export type SignalPreset = 'field' | 'orbit' | 'terrain'

export interface SignalSettings {
  preset: SignalPreset
  energy: number
  seed: number
}

export interface SignalFrame {
  elapsed: number
  pointer: { x: number; y: number }
}

const TAU = Math.PI * 2

function drawField(
  ctx: CanvasRenderingContext2D,
  settings: SignalSettings,
  frame: SignalFrame,
) {
  const { width, height } = ctx.canvas
  const scale = Math.min(width * 0.7, height * 0.8)
  const phase = settings.seed * 1.731 + frame.elapsed * 0.18
  const energy = settings.energy / 100
  const bendX = (frame.pointer.x - 0.5) * 0.8
  const bendY = (frame.pointer.y - 0.5) * 0.7
  const lines = 116
  ctx.lineWidth = Math.max(0.65, width / 1250)

  for (let line = 0; line < lines; line += 1) {
    const band = line / (lines - 1)
    const baseY = (band - 0.5) * 1.68
    const highlight = Math.max(0, Math.sin(band * Math.PI)) ** 10
    const white = line % 19 === 0 || (line > 51 && line < 57)
    ctx.strokeStyle = white
      ? `rgba(255,222,225,${0.48 + highlight * 0.44})`
      : `rgba(255,${Math.round(39 + highlight * 64)},${Math.round(69 + highlight * 65)},${0.22 + highlight * 0.54})`
    ctx.beginPath()

    for (let step = 0; step <= 176; step += 1) {
      const t = step / 176
      let x = (t - 0.5) * 3.45
      let y =
        baseY +
        Math.sin(x * 2.2 + phase) * (0.12 + energy * 0.1) +
        Math.sin(x * 4.2 - phase * 0.7 + baseY * 2) * 0.045
      const dx = x - bendX
      const dy = y - bendY
      const distance = dx * dx + dy * dy
      const twist =
        (1.65 + energy * 2.2) * Math.exp(-distance * 1.2) +
        Math.sin(phase * 0.7) * 0.18
      x = bendX + dx * Math.cos(twist) - dy * Math.sin(twist)
      y = bendY + dx * Math.sin(twist) + dy * Math.cos(twist)
      const screenX = width * 0.5 + (x * 0.98 + y * 0.18) * scale
      const screenY = height * 0.5 + (y * 0.79 - x * 0.13) * scale
      if (step === 0) ctx.moveTo(screenX, screenY)
      else ctx.lineTo(screenX, screenY)
    }
    ctx.stroke()
  }
}

