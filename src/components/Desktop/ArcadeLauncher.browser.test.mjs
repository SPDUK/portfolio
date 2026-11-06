import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { games } from './arcadeCatalog.ts'
import { finishStartup } from './browserStartup.mjs'

const require = createRequire(import.meta.url)
const testUrl = process.env.PLAY_TEST_URL
const options = { skip: !testUrl, timeout: 90000 }

async function withPage(run, pageOptions = {}) {
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
      ...pageOptions,
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await run(page)
    assert.deepEqual(errors, [], 'No uncaught browser errors')
  } finally {
    await browser.close()
  }
}

async function openArcade(page, route = '/arcade') {
  await page.goto(new URL(route, testUrl).href, { waitUntil: 'networkidle' })
  await finishStartup(page)
}

function launcher(page) {
  return page.getByRole('region', { name: 'Game select', exact: true })
}

async function assertSelection(page, label, focused = false) {
  const choices = launcher(page).getByRole('radiogroup', {
    name: 'Choose a game',
    exact: true,
  })
  const selected = choices.getByRole('radio', { name: label, exact: true })
  assert.equal(await selected.getAttribute('aria-checked'), 'true')
  assert.equal(
    await choices.locator('[role="radio"][aria-checked="true"]').count(),
    1,
    'Exactly one game is selected',
  )
  assert.deepEqual(
    await choices.getByRole('radio').evaluateAll(radios =>
      radios.map(radio => ({
        selected: radio.getAttribute('aria-checked') === 'true',
        tabIndex: radio.tabIndex,
      })),
    ),
    games.map(game => ({
      selected: game.label === label,
      tabIndex: game.label === label ? 0 : -1,
    })),
    'Only the selected game is in the tab order',
  )
  if (focused)
    assert.equal(
      await selected.evaluate(element => element === document.activeElement),
      true,
      'Keyboard navigation moves focus with selection',
    )
}

async function assertNoGameMounted(page) {
  const arcade = page.getByRole('region', { name: 'Arcade', exact: true })
  for (const game of games)
    assert.equal(
      await arcade
        .getByRole('region', { name: game.label, exact: true })
        .count(),
      0,
      `${game.label} stays unmounted while browsing`,
    )
}

async function assertGameRoute(page, id) {
  await page.waitForURL(url => url.searchParams.get('game') === id)
  await launcher(page).waitFor({ state: 'hidden' })
  assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), '/arcade')
  assert.equal(new URL(page.url()).searchParams.get('game'), id)
  assert.equal(await launcher(page).count(), 0)
}

test(
  'Plain and invalid arcade routes open a silent launcher with Asteroids selected',
  options,
  async () => {
    await withPage(async page => {
      await page.addInitScript(() => {
        window.__launcherAudioContexts = 0
        window.__launcherMediaPlays = 0
        const NativeAudioContext = window.AudioContext
        window.AudioContext = class extends NativeAudioContext {
          constructor(...args) {
            super(...args)
            window.__launcherAudioContexts += 1
          }
        }
        const nativePlay = HTMLMediaElement.prototype.play
        HTMLMediaElement.prototype.play = function (...args) {
          window.__launcherMediaPlays += 1
          return nativePlay.apply(this, args)
        }
      })
      for (const route of [
        '/arcade',
        '/arcade?game=',
        '/arcade?game=unknown',
      ]) {
        await openArcade(page, route)
        await launcher(page).waitFor()
        await assertSelection(page, 'Asteroids')
        const initialUrl = page.url()
        for (const game of games) {
          await launcher(page)
            .getByRole('radio', { name: game.label, exact: true })
            .click()
          await assertSelection(page, game.label)
          const artwork = await launcher(page)
            .getByRole('img', {
              name: `${game.label} pixel artwork`,
              exact: true,
            })
            .evaluate(async image => {
              await image.decode()
              return {
                src: image.currentSrc,
                alt: image.alt,
                width: image.naturalWidth,
              }
            })
          assert.equal(
            artwork.src,
            new URL(`/arcade/${game.id}.png`, testUrl).href,
            `${game.label} displays its bundled artwork`,
          )
          assert.equal(artwork.alt, `${game.label} pixel artwork`)
          assert.ok(
            artwork.width > 0,
            `${game.label} artwork loads and decodes`,
          )
          await assertNoGameMounted(page)
          assert.equal(
            page.url(),
            initialUrl,
            'Selecting a game preserves the URL',
          )
        }
        assert.deepEqual(
          await page.evaluate(() => ({
            contexts: window.__launcherAudioContexts,
            mediaPlays: window.__launcherMediaPlays,
          })),
          { contexts: 0, mediaPlays: 0 },
          'Loading and browsing never create or play audio',
        )
      }
    })
  },
)

