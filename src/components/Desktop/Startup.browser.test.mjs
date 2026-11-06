import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'

const require = createRequire(import.meta.url)
const testUrl = process.env.PLAY_TEST_URL
const options = { skip: !testUrl, timeout: 60000 }

async function withPage(run, contextOptions = {}) {
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
      viewport: { width: 1440, height: 1000 },
      ...contextOptions,
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
      window.__startupPhases = []
      new MutationObserver(() => {
        const phase = document.querySelector('.os-desktop')?.dataset.startup
        if (phase && window.__startupPhases.at(-1) !== phase)
          window.__startupPhases.push(phase)
      }).observe(document, { subtree: true, childList: true, attributes: true })
    })
    await run(page, context)
    assert.deepEqual(errors, [], 'No uncaught browser errors')
  } finally {
    await browser.close()
  }
}

async function go(page, path = '/') {
  await page.goto(new URL(path, testUrl).href, {
    waitUntil: 'domcontentloaded',
  })
  await page.locator('.os-desktop.os-ready').waitFor()
}

async function assertReleased(page) {
  assert.equal(await page.locator('[data-startup-inert]').count(), 0)
  assert.equal(
    await page.locator('.os-stage').evaluate(node => node.inert),
    false,
  )
  assert.equal(await page.locator('.os-boot').count(), 0)
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.spdevStartup),
    'complete',
  )
}

