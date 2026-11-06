const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../public')
const sharedImages = new Set()
const logo = fs.readFileSync(path.join(root, 'brand/sp-monogram.png'))
assert(logo.length > 24, 'SP logo contains image data')
assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
assert.equal(logo.readUInt32BE(16), 512, 'SP logo width')
assert.equal(logo.readUInt32BE(20), 512, 'SP logo height')
assert.deepEqual(
  logo,
  fs.readFileSync(path.resolve(__dirname, '../static/brand/sp-monogram.png')),
  'Emitted SP logo matches the complete source PNG',
)

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
assert(
  homepage.includes('View projects'),
  'Homepage offers a direct project action',
)
assert(
  !homepage.includes('id="os-window-terminal"'),
  'Fresh homepage opens About without Terminal',
)
assert(
  homepage.includes('aria-label="Primary navigation"'),
  'Compact primary navigation is rendered',
)
const projectsPage = fs.readFileSync(
  path.join(root, 'projects/index.html'),
  'utf8',
)
assert(
  projectsPage.includes('Interactive portfolio'),
  'Project catalog includes the current site',
)
assert(
  projectsPage.includes('Earlier projects'),
  'Project archive is distinct from selected work',
)
for (const slug of ['kishu-stack', 'made-with']) {
  const html = fs.readFileSync(path.join(root, slug, 'index.html'), 'utf8')
  const overview = html.indexOf('<section class="os-project-overview"')
  assert(overview >= 0, `Project overview is server-rendered: ${slug}`)
  assert(
    html.includes('Discuss a similar project'),
    `Project has a contact next step: ${slug}`,
  )
  if (slug === 'kishu-stack') {
    assert(
      overview < html.indexOf('<figure class="os-document-cover"'),
      'Contribution and actions precede project imagery',
    )
  }
}
const appRoutes = [
  'projects',
  'blog',
  'terminal',
  'arcade',
  'signal-lab',
  'photography',
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
const wallpaperManifest = JSON.parse(
  fs.readFileSync(path.join(root, 'wallpapers', 'manifest.json'), 'utf8'),
)
for (const { id: wallpaper } of wallpaperManifest.wallpapers) {
  for (const suffix of ['.webp', '-thumb.webp'])
    assert(
      fs.statSync(path.join(root, 'wallpapers', `${wallpaper}${suffix}`)).size >
        0,
    )
}
const expectedWallpaperFiles = new Set([
  'index.html',
  'manifest.json',
  ...wallpaperManifest.wallpapers.flatMap(({ id }) => [
    `${id}.webp`,
    `${id}-thumb.webp`,
    `${id}.webp.json`,
    `${id}-thumb.webp.json`,
  ]),
])
assert.deepEqual(
  new Set(fs.readdirSync(path.join(root, 'wallpapers'))),
  expectedWallpaperFiles,
  'Only the current wallpaper collection ships',
)
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
  `Verified the SP logo, ${documents.length} server-rendered documents, ${sharedImages.size} distinct 1200x630 sharing cards, ${appRoutes.length} app routes, and ${wallpaperManifest.wallpapers.length} static wallpapers with thumbnails.`,
)
