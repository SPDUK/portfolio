export type LightsOutSize = 3 | 4 | 5

export interface LightsOutPuzzle {
  readonly size: LightsOutSize
  readonly seed: number
  readonly board: readonly boolean[]
  readonly initialBoard: readonly boolean[]
  readonly moves: number
}

interface BoardMove {
  board: readonly boolean[]
  size: LightsOutSize
  index: number
}

export function toggleLightsOutCells({
  board,
  size,
  index,
}: BoardMove): boolean[] {
  const row = Math.floor(index / size)
  const column = index % size
  return board.map((lit, cell) => {
    const distance =
      Math.abs(Math.floor(cell / size) - row) + Math.abs((cell % size) - column)
    return distance <= 1 ? !lit : lit
  })
}

export function isLightsOutSolved(board: readonly boolean[]): boolean {
  return board.every(lit => !lit)
}

export function createLightsOut(
  size: LightsOutSize = 4,
  seed = 1,
): LightsOutPuzzle {
  let randomState = Math.abs(Math.floor(seed)) % 4294967296
  let board = Array<boolean>(size * size).fill(false)
  for (let index = 0; index < board.length; index += 1) {
    randomState = (randomState * 1664525 + 1013904223) % 4294967296
    if (randomState / 4294967296 > 0.5) {
      board = toggleLightsOutCells({ board, size, index })
    }
  }
  if (isLightsOutSolved(board)) {
    board = toggleLightsOutCells({
      board,
      size,
      index: Math.floor(board.length / 2),
    })
  }
  return { size, seed, board, initialBoard: board, moves: 0 }
}

export function pressLightsOut(
  puzzle: LightsOutPuzzle,
  index: number,
): LightsOutPuzzle {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= puzzle.board.length ||
    isLightsOutSolved(puzzle.board)
  ) {
    return puzzle
  }
  return {
    ...puzzle,
    board: toggleLightsOutCells({
      board: puzzle.board,
      size: puzzle.size,
      index,
    }),
    moves: puzzle.moves + 1,
  }
}

export function resetLightsOut(puzzle: LightsOutPuzzle): LightsOutPuzzle {
  return { ...puzzle, board: puzzle.initialBoard, moves: 0 }
}

export function solveLightsOut({
  board,
  size,
}: Pick<LightsOutPuzzle, 'board' | 'size'>): number[] | null {
  let shortest: number[] | null = null
  for (let firstRow = 0; firstRow < 2 ** size; firstRow += 1) {
    let candidate = [...board]
    const presses: number[] = []
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const index = row * size + column
        const shouldPress =
          row === 0
            ? Math.floor(firstRow / 2 ** column) % 2 === 1
            : candidate[index - size]
        if (shouldPress) {
          candidate = toggleLightsOutCells({ board: candidate, size, index })
          presses.push(index)
        }
      }
    }
    if (
      isLightsOutSolved(candidate) &&
      (shortest === null || presses.length < shortest.length)
    ) {
      shortest = presses
    }
  }
  return shortest
}
