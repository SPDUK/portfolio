import test from 'node:test'
import assert from 'node:assert/strict'
import {
  apps,
  desktopGeometry,
  desktopReducer,
  focusedRoute,
  initialDesktop,
  isPrimaryApp,
  layoutIds,
  makeWindow,
  primaryApp,
  readDesktop,
  resolveApp,
  routeKey,
  views,
  viewState,
} from './model.ts'

const send = (state, ...actions) => actions.reduce(desktopReducer, state)
const ids = state =>
  Object.values(state.views).flatMap(view =>
    view.layout ? layoutIds(view.layout) : [],
  )
const documents = { '/a-project': 'projects', '/an-article': 'writing' }
const visible = (state, view) =>
  state.windows.filter(win => win.view === view && !win.minimized)

function assertReachable(state) {
  assert.equal(
    new Set(state.windows.map(win => win.id)).size,
    state.windows.length,
  )
  const leaves = ids(state)
  assert.equal(new Set(leaves).size, leaves.length)
  state.windows.forEach(win => {
    assert.equal(leaves.includes(win.id), !win.minimized && !win.floating)
    if (!win.minimized && !win.floating)
      assert.ok(layoutIds(state.views[win.view].layout).includes(win.id))
    if (isPrimaryApp(win.id)) {
      assert.equal(primaryApp(win.view), win.id)
      assert.equal(win.floating, false)
    }
  })
  views.forEach(view => {
    const primary = primaryApp(view.id)
    const members = visible(state, view.id).filter(win => !win.floating)
    if (!members.some(win => win.id === primary)) return
    const layout = state.views[view.id].layout
    if (members.length === 1) {
      assert.deepEqual(layout, { kind: 'leaf', id: primary })
      return
    }
    assert.equal(layout.kind, 'split')
    assert.equal(layout.axis, 'horizontal')
    assert.deepEqual(layout.first, { kind: 'leaf', id: primary })
    assert.ok(layout.ratio >= 0.5)
    assert.ok(layoutIds(layout.second).every(id => !isPrimaryApp(id)))
  })
}

test('fresh Desktop places About left at 60 percent and Terminal right', () => {
  const state = initialDesktop()
  const geometry = desktopGeometry(state, { width: 1400, height: 800 })
  assert.equal(state.activeView, 'desktop')
  assert.equal(viewState(state).solo, null)
  assert.equal(viewState(state).maximized, null)
  assert.deepEqual(layoutIds(viewState(state).layout), ['about', 'terminal'])
  assert.equal(geometry.boxes.about.x, 0)
  assert.equal(geometry.boxes.about.width, (1400 - 12) * 0.6)
  assert.ok(geometry.boxes.terminal.x > geometry.boxes.about.width)
  assertReachable(state)
})

test('primary launch focuses its home fullscreen while Desktop view stays tiled', () => {
  let state = initialDesktop()
  for (const id of ['about', 'projects', 'writing']) {
    state = desktopReducer(state, { type: 'open', id })
    assert.equal(primaryApp(state.activeView), id)
    assert.equal(viewState(state).focused, id)
    assert.equal(viewState(state).solo, id)
    assertReachable(state)
  }
  state = desktopReducer(state, { type: 'view', id: 'desktop' })
  assert.equal(viewState(state).solo, null)
  assert.deepEqual(layoutIds(viewState(state).layout), ['about', 'terminal'])
})

test('Tile alone creates a 60 percent main and moves the unique Terminal there', () => {
  let state = desktopReducer(initialDesktop('writing'), { type: 'arrange' })
  assert.equal(viewState(state).solo, null)
  assert.equal(viewState(state).maximized, null)
  assert.equal(viewState(state).focused, 'writing')
  assert.equal(viewState(state).layout.ratio, 0.6)
  assert.deepEqual(layoutIds(viewState(state).layout), ['writing', 'terminal'])
  assert.equal(state.windows.filter(win => win.id === 'terminal').length, 1)
  assert.equal(state.windows.find(win => win.id === 'terminal').view, 'writing')
  assert.deepEqual(layoutIds(state.views.desktop.layout), ['about'])
  const once = state
  state = send(state, { type: 'arrange' }, { type: 'arrange' })
  assert.deepEqual(state, once)
  assertReachable(state)
})

