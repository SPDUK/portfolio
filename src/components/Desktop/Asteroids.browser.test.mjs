import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'

const require = createRequire(import.meta.url)
const testUrl = process.env.ASTEROIDS_TEST_URL

// Run against a built app with ASTEROIDS_TEST_URL and an installed Playwright.
test(
  'Asteroids fires with Space and keeps keyboard controls working after pointer input',
  { skip: !testUrl, timeout: 45000 },
  async () => {
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
        viewport: { width: 1440, height: 1080 },
      })
      await page.goto(new URL('/arcade?game=asteroids', testUrl).href, {
        waitUntil: 'networkidle',
      })
      await finishStartup(page)
      const game = page.getByRole('region', { name: 'Asteroids', exact: true })
      const playfield = game.locator('canvas')
      const paused = game.getByRole('heading', { name: 'HOLD POSITION' })
      const score = game.locator('.os-asteroids-scores strong').first()
      const fire = game.getByRole('button', { name: 'Fire', exact: true })
      await game.getByRole('button', { name: 'Start flight' }).click()

      for (const key of ['Space', 'j', 'x']) {
        if (key !== 'Space')
          await game
            .getByRole('button', { name: 'Restart', exact: true })
            .click()
        await page.keyboard.down('ArrowRight')
        await page.keyboard.down(key)
        assert.equal(
          await paused.isVisible(),
          false,
          `${key} fires without pausing the flight`,
        )
        await page.waitForFunction(
          () =>
            Number(
              document.querySelector('.os-asteroids-scores strong').textContent,
            ) > 0,
          undefined,
          { timeout: 5000 },
        )
        await page.keyboard.up(key)
        await page.keyboard.up('ArrowRight')
        assert.ok(
          Number(await score.textContent()) > 0,
          `${key} destroys rocks`,
        )
      }

      await game.getByRole('button', { name: 'Restart', exact: true }).click()
      await page.keyboard.down('ArrowUp')
      await fire.click()
      assert.equal(
        await playfield.evaluate(element => element === document.activeElement),
        true,
        'Clicking Fire preserves the keyboard playfield while thrust is held',
      )
      await page.keyboard.up('ArrowUp')

      // A keyboard user can move focus to the on-screen controls and still steer.
      await game.getByRole('button', { name: 'Restart', exact: true }).click()
      await fire.focus()
      await page.keyboard.down('ArrowRight')
      await page.keyboard.down('x')
      await page.waitForFunction(
        () =>
          Number(
            document.querySelector('.os-asteroids-scores strong').textContent,
          ) > 0,
        undefined,
        { timeout: 5000 },
      )
      await page.keyboard.up('x')
      await page.keyboard.up('ArrowRight')

      await page.keyboard.press('p')
      assert.equal(await paused.isVisible(), true, 'P pauses the flight')
      await page.keyboard.press('p')
      assert.equal(await paused.isVisible(), false, 'P resumes the flight')

      await game.getByRole('button', { name: 'Pause', exact: true }).focus()
      await page.keyboard.press('Space')
      assert.equal(
        await paused.isVisible(),
        true,
        'Space still activates a focused Pause button',
      )
      await game.getByRole('button', { name: 'Resume flight' }).click()
      await page
        .getByRole('button', { name: 'Back to game select', exact: true })
        .focus()
      assert.equal(await paused.isVisible(), true, 'Leaving the game pauses it')
    } finally {
      await browser.close()
    }
  },
)
