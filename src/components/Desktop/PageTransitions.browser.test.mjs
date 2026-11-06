import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { finishStartup } from './browserStartup.mjs'

const require = createRequire(import.meta.url)
const testUrl = process.env.PLAY_TEST_URL
const options = { skip: !testUrl, timeout: 60000 }

async function withPage(
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
        window.__pageTransitions = []
        window.__routeCommits = []
        for (const method of ['pushState', 'replaceState']) {
          const original = history[method].bind(history)
          history[method] = (...args) => {
            const result = original(...args)
            window.__routeCommits.push(
              location.pathname.replace(/\/$/, '') || '/',
            )
            return result
          }
        }
        if (!native) {
          document.startViewTransition = undefined
          return
        }
        const start = document.startViewTransition.bind(document)
        const named = () =>
          Array.from(document.querySelectorAll('.os-stage *'))
            .filter(element => element.style.viewTransitionName)
            .map(element => ({
              name: element.style.viewTransitionName,
              transitionClass: element.style.getPropertyValue(
                'view-transition-class',
              ),
              tag: element.tagName,
              text:
                element.style.viewTransitionName === 'os-page-title'
                  ? element.textContent.trim()
                  : '',
              rect: element.getBoundingClientRect().toJSON(),
            }))
        document.startViewTransition = update => {
          const record = { from: location.pathname, old: named(), done: false }
          window.__pageTransitions.push(record)
          const transition = start(async () => {
            await update()
            record.to = location.pathname
            record.new = named()
          })
          transition.ready
            .then(() => {
              record.direction = document.documentElement.dataset.pageTransition
              record.scope =
                document.documentElement.dataset.pageTransitionScope
              record.sequence =
                document.documentElement.dataset.pageTransitionSequence
              record.titleDuration =
                parseFloat(
                  getComputedStyle(
                    document.documentElement,
                    '::view-transition-group(os-page-title)',
                  ).animationDuration,
                ) * 1000
              record.titleDelay =
                parseFloat(
                  getComputedStyle(
                    document.documentElement,
                    '::view-transition-group(os-page-title)',
                  ).animationDelay,
                ) * 1000
              record.collectionDelay =
                parseFloat(
                  getComputedStyle(
                    document.documentElement,
                    '::view-transition-new(os-page)',
                  ).animationDelay,
                ) * 1000
              const partView =
                record.sequence === 'article-return' ? 'old' : 'new'
              record.parts = record[partView]
                .filter(element => element.name.startsWith('os-article-part-'))
                .map(element => {
                  const style = getComputedStyle(
                    document.documentElement,
                    `::view-transition-${partView}(${element.name})`,
                  )
                  return {
                    name: element.name,
                    delay: parseFloat(style.animationDelay) * 1000,
                    opacity: Number(style.opacity),
                  }
                })
              if (record.sequence && window.__pauseArticle) {
                window.__articleAnimations = document
                  .getAnimations()
                  .filter(animation =>
                    animation.effect?.pseudoElement?.startsWith(
                      '::view-transition',
                    ),
                  )
                window.__articleAnimations.forEach(animation =>
                  animation.pause(),
                )
              }
              if (record.sequence && window.__probeArticle) {
                setTimeout(() => {
                  record.titlePhase = {
                    sequence:
                      document.documentElement.dataset.pageTransitionSequence,
                    oldSurfaceOpacity: Number(
                      getComputedStyle(
                        document.documentElement,
                        '::view-transition-old(os-page)',
                      ).opacity,
                    ),
                    contentOpacity: record.parts.map(part =>
                      Number(
                        getComputedStyle(
                          document.documentElement,
                          `::view-transition-new(${part.name})`,
                        ).opacity,
                      ),
                    ),
                  }
                }, record.titleDuration * 0.7)
              }
              record.opacity = ['old', 'new'].map(view =>
                Number(
                  getComputedStyle(
                    document.documentElement,
                    `::view-transition-${view}(os-page)`,
                  ).opacity,
                ),
              )
              record.windowOpacity = Array.from(
                document.querySelectorAll('.os-window:not([hidden])'),
              ).map(element => Number(getComputedStyle(element).opacity))
            })
            .catch(error => {
              record.error = error.message
            })
          transition.finished.then(() => {
            record.done = true
          })
          return transition
        }
      },
      { motion, native },
    )
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    if (beforeLoad) await beforeLoad(page)
    await page.goto(testUrl)
    await finishStartup(page)
    await run(page)
    assert.deepEqual(errors, [], 'Navigation has no uncaught browser errors')
  } finally {
    await browser.close()
  }
}

