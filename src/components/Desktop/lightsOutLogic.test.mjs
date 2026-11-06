import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createLightsOut,
  isLightsOutSolved,
  pressLightsOut,
  resetLightsOut,
  solveLightsOut,
  toggleLightsOutCells,
} from './lightsOutLogic.ts'

const empty = size => Array(size * size).fill(false)
const litCells = board => board.flatMap((lit, index) => (lit ? [index] : []))

test('A tile toggles itself and its orthogonal neighbors without wrapping edges', () => {
  assert.deepEqual(
    litCells(toggleLightsOutCells({ board: empty(3), size: 3, index: 0 })),
    [0, 1, 3],
  )
  assert.deepEqual(
    litCells(toggleLightsOutCells({ board: empty(3), size: 3, index: 2 })),
    [1, 2, 5],
  )
  assert.deepEqual(
    litCells(toggleLightsOutCells({ board: empty(3), size: 3, index: 4 })),
    [1, 3, 4, 5, 7],
  )
  assert.deepEqual(
    litCells(toggleLightsOutCells({ board: empty(5), size: 5, index: 24 })),
    [19, 23, 24],
  )
})

test('Generated puzzles are reproducible, nonempty, varied, and solvable at every size', () => {
  for (const size of [3, 4, 5]) {
    const boards = new Set()
    for (let seed = 0; seed < 100; seed += 1) {
      const puzzle = createLightsOut(size, seed)
      assert.deepEqual(puzzle, createLightsOut(size, seed))
      assert.equal(puzzle.board.length, size * size)
      assert.equal(isLightsOutSolved(puzzle.board), false)
      assert.equal(puzzle.moves, 0)
      const solution = solveLightsOut(puzzle)
      assert.ok(solution?.length)
      const solved = solution.reduce(pressLightsOut, puzzle)
      assert.equal(isLightsOutSolved(solved.board), true)
      assert.equal(solved.moves, solution.length)
      boards.add(puzzle.board.join(','))
    }
    assert.ok(boards.size > 80)
  }
})

test('Hints solve the current board after arbitrary player moves', () => {
  for (const size of [3, 4, 5]) {
    let puzzle = createLightsOut(size, 42)
    for (const index of [0, size, size * size - 1, 1, 0]) {
      puzzle = pressLightsOut(puzzle, index)
    }
    const solution = solveLightsOut(puzzle)
    assert.notEqual(solution, null)
    const solved = solution.reduce(pressLightsOut, puzzle)
    assert.equal(isLightsOutSolved(solved.board), true)
  }
})

test('The solver chooses a shortest solution and handles solved and impossible boards', () => {
  const board = toggleLightsOutCells({ board: empty(4), size: 4, index: 5 })
  assert.deepEqual(solveLightsOut({ board, size: 4 }), [5])
  assert.deepEqual(solveLightsOut({ board: empty(5), size: 5 }), [])
  const impossible = empty(4)
  impossible[0] = true
  assert.equal(solveLightsOut({ board: impossible, size: 4 }), null)
})

test('Moves are immutable and reset restores the exact starting board and count', () => {
  const puzzle = createLightsOut(5, 17)
  const snapshot = structuredClone(puzzle)
  Object.freeze(puzzle.board)
  Object.freeze(puzzle)
  const once = pressLightsOut(puzzle, 12)
  const twice = pressLightsOut(once, 12)
  assert.deepEqual(twice.board, puzzle.board)
  assert.equal(twice.moves, 2)
  assert.deepEqual(puzzle, snapshot)
  assert.deepEqual(resetLightsOut(once), puzzle)
  assert.deepEqual(resetLightsOut(twice), puzzle)
  for (const invalid of [-1, 25, 1.5, NaN]) {
    assert.equal(pressLightsOut(puzzle, invalid), puzzle)
  }
  const solved = {
    ...puzzle,
    board: empty(5),
    moves: 10,
  }
  assert.equal(pressLightsOut(solved, 0), solved)
  assert.deepEqual(resetLightsOut(solved), puzzle)
})