test(
  'Launcher arrows wrap, Home and End navigate, Space selects, and Enter launches',
  options,
  async () => {
    await withPage(async page => {
      await openArcade(page)
      await launcher(page)
        .getByRole('radio', { name: 'Asteroids', exact: true })
        .focus()
      const initialUrl = page.url()
      for (const [key, label] of [
        ['End', 'Prism Relay'],
        ['ArrowUp', 'Gravity Sling'],
        ['Home', 'Asteroids'],
        ['ArrowUp', 'Prism Relay'],
        ['ArrowDown', 'Asteroids'],
        ['ArrowDown', 'Snake'],
        ['Space', 'Snake'],
      ]) {
        await page.keyboard.press(key)
        await assertSelection(page, label, true)
        await assertNoGameMounted(page)
        assert.equal(page.url(), initialUrl)
      }
      await page.keyboard.press('Enter')
      await page.getByRole('region', { name: 'Snake', exact: true }).waitFor()
      await assertGameRoute(page, 'snake')
    })
  },
)

test(
  'Initial heading focus supports arrows, and Escape or Minimize preserves selection when reopened',
  options,
  async () => {
    await withPage(async page => {
      await openArcade(page)
      await page.waitForFunction(
        () =>
          document.activeElement?.tagName === 'H1' &&
          document.activeElement.textContent === 'SPDEV ARCADE',
      )
      await page.keyboard.press('ArrowDown')
      await assertSelection(page, 'Snake', true)
      await assertNoGameMounted(page)
      const window = page.getByRole('region', {
        name: 'Arcade window',
        exact: true,
      })
      const reopen = page
        .getByRole('navigation', { name: 'Applications', exact: true })
        .getByRole('link', { name: 'Arcade', exact: true })

      await page.keyboard.press('Escape')
      await window.waitFor({ state: 'hidden' })
      await reopen.click()
      await launcher(page).waitFor()
      await assertSelection(page, 'Snake')
      await page
        .getByRole('button', { name: 'Minimize Arcade', exact: true })
        .click()
      await window.waitFor({ state: 'hidden' })
      await reopen.click()
      await launcher(page).waitFor()
      await assertSelection(page, 'Snake')
      const start = launcher(page).getByRole('button', {
        name: 'Start game',
        exact: true,
      })
      await start.focus()
      await page.keyboard.press('Enter')
      await page.getByRole('region', { name: 'Snake', exact: true }).waitFor()
      await assertGameRoute(page, 'snake')
    })
  },
)

test(
  'Start launches the selected game and button or Escape returns to the remembered choice',
  options,
  async () => {
    await withPage(async page => {
      await openArcade(page)
      for (const [id, label, returnWithEscape] of [
        ['snake', 'Snake', false],
        ['prism-relay', 'Prism Relay', true],
      ]) {
        await launcher(page)
          .getByRole('radio', { name: label, exact: true })
          .click()
        await assertNoGameMounted(page)
        await launcher(page)
          .getByRole('button', { name: 'Start game', exact: true })
          .click()
        await page.getByRole('region', { name: label, exact: true }).waitFor()
        await assertGameRoute(page, id)
        if (returnWithEscape) await page.keyboard.press('Escape')
        else
          await page
            .getByRole('button', { name: 'Back to game select', exact: true })
            .click()
        await launcher(page).waitFor()
        await page.waitForURL(url => url.search === '')
        await assertSelection(page, label)
        await assertNoGameMounted(page)
      }
    })
  },
)

