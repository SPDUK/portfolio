const path = require('path')
const sharp = require('sharp')
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'content/assets/wallpaper-source')
const { wallpapers } = require('../static/wallpapers/manifest.json')
async function main() {
  for (const { id: name, source: file } of wallpapers) {
    await sharp(path.join(source, file))
      .resize(2560, 1440, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(root, 'static/wallpapers', `${name}.webp`))
    await sharp(path.join(source, file))
      .resize(640, 360, { fit: 'cover' })
      .webp({ quality: 65 })
      .toFile(path.join(root, 'static/wallpapers', `${name}-thumb.webp`))
  }
  await require('./prepare-sp-brand.cjs')()
  await require('./prepare-share-images.cjs').prepareGlobalShareImage()
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