async function observeTyping(page) {
  return await page.evaluate(
    () =>
      new Promise(resolve => {
        const started = performance.now()
        let visibleSince = null
        const rows = [
          'command',
          'starting',
          'workspace',
          'destination',
          'ready',
        ]
        const observed = rows.map(name => ({
          name,
          partialCounts: [],
          pendingFullSince: null,
          pendingFullFor: 0,
        }))
        const violations = []
        let maxCursors = 0
        let canonicalObserved = false
        const sample = now => {
          const phase = document.querySelector('.os-desktop')?.dataset.startup
          if (phase !== 'presenting') {
            resolve({
              phase,
              elapsed: performance.now() - started,
              visibleFor: visibleSince === null ? 0 : now - visibleSince,
              observed,
              violations,
              maxCursors,
            })
            return
          }
          const states = rows.map((name, index) => {
            const row = document.querySelector(`.os-boot-${name}`)
            const characters = Array.from(row.querySelectorAll('.os-boot-char'))
            const visible = characters.filter(
              node => Number(getComputedStyle(node).opacity) >= 0.98,
            ).length
            const markerOpacity = selector => {
              const marker = row.querySelector(selector)
              return marker ? Number(getComputedStyle(marker).opacity) : 0
            }
            const pending = markerOpacity('.os-boot-pending')
            const done = markerOpacity('.os-boot-done')
            const state = {
              visible,
              total: characters.length,
              pending,
              done,
            }
            const result = observed[index]
            if (
              visible > 0 &&
              visible < characters.length &&
              !result.partialCounts.includes(visible)
            )
              result.partialCounts.push(visible)
            if (
              characters.length > 0 &&
              visible === characters.length &&
              pending >= 0.98 &&
              done <= 0.02
            ) {
              result.pendingFullSince ??= now
              result.pendingFullFor = Math.max(
                result.pendingFullFor,
                now - result.pendingFullSince,
              )
            } else result.pendingFullSince = null
            if (
              done > 0.02 &&
              visible !== characters.length &&
              !violations.includes(`${name}: early success`)
            )
              violations.push(`${name}: early success`)
            return state
          })
          const logo = document.querySelector('.os-boot-logo-whole')
          if (logo && getComputedStyle(logo).visibility === 'visible')
            canonicalObserved = true
          if (
            states[0].visible > 0 &&
            !canonicalObserved &&
            !violations.includes('command: logo incomplete')
          )
            violations.push('command: logo incomplete')
          states.forEach((state, index) => {
            if (
              !index ||
              (state.visible === 0 &&
                state.pending <= 0.02 &&
                state.done <= 0.02)
            )
              return
            const previous = states[index - 1]
            const completed =
              index === 1
                ? previous.total > 0 && previous.visible === previous.total
                : previous.done >= 0.98
            const violation = `${rows[index]}: previous step incomplete`
            if (!completed && !violations.includes(violation))
              violations.push(violation)
          })
          const cursors = Array.from(
            document.querySelectorAll('.os-boot-char'),
          ).filter(
            node =>
              Number(getComputedStyle(node).opacity) *
                Number(getComputedStyle(node, '::after').opacity) >
              0.5,
          ).length
          maxCursors = Math.max(maxCursors, cursors)
          const readable =
            states.every(
              state => state.total > 0 && state.visible === state.total,
            ) &&
            states
              .slice(1)
              .every(state => state.done >= 0.98 && state.pending <= 0.02)
          visibleSince = readable ? (visibleSince ?? now) : null
          requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
      }),
  )
}

function assertTypedProgress(presentation) {
  assert.equal(
    presentation.phase,
    'revealing',
    'The visual sequence reaches its reveal',
  )
  assert.ok(
    presentation.visibleFor >= 140,
    `The complete transcript remains legible before reveal (${Math.round(presentation.visibleFor)}ms observed)`,
  )
  assert.deepEqual(
    presentation.violations,
    [],
    'A step succeeds only after typing and the previous step has completed',
  )
  assert.equal(presentation.maxCursors, 1, 'Only one typing cursor is active')
  for (const row of presentation.observed) {
    assert.ok(
      row.partialCounts.length >= 3,
      `${row.name} has multiple visible partial prefixes`,
    )
    if (row.name !== 'command')
      assert.ok(
        row.pendingFullFor >= 70,
        `${row.name} visibly waits pending after all its characters appear (${Math.round(row.pendingFullFor)}ms)`,
      )
  }
}

test(
  'Cold startup types partial commands, completes each pending step in order, and holds the finished transcript',
  options,
  async () => {
    await withPage(async page => {
      await page.route('**/fonts/*.ttf', async route => {
        await new Promise(resolve => setTimeout(resolve, 650))
        await route.continue()
      })
      await go(page)
      const presentation = await observeTyping(page)
      assertTypedProgress(presentation)
      await page.locator('.os-desktop[data-startup="complete"]').waitFor()
      await assertReleased(page)
    })
  },
)

test(
  'Boot identity, log rows, and desktop geometry stay fixed through illumination and the handoff',
  options,
  async () => {
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 320, height: 740 },
    ]) {
      await withPage(
        async page => {
          await page.addInitScript(() => {
            window.__bootGeometry = {
              samples: 0,
              phases: [],
              regions: {},
              spatialEffects: [],
              glyphs: {},
              markerDelta: 0,
              started: null,
              elapsed: 0,
              crt: {},
              glow: null,
              powerSettled: null,
              powerFadeObserved: false,
            }
            const regions = [
              '.os-boot-logo',
              '.os-boot-power',
              '.os-boot-identity',
              '.os-boot-identity h1',
              '.os-boot-transcript',
              '.os-boot-prompt',
              '.os-boot-command',
              '.os-boot-starting',
              '.os-boot-workspace',
              '.os-boot-destination',
              '.os-boot-ready',
              '.os-panel',
              '.os-rail',
              '.os-stage',
            ]
            const spatial = [
              '.os-boot-console',
              '.os-boot-power',
              '.os-boot-identity',
              '.os-boot-logo-piece',
              '.os-panel',
              '.os-rail',
              '.os-stage',
            ]
            const sample = () => {
              const root = document.querySelector('.os-desktop.os-ready')
              if (root) {
                const result = window.__bootGeometry
                result.samples += 1
                result.started ??= performance.now()
                result.elapsed = performance.now() - result.started
                const phase = root.dataset.startup
                if (result.phases.at(-1) !== phase) result.phases.push(phase)
                for (const selector of regions) {
                  const node = document.querySelector(selector)
                  if (!node) continue
                  if (
                    selector.startsWith('.os-boot') &&
                    document.documentElement.dataset.spdevStartup ===
                      'complete' &&
                    node.getClientRects().length === 0
                  )
                    continue
                  const rect = node.getBoundingClientRect()
                  const values = [rect.x, rect.y, rect.width, rect.height]
                  const region = (result.regions[selector] ||= {
                    initial: values,
                    maxDelta: 0,
                    samples: 0,
                  })
                  region.samples += 1
                  region.maxDelta = Math.max(
                    region.maxDelta,
                    ...values.map((value, index) =>
                      Math.abs(value - region.initial[index]),
                    ),
                  )
                }
                for (const selector of spatial) {
                  for (const node of document.querySelectorAll(selector)) {
                    const style = getComputedStyle(node)
                    if (
                      (style.transform !== 'none' || style.filter !== 'none') &&
                      !result.spatialEffects.includes(selector)
                    )
                      result.spatialEffects.push(selector)
                  }
                }
                if (
                  document.documentElement.dataset.spdevStartup !== 'complete'
                ) {
                  const overlay = document.querySelector('.os-boot')
                  if (overlay)
                    for (const pseudo of ['::before', '::after']) {
                      const style = getComputedStyle(overlay, pseudo)
                      const layer = (result.crt[pseudo] ||= {
                        image: style.backgroundImage,
                        content: style.content,
                        pointerEvents: style.pointerEvents,
                        transform: style.transform,
                        iterations: style.animationIterationCount,
                        fadeObserved: false,
                      })
                      const opacity = Number(style.opacity)
                      if (
                        phase === 'revealing' &&
                        opacity > 0.02 &&
                        opacity < 0.98
                      )
                        layer.fadeObserved = true
                    }
                  result.glow ||= getComputedStyle(
                    document.querySelector('.os-boot-transcript'),
                  ).textShadow
                  const power = document.querySelector('.os-boot-power')
                  if (power) {
                    const style = getComputedStyle(power)
                    const animation = power.getAnimations()[0]
                    if (
                      phase === 'presenting' &&
                      animation?.playState === 'finished'
                    )
                      result.powerSettled = {
                        opacity: Number(style.opacity),
                        clipPath: style.clipPath,
                        transform: style.transform,
                        iterations: style.animationIterationCount,
                        pointerEvents: style.pointerEvents,
                      }
                    if (
                      phase === 'revealing' &&
                      Number(style.opacity) > 0.02 &&
                      Number(style.opacity) < 0.63
                    )
                      result.powerFadeObserved = true
                  }
                  document
                    .querySelectorAll('.os-boot-char')
                    .forEach((node, index) => {
                      if (Number(getComputedStyle(node).opacity) < 0.98) return
                      const rect = node.getBoundingClientRect()
                      const values = [rect.x, rect.y, rect.width, rect.height]
                      const glyph = (result.glyphs[index] ||= {
                        initial: values,
                        maxDelta: 0,
                        samples: 0,
                      })
                      glyph.samples += 1
                      glyph.maxDelta = Math.max(
                        glyph.maxDelta,
                        ...values.map((value, axis) =>
                          Math.abs(value - glyph.initial[axis]),
                        ),
                      )
                    })
                  document
                    .querySelectorAll('.os-boot-pending')
                    .forEach(node => {
                      const pending = node.getBoundingClientRect()
                      const done = node.parentElement
                        .querySelector('.os-boot-done')
                        .getBoundingClientRect()
                      result.markerDelta = Math.max(
                        result.markerDelta,
                        Math.abs(pending.x - done.x),
                        Math.abs(pending.y - done.y),
                        Math.abs(pending.width - done.width),
                        Math.abs(pending.height - done.height),
                      )
                    })
                }
                if (phase === 'complete') return
              }
              requestAnimationFrame(sample)
            }
            requestAnimationFrame(sample)
          })
          await go(page, '/using-imagegen-in-codex-to-rebuild-project-icons/')
          await finishStartup(page)
          await page.waitForFunction(
            () => window.__bootGeometry.phases.at(-1) === 'complete',
          )
          const geometry = await page.evaluate(() => window.__bootGeometry)
          assert.deepEqual(geometry.phases, [
            'presenting',
            'revealing',
            'complete',
          ])
          assert.deepEqual(
            geometry.spatialEffects,
            [],
            'Illumination and handoff use no spatial transforms or blur',
          )
          assert.ok(
            geometry.samples > 3,
            'The invariant observes real rendered frames',
          )
          for (const [selector, region] of Object.entries(geometry.regions)) {
            assert.ok(
              region.samples > 2,
              `${selector} is observed through the sequence`,
            )
            assert.ok(
              region.maxDelta <= 0.5,
              `${selector} stays fixed at ${viewport.width}px (${region.maxDelta.toFixed(2)}px movement observed)`,
            )
          }
          assert.ok(
            Object.keys(geometry.glyphs).length > 30,
            'Visible glyphs are observed while the long destination wraps',
          )
          assert.ok(
            geometry.markerDelta <= 0.5,
            'Pending and OK share the exact marker slot',
          )
          assert.ok(
            geometry.elapsed >= 2800 && geometry.elapsed <= 3600,
            `The long-title boot completes around three seconds (${Math.round(geometry.elapsed)}ms observed)`,
          )
          assert.match(
            geometry.crt['::before'].image,
            /repeating-linear-gradient/,
            'Static scanlines are present during boot',
          )
          assert.match(
            geometry.crt['::after'].image,
            /radial-gradient/,
            'A soft edge vignette is present',
          )
          assert.notEqual(
            geometry.glow,
            'none',
            'The transcript has phosphor glow',
          )
          assert.ok(
            geometry.powerSettled,
            'The finite power-on settles before the transcript completes',
          )
          assert.equal(geometry.powerSettled.transform, 'none')
          assert.equal(geometry.powerSettled.pointerEvents, 'none')
          assert.equal(geometry.powerSettled.iterations, '1')
          assert.ok(Math.abs(geometry.powerSettled.opacity - 0.65) < 0.01)
          assert.match(geometry.powerSettled.clipPath, /^inset\(0px\)$/)
          assert.equal(
            geometry.powerFadeObserved,
            true,
            'The settled screen illumination fades with the console',
          )
          for (const layer of Object.values(geometry.crt)) {
            assert.notEqual(layer.content, 'none')
            assert.equal(
              layer.pointerEvents,
              'none',
              'CRT layers do not intercept input',
            )
            assert.equal(
              layer.transform,
              'none',
              'CRT texture stays stationary',
            )
            assert.equal(
              layer.iterations,
              '1',
              'CRT texture has no ambient animation loop',
            )
            assert.equal(
              layer.fadeObserved,
              true,
              'CRT texture fades with the boot cover',
            )
          }
          for (const [index, glyph] of Object.entries(geometry.glyphs)) {
            assert.ok(
              glyph.samples > 2,
              `Glyph ${index} is observed during typing and completion`,
            )
            assert.ok(
              glyph.maxDelta <= 0.5,
              `Glyph ${index} stays fixed at ${viewport.width}px (${glyph.maxDelta.toFixed(2)}px movement observed)`,
            )
          }
          const screenTexture = () =>
            page.locator('.os-desktop').evaluate(node => {
              const style = getComputedStyle(node, '::after')
              return style.backgroundImage
            })
          assert.equal(await page.locator('.os-boot').count(), 0)
          assert.equal(
            await screenTexture(),
            'none',
            'The desktop has no scanlines',
          )
          await page
            .getByRole('button', { name: 'Open app launcher', exact: true })
            .first()
            .click()
          const launcher = page.getByRole('dialog', { name: 'App launcher' })
          assert.equal(
            await screenTexture(),
            'none',
            'The app launcher has no scanlines',
          )
          await launcher.getByLabel('Search portfolio apps').fill('Terminal')
          await launcher.getByRole('button', { name: /Terminal/ }).click()
          await page.getByLabel('Terminal command').fill('help')
          await page
            .getByRole('button', { name: 'Run command', exact: true })
            .click()
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll('.os-terminal-command')].at(-1)
                ?.textContent === 'help',
          )
          assert.equal(
            await page.getByLabel('Terminal command').inputValue(),
            '',
          )
          assert.equal(await screenTexture(), 'none', 'Apps have no scanlines')
        },
        { viewport },
      )
    }
  },
)

