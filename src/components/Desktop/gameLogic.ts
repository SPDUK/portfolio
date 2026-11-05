export type { GameId } from './arcadeCatalog'
export type GameStatus = 'ready' | 'running' | 'paused' | 'lost' | 'won'
export type Direction = 'up' | 'down' | 'left' | 'right'
export interface Point {
  x: number
  y: number
}
export interface SnakeState {
  body: Point[]
  direction: Direction
  food: Point | null
  score: number
  status: GameStatus
}
export const GRID = { width: 24, height: 16 }
const offsets: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y
export function spawnFood(body: Point[], random = Math.random): Point | null {
  const free: Point[] = []
  for (let y = 0; y < GRID.height; y += 1) {
    for (let x = 0; x < GRID.width; x += 1) {
      if (!body.some(segment => same(segment, { x, y }))) free.push({ x, y })
    }
  }
  return (
    free[Math.min(free.length - 1, Math.floor(random() * free.length))] || null
  )
}
export function createSnake(): SnakeState {
  return {
    body: [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ],
    direction: 'right',
    food: { x: 17, y: 8 },
    score: 0,
    status: 'ready',
  }
}
export function stepSnake(
  state: SnakeState,
  direction: Direction,
  random = Math.random,
): SnakeState {
  if (state.status !== 'running') return state
  const old = offsets[state.direction]
  const requested = offsets[direction]
  const nextDirection =
    old.x + requested.x === 0 && old.y + requested.y === 0
      ? state.direction
      : direction
  const offset = offsets[nextDirection]
  const head = { x: state.body[0].x + offset.x, y: state.body[0].y + offset.y }
  const eating = state.food !== null && same(head, state.food)
  const occupied = eating ? state.body : state.body.slice(0, -1)
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID.width ||
    head.y >= GRID.height ||
    occupied.some(segment => same(segment, head))
  ) {
    return { ...state, status: 'lost' }
  }
  const body = [head, ...state.body]
  if (!eating) body.pop()
  const food = eating ? spawnFood(body, random) : state.food
  return {
    ...state,
    body,
    direction: nextDirection,
    food,
    score: state.score + (eating ? 10 : 0),
    status: food === null ? 'won' : 'running',
  }
}
export interface Brick {
  x: number
  y: number
  alive: boolean
}
export interface BreakoutState {
  ball: Point & { vx: number; vy: number }
  paddle: number
  bricks: Brick[]
  score: number
  lives: number
  status: GameStatus
}
export const FIELD = {
  width: 600,
  height: 400,
  paddleWidth: 88,
  paddleY: 365,
  ballRadius: 6,
  brickWidth: 59,
  brickHeight: 15,
}
export function createBreakout(): BreakoutState {
  const bricks: Brick[] = []
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1)
      bricks.push({ x: 36 + col * 67, y: 47 + row * 23, alive: true })
  }
  return {
    ball: { x: 300, y: 335, vx: 125, vy: -230 },
    paddle: 300,
    bricks,
    score: 0,
    lives: 3,
    status: 'ready',
  }
}
export function stepBreakout(
  state: BreakoutState,
  seconds: number,
  paddle: number,
): BreakoutState {
  if (state.status !== 'running') return state
  const dt = Math.min(seconds, 1 / 60)
  const next = {
    ...state,
    ball: { ...state.ball },
    bricks: state.bricks.map(brick => ({ ...brick })),
    paddle: Math.max(48, Math.min(552, paddle)),
  }
  const { ball } = next
  const oldY = ball.y
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt
  if (ball.x < 6 || ball.x > 594) {
    ball.x = Math.max(6, Math.min(594, ball.x))
    ball.vx *= -1
  }
  if (ball.y < 6) {
    ball.y = 6
    ball.vy = Math.abs(ball.vy)
  }
  if (
    ball.vy > 0 &&
    oldY + 6 <= FIELD.paddleY &&
    ball.y + 6 >= FIELD.paddleY &&
    Math.abs(ball.x - next.paddle) < FIELD.paddleWidth / 2 + 6
  ) {
    const offset = (ball.x - next.paddle) / (FIELD.paddleWidth / 2)
    ball.y = FIELD.paddleY - 6
    ball.vx = offset * 240
    ball.vy = -Math.sqrt(Math.max(180 ** 2, 300 ** 2 - ball.vx ** 2))
  }
  for (const brick of next.bricks) {
    if (
      brick.alive &&
      ball.x + 6 >= brick.x &&
      ball.x - 6 <= brick.x + FIELD.brickWidth &&
      ball.y + 6 >= brick.y &&
      ball.y - 6 <= brick.y + FIELD.brickHeight
    ) {
      brick.alive = false
      next.score += 25
      if (oldY + 6 <= brick.y || oldY - 6 >= brick.y + FIELD.brickHeight)
        ball.vy *= -1
      else ball.vx *= -1
      break
    }
  }
  if (next.bricks.every(brick => !brick.alive)) next.status = 'won'
  else if (ball.y > FIELD.height + 6) {
    next.lives -= 1
    next.status = next.lives === 0 ? 'lost' : 'paused'
    next.ball = { x: next.paddle, y: 335, vx: 125, vy: -230 }
  }
  return next
}