async function settled(page, pathname) {
  await page.waitForURL(
    url => url.pathname.replace(/\/$/, '') === pathname.replace(/\/$/, ''),
  )
  await page.waitForFunction(
    () => !document.documentElement.dataset.pageTransition,
  )
}

const projectCard = page =>
  page
    .locator('#os-window-projects [data-document-link]')
    .filter({ hasText: 'Kishu Stack' })

test(
  'page stack retains opaque views and morphs the selected project title',
  options,
  async () => {
    await withPage(async page => {
      const shell = await page.locator('.os-panel').boundingBox()
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      assert.equal(
        await page.locator('.os-reader h1').textContent(),
        'Kishu Stack',
      )
      const records = await page.evaluate(() => window.__pageTransitions)
      assert.equal(records.length, 2)
      records.forEach(record => {
        assert.equal(
          record.error,
          undefined,
          'Native snapshots successfully animate',
        )
        assert.deepEqual(
          record.opacity,
          [1, 1],
          'Both page surfaces stay opaque',
        )
        assert.ok(
          record.windowOpacity.every(opacity => opacity === 1),
          'Window entrance never fades the captured page',
        )
      })
      const title = record =>
        record.find(element => element.name === 'os-page-title')
      const entry = records.at(-1)
      assert.equal(title(entry.old).text, 'Kishu Stack')
      assert.equal(title(entry.new).text, 'Kishu Stack')
      assert.notEqual(
        title(entry.old).rect.y,
        title(entry.new).rect.y,
        'The title connects its card and reading positions',
      )
      assert.deepEqual(
        await page.locator('.os-panel').boundingBox(),
        shell,
        'Desktop chrome stays anchored',
      )
    })
  },
)

test(
  'returning to the collection preserves the search and reconnects its title',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await page
        .getByRole('searchbox', { name: 'Search projects' })
        .fill('Kishu')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      await page
        .getByRole('button', { name: 'Back to projects', exact: true })
        .click()
      await settled(page, '/projects')
      assert.equal(
        await page
          .getByRole('searchbox', { name: 'Search projects' })
          .inputValue(),
        'Kishu',
      )
      const record = await page.evaluate(() => window.__pageTransitions.at(-1))
      assert.equal(record.direction, 'backward')
      assert.equal(
        record.old.find(element => element.name === 'os-page-title').text,
        'Kishu Stack',
      )
      assert.equal(
        record.new.find(element => element.name === 'os-page-title').text,
        'Kishu Stack',
      )
    })
  },
)

test(
  'browser back and forward reverse the page stack and reach the correct document',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      await page.goBack()
      await settled(page, '/projects')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.at(-1).direction),
        'backward',
      )
      await page.goForward()
      await settled(page, '/kishu-stack')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.at(-1).direction),
        'forward',
      )
      assert.equal(
        await page.locator('.os-reader h1').textContent(),
        'Kishu Stack',
      )
    })
  },
)

test(
  'quick workspace choices settle on the latest request without leaving a snapshot overlay',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await page
        .getByRole('button', { name: 'Writing view', exact: true })
        .click()
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      assert.equal(
        await page.locator('.os-stage').getAttribute('data-view'),
        'projects',
      )
      assert.equal(
        await page.locator('.os-window:not([hidden]) h1').textContent(),
        'Projects',
      )
      assert.equal(
        await page.locator('[style*="view-transition-name"]').count(),
        0,
      )
      await page
        .getByRole('button', { name: 'Desktop view', exact: true })
        .click()
      await settled(page, '/')
    })
  },
)

