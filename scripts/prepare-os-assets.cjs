const path = require('path')
const sharp = require('sharp')
const root = path.resolve(__dirname, '..')
const source = path.join(root, 'content/assets/wallpaper-source')
const images = {
  eclipse: 'eclipse.png',
  cinder: 'cinder.png',
  'red-rain': 'red-rain.png',
}
async function main() {
  for (const [name, file] of Object.entries(images)) {
    await sharp(path.join(source, file))
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 78 })
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