test(
  'Logo pieces illuminate before the terminal, startup cannot be skipped, and reload preserves the workspace',
  options,
  async () => {
    await withPage(async page => {
      await go(page)
      const status = page.locator('.os-boot')
      assert.equal(await status.getAttribute('role'), 'status')
      assert.equal(
        await page.getByRole('button', { name: /Skip intro/ }).count(),
        0,
      )
      assert.equal(await page.locator('.os-boot-footer').count(), 0)
      assert.equal(await status.getAttribute('aria-modal'), null)
      assert.equal(
        await status.evaluate(node => node === document.activeElement),
        true,
      )
      assert.equal(
        await page.locator('.os-stage').evaluate(node => node.inert),
        true,
      )
      assert.equal(await page.locator('.os-boot-logo-piece').count(), 4)
      assert.equal(
        await page.locator('.os-boot-logo-whole').getAttribute('href'),
        '/brand/sp-monogram.png',
      )
      assert.deepEqual(
        await page
          .locator('.os-boot-logo-piece image')
          .evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))),
        Array(4).fill('/brand/sp-monogram.png'),
      )
      for (const animationName of ['os-boot-ready', 'os-cover-out']) {
        await page
          .locator('.os-boot-logo-piece')
          .first()
          .dispatchEvent('animationend', { animationName, bubbles: true })
        assert.equal(
          await page.locator('.os-desktop').getAttribute('data-startup'),
          'presenting',
          'A descendant animation cannot advance the startup phase',
        )
      }
      for (const key of ['Escape', 'Enter', 'Space']) {
        await page.keyboard.press(key)
        assert.equal(
          await page.locator('.os-desktop').getAttribute('data-startup'),
          'presenting',
        )
      }
      await page.locator('.os-boot-logo').click()
      assert.equal(
        await page.locator('.os-desktop').getAttribute('data-startup'),
        'presenting',
      )
      await page.keyboard.press('Control+k')
      assert.equal(
        await page.getByRole('dialog', { name: 'App launcher' }).count(),
        0,
      )
      await page.keyboard.press('Tab')
      assert.equal(
        await page.evaluate(
          () => !!document.activeElement?.closest('.os-stage'),
        ),
        false,
      )
      await page.locator('.os-desktop[data-startup="complete"]').waitFor()
      await assertReleased(page)
      assert.equal(
        await page
          .locator('#os-window-about h1')
          .evaluate(node => node === document.activeElement),
        true,
      )
      assert.deepEqual(await page.evaluate(() => window.__startupPhases), [
        'presenting',
        'revealing',
        'complete',
      ])
      await page
        .getByRole('button', { name: 'View projects', exact: true })
        .click()
      await page.waitForURL(
        url => url.pathname.replace(/\/$/, '') === '/projects',
      )
      assert.equal(
        await page.locator('.os-desktop').getAttribute('data-startup'),
        'complete',
      )
      assert.equal(await page.locator('.os-boot').count(), 0)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.locator('.os-desktop.os-ready').waitFor()
      assert.equal(
        await page.locator('.os-boot-workspace strong').textContent(),
        'restore workspace: Projects',
      )
      await finishStartup(page)
      await assertReleased(page)
      assert.equal(
        await page.locator('.os-stage').getAttribute('data-view'),
        'projects',
      )
      assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), '/projects')
    })
  },
)

