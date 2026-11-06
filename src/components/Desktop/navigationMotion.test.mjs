import test from 'node:test'
import assert from 'node:assert/strict'
import {
  desktopReducer,
  initialDesktop,
  navigationTransition,
} from './model.ts'

const send = (state, ...actions) => actions.reduce(desktopReducer, state)
const motion = (before, after, compact = false) =>
  navigationTransition({
    before,
    after,
    compact,
    size: { width: 1360, height: 900 },
  })

test('changing desktops uses the full workspace transition', () => {
  const before = initialDesktop()
  assert.deepEqual(
    motion(before, send(before, { type: 'view', id: 'projects' })),
    { kind: 'workspace' },
  )
})

test('reselecting a desktop or visible app does not animate a page', () => {
  const before = send(initialDesktop(), { type: 'open', id: 'photography' })
  assert.deepEqual(
    motion(before, send(before, { type: 'open', id: 'photography' })),
    { kind: 'none' },
  )
  const focused = send(before, { type: 'focus', id: 'about' })
  assert.deepEqual(
    motion(focused, send(focused, { type: 'open', id: 'photography' })),
    { kind: 'none' },
  )
  assert.deepEqual(
    motion(
      initialDesktop(),
      send(initialDesktop(), { type: 'view', id: 'desktop' }),
    ),
    { kind: 'none' },
  )
})

test('opening or restoring a window uses window motion on the current desktop', () => {
  const before = initialDesktop()
  const opened = send(before, { type: 'open', id: 'photography' })
  assert.deepEqual(motion(before, opened), { kind: 'none' })
  const minimized = send(opened, { type: 'minimize', id: 'photography' })
  assert.deepEqual(
    motion(minimized, send(minimized, { type: 'open', id: 'photography' })),
    { kind: 'none' },
  )
})

test('changing a document transitions only its visible library even when another app was focused', () => {
  const before = send(initialDesktop('projects'), {
    type: 'open',
    id: 'photography',
  })
  const after = send(
    before,
    { type: 'focus', id: 'projects' },
    {
      type: 'route',
      id: 'projects',
      href: '/kishu-stack/',
      acknowledged: true,
    },
  )
  assert.deepEqual(motion(before, after), { kind: 'page', app: 'projects' })
  assert.deepEqual(
    motion(
      after,
      send(after, {
        type: 'route',
        id: 'projects',
        href: '/kishu-stack',
        acknowledged: true,
      }),
    ),
    { kind: 'none' },
  )
})

test('returning to a collection is a page change while focusing its existing collection is not', () => {
  const before = send(initialDesktop('projects'), {
    type: 'route',
    id: 'projects',
    href: '/kishu-stack',
    acknowledged: true,
  })
  const after = send(before, {
    type: 'route',
    id: 'projects',
    href: '/projects',
    acknowledged: true,
  })
  assert.deepEqual(motion(before, after), { kind: 'page', app: 'projects' })
  assert.deepEqual(
    motion(after, send(after, { type: 'view', id: 'projects' })),
    { kind: 'none' },
  )
})

test('single app phone screens still transition when replacing the visible app', () => {
  const before = initialDesktop()
  const after = send(before, { type: 'open', id: 'photography' })
  assert.deepEqual(motion(before, after, true), { kind: 'workspace' })
  assert.deepEqual(
    motion(after, send(after, { type: 'open', id: 'photography' }), true),
    { kind: 'none' },
  )
})