test(
  'Wheel input uses a threshold and cooldown while leaving games unmounted',
  options,
  async () => {
    await withPage(async page => {
      await openArcade(page)
      const list = launcher(page).getByRole('radiogroup', {
        name: 'Choose a game',
        exact: true,
      })
      const initialUrl = page.url()
      await list.dispatchEvent('wheel', { deltaY: 1 })
      await assertSelection(page, 'Asteroids')
      await list.evaluate(element => {
        for (let event = 0; event < 3; event += 1)
          element.dispatchEvent(
            new WheelEvent('wheel', {
              deltaY: 140,
              bubbles: true,
              cancelable: true,
            }),
          )
      })
      await assertSelection(page, 'Snake')
      await page.waitForTimeout(1000)
      await list.hover()
      await page.mouse.wheel(0, -140)
      await list
        .getByRole('radio', { name: 'Asteroids', exact: true, checked: true })
        .waitFor()
      await assertSelection(page, 'Asteroids')
      await assertNoGameMounted(page)
      assert.equal(page.url(), initialUrl)
    })
  },
)

test(
  'Every explicit game deep link opens its game directly, and terminal play still launches Snake',
  options,
  async () => {
    await withPage(async page => {
      for (const game of games) {
        await openArcade(page, `/arcade?game=${game.id}`)
        await page
          .getByRole('region', { name: game.label, exact: true })
          .waitFor()
        await assertGameRoute(page, game.id)
        assert.equal(
          await page
            .getByRole('button', { name: 'Back to game select', exact: true })
            .isVisible(),
          true,
        )
      }
      await openArcade(page, '/terminal')
      await page
        .getByLabel('Terminal command', { exact: true })
        .fill('play snake')
      await page
        .getByRole('button', { name: 'Run command', exact: true })
        .click()
      await page.getByRole('region', { name: 'Snake', exact: true }).waitFor()
      await assertGameRoute(page, 'snake')
    })
  },
)

