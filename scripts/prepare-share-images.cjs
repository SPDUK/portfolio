const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const width = 1200
const height = 630

function escapeMarkup(value) {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character],
  )
}

async function textLayer(
  text,
  {
    left,
    top,
    size,
    color = '#f1ece9',
    maxWidth = 1056,
    mono = false,
    maxHeight,
  },
) {
  const family = mono ? 'IBM Plex Mono' : 'IBM Plex Sans'
  const fontfile = path.join(
    root,
    'static/fonts',
    mono ? 'plex-mono-400.ttf' : 'plex-sans-600.ttf',
  )
  let input
  let metadata
  do {
    input = await sharp({
      text: {
        text: `<span foreground="${color}">${escapeMarkup(text)}</span>`,
        font: `${family} ${size}`,
        fontfile,
        width: maxWidth,
        rgba: true,
        dpi: 72,
        wrap: 'word',
      },
    })
      .png()
      .toBuffer()
    metadata = await sharp(input).metadata()
    size -= 2
  } while (maxHeight && metadata.height > maxHeight && size >= 24)
  return { input, left, top }
}

async function renderShareImage(document) {
  const global = !document
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="1200" height="630" fill="#080809"/><path d="M72 124H1128M72 528H1128" stroke="#302124"/><path d="M772 0H1200V630H1068Z" fill="#100b0d"/><path d="M1195 0V630" stroke="#b91f2e" stroke-width="10"/><rect x="72" y="67" width="5" height="24" fill="#ef3349"/><path d="M900 125V527M1020 125V527" stroke="#211316"/></svg>`,
  )
  const logoSize = global ? 216 : 76
  const logo = await sharp(
    path.join(root, 'content/assets/brand/sp-monogram-source.png'),
  )
    .resize(logoSize, logoSize)
    .png()
    .toBuffer()
  const layers = [
    { input: logo, left: global ? 899 : 1052, top: global ? 225 : 29 },
    await textLayer(
      global
        ? 'STEVE / INTERACTIVE PORTFOLIO'
        : `${document.kind === 'projects' ? 'PROJECT' : 'WRITING'} / STEVE`,
      { left: 96, top: 67, size: 20, mono: true, color: '#ef3349' },
    ),
    await textLayer('spdevuk.com', {
      left: 72,
      top: 563,
      size: 20,
      mono: true,
    }),
    await textLayer('SPDEV', {
      left: 925,
      top: 563,
      size: 18,
      mono: true,
      color: '#bdacaf',
      maxWidth: 205,
    }),
  ]
  if (global) {
    layers.push(
      await textLayer('Steve.', {
        left: 66,
        top: 166,
        size: 112,
        maxWidth: 800,
      }),
      await textLayer('Senior Software Engineer', {
        left: 72,
        top: 325,
        size: 37,
        maxWidth: 814,
      }),
      await textLayer('AI products, frontend systems and things to play with', {
        left: 72,
        top: 451,
        size: 26,
        maxWidth: 820,
        color: '#bdacaf',
      }),
    )
  } else {
    layers.push(
      await textLayer(document.title, {
        left: 68,
        top: 190,
        size: 68,
        maxWidth: 1050,
        maxHeight: 252,
      }),
      await textLayer('Steve / Senior Software Engineer', {
        left: 72,
        top: 477,
        size: 23,
        maxWidth: 1056,
        color: '#bdacaf',
      }),
    )
  }
  return sharp(background).composite(layers).png().toBuffer()
}

async function prepareGlobalShareImage() {
  const output = path.join(root, 'content/assets/social-preview.png')
  await fs.writeFile(output, await renderShareImage())
  return output
}

async function prepareDocumentShareImages(documents) {
  const directory = path.join(root, 'public/share')
  await fs.mkdir(directory, { recursive: true })
  const images = new Map()
  for (const document of documents) {
    const buffer = await renderShareImage(document)
    const hash = crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex')
      .slice(0, 16)
    const slug = document.slug
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-]+/gi, '-')
    const image = `/share/${slug}-${hash}.png`
    await fs.writeFile(path.join(root, 'public', image), buffer)
    images.set(document.slug, {
      image,
      imageAlt: `${document.title}. ${document.kind === 'projects' ? 'A project' : 'Writing'} by Steve. Red SP monogram on black.`,
    })
  }
  return images
}

module.exports = { prepareGlobalShareImage, prepareDocumentShareImages }

if (require.main === module) {
  prepareGlobalShareImage().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
