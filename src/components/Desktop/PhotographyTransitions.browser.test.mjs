import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'

const require = createRequire(import.meta.url)
const testUrl = process.env.PLAY_TEST_URL
const options = { skip: !testUrl, timeout: 60000 }

async function withGallery(
  run,
  {
    reducedMotion,
    motion = true,
    native = true,
    viewport = { width: 1440, height: 1000 },
    beforeLoad,
  } = {},
) {
  const { chromium } = require(
    process.env.PLAYWRIGHT_MODULE_PATH || 'playwright',
  )
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE_PATH && {
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    }),
  })
  try {
    const context = await browser.newContext({
      viewport,
      ...(reducedMotion && { reducedMotion }),
    })
    await context.addInitScript(
      ({ motion, native }) => {
        localStorage.setItem(
          'spdev-preferences',
          JSON.stringify({ wallpaper: 'afterglow', motion, sound: false }),
        )
        window.__photoTransitions = []
        if (!native) {
          document.startViewTransition = undefined
          return
        }
        const start = document.startViewTransition.bind(document)
        const named = () =>
          Array.from(
            document.querySelectorAll('[style*="view-transition-name"]'),
          ).map(element => ({
            name: element.style.viewTransitionName,
            rect: element.getBoundingClientRect().toJSON(),
          }))
        document.startViewTransition = update => {
          const record = {
            direction: document.documentElement.dataset.photoTransition,
            old: named(),
          }
          window.__photoTransitions.push(record)
          const transition = start(async () => {
            await update()
            record.new = named()
          })
          transition.ready.then(
            () => {
              record.rootAnimation = getComputedStyle(
                document.documentElement,
                '::view-transition-new(root)',
              ).animationName
              record.imageFit = getComputedStyle(
                document.documentElement,
                '::view-transition-new(os-photo-image)',
              ).objectFit
            },
            error => {
              record.error = error.message
            },
          )
          return transition
        }
      },
      { motion, native },
    )
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    if (beforeLoad) await beforeLoad(page)
    await page.goto(new URL('/photography', testUrl).href)
    await finishStartup(page)
    await page.locator('.os-photo-feature img').waitFor()
    await run(page)
    assert.deepEqual(
      errors,
      [],
      'Photograph interactions have no browser errors',
    )
  } finally {
    await browser.close()
  }
}

async function settled(page) {
  await page.waitForFunction(
    () => !document.documentElement.dataset.photoTransition,
  )
  assert.equal(
    await page.locator('[style*="view-transition-name: os-photo"]').count(),
    0,
    'A completed or interrupted photo transition releases its shared layers',
  )
}

const photograph = (page, index) =>
  page.getByRole('button', {
    name: `View photograph ${index} fullscreen`,
    exact: true,
  })

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 320, height: 740 },
]) {
  test(
    `a cropped thumbnail expands to its full aspect and Escape returns it at ${viewport.width}px`,
    options,
    async () => {
      await withGallery(
        async page => {
          const tile = photograph(page, 2)
          await tile.scrollIntoViewIfNeeded()
          await tile.locator('img').waitFor()
          await tile.locator('img').evaluate(image => image.decode())
          const shell = await page.locator('.os-panel').boundingBox()
          await tile.click()
          await page.getByRole('dialog').waitFor()
          await settled(page)
          const opening = await page.evaluate(() =>
            window.__photoTransitions.at(-1),
          )
          assert.equal(opening.direction, 'open')
          assert.equal(opening.error, undefined)
          const small = opening.old.find(
            element => element.name === 'os-photo-image',
          ).rect
          const large = opening.new.find(
            element => element.name === 'os-photo-image',
          ).rect
          assert.ok(
            large.height > small.height,
            'The selected image grows from its actual tile',
          )
          assert.ok(
            Math.abs(large.width / large.height - 2 / 3) < 0.01,
            'A portrait returns to its original aspect ratio',
          )
          assert.equal(
            opening.rootAnimation,
            'none',
            'The surrounding desktop stays stationary',
          )
          assert.equal(
            opening.imageFit,
            'cover',
            'The moving image reveals the original crop without stretching',
          )
          await page.keyboard.press('Escape')
          await page.getByRole('dialog').waitFor({ state: 'hidden' })
          await settled(page)
          const closing = await page.evaluate(() =>
            window.__photoTransitions.at(-1),
          )
          assert.equal(closing.direction, 'close')
          assert.equal(closing.error, undefined)
          const returned = closing.new.find(
            element => element.name === 'os-photo-image',
          ).rect
          assert.equal(returned.width, small.width)
          assert.equal(returned.height, small.height)
          assert.equal(
            await tile.evaluate(button => button === document.activeElement),
            true,
          )
          assert.deepEqual(await page.locator('.os-panel').boundingBox(), shell)
        },
        { viewport },
      )
    },
  )
}

