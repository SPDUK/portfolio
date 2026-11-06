export interface SlingPoint {
  x: number
  y: number
}

export interface SlingAim {
  angle: number
  power: number
}

export interface SlingCourse {
  id: string
  name: string
  description: string
  launch: SlingPoint
  body: SlingPoint & { radius: number; gravity: number }
  receiver: SlingPoint & { radius: number }
  initialAim: SlingAim
  solution: SlingAim
}

export type SlingPhase =
  | 'flying'
  | 'paused'
  | 'hit'
  | 'collision'
  | 'escaped'
  | 'timed-out'

export interface SlingShot {
  phase: SlingPhase
  position: SlingPoint
  velocity: SlingPoint
  steps: number
  trail: readonly SlingPoint[]
}

export const SLING_SPACE = { width: 720, height: 420 }
export const SLING_STEP = 1 / 120
export const SLING_MAX_STEPS = 1800
export const SLING_CATCHUP_STEPS = 12
export const SLING_MAX_TRAIL = 602
export const SLING_PROBE_RADIUS = 3
export const SLING_MIN_ANGLE = -75
export const SLING_MAX_ANGLE = 75

export const SLING_COURSES: readonly SlingCourse[] = [
  {
    id: 'gentle-bend',
    name: 'Gentle bend',
    description: 'Let gravity draw your flight back toward the receiver.',
    launch: { x: 76, y: 316 },
    body: { x: 360, y: 224, radius: 42, gravity: 1250000 },
    receiver: { x: 642, y: 306, radius: 20 },
    initialAim: { angle: -25, power: 60 },
    solution: { angle: -15, power: 50 },
  },
  {
    id: 'close-pass',
    name: 'Close pass',
    description: 'Skim the lower edge for a sharper turn upward.',
    launch: { x: 76, y: 316 },
    body: { x: 360, y: 224, radius: 42, gravity: 1250000 },
    receiver: { x: 634, y: 138, radius: 18 },
    initialAim: { angle: -15, power: 58 },
    solution: { angle: -5, power: 50 },
  },
  {
    id: 'return-arc',
    name: 'Return arc',
    description: 'Ease off the power. Loop around and return from below.',
    launch: { x: 80, y: 310 },
    body: { x: 380, y: 260, radius: 37, gravity: 2400000 },
    receiver: { x: 330, y: 38, radius: 18 },
    initialAim: { angle: -30, power: 18 },
    solution: { angle: -20, power: 7 },
  },
]

export function normalizeSlingAim(aim: SlingAim): SlingAim {
  return {
    angle: Number.isFinite(aim.angle)
      ? Math.max(SLING_MIN_ANGLE, Math.min(SLING_MAX_ANGLE, aim.angle))
      : 0,
    power: Number.isFinite(aim.power)
      ? Math.max(0, Math.min(100, aim.power))
      : 50,
  }
}

export function launchShot(course: SlingCourse, input: SlingAim): SlingShot {
  const aim = normalizeSlingAim(input)
  const angle = (aim.angle * Math.PI) / 180
  const speed = 90 + aim.power * 1.5
  return {
    phase: 'flying',
    position: { ...course.launch },
    velocity: { x: Math.cos(angle) * speed, y: -Math.sin(angle) * speed },
    steps: 0,
    trail: [{ ...course.launch }],
  }
}

// The first intersection matters: a fast probe cannot tunnel through a body.
export function segmentCircleHit(
  from: SlingPoint,
  to: SlingPoint,
  circle: SlingPoint & { radius: number },
): number | null {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const ox = from.x - circle.x
  const oy = from.y - circle.y
  const c = ox * ox + oy * oy - circle.radius * circle.radius
  if (c <= 0) return 0
  const a = dx * dx + dy * dy
  if (a === 0) return null
  const b = 2 * (ox * dx + oy * dy)
  const discriminant = b * b - 4 * a * c
  if (discriminant < 0) return null
  const t = (-b - Math.sqrt(discriminant)) / (2 * a)
  return t >= 0 && t <= 1 ? t : null
}

