import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import {
  advanceShot,
  launchShot,
  normalizeSlingAim,
  pauseShot,
  resumeShot,
  simulateShot,
  SLING_CATCHUP_STEPS,
  SLING_COURSES,
  SLING_MAX_ANGLE,
  SLING_MIN_ANGLE,
  SLING_SPACE,
  SLING_STEP,
} from './gravitySlingLogic'
import type { SlingAim, SlingPoint, SlingShot } from './gravitySlingLogic'
import { drawGravitySling } from './gravitySlingRenderer'
import './gravity-sling.css'

const outcomeText = {
  flying: 'Probe in flight. Watch the bend.',
  paused: 'Flight paused. Resume or reset when you’re ready.',
  hit: 'Receiver reached. Try another course, or send it again.',
  collision: 'The probe hit the body. Adjust your angle and try again.',
  escaped:
    'The probe left the field. Adjust your angle or power and try again.',
  'timed-out': 'The flight ran out of time. Try a little more power.',
}

export default function GravitySling({
  active,
  motion,
}: {
  active: boolean
  motion: boolean
}) {
  const controlsId = useId()
  const [courseIndex, setCourseIndex] = useState(0)
  const course = SLING_COURSES[courseIndex]
  const [aim, setAim] = useState<SlingAim>(SLING_COURSES[0].initialAim)
  const [shot, setShot] = useState<SlingShot | null>(null)
  const [previousTrail, setPreviousTrail] = useState<readonly SlingPoint[]>([])
  const [attentionPause, setAttentionPause] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [surface, setSurface] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  )
  const [retry, setRetry] = useState(0)
  const [dragging, setDragging] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const currentShot = useRef<SlingShot | null>(null)
  const frame = useRef(0)
  const pointer = useRef<number | null>(null)
  const motionAllowed = motion && !reducedMotion
  const phase = shot?.phase || 'aiming'
  const canAim = active && phase !== 'flying' && phase !== 'paused'
  const preview = useMemo(
    () => simulateShot(course, aim, 70).trail,
    [course, aim],
  )

  const commitShot = useCallback((next: SlingShot | null) => {
    currentShot.current = next
    setShot(next)
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [])

  const releaseAim = useCallback(() => {
    const node = canvas.current
    if (pointer.current !== null && node?.hasPointerCapture(pointer.current)) {
      node.releasePointerCapture(pointer.current)
    }
    pointer.current = null
    setDragging(false)
  }, [])

  const pauseForAttention = useCallback(() => {
    stop()
    releaseAim()
    const { current } = currentShot
    if (current?.phase === 'flying') {
      commitShot(pauseShot(current))
      setAttentionPause(true)
    }
  }, [commitShot, releaseAim, stop])

  const draw = useCallback(() => {
    if (!context.current) return
    drawGravitySling(context.current, {
      course,
      aim,
      shot: currentShot.current,
      previousTrail,
      preview,
    })
  }, [course, aim, previousTrail, preview])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!active) pauseForAttention()
  }, [active, pauseForAttention])

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) pauseForAttention()
    }
    window.addEventListener('blur', pauseForAttention)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', pauseForAttention)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [pauseForAttention])

  useEffect(() => {
    if (motionAllowed) return
    const { current } = currentShot
    if (current?.phase === 'flying' || current?.phase === 'paused') {
      stop()
      commitShot(simulateShot(course, aim))
      setAttentionPause(false)
    }
  }, [motionAllowed, course, aim, commitShot, stop])

  useEffect(() => {
    const node = canvas.current
    if (!node) return undefined
    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = node.getContext('2d', { alpha: false })
    } catch {
      ctx = null
    }
    context.current = ctx
    if (!ctx) {
      setSurface('unavailable')
      return undefined
    }
    setSurface('ready')
    const resize = () => {
      const bounds = node.getBoundingClientRect()
      if (bounds.width < 1 || bounds.height < 1) return
      const density = Math.min(window.devicePixelRatio || 1, 2)
      node.width = Math.max(1, Math.round(bounds.width * density))
      node.height = Math.max(1, Math.round(bounds.height * density))
      draw()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(node)
    return () => {
      observer.disconnect()
      context.current = null
    }
  }, [retry, draw])

  useEffect(draw, [draw, shot])

  useEffect(() => {
    if (
      !active ||
      !motionAllowed ||
      phase !== 'flying' ||
      surface !== 'ready'
    ) {
      return undefined
    }
    if (document.hidden) {
      pauseForAttention()
      return undefined
    }
    let previous = performance.now()
    let accumulator = 0
    const tick = (now: number) => {
      accumulator += Math.max(
        0,
        Math.min((now - previous) / 1000, SLING_STEP * SLING_CATCHUP_STEPS),
      )
      previous = now
      const { current } = currentShot
      if (!current || current.phase !== 'flying') return
      if (accumulator >= SLING_STEP) {
        const next = advanceShot(current, course, accumulator)
        accumulator %= SLING_STEP
        commitShot(next)
        if (next.phase !== 'flying') {
          frame.current = 0
          return
        }
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return stop
  }, [
    active,
    motionAllowed,
    phase,
    surface,
    course,
    commitShot,
    pauseForAttention,
    stop,
  ])

  useEffect(() => () => stop(), [stop])

  const changeAim = (next: SlingAim) => {
    if (!canAim) return
    if (currentShot.current) setPreviousTrail(currentShot.current.trail)
    commitShot(null)
    setAim(normalizeSlingAim(next))
    setAttentionPause(false)
  }

  const aimAtPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const scale = Math.min(
      bounds.width / SLING_SPACE.width,
      bounds.height / SLING_SPACE.height,
    )
    const x =
      (event.clientX -
        bounds.left -
        (bounds.width - SLING_SPACE.width * scale) / 2) /
      scale
    const y =
      (event.clientY -
        bounds.top -
        (bounds.height - SLING_SPACE.height * scale) / 2) /
      scale
    const dx = x - course.launch.x
    const dy = y - course.launch.y
    if (Math.hypot(dx, dy) < 8) return
    changeAim({
      angle: Math.round((-Math.atan2(dy, dx) * 180) / Math.PI),
      power: Math.round((Math.hypot(dx, dy) - 60) / 1.2),
    })
  }

  const reset = (index = courseIndex) => {
    stop()
    releaseAim()
    setCourseIndex(index)
    setAim(SLING_COURSES[index].initialAim)
    commitShot(null)
    setPreviousTrail([])
    setAttentionPause(false)
  }

  const flightAction = () => {
    if (!active || surface !== 'ready') return
    const { current } = currentShot
    if (current?.phase === 'flying') {
      stop()
      commitShot(pauseShot(current))
    } else if (current?.phase === 'paused') {
      commitShot(
        motionAllowed ? resumeShot(current) : simulateShot(course, aim),
      )
    } else {
      if (current) setPreviousTrail(current.trail)
      commitShot(
        motionAllowed ? launchShot(course, aim) : simulateShot(course, aim),
      )
    }
    setAttentionPause(false)
  }

  let actionLabel = 'Launch'
  if (phase === 'flying') actionLabel = 'Pause'
  if (phase === 'paused') actionLabel = 'Resume'
  let status = shot
    ? outcomeText[shot.phase]
    : 'Aim for the receiver. Drag to set a path, then launch.'
  if (attentionPause && phase === 'paused') {
    status = 'Paused while away. Choose Resume to continue the flight.'
  }

  return (
    <section className="os-play-toy os-sling" aria-label="Gravity Sling">
      <header className="os-play-header os-sling-header">
        <h2>Gravity Sling</h2>
        <p>One probe. One body. Find the curve into the receiver.</p>
      </header>
      <div
        className="os-sling-courses"
        role="group"
        aria-label="Gravity Sling course"
      >
        {SLING_COURSES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={courseIndex === index}
            disabled={!active}
            onClick={() => reset(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className="os-sling-course-note">{course.description}</p>
      <div
        className="os-sling-stage"
        data-phase={phase}
        data-dragging={dragging}
      >
        <canvas
          key={retry}
          ref={canvas}
          width={720}
          height={420}
          tabIndex={active ? 0 : -1}
          aria-label="Gravity Sling flight field"
          aria-describedby={`${controlsId}-help`}
          onPointerDown={event => {
            if (!canAim || event.button !== 0 || pointer.current !== null)
              return
            event.currentTarget.focus({ preventScroll: true })
            pointer.current = event.pointerId
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
            aimAtPointer(event)
          }}
          onPointerMove={event => {
            if (pointer.current === event.pointerId) aimAtPointer(event)
          }}
          onPointerUp={event => {
            if (pointer.current === event.pointerId) releaseAim()
          }}
          onPointerCancel={releaseAim}
          onLostPointerCapture={releaseAim}
          onKeyDown={event => {
            if (!canAim) return
            const direction = {
              ArrowLeft: -1,
              ArrowDown: -1,
              ArrowRight: 1,
              ArrowUp: 1,
            }[event.key]
            if (!direction) return
            event.preventDefault()
            event.stopPropagation()
            changeAim(
              event.shiftKey
                ? { ...aim, power: aim.power + direction }
                : { ...aim, angle: aim.angle + direction },
            )
          }}
        >
          Aim with the Angle and Power sliders, then launch. The flight outcome
          appears below.
        </canvas>
        {surface === 'unavailable' && (
          <div className="os-sling-recovery" role="alert">
            <p>The flight field could not start.</p>
            <button type="button" onClick={() => setRetry(value => value + 1)}>
              Retry canvas
            </button>
          </div>
        )}
      </div>
      <div className="os-sling-legend" aria-hidden="true">
        <span>
          <i className="os-sling-launch-mark" />
          Launch
        </span>
        <span>
          <i className="os-sling-body-mark" />
          Gravity
        </span>
        <span>
          <i className="os-sling-receiver-mark" />
          Receiver
        </span>
        {previousTrail.length > 0 && phase === 'aiming' && (
          <span className="os-sling-trail-key">Previous flight</span>
        )}
      </div>
      <div className="os-sling-aim">
        <label htmlFor={`${controlsId}-angle`}>
          <span>
            Angle{' '}
            <output aria-hidden="true">
              {aim.angle > 0 ? '+' : ''}
              {aim.angle}°
            </output>
          </span>
          <input
            id={`${controlsId}-angle`}
            type="range"
            min={SLING_MIN_ANGLE}
            max={SLING_MAX_ANGLE}
            step={1}
            value={aim.angle}
            aria-valuetext={`${Math.abs(aim.angle)} degrees ${aim.angle < 0 ? 'below' : 'above'} horizontal`}
            disabled={!canAim}
            onChange={event =>
              changeAim({ ...aim, angle: event.currentTarget.valueAsNumber })
            }
          />
        </label>
        <label htmlFor={`${controlsId}-power`}>
          <span>
            Power <output aria-hidden="true">{aim.power}%</output>
          </span>
          <input
            id={`${controlsId}-power`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={aim.power}
            disabled={!canAim}
            onChange={event =>
              changeAim({ ...aim, power: event.currentTarget.valueAsNumber })
            }
          />
        </label>
      </div>
      <p
        className="os-sling-status"
        role="status"
        aria-atomic="true"
        data-success={phase === 'hit'}
      >
        {status}
      </p>
      <div className="os-play-actions os-sling-actions">
        <button
          type="button"
          className="os-play-primary"
          disabled={!active || surface !== 'ready'}
          onClick={flightAction}
        >
          {phase === 'flying' ? (
            <Pause size={15} aria-hidden="true" />
          ) : (
            <Play size={15} aria-hidden="true" />
          )}
          {actionLabel}
        </button>
        <button type="button" disabled={!active} onClick={() => reset()}>
          <RotateCcw size={15} aria-hidden="true" />
          Reset
        </button>
        {!motionAllowed && (
          <span className="os-sling-still">
            Motion off · full flight shown on launch
          </span>
        )}
      </div>
      <p className="os-play-note" id={`${controlsId}-help`}>
        Drag to aim; release keeps your aim. Arrow keys adjust angle, Shift +
        arrows adjust power. Launch when ready.
      </p>
    </section>
  )
}