for (const [name, settings] of [
  ['reduced motion', { reducedMotion: 'reduce' }],
  ['desktop animations disabled', { motion: false }],
  ['a browser without native view transitions', { native: false }],
]) {
  test(`navigation stays usable with ${name}`, options, async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      assert.equal(
        await page.locator('.os-reader h1').textContent(),
        'Kishu Stack',
      )
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        0,
      )
    }, settings)
  })
}

test(
  'shared titles and page stacks work on a narrow phone',
  options,
  async () => {
    await withPage(
      async page => {
        const navigation = page.getByRole('navigation', {
          name: 'Primary navigation',
        })
        await navigation
          .getByRole('button', { name: 'Projects', exact: true })
          .click()
        await settled(page, '/projects')
        await projectCard(page).click()
        await settled(page, '/kishu-stack')
        assert.equal(
          await page.locator('.os-reader h1').textContent(),
          'Kishu Stack',
        )
        const record = await page.evaluate(() =>
          window.__pageTransitions.at(-1),
        )
        assert.equal(record.error, undefined)
        assert.equal(
          record.new.find(element => element.name === 'os-page-title').text,
          'Kishu Stack',
        )
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        )
        await navigation
          .getByRole('button', { name: 'About', exact: true })
          .click()
        await settled(page, '/')
      },
      { viewport: { width: 320, height: 740 } },
    )
  },
)

test(
  'an offscreen article heading does not create a detached incoming title',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      await page
        .locator('#os-window-projects .os-library-scroll')
        .evaluate(element => {
          element.scrollTop = 700
        })
      await page.goBack()
      await settled(page, '/projects')
      const record = await page.evaluate(() => window.__pageTransitions.at(-1))
      assert.equal(
        record.old.some(element => element.name === 'os-page-title'),
        false,
      )
      assert.equal(
        record.new.some(element => element.name === 'os-page-title'),
        false,
      )
      assert.equal(record.error, undefined)
    })
  },
)

test(
  'cross-app history keeps workspace-sized snapshots and rapid Back reaches home',
  options,
  async () => {
    await withPage(async page => {
      await page
        .locator('.os-selected-projects [data-document-link]')
        .filter({ hasText: 'Kishu Stack' })
        .click()
      await settled(page, '/kishu-stack')
      await page
        .getByRole('button', { name: 'Writing view', exact: true })
        .click()
      await settled(page, '/blog')
      await page.goBack()
      await page.goBack()
      await page.waitForURL(url => url.pathname === '/')
      await page.waitForFunction(
        () => !document.documentElement.dataset.pageTransition,
        null,
        { timeout: 2500 },
      )
      assert.equal(
        await page.locator('.os-stage').getAttribute('data-view'),
        'desktop',
      )
      assert.equal(
        await page.locator('.os-window:not([hidden]) h1').textContent(),
        'Steve.',
      )
    })
  },
)

test(
  'a stalled document preload can be replaced by another navigation',
  options,
  async () => {
    await withPage(async page => {
      const held = []
      await page.route('**/os-content/*.json', route => held.push(route))
      await page
        .locator('.os-selected-projects [data-document-link]')
        .filter({ hasText: 'Kishu Stack' })
        .click()
      await page.waitForFunction(
        () => !document.documentElement.dataset.pageTransition,
      )
      await page
        .getByRole('button', { name: 'Writing view', exact: true })
        .click()
      await settled(page, '/blog')
      assert.equal(
        await page.locator('.os-stage').getAttribute('data-view'),
        'writing',
      )
      await Promise.all(held.map(route => route.abort()))
    })
  },
)

test(
  'a stalled document preload still reaches the clicked Gatsby page',
  options,
  async () => {
    await withPage(async page => {
      const held = []
      await page.route('**/os-content/*.json', route => held.push(route))
      await page
        .locator('.os-selected-projects [data-document-link]')
        .filter({ hasText: 'Kishu Stack' })
        .click()
      await settled(page, '/kishu-stack')
      assert.equal(
        await page.locator('.os-reader h1').textContent(),
        'Kishu Stack',
      )
      await Promise.all(held.map(route => route.abort()))
    })
  },
)

