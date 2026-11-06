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

test(
  'Lights Out supports keyboard moves, reset, and hints through to a solved board',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async page => {
      await page.goto(new URL('/arcade?game=lights-out', testUrl).href, {
        waitUntil: 'networkidle',
      })
      await finishStartup(page)
      const game = page.getByRole('region', { name: 'Lights Out', exact: true })
      const cells = game.locator('.os-lights-cell')
      const initial = await cells.evaluateAll(items =>
        items.map(item => item.getAttribute('aria-pressed')),
      )
      await cells.first().focus()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Space')
      assert.match(await cells.nth(1).getAttribute('aria-label'), /column 2/)
      assert.equal(
        await game.locator('.os-lights-measures dd').first().textContent(),
        '1',
      )
      await game.getByRole('button', { name: 'Reset', exact: true }).click()
      assert.deepEqual(
        await cells.evaluateAll(items =>
          items.map(item => item.getAttribute('aria-pressed')),
        ),
        initial,
      )
      for (
        let move = 0;
        move < 16 &&
        (await game.getByRole('button', { name: 'Show hint' }).isEnabled());
        move += 1
      ) {
        await game.getByRole('button', { name: 'Show hint' }).click()
        await game.locator('[data-hint="true"]').click()
      }
      assert.match(
        await game.getByRole('status').textContent(),
        /All lights out/,
      )
      assert.equal(
        await game.locator('.os-lights-cell[aria-pressed="true"]').count(),
        0,
      )
      await game.getByRole('button', { name: '5 by 5 grid' }).click()
      assert.equal(await cells.count(), 25)
      assert.ok(
        (await game.locator('.os-lights-cell[aria-pressed="true"]').count()) >
          0,
      )
    })
  },
)

test(
  'Pixel Studio draws whole strokes, mirrors, undoes, restores drafts and exports a real transparent PNG',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async page => {
      await page.goto(new URL('/arcade?game=pixel-studio', testUrl).href, {
        waitUntil: 'networkidle',
      })
      await finishStartup(page)
      const studio = page.getByRole('region', {
        name: 'Pixel Studio',
        exact: true,
      })
      await studio.getByRole('button', { name: 'Clear', exact: true }).click()
      const board = studio.getByRole('grid', { name: 'Drawing canvas' })
      await board.scrollIntoViewIfNeeded()
      const rect = await board.boundingBox()
      await page.mouse.move(rect.x + rect.width / 24, rect.y + rect.height / 24)
      await page.mouse.down()
      await page.mouse.move(
        rect.x + (rect.width * 23) / 24,
        rect.y + rect.height / 24,
        { steps: 5 },
      )
      await page.mouse.up()
      assert.equal(
        await studio.getByRole('gridcell', { name: /Rose$/ }).count(),
        12,
      )
      await studio.getByRole('button', { name: 'Undo', exact: true }).click()
      assert.equal(
        await studio.getByRole('gridcell', { name: /Transparent$/ }).count(),
        144,
      )
      await studio.getByRole('button', { name: 'Mirror', exact: true }).click()
      const cell = studio.getByRole('gridcell', {
        name: 'Row 2, column 3: Transparent',
        exact: true,
      })
      await cell.focus()
      await page.keyboard.press('Space')
      assert.equal(
        await studio.getByRole('gridcell', { name: /Rose$/ }).count(),
        2,
      )
      const downloadEvent = page.waitForEvent('download')
      await studio.getByRole('button', { name: 'Save PNG' }).click()
      const download = await downloadEvent
      assert.equal(download.suggestedFilename(), 'pixel-studio.png')
      const chunks = []
      for await (const chunk of await download.createReadStream())
        chunks.push(chunk)
      const sharp = require('sharp')
      const png = sharp(Buffer.concat(chunks))
      const metadata = await png.metadata()
      assert.equal(metadata.width, 384)
      assert.equal(metadata.height, 384)
      assert.equal(metadata.hasAlpha, true)
      const raw = await png.ensureAlpha().raw().toBuffer()
      assert.equal(raw[3], 0, 'Unpainted pixels export as transparent')
      assert.equal(
        raw[((32 + 16) * 384 + (64 + 16)) * 4 + 3],
        255,
        'Painted pixels export opaque',
      )
      await page.reload({ waitUntil: 'networkidle' })
      await finishStartup(page)
      assert.equal(
        await studio.getByRole('gridcell', { name: /Rose$/ }).count(),
        2,
        'The committed drawing survives reload',
      )
    })
  },
)

