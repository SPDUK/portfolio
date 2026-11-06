export interface BeatAudio {
  context: AudioContext
  output: GainNode
  noise: AudioBuffer
  sources: Set<AudioScheduledSourceNode>
}

export function createBeatAudio(): BeatAudio {
  const context = new AudioContext()
  const output = context.createGain()
  output.gain.value = 0.48
  output.connect(context.destination)
  const noise = context.createBuffer(
    1,
    context.sampleRate * 0.25,
    context.sampleRate,
  )
  const data = noise.getChannelData(0)
  for (let index = 0; index < data.length; index += 1)
    data[index] = Math.random() * 2 - 1
  return { context, output, noise, sources: new Set() }
}

export function playBeat(
  audio: BeatAudio,
  track: number,
  step: number,
  time: number,
) {
  const { context, output, sources } = audio
  const gain = context.createGain()
  gain.connect(output)
  let source: AudioScheduledSourceNode
  let filter: BiquadFilterNode | null = null
  let duration = 0.25
  if (track === 0 || track === 3) {
    const oscillator = context.createOscillator()
    oscillator.type = track === 0 ? 'sine' : 'triangle'
    const frequency = track === 0 ? 145 : [220, 261.63, 329.63, 392][step % 4]
    oscillator.frequency.setValueAtTime(frequency, time)
    if (track === 0)
      oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.15)
    oscillator.connect(gain)
    source = oscillator
  } else {
    const buffer = context.createBufferSource()
    buffer.buffer = audio.noise
    filter = context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = track === 1 ? 1100 : 6500
    buffer.connect(filter)
    filter.connect(gain)
    source = buffer
    duration = track === 1 ? 0.15 : 0.055
  }
  const level = [0.8, 0.28, 0.19, 0.22][track]
  gain.gain.setValueAtTime(0, time)
  gain.gain.linearRampToValueAtTime(level, time + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration)
  sources.add(source)
  source.onended = () => {
    source.disconnect()
    gain.disconnect()
    filter?.disconnect()
    sources.delete(source)
  }
  source.start(time)
  source.stop(time + duration + 0.01)
}

export function silenceBeats(audio: BeatAudio) {
  audio.sources.forEach(source => source.stop())
  audio.sources.clear()
}
