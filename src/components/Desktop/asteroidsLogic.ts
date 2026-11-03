import type { GameStatus, Point } from './gameLogic'

export const SPACE = { width: 600, height: 400 }
export const ROCK_RADIUS = { 1: 12, 2: 23, 3: 39 }
export const SHOT_INTERVAL = 0.17
const SHOT_LIFETIME = 1.15
const MAX_PARTICLES = 90

export interface AsteroidsInput {
  left: boolean
  right: boolean
  thrust: boolean
  fire: boolean
}
interface Body extends Point {
  vx: number
  vy: number
}
export interface Ship extends Body {
  angle: number
  immunity: number
}
export interface Rock extends Body {
  id: number
  size: 1 | 2 | 3
  angle: number
  spin: number
}
export interface Shot extends Body {
  id: number
  ttl: number
}
export interface Particle extends Body {
  ttl: number
  lifetime: number
}
export interface AsteroidsState {
  status: Exclude<GameStatus, 'won'>
  ship: Ship
  rocks: Rock[]
  shots: Shot[]
  particles: Particle[]
  score: number
  lives: number
  wave: number
  seed: number
  nextId: number
  cooldown: number
  time: number
}

const newShip = (): Ship => ({
  x: SPACE.width / 2,
  y: SPACE.height / 2,
  vx: 0,
  vy: 0,
  angle: -Math.PI / 2,
  immunity: 2.5,
})
const wrap = (value: number, limit: number) => ((value % limit) + limit) % limit
const distance = (a: Point, b: Point) => {
  const dx = Math.abs(a.x - b.x)
  const dy = Math.abs(a.y - b.y)
  return Math.hypot(
    Math.min(dx, SPACE.width - dx),
    Math.min(dy, SPACE.height - dy),
  )
}

function randomSource(initialSeed: number) {
  let seed = Number.isFinite(initialSeed)
    ? wrap(Math.floor(initialSeed), 4294967296)
    : 1
  return {
    next: () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    },
    seed: () => seed,
  }
}

function spawnWave(wave: number, seed: number, nextId: number) {
  const random = randomSource(seed)
  const rocks: Rock[] = []
  for (let index = 0; index < Math.min(3 + wave, 10); index += 1) {
    const angle = random.next() * Math.PI * 2
    const speed = 26 + random.next() * 24 + wave * 4
    const perimeter = random.next()
    const horizontal = index % 2 === 0
    const sideX = index % 3 === 0 ? 55 : 545
    const sideY = index % 3 === 0 ? 52 : 348
    rocks.push({
      id: nextId + index,
      size: 3,
      x: horizontal ? 45 + perimeter * 510 : sideX,
      y: horizontal ? sideY : 40 + perimeter * 320,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      spin: (random.next() - 0.5) * 0.9,
    })
  }
  return { rocks, seed: random.seed(), nextId: nextId + rocks.length }
}

export function createAsteroids(seed = 0x5a17c0de): AsteroidsState {
  return {
    status: 'ready',
    ship: newShip(),
    ...spawnWave(1, seed, 1),
    shots: [],
    particles: [],
    score: 0,
    lives: 3,
    wave: 1,
    cooldown: 0,
    time: 0,
  }
}

