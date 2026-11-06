export type MirrorOrientation = 'slash' | 'backslash'
export type BeamDirection = 'up' | 'right' | 'down' | 'left'
export type BenchEdge = 'top' | 'right' | 'bottom' | 'left'

export interface BenchCell {
  readonly x: number
  readonly y: number
}

export interface EdgePort {
  readonly edge: BenchEdge
  readonly index: number
}

interface EdgeSource {
  readonly kind: 'edge'
  readonly port: EdgePort
}

interface CellSource {
  readonly kind: 'cell'
  readonly cell: BenchCell
  readonly direction: BeamDirection
}

export interface PrismMirror {
  readonly id: number
  readonly cell: BenchCell
  readonly initial: MirrorOrientation
}

export interface OpticalBench {
  readonly size: number
  readonly source: EdgeSource | CellSource
  readonly receiver: EdgePort
  readonly mirrors: readonly PrismMirror[]
  readonly blockers: readonly BenchCell[]
}

export interface PrismPuzzle extends OpticalBench {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly source: EdgeSource
  readonly solution: readonly MirrorOrientation[]
}

interface BeamPath {
  readonly points: readonly BenchCell[]
  readonly litMirrors: readonly number[]
}

export type BeamTrace = BeamPath &
  (
    | { readonly kind: 'connected'; readonly exit: EdgePort }
    | { readonly kind: 'escaped'; readonly exit: EdgePort }
    | { readonly kind: 'blocked'; readonly cell: BenchCell }
    | { readonly kind: 'loop'; readonly cell: BenchCell }
  )

export const prismPuzzles: readonly PrismPuzzle[] = [
  {
    id: 'first-light',
    title: 'First light',
    description: 'Two turns. One continuous line.',
    size: 5,
    source: { kind: 'edge', port: { edge: 'left', index: 2 } },
    receiver: { edge: 'right', index: 0 },
    mirrors: [
      { id: 1, cell: { x: 1, y: 2 }, initial: 'backslash' },
      { id: 2, cell: { x: 1, y: 0 }, initial: 'backslash' },
    ],
    blockers: [{ x: 3, y: 3 }],
    solution: ['slash', 'slash'],
  },
  {
    id: 'cross-current',
    title: 'Cross current',
    description: 'Let the light cross its own path.',
    size: 5,
    source: { kind: 'edge', port: { edge: 'bottom', index: 1 } },
    receiver: { edge: 'top', index: 2 },
    mirrors: [
      { id: 1, cell: { x: 1, y: 3 }, initial: 'backslash' },
      { id: 2, cell: { x: 4, y: 3 }, initial: 'slash' },
      { id: 3, cell: { x: 4, y: 4 }, initial: 'slash' },
      { id: 4, cell: { x: 2, y: 4 }, initial: 'slash' },
    ],
    blockers: [
      { x: 0, y: 1 },
      { x: 3, y: 1 },
    ],
    solution: ['slash', 'backslash', 'slash', 'backslash'],
  },
  {
    id: 'long-way-home',
    title: 'The long way home',
    description: 'Six mirrors. Follow every reflection.',
    size: 5,
    source: { kind: 'edge', port: { edge: 'left', index: 4 } },
    receiver: { edge: 'right', index: 0 },
    mirrors: [
      { id: 1, cell: { x: 0, y: 4 }, initial: 'backslash' },
      { id: 2, cell: { x: 0, y: 1 }, initial: 'slash' },
      { id: 3, cell: { x: 3, y: 1 }, initial: 'slash' },
      { id: 4, cell: { x: 3, y: 3 }, initial: 'backslash' },
      { id: 5, cell: { x: 1, y: 3 }, initial: 'slash' },
      { id: 6, cell: { x: 1, y: 0 }, initial: 'backslash' },
    ],
    blockers: [
      { x: 4, y: 2 },
      { x: 2, y: 4 },
      { x: 2, y: 2 },
    ],
    solution: ['slash', 'slash', 'backslash', 'slash', 'backslash', 'slash'],
  },
]

const vectors: Record<BeamDirection, BenchCell> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

const reflections: Record<
  MirrorOrientation,
  Record<BeamDirection, BeamDirection>
> = {
  slash: { up: 'right', right: 'up', down: 'left', left: 'down' },
  backslash: { up: 'left', right: 'down', down: 'right', left: 'up' },
}

export function reflectBeam(
  direction: BeamDirection,
  orientation: MirrorOrientation,
): BeamDirection {
  return reflections[orientation][direction]
}

export function portPoint(port: EdgePort, size: number): BenchCell {
  switch (port.edge) {
    case 'top':
      return { x: port.index, y: -0.5 }
    case 'right':
      return { x: size - 0.5, y: port.index }
    case 'bottom':
      return { x: port.index, y: size - 0.5 }
    case 'left':
      return { x: -0.5, y: port.index }
    default: {
      const exhaustive: never = port.edge
      return exhaustive
    }
  }
}

