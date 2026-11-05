import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createSnake,
  stepSnake,
  spawnFood,
  GRID,
  createBreakout,
  stepBreakout,
  FIELD,
} from './gameLogic.ts'

test('Snake starts ready and does not move until started', () => {
  const state = createSnake()
  assert.equal(state.status, 'ready')
  assert.equal(stepSnake(state, 'up'), state)
})
test('Snake rejects immediate reversal and advances one cell', () => {
  const state = { ...createSnake(), status: 'running' }
  const next = stepSnake(state, 'left')
  assert.deepEqual(next.body[0], { x: 9, y: 8 })
  assert.deepEqual(state.body[0], { x: 8, y: 8 })
})
test('Snake grows and scores when eating and food never overlaps its body', () => {
  const state = { ...createSnake(), status: 'running', food: { x: 9, y: 8 } }
  const next = stepSnake(state, 'right', () => 0)
  assert.equal(next.score, 10)
  assert.equal(next.body.length, 4)
  assert.ok(
    !next.body.some(
      segment => segment.x === next.food.x && segment.y === next.food.y,
    ),
  )
})
test('Snake wall and body collisions end the run', () => {
  const state = { ...createSnake(), status: 'running', body: [{ x: 23, y: 8 }] }
  assert.equal(stepSnake(state, 'right').status, 'lost')
  state.body = [
    { x: 5, y: 5 },
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },
    { x: 6, y: 6 },
  ]
  assert.equal(stepSnake(state, 'up').status, 'lost')
})
test('Snake may enter the tail cell being vacated', () => {
  const state = {
    ...createSnake(),
    status: 'running',
    direction: 'down',
    body: [
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 5 },
    ],
  }
  assert.equal(stepSnake(state, 'right').status, 'running')
})
test('A completely filled Snake board wins without food generation looping', () => {
  const body = []
  for (let y = 0; y < GRID.height; y += 1)
    for (let x = 0; x < GRID.width; x += 1) body.push({ x, y })
  assert.equal(spawnFood(body), null)
  const state = {
    ...createSnake(),
    status: 'running',
    body: [
      { x: 22, y: 15 },
      ...body.filter(
        p => !(p.x === 22 && p.y === 15) && !(p.x === 23 && p.y === 15),
      ),
    ],
    food: { x: 23, y: 15 },
  }
  assert.equal(stepSnake(state, 'right').status, 'won')
})
test('Breakout pauses without advancing simulation', () => {
  const state = createBreakout()
  assert.equal(stepBreakout(state, 1 / 120, 400), state)
})
test('Breakout keeps paddle on screen and reflects wall contact', () => {
  const state = {
    ...createBreakout(),
    status: 'running',
    ball: { x: 5, y: 200, vx: -120, vy: -100 },
  }
  const next = stepBreakout(state, 1 / 120, -100)
  assert.equal(next.paddle, 48)
  assert.ok(next.ball.vx > 0)
  assert.equal(state.ball.vx, -120)
})
test('Breakout paddle bounce sends the ball upward', () => {
  const state = {
    ...createBreakout(),
    status: 'running',
    ball: { x: 300, y: FIELD.paddleY - 7, vx: 0, vy: 240 },
  }
  assert.ok(stepBreakout(state, 1 / 120, 300).ball.vy < 0)
})
test('Breakout scores once per destroyed brick and wins on last brick', () => {
  const state = {
    ...createBreakout(),
    status: 'running',
    bricks: [{ x: 100, y: 50, alive: true }],
    ball: { x: 120, y: 72, vx: 0, vy: -240 },
  }
  const next = stepBreakout(state, 1 / 120, 300)
  assert.equal(next.score, 25)
  assert.equal(next.status, 'won')
  assert.equal(next.bricks[0].alive, false)
})
test('Breakout loses one life and waits for explicit resume', () => {
  const state = {
    ...createBreakout(),
    status: 'running',
    ball: { x: 300, y: 407, vx: 0, vy: 240 },
  }
  const next = stepBreakout(state, 1 / 120, 300)
  assert.equal(next.lives, 2)
  assert.equal(next.status, 'paused')
  assert.equal(stepBreakout(next, 1 / 120, 300), next)
  assert.equal(
    stepBreakout({ ...state, lives: 1 }, 1 / 120, 300).status,
    'lost',
  )
})