test(
  'Deep links land intact, and repeated automatic replay restores the invoking control and saved layout',
  options,
  async () => {
    await withPage(async page => {
      await go(page, '/arcade?game=lights-out')
      assert.equal(
        await page.locator('.os-boot-workspace strong').textContent(),
        'load workspace: Desktop',
      )
      assert.equal(
        await page.locator('.os-boot-destination strong').textContent(),
        'open Arcade',
      )
      await finishStartup(page)
      assert.equal(new URL(page.url()).search, '?game=lights-out')
      assert.equal(
        await page
          .getByRole('region', { name: 'Lights Out', exact: true })
          .isVisible(),
        true,
      )
      await page
        .getByRole('button', { name: 'Open Settings', exact: true })
        .click()
      const replay = page.getByRole('button', { name: /Replay startup/ })
      await replay.waitFor()
      await page.waitForURL(
        url => url.pathname.replace(/\/$/, '') === '/settings',
      )
      await page.waitForFunction(() => {
        const saved = JSON.parse(sessionStorage.getItem('spdev-desktop-v2'))
        return saved?.routes.settings?.replace(/\/$/, '') === '/settings'
      })
      const saved = await page.evaluate(() =>
        sessionStorage.getItem('spdev-desktop-v2'),
      )
      for (let repeat = 0; repeat < 3; repeat += 1) {
        await replay.click()
        await page.locator('.os-desktop[data-startup="presenting"]').waitFor()
        await page.keyboard.press('Escape')
        await page.keyboard.press('Enter')
        assert.equal(
          await page.locator('.os-desktop').getAttribute('data-startup'),
          'presenting',
        )
        await finishStartup(page)
        await assertReleased(page)
        assert.equal(
          await replay.evaluate(node => node === document.activeElement),
          true,
        )
      }
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem('spdev-desktop-v2')),
        saved,
      )
      await page.goBack({ waitUntil: 'domcontentloaded' })
      assert.equal(
        await page.locator('.os-desktop').getAttribute('data-startup'),
        'complete',
      )
    })
  },
)