function edgeEntry(port: EdgePort, size: number) {
  switch (port.edge) {
    case 'top':
      return { cell: { x: port.index, y: 0 }, direction: 'down' } satisfies {
        cell: BenchCell
        direction: BeamDirection
      }
    case 'right':
      return {
        cell: { x: size - 1, y: port.index },
        direction: 'left',
      } satisfies {
        cell: BenchCell
        direction: BeamDirection
      }
    case 'bottom':
      return {
        cell: { x: port.index, y: size - 1 },
        direction: 'up',
      } satisfies {
        cell: BenchCell
        direction: BeamDirection
      }
    case 'left':
      return { cell: { x: 0, y: port.index }, direction: 'right' } satisfies {
        cell: BenchCell
        direction: BeamDirection
      }
    default: {
      const exhaustive: never = port.edge
      return exhaustive
    }
  }
}

function exitPort(cell: BenchCell, size: number): EdgePort | null {
  if (cell.x < 0) return { edge: 'left', index: cell.y }
  if (cell.x >= size) return { edge: 'right', index: cell.y }
  if (cell.y < 0) return { edge: 'top', index: cell.x }
  if (cell.y >= size) return { edge: 'bottom', index: cell.x }
  return null
}

export function initialMirrors(puzzle: OpticalBench): MirrorOrientation[] {
  return puzzle.mirrors.map(mirror => mirror.initial)
}

export function rotateMirror(
  orientations: readonly MirrorOrientation[],
  index: number,
): readonly MirrorOrientation[] {
  if (!Number.isInteger(index) || index < 0 || index >= orientations.length)
    return orientations
  return orientations.map((orientation, mirror) => {
    if (mirror !== index) return orientation
    return orientation === 'slash' ? 'backslash' : 'slash'
  })
}

export function traceBeam(
  bench: OpticalBench,
  orientations: readonly MirrorOrientation[] = initialMirrors(bench),
): BeamTrace {
  const points: BenchCell[] = []
  const litMirrors = new Set<number>()
  const visited = new Set<string>()
  const entry =
    bench.source.kind === 'edge'
      ? edgeEntry(bench.source.port, bench.size)
      : bench.source
  let { cell, direction } = entry
  if (bench.source.kind === 'edge')
    points.push(portPoint(bench.source.port, bench.size))

  // Four incoming directions per cell bound every possible ray state.
  const bound = bench.size * bench.size * 4
  for (let step = 0; step <= bound; step += 1) {
    const point = cell
    points.push(point)
    const state = `${point.x},${point.y},${direction}`
    if (visited.has(state))
      return { kind: 'loop', cell, points, litMirrors: [...litMirrors] }
    visited.add(state)
    if (
      bench.blockers.some(
        blocker => blocker.x === point.x && blocker.y === point.y,
      )
    )
      return { kind: 'blocked', cell, points, litMirrors: [...litMirrors] }

    const mirror = bench.mirrors.findIndex(
      item => item.cell.x === point.x && item.cell.y === point.y,
    )
    if (mirror !== -1) {
      litMirrors.add(mirror)
      direction = reflectBeam(
        direction,
        orientations[mirror] ?? bench.mirrors[mirror].initial,
      )
    }
    const vector = vectors[direction]
    cell = { x: cell.x + vector.x, y: cell.y + vector.y }
    const exit = exitPort(cell, bench.size)
    if (exit) {
      points.push(portPoint(exit, bench.size))
      return {
        kind:
          exit.edge === bench.receiver.edge &&
          exit.index === bench.receiver.index
            ? 'connected'
            : 'escaped',
        exit,
        points,
        litMirrors: [...litMirrors],
      }
    }
  }
  return { kind: 'loop', cell, points, litMirrors: [...litMirrors] }
}

export function getPrismHint(
  puzzle: PrismPuzzle,
  orientations: readonly MirrorOrientation[],
): number | null {
  if (traceBeam(puzzle, orientations).kind === 'connected') return null
  const index = puzzle.solution.findIndex(
    (orientation, mirror) => orientation !== orientations[mirror],
  )
  return index === -1 ? null : index
}

export function describePort(port: EdgePort): string {
  const coordinate =
    port.edge === 'left' || port.edge === 'right' ? 'row' : 'column'
  return `${port.edge} edge, ${coordinate} ${port.index + 1}`
}

export function describeBeam(trace: BeamTrace): string {
  switch (trace.kind) {
    case 'connected':
      return 'Receiver connected. A clear path, all the way through.'
    case 'escaped':
      return `Beam escaped through the ${describePort(trace.exit)}.`
    case 'blocked':
      return `Beam stopped at the blocker in row ${trace.cell.y + 1}, column ${trace.cell.x + 1}.`
    case 'loop':
      return `Beam loops through row ${trace.cell.y + 1}, column ${trace.cell.x + 1}. Turn a mirror to open the path.`
    default: {
      const exhaustive: never = trace
      return exhaustive
    }
  }
}