test(
  'a late Gatsby route cannot replace a newer workspace choice',
  options,
  async () => {
    let release
    const held = new Promise(resolve => {
      release = resolve
    })
    await withPage(
      async page => {
        await page
          .locator('.os-selected-projects [data-document-link]')
          .filter({ hasText: 'Kishu Stack' })
          .click()
        await page.waitForFunction(
          () =>
            document.querySelector('.os-reader h1')?.textContent ===
            'Kishu Stack',
        )
        await page
          .getByRole('button', { name: 'Writing view', exact: true })
          .click()
        await settled(page, '/blog')
        release()
        await page.waitForFunction(
          () =>
            window.__routeCommits.includes('/kishu-stack') &&
            window.__routeCommits.at(-1) === '/blog',
        )
        await settled(page, '/blog')
        assert.equal(
          await page.locator('.os-stage').getAttribute('data-view'),
          'writing',
        )
      },
      {
        beforeLoad: page =>
          page.route('**/page-data/kishu-stack/page-data.json', async route => {
            await held
            await route.continue()
          }),
      },
    )
  },
)

test(
  'browser Back wins over a Gatsby response arriving during snapshot capture',
  options,
  async () => {
    let release
    const held = new Promise(resolve => {
      release = resolve
    })
    await withPage(
      async page => {
        await page
          .getByRole('button', { name: 'Projects view', exact: true })
          .click()
        await settled(page, '/projects')
        await projectCard(page).click()
        await page.waitForFunction(
          () =>
            document.querySelector('.os-reader h1')?.textContent ===
            'Kishu Stack',
        )
        await page.goBack()
        release()
        await page.waitForFunction(
          () =>
            window.__routeCommits.includes('/kishu-stack') &&
            window.__routeCommits.at(-1) === '/',
        )
        await settled(page, '/')
        assert.equal(
          await page.locator('.os-stage').getAttribute('data-view'),
          'desktop',
        )
      },
      {
        beforeLoad: page =>
          page.route('**/page-data/kishu-stack/page-data.json', async route => {
            await held
            await route.continue()
          }),
      },
    )
  },
)

test(
  'focusing, reopening, or revealing Photography in the current desktop never slides the whole workspace',
  options,
  async () => {
    await withPage(async page => {
      await page.getByRole('link', { name: 'Photography', exact: true }).click()
      await settled(page, '/photography')
      await page
        .getByRole('region', { name: 'Photography window', exact: true })
        .waitFor()
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        0,
      )
      await page.getByRole('link', { name: 'Photography', exact: true }).click()
      await settled(page, '/photography')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        0,
      )
      await page.getByRole('link', { name: 'About', exact: true }).click()
      await settled(page, '/')
      await page.getByRole('link', { name: 'Photography', exact: true }).click()
      await settled(page, '/photography')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        0,
      )
    })
  },
)

test(
  'a document change in a visible unfocused window captures only its reading pane',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await page.getByRole('link', { name: 'Photography', exact: true }).click()
      await settled(page, '/photography')
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('.os-window')).every(element =>
          element
            .getAnimations()
            .every(animation => animation.playState !== 'running'),
        ),
      )
      const pane = await page
        .locator('#os-window-projects .os-library-scroll')
        .boundingBox()
      const photographWindow = await page
        .locator('#os-window-photography')
        .boundingBox()
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      const records = await page.evaluate(() => window.__pageTransitions)
      assert.equal(
        records.length,
        2,
        'Only the desktop change and document change animate',
      )
      const record = records.at(-1)
      assert.equal(record.scope, 'page')
      assert.equal(
        record.old.find(element => element.name === 'os-page').rect.width,
        pane.width,
      )
      assert.deepEqual(
        await page.locator('#os-window-photography').boundingBox(),
        photographWindow,
      )
      await page.getByRole('link', { name: 'Photography', exact: true }).click()
      await settled(page, '/photography')
      await page
        .getByRole('button', { name: 'Back to projects', exact: true })
        .click()
      await settled(page, '/projects')
      const returning = await page.evaluate(() =>
        window.__pageTransitions.at(-1),
      )
      assert.equal(returning.scope, 'page')
      assert.equal(
        returning.old.find(element => element.name === 'os-page-title').text,
        'Kishu Stack',
      )
      assert.equal(
        returning.new.find(element => element.name === 'os-page-title').text,
        'Kishu Stack',
      )
    })
  },
)

