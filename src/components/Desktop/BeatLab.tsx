import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import {
  BEAT_STEPS,
  beatPresets,
  beatTracks,
  hasBeat,
  readBeatSession,
  scheduleBeatWindow,
  toggleBeat,
} from './beatLabLogic'
import type { BeatCursor } from './beatLabLogic'
import { createBeatAudio, playBeat, silenceBeats } from './beatLabAudio'
import type { BeatAudio } from './beatLabAudio'
import './beat-lab.css'

interface BeatLabProps {
  active: boolean
  sound: boolean
  onSoundChange: (enabled: boolean) => void
}

export default function BeatLab({
  active,
  sound,
  onSoundChange,
}: BeatLabProps) {
  const [pattern, setPattern] = useState<number[]>([...beatPresets[0].pattern])
  const [tempo, setTempo] = useState<number>(beatPresets[0].tempo)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(-1)
  const [pad, setPad] = useState(0)
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState(true)
  const [message, setMessage] = useState(
    'Your first loop is ready. Make it yours.',
  )
  const audio = useRef<BeatAudio | null>(null)
  const timer = useRef<number | null>(null)
  const cursor = useRef<BeatCursor>({ step: 0, time: 0 })
  const pending = useRef<BeatCursor[]>([])
  const playing = useRef(false)
  const settings = useRef({ pattern, tempo })
  const request = useRef(0)
  const pads = useRef<(HTMLButtonElement | null)[]>([])
  const tempoId = useId()

  const stop = useCallback(() => {
    request.current += 1
    playing.current = false
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
    pending.current = []
    if (audio.current) {
      silenceBeats(audio.current)
      audio.current.context.suspend().catch(() => {})
    }
    setRunning(false)
    setStep(-1)
  }, [])

  useEffect(() => {
    try {
      const session = readBeatSession(localStorage.getItem('spdev-beat-lab'))
      if (session) {
        setPattern(session.pattern)
        setTempo(session.tempo)
      }
    } catch {
      setSaved(false)
    }
    setReady(true)
    return () => {
      request.current += 1
      playing.current = false
      if (timer.current !== null) window.clearInterval(timer.current)
      if (audio.current) {
        silenceBeats(audio.current)
        audio.current.context.close().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    settings.current = { pattern, tempo }
    if (!ready) return
    try {
      localStorage.setItem('spdev-beat-lab', JSON.stringify({ pattern, tempo }))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [pattern, tempo, ready])

  useEffect(() => {
    if (!active || !sound) {
      if (playing.current)
        setMessage(
          sound
            ? 'Paused while you were away. Play when you’re ready.'
            : 'Sound is off. Press Play to hear your loop again.',
        )
      stop()
    }
  }, [active, sound, stop])

  useEffect(() => {
    const leave = () => {
      if (playing.current)
        setMessage('Paused while you were away. Play when you’re ready.')
      stop()
    }
    const hide = () => {
      if (document.hidden) leave()
    }
    window.addEventListener('blur', leave)
    document.addEventListener('visibilitychange', hide)
    return () => {
      window.removeEventListener('blur', leave)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [stop])

  const start = async () => {
    if (playing.current || !active) return
    request.current += 1
    const { current } = request
    try {
      if (!audio.current || audio.current.context.state === 'closed')
        audio.current = createBeatAudio()
      await audio.current.context.resume()
      if (request.current !== current) return
      if (audio.current.context.state !== 'running')
        throw new Error('Audio is suspended')
      if (!sound) onSoundChange(true)
      playing.current = true
      cursor.current = {
        step: 0,
        time: audio.current.context.currentTime + 0.035,
      }
      const tick = () => {
        const engine = audio.current
        if (!engine || !playing.current) return
        const now = engine.context.currentTime
        const scheduled = scheduleBeatWindow(
          cursor.current,
          now,
          settings.current.tempo,
        )
        cursor.current = scheduled.cursor
        scheduled.events.forEach(event => {
          beatTracks.forEach((_, track) => {
            if (hasBeat(settings.current.pattern, track, event.step))
              playBeat(engine, track, event.step, event.time)
          })
        })
        pending.current.push(...scheduled.events)
        while (pending.current.length && pending.current[0].time <= now)
          setStep(pending.current.shift().step)
      }
      tick()
      timer.current = window.setInterval(tick, 25)
      setRunning(true)
      setMessage('Looping. Tap the pads to change what you hear.')
    } catch {
      stop()
      setMessage(
        'Audio couldn’t start. Try Play again or check your browser’s sound permissions.',
      )
    }
  }

  return (
    <section className="os-play-toy os-beat" aria-label="Beat Lab">
      <header className="os-play-header">
        <h2>Beat Lab</h2>
        <p>A little drum machine. Tap a pattern. Find a groove.</p>
      </header>
      <div className="os-beat-presets" role="group" aria-label="Beat presets">
        {beatPresets.map(preset => (
          <button
            type="button"
            key={preset.name}
            onClick={() => {
              stop()
              setPattern([...preset.pattern])
              setTempo(preset.tempo)
              setMessage(`${preset.name} loaded. Press Play to listen.`)
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <div className="os-beat-machine">
        <div className="os-beat-count" aria-hidden="true">
          <span />
          {Array.from({ length: BEAT_STEPS }, (_, index) => (
            <span key={index} data-current={step === index}>
              {index % 2 === 0 ? index / 2 + 1 : '&'}
            </span>
          ))}
        </div>
        <div className="os-beat-grid" role="group" aria-label="Sequencer pads">
          {beatTracks.map((track, row) => (
            <div className={`os-beat-track os-beat-track--${row}`} key={track}>
              <span className="os-beat-track-name">{track}</span>
              {Array.from({ length: BEAT_STEPS }, (_, column) => {
                const index = row * BEAT_STEPS + column
                return (
                  <button
                    type="button"
                    key={column}
                    ref={element => {
                      pads.current[index] = element
                    }}
                    aria-label={`${track}, step ${column + 1}`}
                    aria-pressed={hasBeat(pattern, row, column)}
                    data-current={step === column}
                    tabIndex={pad === index ? 0 : -1}
                    onFocus={() => setPad(index)}
                    onClick={() =>
                      setPattern(previous => toggleBeat(previous, row, column))
                    }
                    onKeyDown={event => {
                      let next = index
                      if (event.key === 'ArrowRight')
                        next = row * BEAT_STEPS + ((column + 1) % BEAT_STEPS)
                      else if (event.key === 'ArrowLeft')
                        next =
                          row * BEAT_STEPS +
                          ((column + BEAT_STEPS - 1) % BEAT_STEPS)
                      else if (event.key === 'ArrowDown')
                        next =
                          ((row + 1) % beatTracks.length) * BEAT_STEPS + column
                      else if (event.key === 'ArrowUp')
                        next =
                          ((row + beatTracks.length - 1) % beatTracks.length) *
                            BEAT_STEPS +
                          column
                      else return
                      event.preventDefault()
                      pads.current[next]?.focus()
                    }}
                  >
                    <span />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="os-beat-transport">
        <button
          type="button"
          className="os-play-primary"
          onClick={() => {
            if (running) {
              stop()
              setMessage('Paused. Your pattern is right here.')
            } else start()
          }}
        >
          {running ? (
            <Pause size={16} aria-hidden="true" />
          ) : (
            <Play size={16} aria-hidden="true" />
          )}
          {running ? 'Pause loop' : 'Play loop'}
        </button>
        <button
          type="button"
          className="os-beat-sound"
          aria-label={sound ? 'Mute sound' : 'Enable sound'}
          aria-pressed={sound}
          onClick={() => {
            if (sound) stop()
            setMessage(
              sound
                ? 'Sound is off. Press Play to hear your loop again.'
                : 'Sound is on. Press Play when you’re ready.',
            )
            onSoundChange(!sound)
          }}
        >
          {sound ? (
            <Volume2 size={17} aria-hidden="true" />
          ) : (
            <VolumeX size={17} aria-hidden="true" />
          )}
        </button>
        <div className="os-beat-tempo">
          <label htmlFor={tempoId}>
            Tempo <output>{tempo} BPM</output>
          </label>
          <input
            id={tempoId}
            type="range"
            min="60"
            max="160"
            value={tempo}
            onChange={event => setTempo(Number(event.target.value))}
          />
        </div>
      </div>
      <p className="os-beat-status" role="status">
        {message}
      </p>
      <div className="os-beat-bottom">
        <p className="os-play-note">
          Arrow keys move · Space toggles a pad.
          <br />
          {saved
            ? 'Your pattern stays in this browser.'
            : 'Storage is unavailable. This pattern lasts for this visit.'}
          {!sound && ' Play enables sound.'}
        </p>
        <button
          type="button"
          onClick={() => {
            stop()
            setPattern([0, 0, 0, 0])
            setMessage('A blank beat. Tap a few pads to begin.')
          }}
        >
          Clear pattern
        </button>
      </div>
    </section>
  )
}
