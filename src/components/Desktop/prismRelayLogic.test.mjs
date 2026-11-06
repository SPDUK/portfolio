import assert from 'node:assert/strict'
import test from 'node:test'
import {
  describeBeam,
  describePort,
  getPrismHint,
  initialMirrors,
  portPoint,
  prismPuzzles,
  reflectBeam,
  rotateMirror,
  traceBeam,
} from './prismRelayLogic.ts'

function emptyBench(source, receiver) {
  return {
    size: 5,
    source: { kind: 'edge', port: source },
    receiver,
    mirrors: [],
    blockers: [],
  }
}

test('Every authored bench starts unsolved and its complete mirror route connects', () => {
  assert.deepEqual(
    prismPuzzles.map(puzzle => puzzle.mirrors.length),
    [2, 4, 6],
  )
  for (const puzzle of prismPuzzles) {
    assert.equal(puzzle.size, 5)
    assert.notEqual(traceBeam(puzzle).kind, 'connected', puzzle.title)
    assert.equal(puzzle.solution.length, puzzle.mirrors.length)
    const trace = traceBeam(puzzle, puzzle.solution)
    assert.equal(trace.kind, 'connected', puzzle.title)
    assert.equal(
      trace.litMirrors.length,
      puzzle.mirrors.length,
      'Every authored mirror participates',
    )
    assert.deepEqual(trace.exit, puzzle.receiver)
    assert.ok(trace.points.length <= puzzle.size * puzzle.size * 4 + 2)
  }
})

test('Every orientation of the authored benches terminates within the finite ray bound', () => {
  for (const puzzle of prismPuzzles) {
    for (let mask = 0; mask < 2 ** puzzle.mirrors.length; mask += 1) {
      const orientations = puzzle.mirrors.map((_, index) =>
        (mask & (1 << index)) === 0 ? 'slash' : 'backslash',
      )
      const trace = traceBeam(puzzle, orientations)
      assert.ok(['connected', 'escaped', 'blocked'].includes(trace.kind))
      assert.ok(trace.points.length <= puzzle.size * puzzle.size * 4 + 2)
      assert.ok(
        trace.points.every(
          point =>
            point.x >= -0.5 &&
            point.x <= 4.5 &&
            point.y >= -0.5 &&
            point.y <= 4.5,
        ),
      )
    }
  }
  const crossing = prismPuzzles[1]
  const trace = traceBeam(crossing, crossing.solution)
  assert.equal(
    trace.points.filter(point => point.x === 2 && point.y === 3).length,
    2,
    'Crossing the same cell from another direction is a valid path, rather than a loop',
  )
})

test('Mirrors reflect all four incoming directions and a second turn restores orientation', () => {
  const directions = ['up', 'right', 'down', 'left']
  assert.deepEqual(
    directions.map(direction => reflectBeam(direction, 'slash')),
    ['right', 'up', 'left', 'down'],
  )
  assert.deepEqual(
    directions.map(direction => reflectBeam(direction, 'backslash')),
    ['left', 'down', 'right', 'up'],
  )
  const initial = ['slash', 'backslash', 'slash']
  const turned = rotateMirror(initial, 1)
  assert.deepEqual(turned, ['slash', 'slash', 'slash'])
  assert.deepEqual(
    initial,
    ['slash', 'backslash', 'slash'],
    'Turning is immutable',
  )
  assert.deepEqual(rotateMirror(turned, 1), initial)
  for (const index of [-1, 3, 0.5, NaN])
    assert.equal(rotateMirror(initial, index), initial)
})