test(
  'reselecting the same desktop, document, or collection is a focus action',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        1,
      )
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      await page
        .getByRole('button', { name: 'Kishu Stack', exact: true })
        .click()
      await settled(page, '/kishu-stack')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        2,
      )
      await page
        .getByRole('button', { name: 'All projects', exact: true })
        .click()
      await settled(page, '/projects')
      await page
        .getByRole('button', { name: 'All projects', exact: true })
        .click()
      await settled(page, '/projects')
      assert.equal(
        await page.evaluate(() => window.__pageTransitions.length),
        3,
      )
    })
  },
)

test(
  'a project preview waits for the title and enters with the article content',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      const card = page
        .locator('#os-window-projects [data-document-link]')
        .filter({ hasText: 'PoE Wishlist' })
      await card.scrollIntoViewIfNeeded()
      await card.locator('img').evaluate(image => image.decode())
      await page.evaluate(() => {
        window.__probeArticle = true
      })
      await card.click()
      await settled(page, '/poe-wishlist')
      const record = await page.evaluate(() => window.__pageTransitions.at(-1))
      assert.equal(record.error, undefined)
      assert.equal(
        record.old.some(element => element.name === 'os-page-image'),
        false,
        'The source image stays in its page instead of becoming a detached layer',
      )
      assert.equal(record.sequence, 'article')
      assert.ok(
        record.new.some(
          element =>
            element.tag === 'FIGURE' &&
            element.transitionClass.includes('os-article-part'),
        ),
        'The preview and its caption enter as one section after the title',
      )
      assert.ok(
        record.new.some(
          element =>
            element.tag === 'DETAILS' &&
            element.transitionClass.includes('os-article-part'),
        ),
        'The contents control is ready before the native snapshot and waits with the article',
      )
      assert.ok(record.parts.every(part => part.delay > record.titleDuration))
      assert.equal(
        record.titlePhase.oldSurfaceOpacity,
        0,
        'The source thumbnail clears before the title settles',
      )
      assert.equal(record.titlePhase.sequence, 'article')
      assert.ok(
        record.titlePhase.contentOpacity.every(opacity => opacity === 0),
      )
    })
  },
)

