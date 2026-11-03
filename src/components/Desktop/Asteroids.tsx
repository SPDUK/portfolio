import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createAsteroids, SPACE, stepAsteroids } from './asteroidsLogic'
import type { AsteroidsInput, AsteroidsState } from './asteroidsLogic'
import { drawAsteroids } from './asteroidsRenderer'
import './asteroids.css'

interface AsteroidsProps {
  active: boolean
  sound: boolean
  motion: boolean
}
type Action = keyof AsteroidsInput
type Hud = Pick<AsteroidsState, 'status' | 'score' | 'lives' | 'wave'> & {
  best: number
}
const keyActions: Record<string, Action | undefined> = {
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ArrowUp: 'thrust',
  w: 'thrust',
  j: 'fire',
  x: 'fire',
}
const controls: { action: Action; label: string }[] = [
  { action: 'left', label: 'Rotate left' },
  { action: 'thrust', label: 'Thrust' },
  { action: 'right', label: 'Rotate right' },
  { action: 'fire', label: 'Fire' },
]
const storageKey = 'spdev-arcade-asteroids'

function ControlIcon({ action }: { action: Action }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {action === 'thrust' && <path d="m12 3 7 16-7-4-7 4 7-16Zm0 12v6" />}
      {action === 'left' && <path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" />}
      {action === 'right' && <path d="M20 10a8 8 0 1 0-2 8m2-14v6h-6" />}
      {action === 'fire' && (
        <>
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
        </>
      )}
    </svg>
  )
}

