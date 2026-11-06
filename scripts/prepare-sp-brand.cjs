const fs = require('node:fs/promises')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'content/assets/brand/sp-monogram-source.png')
const staging = path.join(root, '.cache/brand-staging')

async function publishAsset(destination, bytes) {
  const temporary = path.join(
    staging,
    `${path.basename(destination)}.${randomUUID()}.tmp`,
  )
  await fs.writeFile(temporary, bytes)
  await fs.rename(temporary, destination)
}

async function prepareBrand() {
  const brand = path.join(root, 'static/brand')
  await fs.mkdir(brand, { recursive: true })
  await fs.mkdir(staging, { recursive: true })
  const monogram = await sharp(source).resize(512, 512).png().toBuffer()
  await publishAsset(path.join(brand, 'sp-monogram.png'), monogram)
  const siteFavicon = await sharp(source)
    .resize(512, 512)
    .flatten({ background: '#080809' })
    .png()
    .toBuffer()
  await publishAsset(
    path.join(root, 'content/assets/site-favicon.png'),
    siteFavicon,
  )
  const png = await sharp(source)
    .resize(32, 32)
    .flatten({ background: '#080809' })
    .png()
    .toBuffer()
  await publishAsset(path.join(root, 'static/favicon.png'), png)
  const header = Buffer.alloc(22)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header[6] = 32
  header[7] = 32
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  await publishAsset(
    path.join(root, 'static/favicon.ico'),
    Buffer.concat([header, png]),
  )
}

module.exports = prepareBrand

if (require.main === module) {
  prepareBrand().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