test(
  'An article URL survives automatic startup and focus moves into its content',
  options,
  async () => {
    await withPage(async page => {
      await go(page, '/portfolio')
      assert.equal(
        await page.locator('.os-boot-destination strong').textContent(),
        'open Portfolio',
      )
      await finishStartup(page)
      assert.equal(
        new URL(page.url()).pathname.replace(/\/$/, ''),
        '/portfolio',
      )
      assert.equal(
        await page.locator('#os-window-projects h1').first().isVisible(),
        true,
      )
      assert.equal(
        await page.evaluate(
          () => !!document.activeElement?.closest('#os-window-projects'),
        ),
        true,
      )
    })
  },
)

test(
  'A long article destination and Ready remain inside a short landscape viewport',
  options,
  async () => {
    await withPage(
      async page => {
        await go(page, '/using-imagegen-in-codex-to-rebuild-project-icons/')
        await page.waitForFunction(() => {
          const ready = document.querySelector('.os-boot-ready .os-boot-done')
          const characters = Array.from(
            document.querySelectorAll('.os-boot-char'),
          )
          return (
            ready &&
            Number(getComputedStyle(ready).opacity) >= 0.98 &&
            characters.length > 0 &&
            characters.every(
              node => Number(getComputedStyle(node).opacity) >= 0.98,
            ) &&
            document.querySelector('.os-desktop').dataset.startup ===
              'presenting'
          )
        })
        const regions = await page.evaluate(() =>
          [
            '.os-boot-logo',
            '.os-boot-identity h1',
            '.os-boot-transcript',
            '.os-boot-ready',
          ].map(selector => {
            const rect = document
              .querySelector(selector)
              .getBoundingClientRect()
            return {
              selector,
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
            }
          }),
        )
        for (const region of regions) {
          assert.ok(region.top >= 0, `${region.selector} clears the top edge`)
          assert.ok(
            region.bottom <= 378,
            `${region.selector} leaves at least 12px below it (${region.bottom}px)`,
          )
          assert.ok(
            region.left >= 20 && region.right <= 824,
            `${region.selector} stays inside the side gutters`,
          )
        }
        await finishStartup(page)
        await assertReleased(page)
      },
      { viewport: { width: 844, height: 390 } },
    )
  },
)

