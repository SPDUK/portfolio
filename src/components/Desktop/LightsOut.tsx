import React, { useId, useRef, useState } from 'react'
import { Lightbulb, RotateCcw, Shuffle } from 'lucide-react'
import {
  createLightsOut,
  isLightsOutSolved,
  pressLightsOut,
  resetLightsOut,
  solveLightsOut,
} from './lightsOutLogic'
import type { LightsOutSize } from './lightsOutLogic'
import './lights-out.css'

const sizes: readonly LightsOutSize[] = [3, 4, 5]

export default function LightsOut({ active }: { active: boolean }) {
  const [puzzle, setPuzzle] = useState(() => createLightsOut(4, 2468))
  const [hint, setHint] = useState<number | null>(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const instructionsId = useId()
  const solved = isLightsOutSolved(puzzle.board)
  const lightsOn = puzzle.board.filter(Boolean).length

  const moveFocus = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const row = Math.floor(index / puzzle.size)
    const column = index % puzzle.size
    let next = index
    switch (event.key) {
      case 'ArrowLeft':
        next = row * puzzle.size + Math.max(0, column - 1)
        break
      case 'ArrowRight':
        next = row * puzzle.size + Math.min(puzzle.size - 1, column + 1)
        break
      case 'ArrowUp':
        next = Math.max(0, row - 1) * puzzle.size + column
        break
      case 'ArrowDown':
        next = Math.min(puzzle.size - 1, row + 1) * puzzle.size + column
        break
      case 'Home':
        next = event.ctrlKey ? 0 : row * puzzle.size
        break
      case 'End':
        next = event.ctrlKey
          ? puzzle.board.length - 1
          : (row + 1) * puzzle.size - 1
        break
      case ' ':
      case 'Enter':
        event.stopPropagation()
        return
      default:
        return
    }
    event.preventDefault()
    event.stopPropagation()
    setFocusIndex(next)
    cells.current[next]?.focus()
  }

  const newBoard = (size = puzzle.size) => {
    setPuzzle(createLightsOut(size, puzzle.seed + 1))
    setHint(null)
    setFocusIndex(0)
  }

  return (
    <section className="os-play-toy os-lights" aria-label="Lights Out">
      <header className="os-play-header">
        <h2>Lights Out</h2>
        <p id={instructionsId}>
          Switch every light off. Each press flips its neighbors, too.
        </p>
      </header>

      <div className="os-lights-toolbar">
        <div className="os-lights-sizes" role="group" aria-label="Grid size">
          {sizes.map(size => (
            <button
              key={size}
              type="button"
              aria-label={`${size} by ${size} grid`}
              aria-pressed={puzzle.size === size}
              disabled={!active}
              onClick={() => {
                if (size !== puzzle.size) newBoard(size)
              }}
            >
              {size} × {size}
            </button>
          ))}
        </div>
        <dl className="os-lights-measures">
          <div>
            <dt>Moves</dt>
            <dd>{puzzle.moves}</dd>
          </div>
          <div>
            <dt>Lit</dt>
            <dd>{lightsOn}</dd>
          </div>
        </dl>
      </div>

      <div className="os-lights-stage" data-solved={solved}>
        <div
          className="os-lights-grid"
          role="group"
          aria-label={`${puzzle.size} by ${puzzle.size} light grid`}
          aria-describedby={instructionsId}
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}
        >
          {puzzle.board.map((lit, index) => (
            <button
              // The coordinate is the identity of a cell, across every move.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              ref={element => {
                cells.current[index] = element
              }}
              type="button"
              className="os-lights-cell"
              aria-label={`Row ${Math.floor(index / puzzle.size) + 1}, column ${(index % puzzle.size) + 1}, light ${lit ? 'on' : 'off'}${hint === index ? ', suggested move' : ''}`}
              aria-pressed={lit}
              aria-disabled={solved}
              disabled={!active}
              data-hint={hint === index}
              tabIndex={focusIndex === index ? 0 : -1}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={event => moveFocus(event, index)}
              onClick={() => {
                if (!active || solved) return
                setPuzzle(current => pressLightsOut(current, index))
                setHint(null)
              }}
            >
              <span className="os-lights-cell-mark" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <p className="os-lights-status" role="status" aria-atomic="true">
        {solved && (
          <>
            <strong>All lights out.</strong> Solved in {puzzle.moves}{' '}
            {puzzle.moves === 1 ? 'move' : 'moves'}.
          </>
        )}
        {!solved && hint !== null && (
          <>
            Try <strong>row {Math.floor(hint / puzzle.size) + 1}</strong>,{' '}
            <strong>column {(hint % puzzle.size) + 1}</strong>. Follow the
            marked tile.
          </>
        )}
        {!solved &&
          hint === null &&
          'Every board has a solution. Take your time.'}
      </p>

      <div className="os-play-actions os-lights-actions">
        <button
          type="button"
          className="os-play-primary"
          disabled={!active}
          onClick={() => newBoard()}
        >
          <Shuffle size={15} aria-hidden="true" />
          New board
        </button>
        <button
          type="button"
          disabled={!active || puzzle.moves === 0}
          onClick={() => {
            setPuzzle(resetLightsOut)
            setHint(null)
          }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset
        </button>
        <button
          type="button"
          disabled={!active || solved}
          onClick={() => {
            const next = solveLightsOut(puzzle)?.[0]
            if (next === undefined) return
            setHint(next)
          }}
        >
          <Lightbulb size={15} aria-hidden="true" />
          Show hint
        </button>
      </div>
      <p className="os-play-note">
        Tap a tile, or move with arrow keys and switch with Space.
      </p>
    </section>
  )
}