test('secondary launches retain active primary, document route and right-side composition', () => {
  let state = send(initialDesktop('writing'), {
    type: 'route',
    id: 'writing',
    href: '/an-article',
    acknowledged: true,
  })
  for (const id of ['terminal', 'arcade']) {
    state = desktopReducer(state, { type: 'open', id })
    assert.equal(state.activeView, 'writing')
    assert.equal(viewState(state).solo, null)
    assert.equal(viewState(state).maximized, null)
    assert.equal(state.routes.writing, '/an-article')
    assert.equal(state.windows.find(win => win.id === id).view, 'writing')
    assert.equal(state.windows.find(win => win.id === id).floating, false)
    assertReachable(state)
  }
  const layout = viewState(state).layout
  assert.equal(layout.second.kind, 'split')
  assert.equal(layout.second.axis, 'vertical')
  assert.deepEqual(layoutIds(layout.second), ['terminal', 'arcade'])
})

test('Play view explicitly reclaims Arcade while the Arcade app stays in the active view', () => {
  let state = send(initialDesktop('projects'), { type: 'open', id: 'arcade' })
  assert.equal(state.activeView, 'projects')
  state = desktopReducer(state, { type: 'view', id: 'play' })
  assert.equal(state.activeView, 'play')
  assert.equal(viewState(state).focused, 'arcade')
  assert.equal(state.windows.find(win => win.id === 'arcade').view, 'play')
  assert.deepEqual(layoutIds(state.views.projects.layout), ['projects'])
  state = send(
    state,
    { type: 'view', id: 'writing' },
    { type: 'open', id: 'arcade' },
  )
  assert.equal(state.activeView, 'writing')
  assert.equal(state.views.play.focused, null)
  assert.equal(state.views.play.layout, null)
  assertReachable(state)
})

test('opening every app repeatedly never duplicates a window or layout leaf', () => {
  let state = initialDesktop()
  for (let pass = 0; pass < 3; pass += 1) {
    apps.forEach(app => {
      state = desktopReducer(state, { type: 'open', id: app.id })
      assertReachable(state)
    })
  }
  assert.equal(state.windows.length, apps.length)
})

test('moving a maximized tool repairs stale layout, focus and presentation', () => {
  let state = send(
    initialDesktop(),
    { type: 'open', id: 'arcade' },
    { type: 'maximize', id: 'arcade' },
  )
  state = send(
    state,
    { type: 'view', id: 'writing' },
    { type: 'open', id: 'arcade' },
  )
  assert.equal(state.windows.find(win => win.id === 'arcade').view, 'writing')
  assert.equal(state.views.desktop.maximized, null)
  assert.notEqual(state.views.desktop.focused, 'arcade')
  assert.ok(!layoutIds(state.views.desktop.layout).includes('arcade'))
  assertReachable(state)
})

test('primary cannot float, group, or move away; tool drops over primary dock right', () => {
  let state = initialDesktop()
  const original = state
  for (const placement of ['center', 'left', 'right', 'top', 'bottom']) {
    state = desktopReducer(state, {
      type: 'place',
      id: 'about',
      target: 'terminal',
      placement,
    })
    assert.deepEqual(state, original)
  }
  state = desktopReducer(state, { type: 'float', id: 'about' })
  assert.deepEqual(state, original)
  state = send(
    state,
    { type: 'split', path: '', ratio: 0.68 },
    { type: 'open', id: 'contact' },
  )
  for (const placement of ['center', 'left', 'right', 'top', 'bottom']) {
    state = desktopReducer(state, {
      type: 'place',
      id: 'contact',
      target: 'about',
      placement,
    })
    assert.equal(viewState(state).layout.ratio, 0.68)
    assertReachable(state)
  }
})

