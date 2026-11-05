import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  createBreakout,
  createSnake,
  FIELD,
  GRID,
  stepBreakout,
  stepSnake,
} from './gameLogic'
import type { Direction, GameStatus } from './gameLogic'
import { games } from './arcadeCatalog'
import type { GameId } from './arcadeCatalog'
import './arcade.css'
import { Asteroids } from './Asteroids'

export interface ArcadeProps {
  active: boolean
  sound?: boolean
  motion?: boolean
  initialGame?: GameId
  onGameChange?: (game: GameId) => void
}
const directions: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  ArrowDown: 'down',
  s: 'down',
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
}
const labels: Record<GameStatus, string> = {
  ready: 'Ready when you are.',
  running: 'Make your next move.',
  paused: 'Take a breath.',
  lost: 'One more run?',
  won: 'Perfectly executed.',
}

export function Arcade({
  active,
  sound = false,
  motion = true,
  initialGame = 'snake',
  onGameChange,
}: ArcadeProps) {
  const [game, setGame] = useState<GameId>(initialGame)
  useEffect(() => setGame(initialGame), [initialGame])

  return (
    <section className="os-arcade" aria-label="Arcade">
      <div className="os-arcade-toolbar">
        <div className="os-arcade-tabs" aria-label="Choose a game">
          {games.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={game === id}
              onClick={() => {
                setGame(id)
                onGameChange?.(id)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {game === 'asteroids' ? (
        <Asteroids active={active} sound={sound} motion={motion} />
      ) : (
        <ClassicArcade key={game} active={active} sound={sound} game={game} />
      )}
    </section>
  )
}

function ClassicArcade({
  active,
  sound,
  game,
}: {
  active: boolean
  sound: boolean
  game: Exclude<GameId, 'asteroids'>
}) {
  const [status, setStatus] = useState<GameStatus>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [best, setBest] = useState(0)
  const bestScore = useRef(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const root = useRef<HTMLElement>(null)
  const snake = useRef(createSnake())
  const breakout = useRef(createBreakout())
  const direction = useRef<Direction>('right')
  const keys = useRef(new Set<string>())
  const pointer = useRef<number | null>(null)
  const audio = useRef<AudioContext | null>(null)

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0c0c0f'
    ctx.fillRect(0, 0, 600, 400)
    ctx.strokeStyle = '#ffffff06'
    ctx.lineWidth = 1
    for (let x = 0; x <= 600; x += 25) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 400)
      ctx.stroke()
    }
    for (let y = 0; y <= 400; y += 25) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(600, y)
      ctx.stroke()
    }
    if (game === 'snake') {
      snake.current.body.forEach((segment, index) => {
        ctx.fillStyle =
          index === 0
            ? '#f1ece9'
            : `rgba(185,31,46,${Math.max(0.35, 1 - index * 0.025)})`
        ctx.fillRect(segment.x * 25 + 2, segment.y * 25 + 2, 21, 21)
      })
      const { food } = snake.current
      if (food) {
        ctx.fillStyle = '#ff5261'
        ctx.beginPath()
        ctx.arc(food.x * 25 + 12.5, food.y * 25 + 12.5, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ff526150'
        ctx.strokeRect(food.x * 25 + 2, food.y * 25 + 2, 21, 21)
      }
    } else {
      const state = breakout.current
      state.bricks.forEach((brick, index) => {
        if (!brick.alive) return
        ctx.fillStyle = ['#f1ece9', '#ff5261', '#d53444', '#a82332', '#6d202c'][
          Math.floor(index / 8)
        ]
        ctx.fillRect(brick.x, brick.y, FIELD.brickWidth, FIELD.brickHeight)
      })
      ctx.fillStyle = '#f1ece9'
      ctx.fillRect(
        state.paddle - FIELD.paddleWidth / 2,
        FIELD.paddleY,
        FIELD.paddleWidth,
        7,
      )
      ctx.fillStyle = '#ff5261'
      ctx.beginPath()
      ctx.arc(state.ball.x, state.ball.y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [game])

  const pause = useCallback(() => {
    keys.current.clear()
    pointer.current = null
    if (snake.current.status === 'running') snake.current.status = 'paused'
    if (breakout.current.status === 'running')
      breakout.current.status = 'paused'
    setStatus(previous => (previous === 'running' ? 'paused' : previous))
  }, [])

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
  useEffect(
    () => () => {
      audio.current?.close()
    },
    [],
  )
  useEffect(() => {
    snake.current = createSnake()
    breakout.current = createBreakout()
    direction.current = 'right'
    keys.current.clear()
    pointer.current = null
    setStatus('ready')
    setScore(0)
    setLives(3)
    try {
      const value = Number(localStorage.getItem(`spdev-arcade-${game}`))
      bestScore.current = Number.isFinite(value) && value >= 0 ? value : 0
      setBest(bestScore.current)
    } catch {
      bestScore.current = 0
      setBest(0)
    }
    draw()
  }, [game, draw])

  useEffect(() => {
    if (status !== 'running' || !active) {
      draw()
      return undefined
    }
    let frame = 0
    let last = 0
    let accumulator = 0
    const tick = (now: number) => {
      accumulator += last === 0 ? 0 : Math.min(now - last, 100)
      last = now
      const before =
        game === 'snake' ? snake.current.score : breakout.current.score
      if (game === 'snake') {
        const interval = Math.max(65, 140 - snake.current.score / 4)
        while (accumulator >= interval) {
          snake.current = stepSnake(snake.current, direction.current)
          direction.current = snake.current.direction
          accumulator -= interval
        }
      } else {
        while (accumulator >= 1000 / 120) {
          const move =
            (keys.current.has('right') ? 1 : 0) -
            (keys.current.has('left') ? 1 : 0)
          const target =
            pointer.current ?? breakout.current.paddle + (move * 430) / 120
          breakout.current = stepBreakout(breakout.current, 1 / 120, target)
          accumulator -= 1000 / 120
        }
      }
      const current = game === 'snake' ? snake.current : breakout.current
      if (current.score !== before) {
        setScore(current.score)
        if (current.score > bestScore.current) {
          bestScore.current = current.score
          setBest(current.score)
          try {
            localStorage.setItem(`spdev-arcade-${game}`, String(current.score))
          } catch {
            /* Private browsing may disable storage. */
          }
        }
        if (sound && audio.current) {
          const osc = audio.current.createOscillator()
          const gain = audio.current.createGain()
          osc.type = 'sine'
          osc.frequency.value = game === 'snake' ? 640 : 400
          gain.gain.setValueAtTime(0.035, audio.current.currentTime)
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.current.currentTime + 0.08,
          )
          osc.connect(gain)
          gain.connect(audio.current.destination)
          osc.start()
          osc.stop(audio.current.currentTime + 0.08)
        }
      }
      draw()
      if (current.status !== 'running') {
        setStatus(current.status)
        setLives(breakout.current.lives)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status, active, game, sound, draw])

  const start = (restart = false) => {
    if (!active) return
    keys.current.clear()
    if (restart || status === 'lost' || status === 'won') {
      snake.current = createSnake()
      breakout.current = createBreakout()
      direction.current = 'right'
      pointer.current = null
      setScore(0)
      setLives(3)
    }
    if (sound && !audio.current) {
      try {
        audio.current = new AudioContext()
      } catch {
        audio.current = null
      }
    }
    audio.current?.resume().catch(() => undefined)
    if (game === 'snake') snake.current.status = 'running'
    else breakout.current.status = 'running'
    setStatus('running')
    canvas.current?.focus()
  }
  const steer = (next: Direction) => {
    if (game === 'snake') direction.current = next
    else {
      pointer.current = null
      keys.current.add(next)
    }
  }
  const keyDown = (event: React.KeyboardEvent) => {
    if (
      event.target instanceof HTMLButtonElement ||
      event.target instanceof HTMLInputElement
    )
      return
    const next = directions[event.key]
    if (next) {
      event.preventDefault()
      steer(next)
    }
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()
      if (!event.repeat) {
        if (status === 'running') pause()
        else start()
      }
    }
  }

  const title = status === 'ready' ? game.toUpperCase() : labels[status]
  const introductions = {
    snake: 'Collect. Grow. Keep moving.',
    breakout: 'Find the angle. Break the pattern.',
  }
  const descriptions = {
    ready: introductions[game],
    running: '',
    paused: 'Your run is waiting for you.',
    lost: `Final score ${score}.`,
    won: `Final score ${score}.`,
  }
  const actions = {
    ready: 'Start game',
    running: 'Pause',
    paused: 'Resume game',
    lost: 'Play again',
    won: 'Play again',
  }

  return (
    <section
      className="os-arcade-game"
      ref={root}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) pause()
      }}
      aria-label={game === 'snake' ? 'Snake' : 'Breakout'}
    >
      <div className="os-arcade-scores" aria-live="polite" aria-atomic="true">
        <span>
          SCORE <strong>{String(score).padStart(4, '0')}</strong>
        </span>
        <span>
          BEST <strong>{String(best).padStart(4, '0')}</strong>
        </span>
        {game === 'breakout' && (
          <span>
            LIVES <strong>{lives}</strong>
          </span>
        )}
      </div>
      <div className="os-arcade-board">
        <canvas
          ref={canvas}
          width={600}
          height={400}
          tabIndex={0}
          onKeyDown={keyDown}
          onKeyUp={event => {
            const next = directions[event.key]
            if (next) keys.current.delete(next)
          }}
          aria-label={`${game === 'snake' ? 'Snake' : 'Breakout'} playfield. ${game === 'snake' ? 'Arrow keys or WASD to steer.' : 'Left and right arrow keys to move the paddle.'} Space to pause.`}
          onPointerMove={event => {
            if (game !== 'breakout' || status !== 'running') return
            const bounds = event.currentTarget.getBoundingClientRect()
            const fieldWidth = Math.min(bounds.width, bounds.height * 1.5)
            const fieldLeft = bounds.left + (bounds.width - fieldWidth) / 2
            pointer.current =
              ((event.clientX - fieldLeft) / fieldWidth) * FIELD.width
          }}
          onPointerDown={event => {
            if (game === 'breakout')
              event.currentTarget.setPointerCapture(event.pointerId)
          }}
        >
          {game === 'snake'
            ? `Snake uses a ${GRID.width} by ${GRID.height} grid. Collect red nodes and avoid the walls and your tail.`
            : 'Break every brick by returning the ball with your paddle. You have three lives.'}
        </canvas>
        {status !== 'running' && (
          <div className="os-arcade-overlay">
            <span className="os-arcade-symbol" aria-hidden="true">
              {game === 'snake' ? '↳' : '⌁'}
            </span>
            <h2>{title}</h2>
            <p>{descriptions[status]}</p>
            <button
              type="button"
              className="os-arcade-play"
              onClick={() => start()}
            >
              {actions[status]} <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </div>
      <div className="os-arcade-footer">
        <span>
          {game === 'snake' ? '↑ ↓ ← → steer' : '← → move'} <i /> SPACE pause
        </span>
        {(status === 'running' || status === 'paused') && (
          <div>
            {status === 'running' && (
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
      <div className="os-arcade-touch" aria-label="Touch game controls">
        {(game === 'snake'
          ? ['up', 'left', 'down', 'right']
          : ['left', 'right']
        ).map((value: Direction) => (
          <button
            key={value}
            type="button"
            aria-label={`Move ${value}`}
            onPointerDown={event => {
              event.currentTarget.setPointerCapture(event.pointerId)
              steer(value)
            }}
            onPointerUp={() => keys.current.delete(value)}
            onPointerCancel={() => keys.current.delete(value)}
            onLostPointerCapture={() => keys.current.delete(value)}
            onClick={event => {
              if (game === 'snake') steer(value)
              else if (event.detail === 0 && status === 'running') {
                pointer.current = Math.max(
                  48,
                  Math.min(
                    552,
                    breakout.current.paddle + (value === 'left' ? -38 : 38),
                  ),
                )
              }
            }}
          >
            {{ up: '↑', down: '↓', left: '←', right: '→' }[value]}
          </button>
        ))}
      </div>
    </section>
  )
}
export default Arcade