export function stepAsteroids(
  state: AsteroidsState,
  input: AsteroidsInput,
  seconds: number,
): AsteroidsState {
  if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0)
    return state
  const dt = Math.min(seconds, 1 / 30)
  const random = randomSource(state.seed)
  let { nextId, score, lives, wave } = state
  let status: AsteroidsState['status'] = 'running'
  let ship = { ...state.ship }
  ship.angle += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 4.3 * dt
  if (input.thrust) {
    ship.vx += Math.cos(ship.angle) * 245 * dt
    ship.vy += Math.sin(ship.angle) * 245 * dt
  }
  const speed = Math.hypot(ship.vx, ship.vy)
  const drag = Math.exp(-0.12 * dt) * (speed > 310 ? 310 / speed : 1)
  ship.vx *= drag
  ship.vy *= drag
  ship.x = wrap(ship.x + ship.vx * dt, SPACE.width)
  ship.y = wrap(ship.y + ship.vy * dt, SPACE.height)
  ship.immunity = Math.max(0, ship.immunity - dt)

  let cooldown = Math.max(0, state.cooldown - dt)
  const shots = state.shots
    .map(shot => ({
      ...shot,
      x: wrap(shot.x + shot.vx * dt, SPACE.width),
      y: wrap(shot.y + shot.vy * dt, SPACE.height),
      ttl: shot.ttl - dt,
    }))
    .filter(shot => shot.ttl > 0)
  if (input.fire && cooldown === 0 && shots.length < 12) {
    shots.push({
      id: nextId,
      x: wrap(ship.x + Math.cos(ship.angle) * 17, SPACE.width),
      y: wrap(ship.y + Math.sin(ship.angle) * 17, SPACE.height),
      vx: Math.cos(ship.angle) * 430 + ship.vx * 0.35,
      vy: Math.sin(ship.angle) * 430 + ship.vy * 0.35,
      ttl: SHOT_LIFETIME,
    })
    nextId += 1
    cooldown = SHOT_INTERVAL
  }
  let rocks = state.rocks.map(rock => ({
    ...rock,
    x: wrap(rock.x + rock.vx * dt, SPACE.width),
    y: wrap(rock.y + rock.vy * dt, SPACE.height),
    angle: rock.angle + rock.spin * dt,
  }))
  const particles = state.particles
    .map(particle => ({
      ...particle,
      x: wrap(particle.x + particle.vx * dt, SPACE.width),
      y: wrap(particle.y + particle.vy * dt, SPACE.height),
      ttl: particle.ttl - dt,
    }))
    .filter(particle => particle.ttl > 0)
  const burst = (point: Point, count: number) => {
    for (let index = 0; index < count; index += 1) {
      const angle = random.next() * Math.PI * 2
      const velocity = 20 + random.next() * 100
      const lifetime = 0.25 + random.next() * 0.4
      particles.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        ttl: lifetime,
        lifetime,
      })
    }
  }
  const hitShots = new Set<number>()
  const fragments: Rock[] = []
  rocks = rocks.filter(rock => {
    const shot = shots.find(
      candidate =>
        !hitShots.has(candidate.id) &&
        distance(candidate, rock) < ROCK_RADIUS[rock.size] + 2,
    )
    if (!shot) return true
    hitShots.add(shot.id)
    score += { 1: 100, 2: 50, 3: 20 }[rock.size]
    burst(rock, rock.size * 5)
    if (rock.size > 1) {
      const size = rock.size === 3 ? 2 : 1
      for (const direction of [-1, 1]) {
        const angle =
          Math.atan2(rock.vy, rock.vx) + direction * (0.6 + random.next() * 0.5)
        const velocity = Math.hypot(rock.vx, rock.vy) + 26
        fragments.push({
          ...rock,
          id: nextId,
          size,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          spin: direction * (0.5 + random.next()),
        })
        nextId += 1
      }
    }
    return false
  })
  rocks.push(...fragments)
  if (
    ship.immunity === 0 &&
    rocks.some(rock => distance(ship, rock) < ROCK_RADIUS[rock.size] * 0.85 + 8)
  ) {
    burst(ship, 24)
    lives -= 1
    ship = newShip()
    if (lives === 0) status = 'lost'
  }
  let seed = random.seed()
  if (rocks.length === 0 && status === 'running') {
    wave += 1
    const spawned = spawnWave(wave, seed, nextId)
    rocks = spawned.rocks
    seed = spawned.seed
    nextId = spawned.nextId
    ship.immunity = Math.max(ship.immunity, 2)
  }
  return {
    ...state,
    status,
    ship,
    rocks,
    shots: shots.filter(shot => !hitShots.has(shot.id)),
    particles: particles.slice(-MAX_PARTICLES),
    score,
    lives,
    wave,
    seed,
    nextId,
    cooldown,
    time: state.time + dt,
  }
}