for (const [kind, viewport] of [
  ['projects', { width: 1440, height: 1000 }],
  ['writing', { width: 390, height: 844 }],
]) {
  test(
    `${kind} entry settles its title before a downward content cascade`,
    options,
    async () => {
      await withPage(
        async page => {
          if (viewport.width < 1100) {
            await page
              .getByRole('navigation', { name: 'Primary navigation' })
              .getByRole('button', {
                name: kind === 'projects' ? 'Projects' : 'Open app launcher',
                exact: true,
              })
              .click()
            if (kind === 'writing')
              await page
                .getByRole('dialog', { name: 'App launcher' })
                .getByRole('button', { name: /^Writing / })
                .click()
          } else {
            await page
              .getByRole('button', {
                name: kind === 'projects' ? 'Projects view' : 'Writing view',
                exact: true,
              })
              .click()
          }
          await settled(page, kind === 'projects' ? '/projects' : '/blog')
          const card = page
            .locator(`#os-window-${kind} [data-document-link]`)
            .first()
          const target = await card.getAttribute('data-document-link')
          const title = await card.locator('h2').textContent()
          await page.evaluate(() => {
            window.__pauseArticle = true
          })
          await card.click()
          await page.waitForFunction(() => window.__articleAnimations?.length)
          const frames = await page.evaluate(async () => {
            const record = window.__pageTransitions.at(-1)
            const sample = async time => {
              window.__articleAnimations.forEach(animation => {
                animation.currentTime = time
              })
              await new Promise(requestAnimationFrame)
              return record.parts.map(part => {
                const style = getComputedStyle(
                  document.documentElement,
                  `::view-transition-new(${part.name})`,
                )
                return {
                  opacity: Number(style.opacity),
                  y: new DOMMatrixReadOnly(style.transform).m42,
                }
              })
            }
            const titleMoving = await sample(record.titleDuration * 0.7)
            const entering = await sample(record.parts[0].delay + 85)
            const complete = await sample(record.parts.at(-1).delay + 300)
            window.__pauseArticle = false
            window.__articleAnimations.forEach(animation => animation.finish())
            return { record, titleMoving, entering, complete }
          })
          assert.equal(frames.record.error, undefined)
          assert.equal(frames.record.sequence, 'article')
          assert.ok(frames.record.parts.length >= 3)
          assert.ok(
            frames.record.parts.every(
              part => part.delay > frames.record.titleDuration,
            ),
            'Every incoming content section waits until the title lands',
          )
          assert.ok(
            frames.titleMoving.every(part => part.opacity === 0),
            'The reading surface stays empty around the travelling title',
          )
          assert.ok(
            frames.entering[0].opacity > frames.entering[1].opacity &&
              frames.entering[1].opacity > frames.entering[2].opacity,
            'The visible content follows in top-to-bottom order',
          )
          assert.ok(
            frames.entering[0].y < 0 && frames.entering[0].y > -8,
            'Each section gently settles downward as it becomes visible',
          )
          assert.ok(
            frames.complete.every(part => part.opacity === 1 && part.y === 0),
            'All sections become fully visible at their final positions',
          )
          await settled(page, target)
          assert.equal(await page.locator('.os-reader h1').textContent(), title)
          assert.equal(
            await page
              .locator('[style*="view-transition-name: os-article"]')
              .count(),
            0,
            'The reveal releases all captured sections after completion',
          )
          await page.evaluate(() => {
            window.__pauseArticle = true
            window.__articleAnimations = []
          })
          await page
            .getByRole('button', { name: `Back to ${kind}`, exact: true })
            .click()
          await page.waitForFunction(() => window.__articleAnimations?.length)
          const reverse = await page.evaluate(async () => {
            const record = window.__pageTransitions.at(-1)
            const sample = async time => {
              window.__articleAnimations.forEach(animation => {
                animation.currentTime = time
              })
              await new Promise(requestAnimationFrame)
              return {
                content: record.parts.map(part =>
                  Number(
                    getComputedStyle(
                      document.documentElement,
                      `::view-transition-old(${part.name})`,
                    ).opacity,
                  ),
                ),
                collection: Number(
                  getComputedStyle(
                    document.documentElement,
                    '::view-transition-new(os-page)',
                  ).opacity,
                ),
              }
            }
            const clearing = await sample(80)
            const titleTravelling = await sample(
              record.titleDelay + record.titleDuration * 0.5,
            )
            const collectionEntering = await sample(record.collectionDelay + 70)
            window.__pauseArticle = false
            window.__articleAnimations.forEach(animation => animation.finish())
            return { record, clearing, titleTravelling, collectionEntering }
          })
          assert.equal(reverse.record.sequence, 'article-return')
          assert.ok(
            reverse.clearing.content[0] > reverse.clearing.content.at(-1),
            'Back clears the article from bottom to top',
          )
          assert.ok(
            reverse.record.parts.every(
              part => part.delay + 160 <= reverse.record.titleDelay,
            ),
            'The return title waits until all article sections clear',
          )
          assert.ok(
            reverse.titleTravelling.content.every(opacity => opacity === 0),
            'No article content or images linger during the title return',
          )
          assert.equal(reverse.titleTravelling.collection, 0)
          assert.ok(
            reverse.collectionEntering.collection > 0 &&
              reverse.collectionEntering.collection < 1,
            'The collection appears only after its title reconnects',
          )
          await settled(page, kind === 'projects' ? '/projects' : '/blog')
          await card.click()
          await settled(page, target)
          assert.equal(
            await page.evaluate(() => window.__pageTransitions.at(-1).sequence),
            'article',
            'Opening a cached document repeats the sequence cleanly',
          )
          await page
            .getByRole('button', { name: `Back to ${kind}`, exact: true })
            .click()
          await settled(page, kind === 'projects' ? '/projects' : '/blog')
          const nextCard = page
            .locator(
              `#os-window-${kind} [data-document-link]:not([data-document-link="/made-with"])`,
            )
            .nth(1)
          const nextTarget = await nextCard.getAttribute('data-document-link')
          const nextTitle = await nextCard.locator('h2').textContent()
          await nextCard.click()
          await settled(page, nextTarget)
          assert.equal(
            await page.locator('.os-reader h1').textContent(),
            nextTitle,
          )
          const firstTab = page
            .getByRole('navigation', { name: `${kind} document tabs` })
            .getByRole('button', { name: title, exact: true })
          await firstTab.click()
          await settled(page, target)
          assert.equal(await page.locator('.os-reader h1').textContent(), title)
          assert.equal(
            await page.evaluate(() => window.__pageTransitions.at(-1).sequence),
            'article',
            'Changing article tabs also uses the title-first sequence',
          )
          const transitionsBeforeHistory = await page.evaluate(
            () => window.__pageTransitions.length,
          )
          await page.goBack()
          await page.waitForFunction(
            count => window.__pageTransitions.length > count,
            transitionsBeforeHistory,
          )
          await settled(page, nextTarget)
          const historyReturn = await page.evaluate(() =>
            window.__pageTransitions.at(-1),
          )
          assert.equal(
            historyReturn.sequence,
            'article-back',
            'Browser Back between article tabs also sequences the outgoing content',
          )
          assert.equal(
            historyReturn.old.find(part => part.name === 'os-page-title').text,
            title,
          )
          assert.equal(
            historyReturn.new.find(part => part.name === 'os-page-title').text,
            nextTitle,
          )
          assert.equal(
            historyReturn.old.some(
              oldPart =>
                oldPart.name.startsWith('os-article-part-') &&
                historyReturn.new.some(
                  newPart => newPart.name === oldPart.name,
                ),
            ),
            false,
            'Different articles never share content or image layers',
          )
          await page.evaluate(() => {
            window.__pauseArticle = true
            window.__articleAnimations = []
          })
          await firstTab.click()
          await page.waitForFunction(() => window.__articleAnimations?.length)
          await page.evaluate(() => {
            window.__pauseArticle = false
          })
          await page
            .getByRole('button', {
              name: kind === 'projects' ? 'All projects' : 'All writing',
              exact: true,
            })
            .click()
          await settled(page, kind === 'projects' ? '/projects' : '/blog')
          assert.equal(
            await page
              .locator('.os-stage [style*="view-transition-name: os-"]')
              .count(),
            0,
            'Interrupting a content reveal clears every temporary layer',
          )
        },
        { viewport },
      )
    },
  )
}

test(
  'restoring a scrolled article resumes reading without a detached title sequence',
  options,
  async () => {
    await withPage(async page => {
      await page
        .getByRole('button', { name: 'Projects view', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      const scroller = page.locator('#os-window-projects .os-library-scroll')
      await scroller.evaluate(element => {
        element.scrollTop = 700
      })
      await page
        .getByRole('button', { name: 'All projects', exact: true })
        .click()
      await settled(page, '/projects')
      await projectCard(page).click()
      await settled(page, '/kishu-stack')
      const record = await page.evaluate(() => window.__pageTransitions.at(-1))
      assert.equal(record.error, undefined)
      assert.equal(
        record.sequence,
        undefined,
        'A saved reading position below the title bypasses title-first entry',
      )
      assert.equal(
        record.new.some(element => element.name === 'os-page-title'),
        false,
      )
      assert.ok(await scroller.evaluate(element => element.scrollTop > 650))
    })
  },
)