for (const mode of ['reduced', 'stored']) {
  test(
    `The ${mode} motion preference preserves the full typed startup on a phone`,
    options,
    async () => {
      await withPage(
        async page => {
          if (mode === 'stored')
            await page.addInitScript(() =>
              localStorage.setItem(
                'spdev-preferences',
                JSON.stringify({
                  wallpaper: 'afterglow',
                  motion: false,
                  sound: false,
                }),
              ),
            )
          await go(page)
          const progress = await observeTyping(page)
          assert.ok(
            progress.elapsed >= 2400 && progress.elapsed <= 3300,
            `The full boot ran for only ${Math.round(progress.elapsed)}ms under ${mode} motion`,
          )
          assertTypedProgress(progress)
          await finishStartup(page)
          await assertReleased(page)
          assert.equal(
            await page.locator('.os-desktop.os-motion').count(),
            0,
            'The desktop keeps its own motion preference',
          )
          assert.equal(await page.locator('#os-window-about').isVisible(), true)
        },
        {
          viewport: { width: 320, height: 740 },
          reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
        },
      )
    },
  )
}

test(
  'A mid-boot system motion change cannot complete or shorten the typing clock',
  options,
  async () => {
    await withPage(async page => {
      await go(page)
      const observing = observeTyping(page)
      await page.waitForFunction(() => {
        const characters = Array.from(
          document.querySelectorAll('.os-boot-command .os-boot-char'),
        )
        const visible = characters.filter(
          node => Number(getComputedStyle(node).opacity) >= 0.98,
        ).length
        return visible > 0 && visible < characters.length
      })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      assert.equal(
        await page.locator('.os-desktop').getAttribute('data-startup'),
        'presenting',
      )
      const progress = await observing
      assert.ok(
        progress.elapsed >= 2400 && progress.elapsed <= 3300,
        `The motion change shortened the boot to ${Math.round(progress.elapsed)}ms`,
      )
      assertTypedProgress(progress)
      await finishStartup(page)
      await assertReleased(page)
    })
  },
)