function drawOrbit(
  ctx: CanvasRenderingContext2D,
  settings: SignalSettings,
  frame: SignalFrame,
) {
  const { width, height } = ctx.canvas
  const scale = Math.min(width * 0.46, height * 0.51)
  const phase = settings.seed * 0.923 + frame.elapsed * 0.13
  const energy = settings.energy / 100
  const bendX = (frame.pointer.x - 0.5) * 0.4
  const bendY = (frame.pointer.y - 0.5) * 0.6
  const centerX = width * 0.5
  const centerY = height * 0.5

  for (let family = 0; family < 2; family += 1) {
    const count = family === 0 ? 78 : 34
    for (let line = 0; line < count; line += 1) {
      const band = line / (count - 1)
      const radius = family === 0 ? 0.62 + band * 0.42 : 0.91 + band * 0.16
      const angle =
        (family === 0 ? -0.62 + band * 0.82 : 1.05 + band * 0.25) +
        Math.sin(phase) * 0.14 +
        bendY
      const flatten =
        (family === 0 ? 0.4 + band * 0.15 : 0.2 + band * 0.08) + bendX * 0.3
      const white = family === 0 && (line % 23 === 0 || line === 77)
      ctx.strokeStyle = white
        ? 'rgba(255,228,231,0.85)'
        : `rgba(255,${family === 0 ? 55 + Math.round(band * 50) : 43},${family === 0 ? 85 + Math.round(band * 45) : 75},${family === 0 ? 0.32 + band * 0.32 : 0.29})`
      ctx.lineWidth = Math.max(0.65, width / 1400)
      ctx.beginPath()

      for (let step = 0; step <= 220; step += 1) {
        const theta = (step / 220) * TAU
        const ripple = Math.sin(theta * 3 + phase + band * 4) * energy * 0.032
        const x = Math.cos(theta) * (radius + ripple)
        const y =
          Math.sin(theta) * radius * flatten +
          Math.sin(theta * 2 + phase) * energy * 0.04
        const screenX =
          centerX + (x * Math.cos(angle) - y * Math.sin(angle)) * scale
        const screenY =
          centerY + (x * Math.sin(angle) + y * Math.cos(angle)) * scale
        if (step === 0) ctx.moveTo(screenX, screenY)
        else ctx.lineTo(screenX, screenY)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }

  for (let index = 0; index < 7; index += 1) {
    const theta = phase * (index % 2 === 0 ? 1 : -1) + index * 1.91
    const angle = index % 2 === 0 ? -0.48 + bendY : 1.2 + bendY
    const x = Math.cos(theta) * (0.75 + index * 0.036)
    const y = Math.sin(theta) * 0.39
    const screenX =
      centerX + (x * Math.cos(angle) - y * Math.sin(angle)) * scale
    const screenY =
      centerY + (x * Math.sin(angle) + y * Math.cos(angle)) * scale
    ctx.fillStyle = '#fff0ef'
    ctx.beginPath()
    ctx.arc(screenX, screenY, Math.max(1.2, width / 720), 0, TAU)
    ctx.fill()
  }
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  settings: SignalSettings,
  frame: SignalFrame,
) {
  const { width, height } = ctx.canvas
  const phase = settings.seed * 1.377 + frame.elapsed * 0.24
  const energy = 0.3 + settings.energy / 100
  const horizon = height * 0.35
  const bendX = (frame.pointer.x - 0.5) * 5
  const bendY = (frame.pointer.y - 0.5) * 1.6
  const scale = Math.min(width, height * 1.8)
  const sunX = width * 0.68
  const sunY = horizon - height * 0.065
  const sunRadius = Math.min(width * 0.095, height * 0.14)
  const glow = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    sunRadius * 3.8,
  )
  glow.addColorStop(0, '#b91f2e30')
  glow.addColorStop(1, '#b91f2e00')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, horizon + sunRadius)

  for (let star = 0; star < 48; star += 1) {
    const x =
      (((Math.sin(star * 128.71 + settings.seed) * 43758.54) % 1) + 1) % 1
    const y =
      (((Math.sin(star * 82.17 + settings.seed) * 22578.14) % 1) + 1) % 1
    ctx.fillStyle = star % 7 === 0 ? '#ecd1d798' : '#b9536c65'
    const size = star % 7 === 0 ? 1.35 : 0.7
    ctx.fillRect(x * width, y * horizon * 0.87, size, size)
  }

  ctx.fillStyle = '#270d16'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = '#f09aa9'
  ctx.lineWidth = Math.max(0.8, width / 1200)
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunRadius, Math.PI * 0.93, Math.PI * 1.93)
  ctx.stroke()
  ctx.strokeStyle = '#b5274960'
  ctx.beginPath()
  ctx.ellipse(sunX, sunY, sunRadius * 1.38, sunRadius * 0.28, -0.3, 0, TAU)
  ctx.stroke()

  const project = (x: number, z: number) => {
    const mountain =
      Math.sin(x * 0.62 + z * 0.29 + phase) * 0.66 +
      Math.sin(x * 1.05 - z * 0.34 + phase * 0.4) * 0.28 +
      Math.cos(z * 0.53 + phase * 0.6) * 0.3
    const ridge = Math.exp(-(((x - bendX) * 0.3) ** 2)) * (1 + bendY)
    const elevation = (mountain + ridge * 0.7 + 0.6) * energy
    const depth = z + 2.5
    return {
      x: width * 0.5 + (x * scale * 0.85) / depth,
      y: horizon + (height * 2.45 - elevation * height * 0.72) / depth,
    }
  }

  ctx.lineWidth = Math.max(0.65, width / 1500)
  for (let row = 48; row >= 0; row -= 1) {
    const z = 0.2 + (row / 48) ** 1.75 * 30
    ctx.beginPath()
    for (let column = 0; column <= 144; column += 1) {
      const point = project((column / 144 - 0.5) * 27, z)
      if (column === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    }
    ctx.strokeStyle =
      row % 9 === 0
        ? `rgba(255,193,204,${0.28 + (1 - row / 48) * 0.38})`
        : `rgba(255,58,91,${0.2 + (1 - row / 48) * 0.47})`
    ctx.stroke()
  }

  for (let column = 0; column <= 68; column += 1) {
    const x = (column / 68 - 0.5) * 27
    ctx.beginPath()
    for (let step = 0; step <= 90; step += 1) {
      const z = 0.2 + (step / 90) ** 1.6 * 30
      const point = project(x, z)
      if (step === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    }
    ctx.strokeStyle = column % 17 === 0 ? '#ffb2c25c' : '#b72c4947'
    ctx.stroke()
  }
}

const renderers = {
  field: drawField,
  orbit: drawOrbit,
  terrain: drawTerrain,
} satisfies Record<SignalPreset, typeof drawField>

export function drawSignal(
  ctx: CanvasRenderingContext2D,
  settings: SignalSettings,
  frame: SignalFrame,
) {
  const { width, height } = ctx.canvas
  if (width < 1 || height < 1) return
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#08070b'
  ctx.fillRect(0, 0, width, height)
  const glow = ctx.createRadialGradient(
    width * 0.52,
    height * 0.5,
    0,
    width * 0.52,
    height * 0.5,
    Math.max(width, height) * 0.65,
  )
  glow.addColorStop(0, '#48102536')
  glow.addColorStop(1, '#08070b00')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
  renderers[settings.preset](ctx, settings, frame)
  ctx.restore()
}
