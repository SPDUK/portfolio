import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'

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
    await run(page)
    assert.deepEqual(errors, [], 'No uncaught browser errors')
  } finally {
    await browser.close()
  }
}

async function openPrism(page) {
  await page.goto(new URL('/arcade?game=prism-relay', testUrl).href, {
    waitUntil: 'networkidle',
  })
  await finishStartup(page)
  return page.getByRole('region', { name: 'Prism Relay', exact: true })
}

async function solveWithHints(game) {
  for (let turns = 0; turns < 6; turns += 1) {
    const hint = game.getByRole('button', { name: 'Show hint', exact: true })
    if (!(await hint.isEnabled())) break
    const before = await game
      .locator('.os-prism-mirror')
      .evaluateAll(mirrors => mirrors.map(mirror => mirror.dataset.orientation))
    await hint.click()
    assert.deepEqual(
      await game
        .locator('.os-prism-mirror')
        .evaluateAll(mirrors =>
          mirrors.map(mirror => mirror.dataset.orientation),
        ),
      before,
      'Showing a hint does not turn a mirror',
    )
    assert.equal(await game.locator('[data-hint="true"]').count(), 1)
    await game.locator('[data-hint="true"]').click()
  }
  assert.match(
    await game.getByRole('status').textContent(),
    /Receiver connected/,
  )
  assert.equal(await game.locator('.os-prism-receiver-connected').count(), 1)
}

test(
  'Prism Relay turns with the keyboard, resets, and connects all three authored puzzles',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async page => {
      const game = await openPrism(page)
      const back = page.getByRole('button', {
        name: 'Back to game select',
        exact: true,
      })
      assert.equal(
        await back.isVisible(),
        true,
        'The game exposes a reachable return to game select',
      )
      const mirrors = game.locator('.os-prism-mirror')
      const initial = await mirrors.evaluateAll(items =>
        items.map(item => item.dataset.orientation),
      )
      assert.equal(await mirrors.count(), 2)
      assert.match(
        await game.getByRole('img').getAttribute('aria-label'),
        /Source on the left edge, row 3. Receiver on the right edge, row 1/,
      )
      await mirrors.first().focus()
      await page.keyboard.press('ArrowUp')
      assert.equal(
        await mirrors
          .nth(1)
          .evaluate(element => element === document.activeElement),
        true,
      )
      await page.keyboard.press('Space')
      assert.equal(
        await mirrors.nth(1).getAttribute('data-orientation'),
        'slash',
      )
      await page.keyboard.press('Enter')
      assert.equal(
        await mirrors.nth(1).getAttribute('data-orientation'),
        'backslash',
      )
      assert.equal(await game.locator('.os-prism-puzzle dd').textContent(), '2')
      await game.getByRole('button', { name: 'Reset', exact: true }).click()
      assert.deepEqual(
        await mirrors.evaluateAll(items =>
          items.map(item => item.dataset.orientation),
        ),
        initial,
      )
      assert.equal(await game.locator('.os-prism-puzzle dd').textContent(), '0')
      assert.equal(
        await game.getByRole('button', { name: 'Next puzzle' }).count(),
        0,
      )

      await solveWithHints(game)
      await game.getByRole('button', { name: 'Reset', exact: true }).click()
      assert.equal(
        await game.locator('.os-prism-bench').getAttribute('data-solved'),
        'false',
      )
      await solveWithHints(game)
      for (const count of [4, 6]) {
        await game
          .getByRole('button', { name: 'Next puzzle', exact: true })
          .click()
        assert.equal(await mirrors.count(), count)
        assert.equal(
          await mirrors
            .first()
            .evaluate(element => element === document.activeElement),
          true,
          'The new puzzle starts with keyboard focus on its first mirror',
        )
        await solveWithHints(game)
      }
      await game
        .getByRole('button', { name: 'Play again', exact: true })
        .click()
      assert.equal(await mirrors.count(), 2)
      assert.equal(await game.locator('.os-prism-puzzle dd').textContent(), '0')
    })
  },
)

test(
  'Prism Relay keeps 44px touch controls at 320px and respects reduced motion',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(
      async page => {
        const game = await openPrism(page)
        const arcade = page.getByRole('region', { name: 'Arcade', exact: true })
        const back = arcade.getByRole('button', {
          name: 'Back to game select',
          exact: true,
        })
        await back.scrollIntoViewIfNeeded()
        assert.equal(await back.isVisible(), true)
        assert.ok((await back.boundingBox()).height >= 44)
        const mirrors = game.locator('.os-prism-mirror')
        const mirrorSizes = await mirrors.evaluateAll(buttons =>
          buttons.map(button => {
            const rect = button.getBoundingClientRect()
            return { width: rect.width, height: rect.height }
          }),
        )
        assert.ok(
          mirrorSizes.every(rect => rect.width >= 44 && rect.height >= 44),
        )
        assert.equal(
          await arcade.evaluate(
            element => element.scrollWidth <= element.clientWidth + 1,
          ),
          true,
        )
        await mirrors.first().tap()
        assert.equal(
          await game.locator('.os-prism-puzzle dd').textContent(),
          '1',
        )
        assert.equal(
          await game
            .locator('.os-prism-beam')
            .evaluate(element => getComputedStyle(element).animationName),
          'none',
        )
        assert.equal(
          await game
            .locator('.os-prism-beam')
            .evaluate(element => element.getAnimations().length),
          0,
        )
        await solveWithHints(game)
        await game
          .getByRole('button', { name: 'Next puzzle', exact: true })
          .tap()
        assert.equal(await mirrors.count(), 4)
        await game.getByRole('button', { name: 'Show hint', exact: true }).tap()
        const hinted = game.locator('[data-hint="true"]')
        await hinted.tap()
        assert.equal(
          await game.locator('.os-prism-puzzle dd').textContent(),
          '1',
        )
      },
      {
        viewport: { width: 320, height: 740 },
        isMobile: true,
        hasTouch: true,
        reducedMotion: 'reduce',
      },
    )
  },
)

test(
  'A stored motion preference disables the beam reveal',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async page => {
      await page.addInitScript(() => {
        localStorage.setItem(
          'spdev-preferences',
          JSON.stringify({ motion: false, sound: false }),
        )
      })
      const game = await openPrism(page)
      await game.locator('.os-prism-mirror').first().click()
      assert.equal(
        await game.locator('.os-prism-beam').getAttribute('data-reveal'),
        'false',
      )
      assert.equal(
        await game
          .locator('.os-prism-beam')
          .evaluate(element => element.getAnimations().length),
        0,
      )
    })
  },
)