function boundaryExit(from: SlingPoint, to: SlingPoint): number | null {
  let first = 1
  let escaped = false
  for (const [start, end, limit] of [
    [from.x, to.x, SLING_SPACE.width],
    [from.y, to.y, SLING_SPACE.height],
  ]) {
    if (end < 0 || end > limit) {
      const edge = end < 0 ? 0 : limit
      first = Math.min(first, (edge - start) / (end - start))
      escaped = true
    }
  }
  return escaped ? Math.max(0, first) : null
}

export function stepShot(shot: SlingShot, course: SlingCourse): SlingShot {
  if (shot.phase !== 'flying') return shot
  const dx = course.body.x - shot.position.x
  const dy = course.body.y - shot.position.y
  const distance = Math.max(course.body.radius, Math.hypot(dx, dy))
  const acceleration = course.body.gravity / (distance * distance * distance)
  const velocity = {
    x: shot.velocity.x + dx * acceleration * SLING_STEP,
    y: shot.velocity.y + dy * acceleration * SLING_STEP,
  }
  let position = {
    x: shot.position.x + velocity.x * SLING_STEP,
    y: shot.position.y + velocity.y * SLING_STEP,
  }
  const hits: { phase: SlingPhase; t: number }[] = []
  const bodyHit = segmentCircleHit(shot.position, position, {
    ...course.body,
    radius: course.body.radius + SLING_PROBE_RADIUS,
  })
  const receiverHit = segmentCircleHit(shot.position, position, {
    ...course.receiver,
    radius: course.receiver.radius + SLING_PROBE_RADIUS,
  })
  const exit = boundaryExit(shot.position, position)
  if (bodyHit !== null) hits.push({ phase: 'collision', t: bodyHit })
  if (receiverHit !== null) hits.push({ phase: 'hit', t: receiverHit })
  if (exit !== null) hits.push({ phase: 'escaped', t: exit })
  hits.sort((a, b) => a.t - b.t)
  const first = hits[0]
  const steps = shot.steps + 1
  const phase =
    first?.phase || (steps >= SLING_MAX_STEPS ? 'timed-out' : 'flying')
  if (first) {
    position = {
      x: shot.position.x + (position.x - shot.position.x) * first.t,
      y: shot.position.y + (position.y - shot.position.y) * first.t,
    }
  }
  const trail =
    steps % 3 === 0 || phase !== 'flying'
      ? [...shot.trail, position].slice(-SLING_MAX_TRAIL)
      : shot.trail
  return { phase, position, velocity, steps, trail }
}

export function pauseShot(shot: SlingShot): SlingShot {
  return shot.phase === 'flying' ? { ...shot, phase: 'paused' } : shot
}

export function resumeShot(shot: SlingShot): SlingShot {
  return shot.phase === 'paused' ? { ...shot, phase: 'flying' } : shot
}

export function advanceShot(
  shot: SlingShot,
  course: SlingCourse,
  elapsed: number,
): SlingShot {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return shot
  const steps = Math.min(SLING_CATCHUP_STEPS, Math.floor(elapsed / SLING_STEP))
  let next = shot
  for (let index = 0; index < steps && next.phase === 'flying'; index += 1) {
    next = stepShot(next, course)
  }
  return next
}

export function simulateShot(
  course: SlingCourse,
  aim: SlingAim,
  maxSteps = SLING_MAX_STEPS,
): SlingShot {
  const limit = Number.isFinite(maxSteps)
    ? Math.max(0, Math.min(SLING_MAX_STEPS, Math.floor(maxSteps)))
    : SLING_MAX_STEPS
  let shot = launchShot(course, aim)
  for (let index = 0; index < limit && shot.phase === 'flying'; index += 1) {
    shot = stepShot(shot, course)
  }
  return shot
}