export function Asteroids({ active, sound, motion }: AsteroidsProps) {
  const [initialState] = useState(createAsteroids)
  const simulation = useRef(initialState)
  const [hud, setHud] = useState<Hud>({
    status: 'ready',
    score: 0,
    lives: 3,
    wave: 1,
    best: 0,
  })
  const displayed = useRef(hud)
  const canvas = useRef<HTMLCanvasElement>(null)
  const keyboard = useRef(new Set<string>())
  const pointers = useRef(
    new Map<number, { action: Action; element: HTMLButtonElement }>(),
  )
  const impulses = useRef<Partial<Record<Action, number>>>({})
  const audio = useRef<AudioContext | null>(null)

  const clearInput = useCallback(() => {
    keyboard.current.clear()
    impulses.current = {}
    const captured = [...pointers.current.entries()]
    pointers.current.clear()
    captured.forEach(([id, { element }]) => {
      if (element.hasPointerCapture(id)) element.releasePointerCapture(id)
    })
  }, [])
  const publish = useCallback(() => {
    const state = simulation.current
    const previous = displayed.current
    const best = Math.max(previous.best, state.score)
    if (best > previous.best) {
      try {
        localStorage.setItem(storageKey, String(best))
      } catch {
        /* Runs still work when browser storage is unavailable. */
      }
    }
    if (
      state.status !== previous.status ||
      state.score !== previous.score ||
      state.lives !== previous.lives ||
      state.wave !== previous.wave ||
      best !== previous.best
    ) {
      displayed.current = {
        status: state.status,
        score: state.score,
        lives: state.lives,
        wave: state.wave,
        best,
      }
      setHud(displayed.current)
    }
  }, [])
  const draw = useCallback(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    const thrust =
      simulation.current.status === 'running' &&
      (keyboard.current.has('ArrowUp') ||
        keyboard.current.has('w') ||
        [...pointers.current.values()].some(
          pointer => pointer.action === 'thrust',
        ) ||
        (impulses.current.thrust ?? 0) > 0)
    drawAsteroids(context, simulation.current, { motion, thrust })
  }, [motion])
  const pause = useCallback(() => {
    clearInput()
    if (simulation.current.status === 'running') {
      simulation.current = { ...simulation.current, status: 'paused' }
      publish()
    }
  }, [clearInput, publish])

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey))
      if (Number.isFinite(saved) && saved > 0) {
        displayed.current = { ...displayed.current, best: Math.floor(saved) }
        setHud(displayed.current)
      }
    } catch {
      /* Runs still work when browser storage is unavailable. */
    }
    return () => {
      clearInput()
      audio.current?.close()
    }
  }, [clearInput])
  useEffect(() => {
    if (!active) pause()
  }, [active, pause])
  useEffect(() => {
    const hide = () => {
      if (document.hidden) pause()
    }
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', hide)
    return () => {
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [pause])
  useEffect(() => {
    draw()
    if (hud.status !== 'running' || !active) return undefined
    let frame = 0
    let last = 0
    let accumulator = 0
    const tick = (now: number) => {
      accumulator += last === 0 ? 0 : Math.min(now - last, 100)
      last = now
      const previousScore = simulation.current.score
      while (
        accumulator >= 1000 / 120 &&
        simulation.current.status === 'running'
      ) {
        const input: AsteroidsInput = {
          left: false,
          right: false,
          thrust: false,
          fire: false,
        }
        keyboard.current.forEach(key => {
          const action = keyActions[key]
          if (action) input[action] = true
        })
        pointers.current.forEach(({ action }) => {
          input[action] = true
        })
        controls.forEach(({ action }) => {
          const remaining = impulses.current[action] ?? 0
          if (remaining > 0) input[action] = true
          impulses.current[action] = Math.max(0, remaining - 1 / 120)
        })
        simulation.current = stepAsteroids(simulation.current, input, 1 / 120)
        accumulator -= 1000 / 120
      }
      if (sound && audio.current && simulation.current.score > previousScore) {
        const context = audio.current
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.frequency.setValueAtTime(260, context.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(
          90,
          context.currentTime + 0.09,
        )
        gain.gain.setValueAtTime(0.025, context.currentTime)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + 0.09,
        )
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start()
        oscillator.stop(context.currentTime + 0.09)
        oscillator.onended = () => {
          oscillator.disconnect()
          gain.disconnect()
        }
      }
      publish()
      draw()
      if (simulation.current.status === 'running')
        frame = requestAnimationFrame(tick)
      else clearInput()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [hud.status, active, sound, draw, publish, clearInput])

  const start = (restart = false) => {
    if (!active) return
    clearInput()
    if (restart || simulation.current.status === 'lost')
      simulation.current = createAsteroids()
    simulation.current = { ...simulation.current, status: 'running' }
    if (sound && !audio.current) {
      try {
        audio.current = new AudioContext()
      } catch {
        audio.current = null
      }
    }
    audio.current?.resume().catch(() => undefined)
    publish()
    canvas.current?.focus({ preventScroll: true })
  }
  const statusText = {
    ready: 'Asteroids ready. Three lives. Start flight to play.',
    running: `Wave ${hud.wave}. ${hud.lives} ${hud.lives === 1 ? 'life' : 'lives'} remaining.`,
    paused: 'Flight paused. Resume when you are ready.',
    lost: `Flight ended. Final score ${hud.score}.`,
  }[hud.status]
  const titles = {
    ready: 'ASTEROIDS',
    running: '',
    paused: 'HOLD POSITION',
    lost: 'SIGNAL LOST',
  }
  const descriptions = {
    ready: 'Build momentum. Release thrust to drift.',
    running: '',
    paused: 'Your orbit can wait.',
    lost: `Final score ${String(hud.score).padStart(4, '0')}. Take another flight.`,
  }
  const actions = {
    ready: 'Start flight',
    running: 'Pause',
    paused: 'Resume flight',
    lost: 'Fly again',
  }

  return (
    <section
      className="os-arcade-game os-asteroids"
      aria-label="Asteroids"
      onBlur={event => {
        if (event.target === canvas.current) keyboard.current.clear()
        if (!event.currentTarget.contains(event.relatedTarget)) pause()
      }}
    >
      <div className="os-arcade-scores os-asteroids-scores">
        <span>
          SCORE <strong>{String(hud.score).padStart(4, '0')}</strong>
        </span>
        <span>
          BEST <strong>{String(hud.best).padStart(4, '0')}</strong>
        </span>
        <span>
          WAVE <strong>{String(hud.wave).padStart(2, '0')}</strong>
        </span>
        <span>
          LIVES <strong>{hud.lives}</strong>
        </span>
      </div>
      <div className="os-arcade-board os-asteroids-board">
        <canvas
          ref={canvas}
          width={SPACE.width}
          height={SPACE.height}
          tabIndex={0}
          aria-label="Asteroids playfield. Left and right arrows or A and D rotate. Up arrow or W thrusts. J or X fires. Space pauses. Enter starts or resumes."
          onKeyUp={event =>
            keyboard.current.delete(
              event.key.length === 1 ? event.key.toLowerCase() : event.key,
            )
          }
          onKeyDown={event => {
            const key =
              event.key.length === 1 ? event.key.toLowerCase() : event.key
            if (keyActions[key]) {
              event.preventDefault()
              if (simulation.current.status === 'running')
                keyboard.current.add(key)
            }
            if (event.code === 'Space' || event.code === 'Enter') {
              event.preventDefault()
              if (!event.repeat) {
                if (simulation.current.status === 'running') {
                  if (event.code === 'Space') pause()
                } else start()
              }
            }
          }}
        >
          Pilot a white ship through a wrapping starfield. Shoot red asteroids
          to split them, clear each wave, and survive with three lives. The ship
          keeps drifting after thrust is released.
        </canvas>
        {hud.status !== 'running' && (
          <div
            className={`os-arcade-overlay os-asteroids-overlay ${hud.status === 'ready' ? 'is-ready' : ''}`}
          >
            <h2>{titles[hud.status]}</h2>
            <p>{descriptions[hud.status]}</p>
            <button
              type="button"
              className="os-arcade-play"
              onClick={() => start()}
            >
              {actions[hud.status]}{' '}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 18 18 6M6 6h12v12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="os-arcade-footer os-asteroids-footer">
        <p>
          Split the rocks. Clear the orbit. <span>The edges wrap.</span>
        </p>
        {(hud.status === 'running' || hud.status === 'paused') && (
          <div>
            {hud.status === 'running' && (
              <button type="button" onClick={pause}>
                Pause
              </button>
            )}
            <button type="button" onClick={() => start(true)}>
              Restart
            </button>
          </div>
        )}
      </div>
      <div className="os-asteroids-instructions" id="asteroids-controls">
        <span>
          <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> rotate
        </span>
        <span>
          <kbd>↑</kbd> / <kbd>W</kbd> thrust
        </span>
        <span>
          <kbd>J</kbd> / <kbd>X</kbd> fire
        </span>
        <span>
          <kbd>SPACE</kbd> pause
        </span>
        <span>
          <kbd>ENTER</kbd> start / resume
        </span>
      </div>
      <div
        className="os-arcade-touch os-asteroids-touch"
        aria-label="Flight controls"
      >
        {controls.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            aria-label={label}
            disabled={hud.status !== 'running'}
            onPointerDown={event => {
              if (simulation.current.status !== 'running') return
              event.currentTarget.setPointerCapture(event.pointerId)
              pointers.current.set(event.pointerId, {
                action,
                element: event.currentTarget,
              })
              impulses.current[action] = action === 'fire' ? 1 / 120 : 0.15
            }}
            onPointerUp={event => pointers.current.delete(event.pointerId)}
            onPointerCancel={event => pointers.current.delete(event.pointerId)}
            onLostPointerCapture={event =>
              pointers.current.delete(event.pointerId)
            }
            onClick={event => {
              if (event.detail === 0 && simulation.current.status === 'running')
                impulses.current[action] = action === 'fire' ? 1 / 120 : 0.15
            }}
          >
            <ControlIcon action={action} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <span
        className="os-asteroids-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </span>
    </section>
  )
}