test(
  'Beat Lab requires a gesture, emits audio, pauses on mute and departure, and saves edits',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(async page => {
      await page.addInitScript(() => {
        window.__beatContexts = []
        const NativeAudioContext = window.AudioContext
        window.AudioContext = class extends NativeAudioContext {
          constructor(...args) {
            super(...args)
            this.probe = this.createAnalyser()
            this.probe.connect(this.destination)
            window.__beatContexts.push(this)
          }
          createGain() {
            const gain = super.createGain()
            const connect = gain.connect.bind(gain)
            gain.connect = (target, ...args) =>
              connect(
                target === this.destination ? this.probe : target,
                ...args,
              )
            return gain
          }
        }
      })
      await page.goto(new URL('/arcade?game=beat-lab', testUrl).href, {
        waitUntil: 'networkidle',
      })
      await finishStartup(page)
      const lab = page.getByRole('region', { name: 'Beat Lab', exact: true })
      assert.equal(
        await page.evaluate(() => window.__beatContexts.length),
        0,
        'Loading the toy never creates audio',
      )
      const pad = lab.getByRole('button', { name: 'Kick, step 2', exact: true })
      await pad.focus()
      await page.keyboard.press('Space')
      assert.equal(await pad.getAttribute('aria-pressed'), 'true')
      await page.keyboard.press('ArrowDown')
      assert.equal(
        await page.evaluate(() =>
          document.activeElement.getAttribute('aria-label'),
        ),
        'Snare, step 2',
      )
      await lab.getByRole('button', { name: 'Play loop', exact: true }).click()
      await page.waitForFunction(() =>
        window.__beatContexts.some(context => {
          const samples = new Float32Array(context.probe.fftSize)
          context.probe.getFloatTimeDomainData(samples)
          return (
            context.state === 'running' &&
            samples.some(value => Math.abs(value) > 0.001)
          )
        }),
      )
      assert.equal(
        await lab.getByRole('button', { name: 'Pause loop' }).isVisible(),
        true,
      )
      await lab.getByRole('button', { name: 'Mute sound', exact: true }).click()
      await page.waitForFunction(() =>
        window.__beatContexts.every(context => context.state !== 'running'),
      )
      assert.match(
        await lab.locator('.os-beat-status').textContent(),
        /Sound is off/,
      )
      assert.equal(
        await lab.getByRole('button', { name: 'Play loop' }).isVisible(),
        true,
      )
      await lab.getByRole('button', { name: 'Play loop', exact: true }).click()
      await lab.getByRole('button', { name: 'Pause loop' }).waitFor()
      await page
        .getByRole('button', { name: 'Back to game select', exact: true })
        .click()
      await page.waitForFunction(() =>
        window.__beatContexts.every(context => context.state === 'closed'),
      )
      await page.getByRole('radio', { name: 'Snake', exact: true }).click()
      await page
        .getByRole('button', { name: 'Start game', exact: true })
        .click()
      await page
        .getByRole('button', { name: 'Back to game select', exact: true })
        .click()
      await page.getByRole('radio', { name: 'Beat Lab', exact: true }).click()
      await page
        .getByRole('button', { name: 'Start game', exact: true })
        .click()
      await page.waitForFunction(
        () =>
          document
            .querySelector('[aria-label="Kick, step 2"]')
            ?.getAttribute('aria-pressed') === 'true',
      )
      assert.equal(await pad.getAttribute('aria-pressed'), 'true')
      assert.equal(
        await lab.getByRole('button', { name: 'Play loop' }).isVisible(),
        true,
      )
    })
  },
)

test(
  'All eight choices fit a narrow touch viewport, and a touch paints the selected pixel',
  { skip: !testUrl, timeout: 45000 },
  async () => {
    await withPage(
      async page => {
        await page.goto(new URL('/arcade?game=pixel-studio', testUrl).href, {
          waitUntil: 'networkidle',
        })
        await finishStartup(page)
        const arcade = page.getByRole('region', { name: 'Arcade', exact: true })
        const back = arcade.getByRole('button', {
          name: 'Back to game select',
          exact: true,
        })
        await back.tap()
        assert.equal(await arcade.getByRole('radio').count(), 8)
        for (const name of [
          'Lights Out',
          'Beat Lab',
          'Gravity Sling',
          'Prism Relay',
          'Pixel Studio',
        ]) {
          await arcade.getByRole('radio', { name, exact: true }).tap()
          await arcade
            .getByRole('button', { name: 'Start game', exact: true })
            .tap()
          const toy = page.getByRole('region', { name, exact: true })
          await toy.waitFor()
          assert.equal(
            await arcade.evaluate(
              element => element.scrollWidth <= element.clientWidth + 1,
            ),
            true,
            `${name} fits without horizontal overflow`,
          )
          await back.scrollIntoViewIfNeeded()
          assert.equal(await back.isVisible(), true)
          if (name !== 'Pixel Studio') await back.tap()
        }
        const studio = page.getByRole('region', {
          name: 'Pixel Studio',
          exact: true,
        })
        await studio.getByRole('button', { name: 'Clear', exact: true }).tap()
        await studio
          .getByRole('gridcell', {
            name: 'Row 1, column 1: Transparent',
            exact: true,
          })
          .tap()
        assert.equal(
          await studio
            .getByRole('gridcell', {
              name: 'Row 1, column 1: Rose',
              exact: true,
            })
            .count(),
          1,
        )
      },
      { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true },
    )
  },
)
