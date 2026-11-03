import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Download, Pause, Play, Shuffle } from 'lucide-react'
import { drawSignal } from './signalRenderer'
import type {
  SignalFrame,
  SignalPreset,
  SignalSettings,
} from './signalRenderer'
import './signal-lab.css'

interface SignalLabProps {
  active: boolean
  motion: boolean
}

type Playback = 'running' | 'paused' | 'attention' | 'still'
type Surface = 'initializing' | 'ready' | 'unavailable'
type ExportState = 'idle' | 'saving' | 'saved' | 'error'

const presets: { id: SignalPreset; label: string; description: string }[] = [
  {
    id: 'field',
    label: 'Field',
    description: 'Flowing ribbons of crimson light',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    description: 'Intersecting elliptical filaments',
  },
  { id: 'terrain', label: 'Terrain', description: 'A receding wire landscape' },
]

const playbackLabels: Record<Playback, string> = {
  running: 'In motion',
  paused: 'Paused',
  attention: 'Paused while away',
  still: 'Still frame',
}

const playbackActions: Record<Playback, string> = {
  running: 'Pause',
  paused: 'Resume',
  attention: 'Resume',
  still: 'Run',
}

export default function SignalLab({ active, motion }: SignalLabProps) {
  const controlId = useId()
  const [settings, setSettings] = useState<SignalSettings>({
    preset: 'field',
    energy: 58,
    seed: 7,
  })
  const [tempo, setTempo] = useState(45)
  const [playback, setPlayback] = useState<Playback>(
    motion ? 'running' : 'still',
  )
  const [surface, setSurface] = useState<Surface>('initializing')
  const [exportState, setExportState] = useState<ExportState>('idle')
  const [retry, setRetry] = useState(0)
  const [dragging, setDragging] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const frame = useRef<SignalFrame>({ elapsed: 0, pointer: { x: 0.5, y: 0.5 } })
  const settingsRef = useRef(settings)
  const tempoRef = useRef(tempo)
  const capturedPointer = useRef<number | null>(null)
  const animation = useRef(0)
  const download = useRef<{ url: string; timer: number } | null>(null)
  const mounted = useRef(false)

  const draw = useCallback(() => {
    if (context.current)
      drawSignal(context.current, settingsRef.current, frame.current)
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(animation.current)
    animation.current = 0
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (download.current) {
        URL.revokeObjectURL(download.current.url)
        clearTimeout(download.current.timer)
      }
    }
  }, [])

  useEffect(() => {
    settingsRef.current = settings
    draw()
  }, [settings, draw])

  useEffect(() => {
    tempoRef.current = tempo
  }, [tempo])

  useEffect(() => {
    if (!active) {
      stop()
      setPlayback(current => (current === 'running' ? 'attention' : current))
      setDragging(false)
      capturedPointer.current = null
    } else draw()
  }, [active, draw, stop])

  useEffect(() => {
    if (!motion) {
      stop()
      setPlayback('still')
    }
  }, [motion, stop])

  useEffect(() => {
    const node = canvas.current
    const container = stage.current
    if (!node || !container) return undefined
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
      const { width, height } = container.getBoundingClientRect()
      if (width < 1 || height < 1) return
      const density = Math.min(
        window.devicePixelRatio || 1,
        1.5,
        1600 / width,
        1200 / height,
        Math.sqrt(1400000 / (width * height)),
      )
      const nextWidth = Math.max(1, Math.round(width * density))
      const nextHeight = Math.max(1, Math.round(height * density))
      if (node.width !== nextWidth || node.height !== nextHeight) {
        node.width = nextWidth
        node.height = nextHeight
      }
      draw()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    window.addEventListener('resize', resize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      context.current = null
    }
  }, [retry, draw])

  useEffect(() => {
    const pauseForAttention = () => {
      stop()
      setPlayback(current => (current === 'running' ? 'attention' : current))
      setDragging(false)
      capturedPointer.current = null
    }
    const visibility = () => {
      if (document.hidden) pauseForAttention()
    }
    window.addEventListener('blur', pauseForAttention)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', pauseForAttention)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [stop])

  useEffect(() => {
    if (
      !active ||
      playback !== 'running' ||
      surface !== 'ready' ||
      document.hidden
    )
      return undefined
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05)
      previous = now
      frame.current.elapsed += delta * (0.16 + tempoRef.current / 70)
      draw()
      animation.current = requestAnimationFrame(tick)
    }
    animation.current = requestAnimationFrame(tick)
    return stop
  }, [active, playback, surface, draw, stop])

  const bend = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    frame.current.pointer = {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    }
    if (playback !== 'running') draw()
  }

  const save = () => {
    const node = canvas.current
    if (!node || surface !== 'ready') return
    const filename = `signal-lab-${settings.preset}-${settings.seed}.png`
    setExportState('saving')
    try {
      node.toBlob(blob => {
        if (!mounted.current) return
        if (!blob) {
          setExportState('error')
          return
        }
        if (download.current) {
          URL.revokeObjectURL(download.current.url)
          clearTimeout(download.current.timer)
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        download.current = {
          url,
          timer: window.setTimeout(() => {
            URL.revokeObjectURL(url)
            download.current = null
          }, 30000),
        }
        setExportState('saved')
      }, 'image/png')
    } catch {
      setExportState('error')
    }
  }

  const selected = presets.find(preset => preset.id === settings.preset)

  return (
    <section className="os-signal" aria-label="Signal Lab">
      <header className="os-signal-header">
        <div>
          <h1>
            Signal Lab<span>.</span>
          </h1>
          <p>Drag to bend the light. Save a frame.</p>
        </div>
        <span className="os-signal-state" data-running={playback === 'running'}>
          {playbackLabels[playback]}
        </span>
      </header>
      <div className="os-signal-presets" role="group" aria-label="Composition">
        {presets.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={settings.preset === preset.id}
            title={preset.description}
            onClick={() => {
              setSettings(current => ({ ...current, preset: preset.id }))
              setExportState('idle')
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="os-signal-stage" ref={stage} data-dragging={dragging}>
        <canvas
          key={retry}
          ref={canvas}
          width={800}
          height={500}
          tabIndex={0}
          aria-label={`${selected?.description}. Drag or use arrow keys to reshape the composition.`}
          onPointerDown={event => {
            if (event.button !== 0 || capturedPointer.current !== null) return
            capturedPointer.current = event.pointerId
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
            bend(event)
          }}
          onPointerMove={event => {
            if (capturedPointer.current === event.pointerId) bend(event)
          }}
          onPointerUp={event => {
            if (capturedPointer.current !== event.pointerId) return
            capturedPointer.current = null
            setDragging(false)
            event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          onPointerCancel={() => {
            capturedPointer.current = null
            setDragging(false)
          }}
          onLostPointerCapture={() => {
            capturedPointer.current = null
            setDragging(false)
          }}
          onKeyDown={event => {
            const directions: Record<string, { x: number; y: number }> = {
              ArrowLeft: { x: -0.04, y: 0 },
              ArrowRight: { x: 0.04, y: 0 },
              ArrowUp: { x: 0, y: -0.04 },
              ArrowDown: { x: 0, y: 0.04 },
            }
            const direction = directions[event.key]
            if (!direction) return
            event.preventDefault()
            frame.current.pointer = {
              x: Math.min(
                1,
                Math.max(0, frame.current.pointer.x + direction.x),
              ),
              y: Math.min(
                1,
                Math.max(0, frame.current.pointer.y + direction.y),
              ),
            }
            if (playback !== 'running') draw()
          }}
        >
          Your browser needs canvas support to display Signal Lab.
        </canvas>
        {surface === 'unavailable' && (
          <div className="os-signal-recovery" role="alert">
            <h2>The canvas could not start.</h2>
            <p>Try creating a fresh drawing surface.</p>
            <button
              type="button"
              onClick={() => setRetry(current => current + 1)}
            >
              Retry canvas
            </button>
          </div>
        )}
      </div>
      <div className="os-signal-controls">
        <label className="os-signal-slider" htmlFor={`${controlId}-energy`}>
          <span>
            Energy <output aria-hidden="true">{settings.energy}%</output>
          </span>
          <input
            id={`${controlId}-energy`}
            type="range"
            min="0"
            max="100"
            value={settings.energy}
            onChange={event => {
              const energy = event.currentTarget.valueAsNumber
              setSettings(current => ({ ...current, energy }))
            }}
          />
        </label>
        <label className="os-signal-slider" htmlFor={`${controlId}-tempo`}>
          <span>
            Tempo{' '}
            <output aria-hidden="true">
              {(0.16 + tempo / 70).toFixed(1)}×
            </output>
          </span>
          <input
            id={`${controlId}-tempo`}
            type="range"
            min="0"
            max="100"
            value={tempo}
            onChange={event => setTempo(event.currentTarget.valueAsNumber)}
          />
        </label>
      </div>
      <footer className="os-signal-footer">
        <button
          type="button"
          className="os-signal-variation"
          onClick={() => {
            setSettings(current => ({ ...current, seed: current.seed + 1 }))
            setExportState('idle')
          }}
        >
          <Shuffle size={15} aria-hidden="true" />
          New variation
        </button>
        <div className="os-signal-actions">
          <button
            type="button"
            className="os-signal-play"
            disabled={surface !== 'ready'}
            onClick={() =>
              setPlayback(current =>
                current === 'running' ? 'paused' : 'running',
              )
            }
          >
            {playback === 'running' ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {playbackActions[playback]}
          </button>
          <button
            type="button"
            disabled={surface !== 'ready' || exportState === 'saving'}
            onClick={save}
          >
            <Download size={15} aria-hidden="true" />
            {exportState === 'saving' ? 'Saving…' : 'Save PNG'}
          </button>
        </div>
      </footer>
      <p className="os-signal-export" role="status">
        {exportState === 'saved' &&
          'PNG saved. Your current composition, exactly as shown.'}
        {exportState === 'error' &&
          'The PNG could not be saved. Try Save PNG again.'}
      </p>
    </section>
  )
}
