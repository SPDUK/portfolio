import assert from 'node:assert/strict'
import test from 'node:test'
import { createAsteroids, stepAsteroids, SPACE } from './asteroidsLogic.ts'

const idle = { left: false, right: false, thrust: false, fire: false }
const running = (overrides = {}) => ({
  ...createAsteroids(42),
  status: 'running',
  ...overrides,
})
const rock = (overrides = {}) => ({
  id: 100,
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  angle: 0,
  spin: 0,
  size: 3,
  ...overrides,
})
const shot = (overrides = {}) => ({
  id: 200,
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  ttl: 1,
  ...overrides,
})
const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

test('Asteroids starts with a safe populated field and only advances while running', () => {
  const state = createAsteroids(42)
  assert.equal(state.lives, 3)
  assert.equal(state.wave, 1)
  assert.equal(state.rocks.length, 4)
  assert.ok(
    state.rocks.every(
      item => Math.hypot(item.x - state.ship.x, item.y - state.ship.y) > 100,
    ),
  )
  for (const status of ['ready', 'paused', 'lost']) {
    const held = { ...state, status }
    assert.equal(stepAsteroids(held, { ...idle, thrust: true }, 1 / 120), held)
  }
})

test('The inertial ship, rocks and shots wrap through field edges', () => {
  const state = running({
    ship: { x: 599.9, y: 399.9, vx: 100, vy: 100, angle: 0, immunity: 1 },
    rocks: [rock({ x: 0.1, vx: -60 })],
    shots: [shot({ x: 599, y: 250, vx: 240 })],
  })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.ok(next.ship.x < 1 && next.ship.y < 1)
  assert.ok(next.ship.vx > 0 && next.ship.vy > 0)
  assert.ok(next.rocks[0].x > 599)
  assert.equal(next.shots[0].x, 1)
})

test('Rotation and thrust change motion without changing their input or the previous state', () => {
  const state = freeze(running())
  const input = freeze({ ...idle, right: true, thrust: true, fire: true })
  const snapshot = structuredClone(state)
  const next = stepAsteroids(state, input, 1 / 120)
  assert.ok(next.ship.angle > state.ship.angle)
  assert.ok(next.ship.vy < 0)
  assert.equal(next.shots.length, 1)
  assert.deepEqual(state, snapshot)
  assert.equal(input.fire, true)
})

test('Holding fire respects cooldown and shots expire rather than accumulating', () => {
  let state = running({ rocks: [rock({ x: 40, y: 40, size: 1 })] })
  state = stepAsteroids(state, { ...idle, fire: true }, 1 / 120)
  assert.equal(state.shots.length, 1)
  for (let tick = 0; tick < 18; tick += 1)
    state = stepAsteroids(state, { ...idle, fire: true }, 1 / 120)
  assert.equal(state.shots.length, 1)
  for (let tick = 0; tick < 4; tick += 1)
    state = stepAsteroids(state, { ...idle, fire: true }, 1 / 120)
  assert.equal(state.shots.length, 2)
  for (let tick = 0; tick < 150; tick += 1)
    state = stepAsteroids(state, idle, 1 / 120)
  assert.equal(state.shots.length, 0)
})

test('A hit scores once, consumes the shot and splits a large rock into two smaller rocks', () => {
  const state = running({ rocks: [rock()], shots: [shot(), shot({ id: 201 })] })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.equal(next.score, 20)
  assert.equal(next.shots.length, 1)
  assert.equal(next.rocks.length, 2)
  assert.ok(next.rocks.every(item => item.size === 2 && item.id !== 100))
  assert.notEqual(next.rocks[0].id, next.rocks[1].id)
})

test('One shot cannot destroy two overlapping rocks', () => {
  const state = running({
    rocks: [rock({ size: 1 }), rock({ id: 101, size: 1 })],
    shots: [shot()],
  })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.equal(next.score, 100)
  assert.equal(next.rocks.length, 1)
  assert.equal(next.shots.length, 0)
})

test('Shot collisions see across the wrap boundary', () => {
  const state = running({
    rocks: [rock({ x: 598, size: 1 }), rock({ id: 101, x: 300 })],
    shots: [shot({ x: 2 })],
  })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.equal(next.score, 100)
  assert.equal(next.rocks.length, 1)
})

test('Ship impact loses exactly one life and grants respawn immunity', () => {
  const ship = { x: 2, y: 100, vx: 0, vy: 0, angle: 0, immunity: 0 }
  const state = running({
    ship,
    rocks: [rock({ x: 598 }), rock({ id: 101, x: 300, y: 200 })],
  })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.equal(next.lives, 2)
  assert.equal(next.status, 'running')
  assert.equal(next.ship.x, SPACE.width / 2)
  assert.ok(next.ship.immunity > 2)
  assert.equal(stepAsteroids(next, idle, 1 / 120).lives, 2)
  assert.equal(
    stepAsteroids({ ...state, lives: 1 }, idle, 1 / 120).status,
    'lost',
  )
})

test('Destroying the last fragment deterministically advances the wave', () => {
  const state = running({ rocks: [rock({ size: 1 })], shots: [shot()] })
  const next = stepAsteroids(state, idle, 1 / 120)
  assert.equal(next.wave, 2)
  assert.equal(next.score, 100)
  assert.equal(next.rocks.length, 5)
  assert.ok(next.ship.immunity >= 2)
  assert.deepEqual(next, stepAsteroids(state, idle, 1 / 120))
  assert.deepEqual(createAsteroids(42), createAsteroids(42))
  assert.notDeepEqual(createAsteroids(42).rocks, createAsteroids(43).rocks)
})

test('The simulation caps long deltas and keeps its effects bounded', () => {
  const state = running({
    rocks: [rock()],
    shots: [shot()],
    particles: Array.from({ length: 90 }, () => ({
      x: 1,
      y: 1,
      vx: 0,
      vy: 0,
      ttl: 1,
      lifetime: 1,
    })),
  })
  const next = stepAsteroids(state, idle, 60)
  assert.ok(next.time <= 1 / 30)
  assert.ok(next.particles.length <= 90)
  assert.equal(stepAsteroids(state, idle, Number.NaN), state)
  assert.equal(stepAsteroids(state, idle, -1), state)
})
