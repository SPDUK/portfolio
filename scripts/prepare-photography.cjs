const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const originals = path.join(root, 'content/photography')
const samples = path.join(root, 'content/photography-samples')
const output = path.join(root, 'static/photography')
const staging = path.join(root, '.cache/photography-staging')
const supported = /\.(jpe?g|png|webp|avif|tiff?)$/i
const widths = [480, 960, 1600, 2400]

async function imageFiles(directory) {
  const entries = await fs
    .readdir(directory, { withFileTypes: true })
    .catch(error => {
      if (error.code === 'ENOENT') return []
      throw error
    })
  return entries
    .filter(entry => entry.isFile() && supported.test(entry.name))
    .map(entry => entry.name)
    .sort((first, second) =>
      first.localeCompare(second, 'en', { numeric: true }),
    )
}

async function prepareImage(directory, file) {
  const bytes = await fs.readFile(path.join(directory, file))
  const hash = crypto
    .createHash('sha256')
    .update('photography-v1')
    .update(bytes)
    .digest('hex')
    .slice(0, 20)
  const metadata = await sharp(bytes).metadata()
  const rotated = metadata.orientation >= 5 && metadata.orientation <= 8
  const width = rotated ? metadata.height : metadata.width
  const height = rotated ? metadata.width : metadata.height
  if (!width || !height)
    throw new Error(`Cannot read photograph dimensions: ${file}`)
  const sizes = [...new Set(widths.map(size => Math.min(size, width)))]
  const variants = []
  for (const size of sizes) {
    const filename = `${hash}-${size}.webp`
    const destination = path.join(output, filename)
    try {
      await fs.access(destination)
    } catch {
      const temporary = path.join(staging, `${filename}.${process.pid}.tmp`)
      await sharp(bytes)
        .rotate()
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: size > 960 ? 84 : 78 })
        .toFile(temporary)
      await fs.rename(temporary, destination)
    }
    variants.push({ src: `/photography/${filename}`, width: size })
  }
  return {
    id: hash,
    width,
    height,
    variants,
  }
}

async function preparePhotography({ reporter } = {}) {
  await fs.mkdir(output, { recursive: true })
  await fs.mkdir(staging, { recursive: true })
  const files = await imageFiles(originals)
  let manifest
  if (files.length) {
    const photos = []
    for (const file of files) {
      const photo = await prepareImage(originals, file)
      photos.push({ ...photo, id: `${photo.id}-${photos.length + 1}` })
    }
    manifest = { kind: 'original', photos }
  } else {
    const [file] = await imageFiles(samples)
    if (file) {
      const photo = await prepareImage(samples, file)
      const sources = JSON.parse(
        await fs.readFile(path.join(samples, 'sources.json'), 'utf8'),
      )
      const source = sources.find(entry => entry.file === file)?.source
      if (
        typeof source !== 'string' ||
        !source.startsWith('https://images.unsplash.com/')
      ) {
        throw new Error(`Missing Unsplash demo provenance: ${file}`)
      }
      manifest = {
        kind: 'demo',
        source,
        photos: Array.from({ length: 36 }, (_, index) => ({
          ...photo,
          id: `${photo.id}-demo-${index + 1}`,
        })),
      }
    } else manifest = { kind: 'original', photos: [] }
  }
  const temporary = path.join(staging, `manifest.${process.pid}.tmp`)
  await fs.writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`)
  await fs.rename(temporary, path.join(output, 'manifest.json'))
  const message = `Photography prepared ${manifest.photos.length} ${manifest.kind === 'demo' ? 'demo frames from one image' : 'photographs'}.`
  if (reporter) reporter.info(message)
  else process.stdout.write(`${message}\n`)
}

module.exports = { preparePhotography }
if (require.main === module) {
  preparePhotography().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
