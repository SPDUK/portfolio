const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'content/assets/brand/sp-monogram-source.png')

async function prepareBrand() {
  const brand = path.join(root, 'static/brand')
  await fs.mkdir(brand, { recursive: true })
  await sharp(source)
    .resize(512, 512)
    .png()
    .toFile(path.join(brand, 'sp-monogram.png'))
  for (const size of [16, 32, 48, 180, 192, 512]) {
    await sharp(source)
      .resize(size, size)
      .flatten({ background: '#080809' })
      .png()
      .toFile(path.join(brand, `sp-icon-${size}.png`))
  }
  await fs.copyFile(
    path.join(brand, 'sp-icon-512.png'),
    path.join(root, 'content/assets/site-favicon.png'),
  )
  await fs.copyFile(
    path.join(brand, 'sp-icon-32.png'),
    path.join(root, 'static/favicon.png'),
  )
  const png = await fs.readFile(path.join(brand, 'sp-icon-32.png'))
  const header = Buffer.alloc(22)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header[6] = 32
  header[7] = 32
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  await fs.writeFile(
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