test(
  'Desktop launcher fits responsive viewports, long game copy and footer controls inside the CRT screen',
  { ...options, timeout: 180000 },
  async context => {
    const configurations = [
      {
        deviceScaleFactor: 1,
        viewports: [
          { width: 2554, height: 1324 },
          { width: 2560, height: 1080 },
          { width: 1920, height: 900 },
          { width: 1440, height: 1000 },
          { width: 1666, height: 1082 },
          { width: 1440, height: 900 },
          { width: 1366, height: 768 },
          { width: 1280, height: 720 },
          { width: 1024, height: 768 },
          { width: 768, height: 1024 },
          { width: 820, height: 1180 },
          { width: 844, height: 390 },
          { width: 740, height: 360 },
          { width: 390, height: 844 },
          { width: 320, height: 568 },
        ],
      },
      {
        deviceScaleFactor: 1.25,
        viewports: [{ width: 2043, height: 1059 }],
      },
    ]
    const variants = ['breakout', 'asteroids', 'gravity-sling', 'prism-relay']
    const fits = (inner, outer, tolerance = 0.1) =>
      inner.left >= outer.left - tolerance &&
      inner.right <= outer.right + tolerance &&
      inner.top >= outer.top - tolerance &&
      inner.bottom <= outer.bottom + tolerance

    for (const configuration of configurations)
      await withPage(
        async page => {
          await openArcade(page)
          assert.equal(
            await page.evaluate(() => window.devicePixelRatio),
            configuration.deviceScaleFactor,
          )
          await page
            .getByRole('button', { name: 'Maximize Arcade', exact: true })
            .click()
          await page
            .getByRole('button', { name: 'Restore Arcade', exact: true })
            .waitFor()
          for (const viewport of configuration.viewports)
            await context.test(
              `${viewport.width}x${viewport.height} at DPR ${configuration.deviceScaleFactor}`,
              async sample => {
                await page.setViewportSize(viewport)
                await page.evaluate(
                  () =>
                    new Promise(resolve =>
                      requestAnimationFrame(() =>
                        requestAnimationFrame(resolve),
                      ),
                    ),
                )
                let minimumClearance = Infinity
                for (const id of variants) {
                  const index = games.findIndex(game => game.id === id)
                  const game = games[index]
                  const menu = launcher(page).getByRole('radiogroup', {
                    name: 'Choose a game',
                    exact: true,
                  })
                  await menu.getByRole('radio', { checked: true }).focus()
                  await page.keyboard.press('Home')
                  for (let step = 0; step < index; step += 1)
                    await page.keyboard.press('ArrowDown')
                  await assertSelection(page, game.label, true)
                  await launcher(page)
                    .getByRole('img', {
                      name: `${game.label} pixel artwork`,
                      exact: true,
                    })
                    .evaluate(image => image.decode())
                  const geometry = await launcher(page).evaluate(root => {
                    const bounds = element =>
                      element.getBoundingClientRect().toJSON()
                    const screen = root.querySelector('.os-crt-screen')
                    const list = root.querySelector('[role="radiogroup"]')
                    return {
                      root: bounds(root),
                      content: bounds(root.closest('.os-window-content')),
                      screen: bounds(screen),
                      screenScrollWidth: screen.scrollWidth,
                      screenClientWidth: screen.clientWidth,
                      screenScrollHeight: screen.scrollHeight,
                      screenClientHeight: screen.clientHeight,
                      list: bounds(list),
                      listScrollHeight: list.scrollHeight,
                      listClientHeight: list.clientHeight,
                      heading: bounds(screen.querySelector('h1')),
                      start: bounds(screen.querySelector('.os-crt-start')),
                      footer: bounds(screen.querySelector('.os-crt-footer')),
                      choices: Array.from(
                        list.querySelectorAll('[role="radio"]'),
                        element => ({
                          selected:
                            element.getAttribute('aria-checked') === 'true',
                          ...bounds(element),
                        }),
                      ),
                      keycaps: Array.from(
                        screen.querySelectorAll('.os-crt-footer kbd'),
                        bounds,
                      ).filter(rect => rect.width > 0 && rect.height > 0),
                    }
                  })
                  const label = `${game.label} at ${viewport.width}x${viewport.height}`
                  const viewportBounds = {
                    left: 0,
                    top: 0,
                    right: viewport.width,
                    bottom: viewport.height,
                  }
                  assert.ok(
                    fits(geometry.root, geometry.content),
                    `${label}: CRT ${geometry.root.width}x${geometry.root.height} fits actual window content ${geometry.content.width}x${geometry.content.height}`,
                  )
                  assert.ok(
                    fits(geometry.root, viewportBounds),
                    `${label}: CRT fits the viewport`,
                  )
                  assert.ok(
                    fits(geometry.screen, geometry.root),
                    `${label}: screen fits the bezel`,
                  )
                  assert.ok(
                    fits(geometry.list, geometry.screen),
                    `${label}: game list fits inside the screen`,
                  )
                  assert.ok(
                    geometry.screenScrollWidth <=
                      geometry.screenClientWidth + 1,
                    `${label}: screen has no horizontal overflow (${geometry.screenScrollWidth}/${geometry.screenClientWidth})`,
                  )
                  assert.ok(
                    geometry.screenScrollHeight <=
                      geometry.screenClientHeight + 1,
                    `${label}: screen has no vertical overflow (${geometry.screenScrollHeight}/${geometry.screenClientHeight})`,
                  )
                  assert.equal(geometry.choices.length, games.length)
                  assert.ok(geometry.keycaps.length >= 3)
                  for (const control of [
                    { name: 'Heading', ...geometry.heading },
                    { name: 'Start game', ...geometry.start },
                    { name: 'Footer', ...geometry.footer },
                    ...geometry.keycaps.map((keycap, keycapIndex) => ({
                      name: `Footer keycap ${keycapIndex + 1}`,
                      ...keycap,
                    })),
                  ]) {
                    assert.ok(control.width > 0 && control.height > 0)
                    assert.ok(
                      fits(control, geometry.screen),
                      `${label}: ${control.name} fits inside the screen`,
                    )
                  }
                  const clearance = Math.min(
                    ...geometry.keycaps.map(
                      keycap => geometry.screen.bottom - keycap.bottom,
                    ),
                  )
                  minimumClearance = Math.min(minimumClearance, clearance)
                  assert.ok(
                    clearance >= 7.9,
                    `${label}: footer keycaps retain the 8px safe margin (${clearance}px)`,
                  )
                  const selected = geometry.choices.find(
                    choice => choice.selected,
                  )
                  assert.ok(
                    fits(selected, geometry.list, 1),
                    `${label}: selected game is visible in the list (choice ${selected.top}..${selected.bottom}, list ${geometry.list.top}..${geometry.list.bottom})`,
                  )
                  if (viewport.width <= 1024 || viewport.height <= 768) {
                    assert.ok(
                      geometry.choices.every(
                        choice => choice.width >= 44 && choice.height >= 44,
                      ),
                      `${label}: game choices retain 44px touch targets`,
                    )
                    assert.ok(
                      geometry.start.width >= 44 && geometry.start.height >= 44,
                      `${label}: Start retains a 44px touch target`,
                    )
                  }
                  if (
                    (viewport.width === 1440 && viewport.height === 1000) ||
                    (viewport.width === 1666 && viewport.height === 1082)
                  ) {
                    assert.ok(
                      geometry.listScrollHeight <=
                        geometry.listClientHeight + 1,
                      `${label}: all eight choices fit without list scrolling`,
                    )
                    assert.ok(
                      geometry.choices.every(choice =>
                        fits(choice, geometry.list),
                      ),
                    )
                  }
                }
                await page.keyboard.press('End')
                await assertSelection(page, 'Prism Relay', true)
                const visibleSelection = await launcher(page)
                  .getByRole('radio', { name: 'Prism Relay', exact: true })
                  .evaluate(element => ({
                    choice: element.getBoundingClientRect().toJSON(),
                    list: element
                      .closest('[role="radiogroup"]')
                      .getBoundingClientRect()
                      .toJSON(),
                  }))
                assert.ok(
                  fits(visibleSelection.choice, visibleSelection.list, 1),
                  'End scrolls the last selected game into view',
                )
                sample.diagnostic(
                  `Four game variants fit; minimum footer clearance ${minimumClearance}px`,
                )
              },
            )
        },
        {
          viewport: configuration.viewports[0],
          deviceScaleFactor: configuration.deviceScaleFactor,
          reducedMotion: 'reduce',
        },
      )
  },
)

