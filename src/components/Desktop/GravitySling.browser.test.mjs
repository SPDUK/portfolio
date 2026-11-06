import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'
import { SLING_COURSES } from './gravitySlingLogic.ts'

const require = createRequire(import.meta.url)
const testUrl = process.env.PLAY_TEST_URL

async function withPage(run, options = {}) {
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
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      ...options,
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(new URL('/arcade?game=gravity-sling', testUrl).href, {
      waitUntil: 'networkidle',
    })
    await finishStartup(page)
    await run(
      page,
      page.getByRole('region', { name: 'Gravity Sling', exact: true }),
    )
    assert.deepEqual(errors, [], 'No uncaught browser errors')
  } finally {
    await browser.close()
  }
}

async function setSlider(page, slider, value) {
  await slider.focus()
  await page.keyboard.press('Home')
  const minimum = Number(await slider.getAttribute('min'))
  for (let index = minimum; index < value; index += 1)
    await page.keyboard.press('ArrowRight')
  assert.equal(Number(await slider.inputValue()), value)
}

async function setAim(page, game, aim) {
  await setSlider(
    page,
    game.getByRole('slider', { name: 'Angle', exact: true }),
    aim.angle,
  )
  await setSlider(
    page,
    game.getByRole('slider', { name: 'Power', exact: true }),
    aim.power,
  )
}

test(
  'Gravity Sling aims without launching, pauses explicitly and on departure, and finishes the same flight with motion off',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async (page, game) => {
      const field = game.locator('canvas')
      const stage = game.locator('.os-sling-stage')
      const arcadeBounds = await page
        .getByRole('region', { name: 'Arcade', exact: true })
        .boundingBox()
      const helpBounds = await game.locator('.os-play-note').boundingBox()
      assert.ok(
        helpBounds.y + helpBounds.height <=
          arcadeBounds.y + arcadeBounds.height,
        'The desktop field, primary controls, and help fit together without scrolling',
      )
      const angle = game.getByRole('slider', { name: 'Angle', exact: true })
      const power = game.getByRole('slider', { name: 'Power', exact: true })
      await field.scrollIntoViewIfNeeded()
      const bounds = await field.boundingBox()
      await page.mouse.move(
        bounds.x + bounds.width * 0.13,
        bounds.y + bounds.height * 0.75,
      )
      await page.mouse.down()
      await page.mouse.move(
        bounds.x + bounds.width * 0.34,
        bounds.y + bounds.height * 0.82,
        { steps: 5 },
      )
      await page.mouse.up()
      assert.equal(
        await stage.getAttribute('data-phase'),
        'aiming',
        'Releasing a drag never launches',
      )
      const beforeAngle = Number(await angle.inputValue())
      const beforePower = Number(await power.inputValue())
      await field.focus()
      await page.keyboard.press('ArrowUp')
      assert.equal(Number(await angle.inputValue()), beforeAngle + 1)
      await page.keyboard.press('Shift+ArrowUp')
      assert.equal(Number(await power.inputValue()), beforePower + 1)
      await setAim(page, game, SLING_COURSES[0].solution)
      await game.getByRole('button', { name: 'Launch', exact: true }).click()
      await page.waitForFunction(
        () =>
          document.querySelector('.os-sling-stage')?.dataset.phase === 'flying',
      )
      assert.equal(await angle.isDisabled(), true)
      await game.getByRole('button', { name: 'Pause', exact: true }).click()
      await page.waitForTimeout(100)
      const pausedImage = await field.evaluate(node => node.toDataURL())
      await page.waitForTimeout(180)
      assert.equal(
        await field.evaluate(node => node.toDataURL()),
        pausedImage,
        'Paused flight does not advance',
      )
      await game.getByRole('button', { name: 'Resume', exact: true }).click()
      await page.evaluate(() => window.dispatchEvent(new Event('blur')))
      await page.waitForFunction(
        () =>
          document.querySelector('.os-sling-stage')?.dataset.phase === 'paused',
      )
      assert.match(
        await game.getByRole('status').textContent(),
        /Paused while away/,
      )
      await page.bringToFront()
      await field.focus()
      await page.waitForTimeout(150)
      assert.equal(
        await stage.getAttribute('data-phase'),
        'paused',
        'Focus does not resume a paused flight',
      )
      await game.getByRole('button', { name: 'Resume', exact: true }).click()
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForFunction(
        () =>
          document.querySelector('.os-sling-stage')?.dataset.phase === 'hit',
      )
      assert.match(
        await game.getByRole('status').textContent(),
        /Receiver reached/,
      )
      await angle.focus()
      await page.keyboard.press('ArrowRight')
      assert.equal(await stage.getAttribute('data-phase'), 'aiming')
      assert.match(
        await game.locator('.os-sling-legend').textContent(),
        /Previous flight/,
      )
      await game.getByRole('button', { name: 'Reset', exact: true }).click()
      assert.equal(
        Number(await angle.inputValue()),
        SLING_COURSES[0].initialAim.angle,
      )
      assert.equal(
        Number(await power.inputValue()),
        SLING_COURSES[0].initialAim.power,
      )
    })
  },
)

test(
  'every authored course wins through native aim controls with reduced motion and no running animation',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(
      async (page, game) => {
        for (const course of SLING_COURSES) {
          await game
            .getByRole('button', { name: course.name, exact: true })
            .click()
          await setAim(page, game, course.solution)
          await game
            .getByRole('button', { name: 'Launch', exact: true })
            .click()
          assert.equal(
            await game.locator('.os-sling-stage').getAttribute('data-phase'),
            'hit',
          )
          assert.match(
            await game.getByRole('status').textContent(),
            /Receiver reached/,
          )
          assert.equal(
            await game
              .getByRole('button', { name: 'Pause', exact: true })
              .count(),
            0,
          )
          const field = game.locator('canvas')
          const completed = await field.evaluate(node => node.toDataURL())
          await page.waitForTimeout(120)
          assert.equal(
            await field.evaluate(node => node.toDataURL()),
            completed,
          )
        }
      },
      { reducedMotion: 'reduce' },
    )
  },
)

test(
  'Gravity Sling stays usable at 320px and a touch aims without launching',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(
      async (page, game) => {
        const field = game.locator('canvas')
        await field.scrollIntoViewIfNeeded()
        const bounds = await field.boundingBox()
        await page.touchscreen.tap(
          bounds.x + bounds.width * 0.34,
          bounds.y + bounds.height * 0.8,
        )
        assert.equal(
          await game.locator('.os-sling-stage').getAttribute('data-phase'),
          'aiming',
        )
        assert.equal(
          await game
            .getByRole('button', { name: 'Launch', exact: true })
            .isEnabled(),
          true,
        )
        for (const control of [
          game.getByRole('slider', { name: 'Angle', exact: true }),
          game.getByRole('slider', { name: 'Power', exact: true }),
          game.getByRole('button', { name: 'Launch', exact: true }),
          game.getByRole('button', { name: 'Reset', exact: true }),
        ]) {
          await control.scrollIntoViewIfNeeded()
          assert.equal(await control.isVisible(), true)
          assert.ok((await control.boundingBox()).height >= 44)
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          true,
        )
        assert.equal(
          await field.evaluate(
            node => node.width <= node.getBoundingClientRect().width * 2 + 1,
          ),
          true,
        )
      },
      {
        viewport: { width: 320, height: 740 },
        hasTouch: true,
        isMobile: true,
        reducedMotion: 'reduce',
      },
    )
  },
)
