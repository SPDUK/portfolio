const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../public')
const sharedImages = new Set()

function decodeEntities(value) {
  return value.replace(
    /&(?:amp|quot|apos|lt|gt|#39|#x27);/g,
    entity =>
      ({
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
        '&#x27;': "'",
      })[entity],
  )
}

function verifySharing(html, label, title, type = 'website') {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) =>
    Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        decodeEntities(value),
      ]),
    ),
  )
  const value = name => {
    const matches = tags.filter(
      tag => tag.property === name || tag.name === name,
    )
    assert.equal(matches.length, 1, `One ${name} tag is emitted: ${label}`)
    return matches[0].content
  }
  assert.equal(value('og:type'), type, `Correct Open Graph type: ${label}`)
  const image = value('og:image')
  const url = new URL(image)
  assert.equal(
    url.origin,
    'https://spdevuk.com',
    `Absolute share image URL: ${label}`,
  )
  assert.equal(
    value('twitter:image'),
    image,
    `Open Graph and Twitter use the same card: ${label}`,
  )
  assert.equal(value('og:image:width'), '1200', `Open Graph width: ${label}`)
  assert.equal(value('og:image:height'), '630', `Open Graph height: ${label}`)
  assert.equal(
    value('og:image:type'),
    'image/png',
    `Open Graph image type: ${label}`,
  )
  assert.equal(
    value('twitter:card'),
    'summary_large_image',
    `Large Twitter card: ${label}`,
  )
  const alt = value('og:image:alt')
  assert(
    alt.includes('SP monogram on black'),
    `Current black and red image description: ${label}`,
  )
  assert.equal(
    value('twitter:image:alt'),
    alt,
    `Twitter image description: ${label}`,
  )
  if (title) {
    assert.equal(
      value('og:title'),
      title,
      `Document headline metadata: ${label}`,
    )
    assert(alt.includes(title), `Document headline image description: ${label}`)
    assert.match(
      url.pathname,
      /^\/share\/.+-[a-f0-9]{16}\.png$/,
      `Document card has content hash: ${label}`,
    )
    assert(!sharedImages.has(image), `Document has its own card: ${label}`)
  } else {
    assert.match(
      url.pathname,
      /^\/static\/[^/]+\/social-preview\.png$/,
      'Global card has Gatsby content hash',
    )
  }
  sharedImages.add(image)
  const imagePath = path.join(root, decodeURIComponent(url.pathname))
  assert(fs.existsSync(imagePath), `Share image is emitted: ${label}`)
  const png = fs.readFileSync(imagePath)
  assert.equal(
    png.subarray(0, 8).toString('hex'),
    '89504e470d0a1a0a',
    `Share image is a PNG: ${label}`,
  )
  assert.equal(png.readUInt32BE(16), 1200, `Image file width: ${label}`)
  assert.equal(png.readUInt32BE(20), 630, `Image file height: ${label}`)
}

const documents = fs
  .readdirSync(path.join(root, 'os-content'))
  .filter(file => file.endsWith('.json'))
assert(documents.length > 0, 'Build emits document payloads')
for (const filename of documents) {
  const document = JSON.parse(
    fs.readFileSync(path.join(root, 'os-content', filename), 'utf8'),
  )
  const htmlPath = path.join(root, document.slug, 'index.html')
  assert(
    fs.existsSync(htmlPath),
    `Existing content URL remains available: ${document.slug}`,
  )
  const html = fs.readFileSync(htmlPath, 'utf8')
  verifySharing(
    html,
    document.slug,
    document.title,
    document.kind === 'writing' ? 'article' : 'website',
  )
  assert(
    html.includes('os-document-body'),
    `Document body is server-rendered: ${document.slug}`,
  )
  assert(
    html.includes(`https://spdevuk.com${document.slug}`),
    `Canonical URL retained: ${document.slug}`,
  )
  const paragraph = document.html.match(/<p>[^<]{60,}<\/p>/)?.[0]
  if (paragraph)
    assert(
      html.includes(paragraph),
      `Original prose is present before JavaScript: ${document.slug}`,
    )
}
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
verifySharing(homepage, '/')
assert(
  homepage.includes('Senior Software Engineer &amp; Forward Deployed Engineer'),
  'Homepage includes current role',
)
assert(homepage.includes('https://www.zuora.com/'), 'Employer links to Zuora')
const appRoutes = [
  'projects',
  'blog',
  'terminal',
  'arcade',
  'signal-lab',
  'wallpapers',
  'settings',
  'contact',
  'made-with',
]
for (const route of appRoutes) {
  assert(
    fs.existsSync(path.join(root, route, 'index.html')),
    `App route emitted: ${route}`,
  )
  verifySharing(
    fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'),
    `/${route}/`,
  )
}
for (const wallpaper of ['eclipse', 'cinder', 'red-rain']) {
  for (const suffix of ['.webp', '-thumb.webp'])
    assert(
      fs.statSync(path.join(root, 'wallpapers', `${wallpaper}${suffix}`)).size >
        0,
    )
}
assert(
  fs
    .readdirSync(path.join(root, 'wallpapers'))
    .every(file => !/\.(mp4|webm)$/i.test(file)),
  'Wallpapers ship as static images only',
)
assert(
  fs
    .readFileSync(path.join(root, 'index.html'), 'utf8')
    .includes('data-theme="dark"'),
  'Dark theme is server-rendered',
)
console.log(
  `Verified ${documents.length} server-rendered documents, ${sharedImages.size} distinct 1200x630 sharing cards, ${appRoutes.length} app routes, and 3 static wallpapers with thumbnails.`,
)