test('secondary apps retain grouping, floating, rectangles and explicit Tile docking', () => {
  const rect = { x: 45, y: 60, width: 610, height: 460 }
  let state = send(
    initialDesktop(),
    { type: 'open', id: 'contact' },
    { type: 'place', id: 'contact', target: 'terminal', placement: 'center' },
  )
  assert.equal(viewState(state).layout.second.kind, 'tabs')
  state = send(
    state,
    { type: 'float', id: 'contact' },
    { type: 'rect', id: 'contact', rect },
  )
  assert.equal(state.windows.find(win => win.id === 'contact').floating, true)
  assert.ok(!ids(state).includes('contact'))
  state = desktopReducer(state, { type: 'arrange' })
  assert.equal(state.windows.find(win => win.id === 'contact').floating, false)
  assert.deepEqual(state.windows.find(win => win.id === 'contact').rect, rect)
  state = send(
    state,
    { type: 'minimize', id: 'contact' },
    { type: 'open', id: 'contact' },
  )
  assert.deepEqual(state.windows.find(win => win.id === 'contact').rect, rect)
  assertReachable(state)
})

test('closing or minimizing the last companion does not reopen it until explicit Tile', () => {
  for (const type of ['close', 'minimize']) {
    let state = desktopReducer(initialDesktop(), { type, id: 'terminal' })
    assert.deepEqual(viewState(state).layout, { kind: 'leaf', id: 'about' })
    state = send(
      state,
      { type: 'focus', id: 'about' },
      { type: 'route', id: 'about', href: '/', acknowledged: true },
    )
    assert.deepEqual(viewState(state).layout, { kind: 'leaf', id: 'about' })
    state = desktopReducer(state, { type: 'arrange' })
    assert.deepEqual(layoutIds(viewState(state).layout), ['about', 'terminal'])
    assertReachable(state)
  }
})

test('closing a primary leaves the remaining tool usable and view reentry restores primary', () => {
  let state = desktopReducer(initialDesktop(), { type: 'close', id: 'about' })
  assert.equal(viewState(state).focused, 'terminal')
  assert.equal(focusedRoute(state), '/terminal')
  assert.deepEqual(viewState(state).layout, { kind: 'leaf', id: 'terminal' })
  state = desktopReducer(state, { type: 'view', id: 'desktop' })
  assert.equal(viewState(state).focused, 'about')
  assertReachable(state)
})

test('root resizing protects at least half the actual stage including the divider gap', () => {
  let state = desktopReducer(initialDesktop(), {
    type: 'split',
    path: '',
    ratio: 0.1,
  })
  assert.equal(viewState(state).layout.ratio, 0.5)
  for (const width of [800, 960, 1100, 1400, 2000]) {
    const geometry = desktopGeometry(state, { width, height: 800 })
    assert.ok(geometry.boxes.about.width >= width / 2)
    assert.ok(geometry.boxes.terminal.width >= 360)
    assert.equal(
      geometry.boxes.about.width + geometry.boxes.terminal.width + 12,
      width,
    )
  }
  state = desktopReducer(state, { type: 'split', path: '', ratio: 0.67 })
  assert.equal(viewState(state).layout.ratio, 0.67)
  state = send(
    state,
    { type: 'open', id: 'arcade' },
    { type: 'open', id: 'about' },
    { type: 'arrange' },
  )
  assert.equal(viewState(state).layout.ratio, 0.67)
  assertReachable(state)
})

test('compact geometry selects one app without losing its saved desktop composition', () => {
  const state = initialDesktop()
  const narrow = desktopGeometry(state, { width: 320, height: 400 })
  assert.deepEqual(narrow.tabs[0].ids, ['about', 'terminal'])
  assert.equal(narrow.tabs[0].selected, 'about')
  assert.equal(narrow.boxes.about.width, 320)
  const wide = desktopGeometry(state, { width: 1280, height: 720 })
  assert.ok(wide.boxes.about.width >= 640)
  assert.ok(wide.boxes.terminal.x > wide.boxes.about.width)
})

