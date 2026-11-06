import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceShot,
  launchShot,
  normalizeSlingAim,
  pauseShot,
  resumeShot,
  segmentCircleHit,
  simulateShot,
  SLING_CATCHUP_STEPS,
  SLING_COURSES,
  SLING_MAX_STEPS,
  SLING_MAX_TRAIL,
  SLING_SPACE,
  SLING_STEP,
  stepShot,
} from './gravitySlingLogic.ts'

for (const course of SLING_COURSES) {
  test(`${course.name} has a reproducible winning flight and an unsolved starting aim`, () => {
    const shot = simulateShot(course, course.solution)
    assert.equal(shot.phase, 'hit')
    assert.deepEqual(simulateShot(course, course.solution), shot)
    assert.notEqual(simulateShot(course, course.initialAim).phase, 'hit')
    assert.ok(
      shot.steps > 120,
      'The receiver requires a flight through the field',
    )
    assert.ok(shot.steps <= SLING_MAX_STEPS)
    assert.ok(shot.trail.length <= SLING_MAX_TRAIL)
    assert.deepEqual(shot.trail[0], course.launch)
    assert.deepEqual(shot.trail.at(-1), shot.position)
    assert.ok(
      Math.hypot(
        shot.position.x - course.receiver.x,
        shot.position.y - course.receiver.y,
      ) <=
        course.receiver.radius + 3.000001,
      'The final probe touches the receiver',
    )
    assert.ok(
      shot.trail.every(
        point => Number.isFinite(point.x) && Number.isFinite(point.y),
      ),
    )
  })
}

test('the return arc bends back left and takes longer than the opening course', () => {
  const first = simulateShot(SLING_COURSES[0], SLING_COURSES[0].solution)
  const course = SLING_COURSES[2]
  const returning = simulateShot(course, course.solution)
  assert.ok(returning.steps > first.steps)
  assert.ok(
    returning.velocity.x < 0,
    'The probe arrives while traveling back to the left',
  )
})

test('the same fixed steps produce the same path through frame catch-up and direct simulation', () => {
  const course = SLING_COURSES[1]
  let shot = launchShot(course, course.solution)
  while (shot.phase === 'flying')
    shot = advanceShot(shot, course, SLING_STEP * 4)
  assert.deepEqual(shot, simulateShot(course, course.solution))
})

test('a paused flight holds its exact position until explicitly resumed', () => {
  const course = SLING_COURSES[0]
  const launched = advanceShot(launchShot(course, course.solution), course, 0.1)
  const paused = pauseShot(launched)
  assert.equal(paused.phase, 'paused')
  assert.equal(stepShot(paused, course), paused)
  assert.equal(advanceShot(paused, course, 1), paused)
  const resumed = resumeShot(paused)
  assert.equal(resumed.phase, 'flying')
  assert.deepEqual(resumed.position, launched.position)
  assert.deepEqual(stepShot(resumed, course), stepShot(launched, course))
  const finished = simulateShot(course, course.solution)
  assert.equal(pauseShot(finished), finished)
  assert.equal(resumeShot(finished), finished)
})

test('one delayed frame cannot advance an unbounded amount of physics', () => {
  const course = SLING_COURSES[0]
  const shot = launchShot(course, course.solution)
  assert.equal(advanceShot(shot, course, 60).steps, SLING_CATCHUP_STEPS)
  assert.equal(advanceShot(shot, course, SLING_STEP / 2), shot)
  for (const invalid of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(advanceShot(shot, course, invalid), shot)
  }
})

test('segment collision detects a crossed circle, a tangent, and an initial overlap', () => {
  const circle = { x: 50, y: 50, radius: 10 }
  assert.equal(
    segmentCircleHit({ x: 0, y: 50 }, { x: 100, y: 50 }, circle),
    0.4,
  )
  assert.equal(
    segmentCircleHit({ x: 0, y: 40 }, { x: 100, y: 40 }, circle),
    0.5,
  )
  assert.equal(segmentCircleHit({ x: 50, y: 50 }, { x: 50, y: 50 }, circle), 0)
  assert.equal(segmentCircleHit({ x: 0, y: 0 }, { x: 0, y: 0 }, circle), null)
  assert.equal(
    segmentCircleHit({ x: 0, y: 10 }, { x: 100, y: 10 }, circle),
    null,
  )
})

test('a fast probe hits the first object crossed and stops on its surface', () => {
  const course = {
    ...SLING_COURSES[0],
    launch: { x: 60, y: 200 },
    body: { x: 350, y: 200, radius: 35, gravity: 0 },
    receiver: { x: 600, y: 200, radius: 18 },
  }
  const fast = {
    ...launchShot(course, { angle: 0, power: 100 }),
    velocity: { x: 100000, y: 0 },
  }
  const collision = stepShot(fast, course)
  assert.equal(collision.phase, 'collision')
  assert.equal(collision.position.x, 312)
  assert.equal(collision.position.y, 200)
  assert.deepEqual(collision.trail.at(-1), collision.position)
  const receiverFirst = { ...course, receiver: { x: 200, y: 200, radius: 18 } }
  assert.equal(stepShot(fast, receiverFirst).phase, 'hit')
  assert.equal(stepShot(collision, course), collision)
})

test('escaped probes stop at the edge and every ordinary aim ends within the flight budget', () => {
  for (const course of SLING_COURSES) {
    for (const angle of [-75, -30, 0, 30, 75]) {
      for (const power of [0, 50, 100]) {
        const shot = simulateShot(course, { angle, power })
        assert.ok(
          ['hit', 'collision', 'escaped', 'timed-out'].includes(shot.phase),
        )
        assert.ok(shot.steps <= SLING_MAX_STEPS)
        assert.ok(shot.trail.length <= SLING_MAX_TRAIL)
        assert.ok(
          shot.position.x >= -0.000001 &&
            shot.position.x <= SLING_SPACE.width + 0.000001,
        )
        assert.ok(
          shot.position.y >= -0.000001 &&
            shot.position.y <= SLING_SPACE.height + 0.000001,
        )
      }
    }
  }
})

test('a bound orbit cannot run forever or grow its trail without limit', () => {
  const course = {
    ...SLING_COURSES[0],
    launch: { x: 100, y: 100 },
    body: { x: 400, y: 300, radius: 20, gravity: 0 },
    receiver: { x: 650, y: 40, radius: 18 },
  }
  let shot = {
    ...launchShot(course, course.solution),
    velocity: { x: 0, y: 0 },
  }
  for (let index = 0; index < SLING_MAX_STEPS + 10; index += 1)
    shot = stepShot(shot, course)
  assert.equal(shot.phase, 'timed-out')
  assert.equal(shot.steps, SLING_MAX_STEPS)
  assert.ok(shot.trail.length <= SLING_MAX_TRAIL)
  assert.deepEqual(shot.position, course.launch)
})

test('aim input is finite and bounded, and a short preview does not complete a flight', () => {
  assert.deepEqual(normalizeSlingAim({ angle: -900, power: 999 }), {
    angle: -75,
    power: 100,
  })
  assert.deepEqual(
    normalizeSlingAim({ angle: Number.NaN, power: Number.POSITIVE_INFINITY }),
    { angle: 0, power: 50 },
  )
  const course = SLING_COURSES[0]
  const preview = simulateShot(course, course.solution, 70)
  assert.equal(preview.phase, 'flying')
  assert.equal(preview.steps, 70)
  assert.ok(preview.position.x - course.launch.x < 130)
})