for (const width of [320, 390])
  test(
    `All eight games can be selected, started, and left at ${width}px without overflow`,
    options,
    async () => {
      await withPage(
        async page => {
          await openArcade(page)
          const arcade = page.getByRole('region', {
            name: 'Arcade',
            exact: true,
          })
          for (const game of games) {
            const choice = launcher(page).getByRole('radio', {
              name: game.label,
              exact: true,
            })
            await choice.tap()
            await assertSelection(page, game.label)
            const choiceBounds = await choice.boundingBox()
            assert.ok(choiceBounds.height >= 44 && choiceBounds.width >= 44)
            await assertNoGameMounted(page)
            await launcher(page)
              .getByRole('button', { name: 'Start game', exact: true })
              .tap()
            await page
              .getByRole('region', { name: game.label, exact: true })
              .waitFor()
            await assertGameRoute(page, game.id)
            assert.equal(
              await arcade.evaluate(
                element => element.scrollWidth <= element.clientWidth + 1,
              ),
              true,
              `${game.label} fits the arcade at ${width}px`,
            )
            const back = page.getByRole('button', {
              name: 'Back to game select',
              exact: true,
            })
            await back.scrollIntoViewIfNeeded()
            assert.ok((await back.boundingBox()).height >= 44)
            await back.tap()
            await launcher(page).waitFor()
            await assertSelection(page, game.label)
            assert.equal(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth,
              ),
              true,
              `The launcher fits the viewport after ${game.label}`,
            )
            assert.equal(
              await arcade.evaluate(
                element => element.scrollWidth <= element.clientWidth + 1,
              ),
              true,
            )
          }
        },
        {
          viewport: { width, height: 740 },
          hasTouch: true,
          isMobile: true,
          reducedMotion: 'reduce',
        },
      )
    },
  )