test('route acknowledgements and ordinary focus retain tiled presentation and geometry references', () => {
  let state = send(
    initialDesktop('writing'),
    { type: 'arrange' },
    { type: 'route', id: 'writing', href: '/an-article', acknowledged: true },
  )
  const windows = state.windows
  const savedViews = state.views
  state = desktopReducer(state, {
    type: 'route',
    id: 'writing',
    href: '/an-article/',
    acknowledged: true,
  })
  assert.equal(state.windows, windows)
  assert.equal(state.views, savedViews)
  state = desktopReducer(state, { type: 'focus', id: 'writing' })
  assert.equal(viewState(state).solo, null)
  assert.equal(viewState(state).maximized, null)
  assert.equal(focusedRoute(state), '/an-article/')
  state = send(
    state,
    { type: 'open', id: 'arcade' },
    { type: 'maximize', id: 'arcade' },
    {
      type: 'route',
      id: 'arcade',
      href: '/arcade?game=breakout',
      acknowledged: true,
    },
  )
  assert.equal(viewState(state).maximized, 'arcade')
  assert.equal(state.activeView, 'writing')
})

test('navigation acknowledgement keys ignore only trailing path slash and retain query state', () => {
  assert.equal(routeKey('/blog/'), routeKey('/blog'))
  assert.equal(
    routeKey('/arcade/?game=breakout'),
    routeKey('/arcade?game=breakout'),
  )
  assert.equal(routeKey('/?x=1'), '/?x=1')
  assert.notEqual(
    routeKey('/arcade?game=breakout'),
    routeKey('/arcade?game=snake'),
  )
})

test('external routes including Back and Forward apply content entry policy and root stays tiled', () => {
  let state = initialDesktop()
  for (const [id, href] of [
    ['writing', '/an-article'],
    ['projects', '/a-project'],
    ['writing', '/an-article'],
  ]) {
    state = desktopReducer(state, { type: 'route', id, href })
    assert.equal(state.activeView, id)
    assert.equal(viewState(state).solo, id)
    assert.equal(focusedRoute(state), href)
    assertReachable(state)
  }
  state = desktopReducer(state, { type: 'route', id: 'about', href: '/' })
  assert.equal(state.activeView, 'desktop')
  assert.equal(viewState(state).solo, null)
  assert.equal(viewState(state).focused, 'about')
})

test('version 2 round trip preserves canonical ratios, tool ownership, routes, rectangles and minimized flags', () => {
  const state = send(
    initialDesktop('writing'),
    { type: 'route', id: 'writing', href: '/an-article', acknowledged: true },
    { type: 'open', id: 'terminal' },
    { type: 'split', path: '', ratio: 0.64 },
    { type: 'open', id: 'arcade' },
    { type: 'float', id: 'arcade' },
    { type: 'minimize', id: 'arcade' },
  )
  const restored = readDesktop(JSON.stringify(state), documents)
  assert.deepEqual(restored, state)
  assert.equal(
    restored.windows.find(win => win.id === 'terminal').view,
    'writing',
  )
  assert.equal(
    restored.windows.find(win => win.id === 'arcade').view,
    'writing',
  )
  assertReachable(restored)
})

test('obsolete terminal-left storage migrates to About-left and protected primary ratios normalize', () => {
  const saved = initialDesktop()
  saved.views.desktop.layout = {
    kind: 'split',
    axis: 'horizontal',
    ratio: 0.38,
    first: { kind: 'leaf', id: 'terminal' },
    second: { kind: 'leaf', id: 'about' },
  }
  let restored = readDesktop(JSON.stringify(saved))
  assert.deepEqual(layoutIds(restored.views.desktop.layout), [
    'about',
    'terminal',
  ])
  assert.equal(restored.views.desktop.layout.ratio, 0.6)
  restored.views.desktop.layout.ratio = 0.57
  restored = readDesktop(JSON.stringify(restored))
  assert.equal(restored.views.desktop.layout.ratio, 0.57)
  restored.views.desktop.layout.ratio = 0.2
  restored = readDesktop(JSON.stringify(restored))
  assert.equal(restored.views.desktop.layout.ratio, 0.5)
  assert.ok(
    desktopGeometry(restored, { width: 1400, height: 800 }).boxes.about.width >=
      700,
  )
})

