const assert = require('node:assert/strict')
const { watch } = require('node:fs')
const fs = require('node:fs/promises')
const path = require('node:path')
const test = require('node:test')
const { setTimeout: delay } = require('node:timers/promises')
const sharp = require('sharp')

test('brand exports remain decodable when a static-file watcher reads them', async t => {
  const root = path.resolve(__dirname, '..')
  const cache = path.join(root, '.cache')
  await fs.mkdir(cache, { recursive: true })
  const fixture = await fs.mkdtemp(path.join(cache, 'brand-assets-test-'))
  t.after(async () => {
    assert(path.resolve(fixture).startsWith(cache + path.sep))
    await fs.rm(fixture, { recursive: true, force: true })
  })
  const outputs = [
    'static/brand/sp-monogram.png',
    'content/assets/site-favicon.png',
    'static/favicon.png',
    'static/favicon.ico',
  ]
  const script = path.join(fixture, 'scripts/prepare-sp-brand.cjs')
  for (const directory of ['scripts', 'content/assets/brand', 'static/brand'])
    await fs.mkdir(path.join(fixture, directory), { recursive: true })
  await fs.copyFile(path.join(__dirname, 'prepare-sp-brand.cjs'), script)
  await fs.copyFile(
    path.join(root, 'content/assets/brand/sp-monogram-source.png'),
    path.join(fixture, 'content/assets/brand/sp-monogram-source.png'),
  )
  const observed = new Set()
  const failures = []
  const reads = []
  const watchers = [...new Set(outputs.map(file => path.dirname(file)))].map(
    directory =>
      watch(path.join(fixture, directory), (_, filename) => {
        if (!filename) return
        const relative = path.join(directory, filename).replaceAll('\\', '/')
        if (!outputs.includes(relative)) return
        reads.push(
          (async () => {
            const bytes = await fs.readFile(path.join(fixture, relative))
            observed.add(relative)
            const png = relative.endsWith('.ico') ? bytes.subarray(22) : bytes
            await sharp(png).raw().toBuffer()
          })().catch(error => {
            if (error.code !== 'ENOENT')
              failures.push(`${relative}: ${error.message}`)
          }),
        )
      }),
  )
  t.after(() => watchers.forEach(watcher => watcher.close()))
  const prepareBrand = require(script)
  await prepareBrand()
  await delay(100)
  await prepareBrand()
  await delay(100)
  await Promise.all(reads)
  assert.deepEqual([...observed].sort(), [...outputs].sort())
  assert.deepEqual(
    failures,
    [],
    'Watchers never receive empty or partial images',
  )
})
