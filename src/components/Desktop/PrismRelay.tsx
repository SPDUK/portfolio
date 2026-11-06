import React, { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, Lightbulb, RotateCcw } from 'lucide-react'
import {
  describeBeam,
  describePort,
  getPrismHint,
  initialMirrors,
  portPoint,
  prismPuzzles,
  rotateMirror,
  traceBeam,
} from './prismRelayLogic'
import type { BenchEdge, MirrorOrientation } from './prismRelayLogic'
import './prism-relay.css'

const sourceAngles: Record<BenchEdge, number> = {
  left: 0,
  top: 90,
  right: 180,
  bottom: 270,
}

export default function PrismRelay({
  active,
  motion,
}: {
  active: boolean
  motion: boolean
}) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = prismPuzzles[puzzleIndex]
  const [orientations, setOrientations] = useState<
    readonly MirrorOrientation[]
  >(() => initialMirrors(puzzle))
  const [turns, setTurns] = useState(0)
  const [hint, setHint] = useState<number | null>(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const mirrors = useRef<(HTMLButtonElement | null)[]>([])
  const focusAfterChange = useRef(false)
  const instructionsId = useId()
  const trace = traceBeam(puzzle, orientations)
  const solved = trace.kind === 'connected'
  const source = portPoint(puzzle.source.port, puzzle.size)
  const receiver = portPoint(puzzle.receiver, puzzle.size)
  const path = trace.points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ')
  const markedMirror = hint === null ? null : puzzle.mirrors[hint]

  useEffect(() => {
    if (!focusAfterChange.current) return
    focusAfterChange.current = false
    mirrors.current[0]?.focus()
  }, [puzzleIndex])

  const moveFocus = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!active) return
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation()
      return
    }
    const current = puzzle.mirrors[index].cell
    let next = index
    if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = puzzle.mirrors.length - 1
    else {
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
      const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown'
      if (!horizontal && !vertical) return
      const sign = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1
      let nearest = Infinity
      puzzle.mirrors.forEach((mirror, candidate) => {
        const along = horizontal
          ? mirror.cell.x - current.x
          : mirror.cell.y - current.y
        const across = horizontal
          ? mirror.cell.y - current.y
          : mirror.cell.x - current.x
        const distance = Math.abs(across) * puzzle.size + Math.abs(along)
        if (along * sign > 0 && distance < nearest) {
          nearest = distance
          next = candidate
        }
      })
    }
    event.preventDefault()
    event.stopPropagation()
    setFocusIndex(next)
    mirrors.current[next]?.focus()
  }

  const reset = () => {
    setOrientations(initialMirrors(puzzle))
    setTurns(0)
    setHint(null)
  }

  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % prismPuzzles.length
    focusAfterChange.current = true
    setPuzzleIndex(next)
    setOrientations(initialMirrors(prismPuzzles[next]))
    setTurns(0)
    setHint(null)
    setFocusIndex(0)
  }

  return (
    <section className="os-play-toy os-prism" aria-label="Prism Relay">
      <header className="os-play-header">
        <h2>Prism Relay</h2>
        <p id={instructionsId}>
          Turn the mirrors. Carry the light from source to receiver.
        </p>
      </header>

      <div className="os-prism-puzzle">
        <div>
          <h3>
            <span
              aria-label={`Puzzle ${puzzleIndex + 1} of ${prismPuzzles.length}`}
            >
              {puzzleIndex + 1} / {prismPuzzles.length}
            </span>
            {puzzle.title}
          </h3>
          <p>{puzzle.description}</p>
        </div>
        <dl>
          <dt>Turns</dt>
          <dd>{turns}</dd>
        </dl>
      </div>

      <div className="os-prism-bench" data-solved={solved}>
        <div className="os-prism-field">
          <svg
            className="os-prism-optics"
            viewBox="-1 -1 6 6"
            role="img"
            aria-label={`Optical bench. Source on the ${describePort(puzzle.source.port)}. Receiver on the ${describePort(puzzle.receiver)}. ${describeBeam(trace)}`}
          >
            <desc>
              {puzzle.blockers
                .map(
                  cell => `Blocker at row ${cell.y + 1}, column ${cell.x + 1}.`,
                )
                .join(' ')}
            </desc>
            <rect
              className="os-prism-boundary"
              x="-0.5"
              y="-0.5"
              width="5"
              height="5"
            />
            {Array.from({ length: puzzle.size * puzzle.size }, (_, index) => (
              <circle
                key={`point-${index}`}
                className="os-prism-point"
                cx={index % puzzle.size}
                cy={Math.floor(index / puzzle.size)}
                r="0.018"
              />
            ))}
            {puzzle.blockers.map(cell => (
              <g
                key={`${puzzle.id}-${cell.x}-${cell.y}`}
                className="os-prism-blocker"
                transform={`translate(${cell.x},${cell.y})`}
              >
                <rect x="-0.15" y="-0.15" width="0.3" height="0.3" rx="0.025" />
                <path d="M-0.08,-0.08 L0.08,0.08 M0.08,-0.08 L-0.08,0.08" />
              </g>
            ))}
            <path
              key={`${puzzle.id}-${turns}-under`}
              className="os-prism-beam-under"
              data-reveal={active && motion}
              pathLength="1"
              d={path}
            />
            <path
              key={`${puzzle.id}-${turns}`}
              className="os-prism-beam"
              data-reveal={active && motion}
              pathLength="1"
              d={path}
            />
            <g
              className="os-prism-source"
              transform={`translate(${source.x},${source.y}) rotate(${sourceAngles[puzzle.source.port.edge]})`}
            >
              <path d="M-0.34,0 H-0.07 M-0.17,-0.1 L-0.07,0 L-0.17,0.1" />
            </g>
            <g
              className="os-prism-receiver"
              transform={`translate(${receiver.x},${receiver.y})`}
            >
              <circle r="0.15" />
              <circle className="os-prism-receiver-core" r="0.055" />
              {solved && (
                <circle className="os-prism-receiver-connected" r="0.24" />
              )}
            </g>
          </svg>

          <div
            className="os-prism-mirrors"
            role="group"
            aria-label="Turnable mirrors"
            aria-describedby={instructionsId}
          >
            {puzzle.mirrors.map((mirror, index) => {
              const orientation = orientations[index]
              const lit = trace.litMirrors.includes(index)
              return (
                <button
                  key={`${puzzle.id}-${mirror.id}`}
                  ref={element => {
                    mirrors.current[index] = element
                  }}
                  type="button"
                  className="os-prism-mirror"
                  style={{
                    left: `${((mirror.cell.x + 1) / 6) * 100}%`,
                    top: `${((mirror.cell.y + 1) / 6) * 100}%`,
                  }}
                  aria-label={`Mirror ${mirror.id}, row ${mirror.cell.y + 1}, column ${mirror.cell.x + 1}, ${orientation === 'slash' ? 'slash' : 'backslash'}${hint === index ? ', suggested mirror' : ''}. Turn to ${orientation === 'slash' ? 'backslash' : 'slash'}.`}
                  aria-disabled={solved}
                  disabled={!active}
                  data-orientation={orientation}
                  data-hint={hint === index}
                  data-lit={lit}
                  tabIndex={focusIndex === index ? 0 : -1}
                  onFocus={() => setFocusIndex(index)}
                  onKeyDown={event => moveFocus(event, index)}
                  onClick={() => {
                    if (!active || solved) return
                    setOrientations(current => rotateMirror(current, index))
                    setTurns(current => current + 1)
                    setHint(null)
                  }}
                >
                  <span className="os-prism-mirror-number" aria-hidden="true">
                    {mirror.id}
                  </span>
                  <svg viewBox="0 0 40 40" aria-hidden="true">
                    <path
                      d={
                        orientation === 'slash'
                          ? 'M10,30 L30,10'
                          : 'M10,10 L30,30'
                      }
                    />
                  </svg>
                </button>
              )
            })}
          </div>
        </div>
        <div className="os-prism-ports">
          <span>
            Source <strong>{describePort(puzzle.source.port)}</strong>
          </span>
          <span>
            Receiver <strong>{describePort(puzzle.receiver)}</strong>
          </span>
        </div>
      </div>

      <p className="os-prism-status" role="status" aria-atomic="true">
        {solved ? (
          <>
            <strong>Receiver connected.</strong> Solved in {turns}{' '}
            {turns === 1 ? 'turn' : 'turns'}.
          </>
        ) : (
          describeBeam(trace)
        )}
        {markedMirror && (
          <>
            {' '}
            Try <strong>mirror {markedMirror.id}</strong>, row{' '}
            {markedMirror.cell.y + 1}, column {markedMirror.cell.x + 1}. The
            marked mirror needs a turn.
          </>
        )}
      </p>

      <div className="os-play-actions os-prism-actions">
        {solved && (
          <button
            type="button"
            className="os-play-primary"
            disabled={!active}
            onClick={nextPuzzle}
          >
            {puzzleIndex === prismPuzzles.length - 1
              ? 'Play again'
              : 'Next puzzle'}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
        <button type="button" disabled={!active || turns === 0} onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" />
          Reset
        </button>
        <button
          type="button"
          disabled={!active || solved}
          onClick={() => setHint(getPrismHint(puzzle, orientations))}
        >
          <Lightbulb size={15} aria-hidden="true" />
          Show hint
        </button>
      </div>
      <p className="os-play-note">
        Tap a mirror to turn it. Arrow keys move between mirrors; Space or Enter
        turns.
      </p>
    </section>
  )
}