test(
  'opening uses the decoded thumbnail while the full photograph is still loading',
  options,
  async () => {
    const held = []
    await withGallery(
      async page => {
        const tile = photograph(page, 1)
        const thumbnail = await tile.locator('img').getAttribute('src')
        await tile.click()
        await page.getByRole('dialog').waitFor()
        await settled(page)
        assert.equal(
          await page.locator('.os-photo-current').getAttribute('src'),
          thumbnail,
        )
        assert.equal(await page.locator('.os-photo-viewer-skeleton').count(), 0)
        assert.equal(
          held.length,
          1,
          'The existing admission queue makes just one full-image request',
        )
        await page.keyboard.press('Escape')
        await page.getByRole('dialog').waitFor({ state: 'hidden' })
        await settled(page)
        await Promise.all(held.map(route => route.abort()))
      },
      {
        beforeLoad: page =>
          page.route('**/photography/*-2400.webp', route => held.push(route)),
      },
    )
  },
)

test(
  'Escape during expansion and an immediate reopen leave the viewer usable',
  options,
  async () => {
    await withGallery(async page => {
      const tile = photograph(page, 1)
      await tile.click()
      await page.getByRole('dialog').waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await tile.click()
      await page.getByRole('dialog').waitFor()
      await settled(page)
      await page.locator('.os-photo-image-stack[data-phase="ready"]').waitFor()
      await page
        .getByRole('button', { name: 'Next photograph', exact: true })
        .click()
      await page.locator('.os-photo-image-stack[data-phase="ready"]').waitFor()
      assert.match(
        await page.locator('.os-photo-viewer-caption').textContent(),
        /2\s*\//,
      )
      await page
        .getByRole('button', { name: 'Close fullscreen viewer', exact: true })
        .click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await settled(page)
    })
  },
)

test(
  'a photograph outside the visible collection closes without a detached return layer',
  options,
  async () => {
    await withGallery(async page => {
      await photograph(page, 1).click()
      await settled(page)
      await page.locator('.os-photo-image-stack[data-phase="ready"]').waitFor()
      await page.keyboard.press('End')
      await page.locator('.os-photo-image-stack[data-phase="ready"]').waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await settled(page)
      assert.equal(
        await page.evaluate(() => window.__photoTransitions.length),
        1,
      )
    })
  },
)

test(
  'a motion preference change during snapshot capture still opens and releases the viewer',
  options,
  async () => {
    await withGallery(async page => {
      await page.evaluate(() => {
        const start = document.startViewTransition.bind(document)
        document.startViewTransition = update =>
          start(async () => {
            await new Promise(resolve => setTimeout(resolve, 100))
            return update()
          })
      })
      await photograph(page, 1).click()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.getByRole('dialog').waitFor()
      await settled(page)
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await settled(page)
    })
  },
)

for (const [name, settings] of [
  ['reduced motion', { reducedMotion: 'reduce' }],
  ['desktop animations disabled', { motion: false }],
  ['a browser without native view transitions', { native: false }],
]) {
  test(`photographs open and close with ${name}`, options, async () => {
    await withGallery(async page => {
      const tile = photograph(page, 1)
      await tile.click()
      await page.getByRole('dialog').waitFor()
      await page.locator('.os-photo-image-stack[data-phase="ready"]').waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await settled(page)
      assert.equal(
        await tile.evaluate(button => button === document.activeElement),
        true,
      )
      assert.equal(
        await page.evaluate(() => window.__photoTransitions.length),
        0,
      )
    }, settings)
  })
}