test(
  'Missing or running document markers recover the active typing clock',
  options,
  async () => {
    for (const marker of ['missing', 'running']) {
      await withPage(async page => {
        let release
        const bundles = new Promise(resolve => {
          release = resolve
        })
        await page.route('**/*', async route => {
          if (route.request().resourceType() === 'script') await bundles
          await route.continue()
        })
        try {
          await page.goto(new URL('/', testUrl).href, { waitUntil: 'commit' })
          await page.locator('.os-boot').waitFor({ state: 'visible' })
          await page.evaluate(value => {
            if (value === 'missing')
              delete document.documentElement.dataset.spdevStartup
            else document.documentElement.dataset.spdevStartup = value
          }, marker)
        } finally {
          release()
        }
        await page.locator('.os-desktop.os-ready').waitFor()
        await page.waitForFunction(() => {
          const chars = Array.from(
            document.querySelectorAll('.os-boot-command .os-boot-char'),
          )
          const visible = chars.filter(
            node => Number(getComputedStyle(node).opacity) >= 0.98,
          ).length
          return visible > 0 && visible < chars.length
        })
        assert.equal(
          await page.locator('.os-desktop').getAttribute('data-startup'),
          'presenting',
        )
        assert.equal(
          await page.evaluate(
            () => document.documentElement.dataset.spdevStartup,
          ),
          'running',
        )
        assert.equal(
          await page.locator('.os-stage').evaluate(node => node.inert),
          true,
        )
      })
    }
  },
)

test(
  'No JavaScript leaves the server-rendered article readable',
  options,
  async () => {
    await withPage(
      async page => {
        await page.goto(new URL('/portfolio', testUrl).href, {
          waitUntil: 'domcontentloaded',
        })
        assert.equal(await page.locator('.os-boot').isVisible(), false)
        assert.equal(
          await page
            .locator('.os-stage')
            .evaluate(node => getComputedStyle(node).opacity),
          '1',
        )
        assert.equal(
          await page.locator('#os-window-projects h1').first().isVisible(),
          true,
        )
        assert.equal(await page.locator('[inert]').count(), 0)
      },
      { javaScriptEnabled: false },
    )
  },
)

test(
  'The prepaint watchdog exposes content when bundles stall and delayed hydration does not revive startup',
  options,
  async () => {
    await withPage(async page => {
      let release
      const bundles = new Promise(resolve => {
        release = resolve
      })
      await page.route('**/*', async route => {
        if (route.request().resourceType() === 'script') await bundles
        await route.continue()
      })
      try {
        await page.goto(new URL('/portfolio', testUrl).href, {
          waitUntil: 'commit',
        })
        await page.locator('.os-boot').waitFor({ state: 'visible' })
        await page.waitForFunction(
          () => document.documentElement.dataset.spdevStartup === 'complete',
          undefined,
          { timeout: 25000 },
        )
        assert.equal(await page.locator('.os-boot').isVisible(), false)
        assert.equal(await page.locator('[inert]').count(), 0)
        assert.equal(
          await page.locator('#os-window-projects h1').first().isVisible(),
          true,
        )
      } finally {
        release()
      }
      await page
        .locator('.os-desktop.os-ready[data-startup="complete"]')
        .waitFor()
      await assertReleased(page)
      assert.equal(
        await page.locator('#os-window-projects h1').first().isVisible(),
        true,
      )
    })
  },
)