test('Straight beams enter and leave every board edge at exact boundaries', () => {
  for (const [source, receiver, start, end] of [
    [
      { edge: 'left', index: 2 },
      { edge: 'right', index: 2 },
      { x: -0.5, y: 2 },
      { x: 4.5, y: 2 },
    ],
    [
      { edge: 'right', index: 2 },
      { edge: 'left', index: 2 },
      { x: 4.5, y: 2 },
      { x: -0.5, y: 2 },
    ],
    [
      { edge: 'top', index: 2 },
      { edge: 'bottom', index: 2 },
      { x: 2, y: -0.5 },
      { x: 2, y: 4.5 },
    ],
    [
      { edge: 'bottom', index: 2 },
      { edge: 'top', index: 2 },
      { x: 2, y: 4.5 },
      { x: 2, y: -0.5 },
    ],
  ]) {
    const trace = traceBeam(emptyBench(source, receiver))
    assert.equal(trace.kind, 'connected')
    assert.deepEqual(trace.points[0], start)
    assert.deepEqual(trace.points.at(-1), end)
    assert.deepEqual(portPoint(source, 5), start)
    assert.equal(trace.points.length, 7)
  }
  const escaped = traceBeam(
    emptyBench({ edge: 'left', index: 2 }, { edge: 'right', index: 3 }),
  )
  assert.equal(escaped.kind, 'escaped')
  assert.deepEqual(escaped.exit, { edge: 'right', index: 2 })
  assert.match(describeBeam(escaped), /right edge, row 3/)
})

test('A blocker stops the beam at its cell and prevents a receiver connection', () => {
  const bench = emptyBench(
    { edge: 'left', index: 2 },
    { edge: 'right', index: 2 },
  )
  bench.blockers.push({ x: 2, y: 2 })
  const trace = traceBeam(bench)
  assert.equal(trace.kind, 'blocked')
  assert.deepEqual(trace.cell, { x: 2, y: 2 })
  assert.deepEqual(trace.points.at(-1), trace.cell)
  assert.equal(trace.points.length, 4)
  assert.match(describeBeam(trace), /blocker in row 3, column 3/)
})

test('A closed internal ray stops on a repeated cell and incoming direction', () => {
  // A reversible edge source cannot enter a closed cycle; place a diagnostic ray inside it.
  const trace = traceBeam({
    size: 5,
    source: { kind: 'cell', cell: { x: 1, y: 1 }, direction: 'up' },
    receiver: { edge: 'right', index: 0 },
    mirrors: [
      { id: 1, cell: { x: 1, y: 1 }, initial: 'slash' },
      { id: 2, cell: { x: 3, y: 1 }, initial: 'backslash' },
      { id: 3, cell: { x: 3, y: 3 }, initial: 'slash' },
      { id: 4, cell: { x: 1, y: 3 }, initial: 'backslash' },
    ],
    blockers: [],
  })
  assert.equal(trace.kind, 'loop')
  assert.deepEqual(trace.cell, { x: 1, y: 1 })
  assert.equal(trace.points.length, 9)
  assert.ok(trace.points.length <= 5 * 5 * 4 + 1)
  assert.match(describeBeam(trace), /loops through row 2, column 2/)
})

test('Hints only identify wrong mirrors, and following them solves each authored puzzle', () => {
  for (const puzzle of prismPuzzles) {
    let orientations = initialMirrors(puzzle)
    const untouched = [...orientations]
    let turns = 0
    while (traceBeam(puzzle, orientations).kind !== 'connected') {
      const hint = getPrismHint(puzzle, orientations)
      assert.notEqual(hint, null)
      assert.notEqual(orientations[hint], puzzle.solution[hint])
      const beforeHint = [...orientations]
      assert.equal(getPrismHint(puzzle, orientations), hint)
      assert.deepEqual(orientations, beforeHint, 'A hint never turns a mirror')
      orientations = rotateMirror(orientations, hint)
      turns += 1
      assert.ok(turns <= puzzle.mirrors.length)
    }
    assert.equal(getPrismHint(puzzle, orientations), null)
    assert.deepEqual(
      initialMirrors(puzzle),
      untouched,
      'Reset restores the authored start',
    )
  }
  assert.equal(describePort({ edge: 'top', index: 1 }), 'top edge, column 2')
  assert.match(
    describeBeam(traceBeam(prismPuzzles[0], prismPuzzles[0].solution)),
    /^Receiver connected/,
  )
})
