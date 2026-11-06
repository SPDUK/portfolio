/* eslint-disable no-bitwise */
export const BEAT_STEPS = 8
export const beatTracks = ['Kick', 'Snare', 'Hat', 'Tone'] as const
export const beatPresets = [
  { name: 'After hours', pattern: [17, 68, 170, 33], tempo: 104 },
  { name: 'Four on the floor', pattern: [85, 68, 170, 146], tempo: 124 },
  { name: 'Slow motion', pattern: [33, 16, 85, 132], tempo: 76 },
] as const

export interface BeatSession {
  pattern: number[]
  tempo: number
}
export interface BeatCursor {
  step: number
  time: number
}

export function hasBeat(
  pattern: readonly number[],
  track: number,
  step: number,
) {
  return Boolean(pattern[track] & (1 << step))
}

export function toggleBeat(
  pattern: readonly number[],
  track: number,
  step: number,
) {
  return pattern.map((row, index) =>
    index === track ? row ^ (1 << step) : row,
  )
}

export function readBeatSession(value: string | null): BeatSession | null {
  try {
    const parsed: unknown = JSON.parse(value || 'null')
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('pattern' in parsed) ||
      !('tempo' in parsed)
    )
      return null
    const { pattern, tempo } = parsed
    if (
      !Array.isArray(pattern) ||
      pattern.length !== beatTracks.length ||
      !pattern.every(
        (row: unknown): row is number =>
          typeof row === 'number' &&
          Number.isInteger(row) &&
          row >= 0 &&
          row < 256,
      ) ||
      typeof tempo !== 'number' ||
      !Number.isInteger(tempo) ||
      tempo < 60 ||
      tempo > 160
    )
      return null
    return { pattern, tempo }
  } catch {
    return null
  }
}

export function scheduleBeatWindow(
  cursor: BeatCursor,
  now: number,
  tempo: number,
) {
  const interval = 30 / tempo
  const events: BeatCursor[] = []
  let { step, time } = cursor
  // A stalled tab resumes ahead of the audio clock, never with a burst of old notes.
  if (time < now) time = now + 0.02
  while (time < now + 0.1) {
    events.push({ step, time })
    step = (step + 1) % BEAT_STEPS
    time += interval
  }
  return { events, cursor: { step, time } }
}