test('legacy migration restores primary homes but preserves secondary workspace and valid document routes', () => {
  const legacy = {
    windows: ['terminal', 'about', 'writing', 'arcade', 'settings'].map(id => ({
      ...makeWindow(id),
      view: undefined,
      workspace: id === 'terminal' ? 1 : 0,
      floating: id === 'settings',
    })),
    workspace: 0,
    focused: 'writing',
    layouts: [
      {
        kind: 'tabs',
        ids: ['about', 'writing', 'arcade'],
        selected: 'writing',
      },
      { kind: 'leaf', id: 'terminal' },
      null,
    ],
  }
  legacy.windows.push({ ...legacy.windows[2] })
  const restored = readDesktop(
    JSON.stringify(legacy),
    documents,
    JSON.stringify({
      writing: '/an-article',
      projects: '/an-article',
      settings: '//evil.example',
    }),
  )
  assert.equal(restored.version, 2)
  assert.equal(
    restored.windows.find(win => win.id === 'writing').view,
    'writing',
  )
  assert.equal(
    restored.windows.find(win => win.id === 'terminal').view,
    'projects',
  )
  assert.equal(
    restored.windows.find(win => win.id === 'arcade').view,
    'desktop',
  )
  assert.deepEqual(
    restored.windows.find(win => win.id === 'settings').rect,
    legacy.windows[4].rect,
  )
  assert.deepEqual(restored.routes, { writing: '/an-article' })
  assertReachable(restored)
})

test('invalid storage fails safely while malformed layout, foreign leaves and stale focus repair', () => {
  for (const value of [
    'nope',
    'null',
    '{}',
    '{"windows":[],"workspace":9}',
    '{"version":3,"windows":[],"workspace":0}',
  ])
    assert.equal(readDesktop(value), null)
  const malformed = initialDesktop()
  malformed.views.desktop.layout = {
    kind: 'tabs',
    ids: ['about', 'about', 'writing'],
    selected: 'writing',
  }
  malformed.views.desktop.focused = 'writing'
  malformed.views.desktop.maximized = 'writing'
  malformed.windows[0].floating = true
  const restored = readDesktop(JSON.stringify(malformed))
  assert.equal(restored.views.desktop.maximized, null)
  assert.equal(restored.views.desktop.focused, 'about')
  assert.equal(restored.windows.find(win => win.id === 'about').floating, false)
  assertReachable(restored)
})

test('Signal Lab opens as a utility and its route and workspace survive storage', () => {
  let state = send(initialDesktop('writing'), {
    type: 'route',
    id: 'writing',
    href: '/an-article',
  })
  state = send(
    state,
    { type: 'open', id: 'signal-lab' },
    { type: 'route', id: 'signal-lab', href: '/signal-lab' },
  )
  assert.equal(state.version, 2)
  assert.equal(state.activeView, 'writing')
  assert.equal(
    state.windows.find(win => win.id === 'signal-lab').view,
    'writing',
  )
  assert.equal(isPrimaryApp('signal-lab'), false)
  assert.equal(viewState(state).focused, 'signal-lab')
  assert.deepEqual(layoutIds(viewState(state).layout), [
    'writing',
    'signal-lab',
  ])
  assert.equal(resolveApp('/signal-lab/', documents), 'signal-lab')
  assert.equal(focusedRoute(state), '/signal-lab')
  const restored = readDesktop(JSON.stringify(state), documents)
  assert.deepEqual(restored, state)
  assert.equal(restored.routes.writing, '/an-article')
  assert.equal(restored.routes['signal-lab'], '/signal-lab')
  assertReachable(restored)
})

test('route resolution and storage accept only known app paths or indexed documents', () => {
  assert.equal(resolveApp('/missing-page', documents), null)
  assert.equal(resolveApp('/a-project', documents), 'projects')
  assert.equal(resolveApp('/an-article/', documents), 'writing')
  assert.equal(resolveApp('/arcade?game=breakout', documents), 'arcade')
  assert.equal(resolveApp('//external.example'), null)
  assert.equal(resolveApp('/\\external.example'), null)
  const state = initialDesktop('writing')
  state.routes = {
    writing: '/missing',
    projects: '/an-article',
    about: '/projects',
    arcade: '/arcade?game=breakout',
  }
  assert.deepEqual(readDesktop(JSON.stringify(state), documents).routes, {
    arcade: '/arcade?game=breakout',
  })
})
