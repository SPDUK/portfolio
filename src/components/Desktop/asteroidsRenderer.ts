import { ROCK_RADIUS, SPACE } from './asteroidsLogic'
import type { AsteroidsState } from './asteroidsLogic'

interface RenderOptions {
  motion: boolean
  thrust: boolean
}

function wrappedPositions(x: number, y: number, radius: number) {
  const positions: { x: number; y: number }[] = []
  for (const offsetX of [-SPACE.width, 0, SPACE.width]) {
    for (const offsetY of [-SPACE.height, 0, SPACE.height]) {
      const px = x + offsetX
      const py = y + offsetY
      if (
        px + radius >= 0 &&
        px - radius <= SPACE.width &&
        py + radius >= 0 &&
        py - radius <= SPACE.height
      )
        positions.push({ x: px, y: py })
    }
  }
  return positions
}

export function drawAsteroids(
  ctx: CanvasRenderingContext2D,
  state: AsteroidsState,
  { motion, thrust }: RenderOptions,
) {
  ctx.fillStyle = '#0a0b0f'
  ctx.fillRect(0, 0, SPACE.width, SPACE.height)
  for (let index = 0; index < 70; index += 1) {
    const x = (index * 173.3 + 29) % SPACE.width
    const y = (index * 97.7 + 43) % SPACE.height
    ctx.fillStyle = index % 7 === 0 ? '#c6bdc15e' : '#c6bdc128'
    ctx.fillRect(x, y, index % 7 === 0 ? 1.6 : 1, 1)
  }
  ctx.lineWidth = 1
  ctx.strokeStyle = '#79606a40'
  for (const [x, y, flipX, flipY] of [
    [16, 16, 1, 1],
    [584, 16, -1, 1],
    [16, 384, 1, -1],
    [584, 384, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x + flipX * 14, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + flipY * 14)
    ctx.stroke()
  }

  for (const rock of state.rocks) {
    const radius = ROCK_RADIUS[rock.size]
    for (const position of wrappedPositions(rock.x, rock.y, radius)) {
      ctx.save()
      ctx.translate(position.x, position.y)
      ctx.rotate(rock.angle)
      ctx.beginPath()
      for (let vertex = 0; vertex < 11; vertex += 1) {
        const angle = (vertex / 11) * Math.PI * 2
        const irregularity =
          0.76 + (Math.sin(rock.id * 43 + vertex * 17) + 1) * 0.12
        const px = Math.cos(angle) * radius * irregularity
        const py = Math.sin(angle) * radius * irregularity
        if (vertex === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = '#b91f2e0c'
      ctx.fill()
      ctx.strokeStyle = rock.size === 1 ? '#ff8791' : '#d74b5c'
      ctx.lineWidth = rock.size === 3 ? 1.6 : 1.2
      ctx.stroke()
      ctx.restore()
    }
  }
  if (motion) {
    for (const particle of state.particles) {
      ctx.globalAlpha = particle.ttl / particle.lifetime
      ctx.strokeStyle = '#ff7884'
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.lineTo(
        particle.x - particle.vx * 0.025,
        particle.y - particle.vy * 0.025,
      )
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
  for (const shot of state.shots) {
    ctx.strokeStyle = '#f7d5d8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(shot.x, shot.y)
    const speed = Math.hypot(shot.vx, shot.vy)
    ctx.lineTo(shot.x - (shot.vx / speed) * 6, shot.y - (shot.vy / speed) * 6)
    ctx.stroke()
  }
  if (state.status === 'lost') return
  const { ship } = state
  for (const position of wrappedPositions(ship.x, ship.y, 28)) {
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(ship.angle)
    if (ship.immunity > 0 && state.status !== 'ready') {
      ctx.strokeStyle = '#f1ece940'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 5])
      ctx.beginPath()
      ctx.arc(0, 0, 22, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
    if (thrust && motion) {
      const length = 14 + (Math.sin(state.time * 45) + 1) * 5
      ctx.beginPath()
      ctx.moveTo(-8, -4)
      ctx.lineTo(-length - 8, 0)
      ctx.lineTo(-8, 4)
      ctx.strokeStyle = '#ff6475'
      ctx.lineWidth = 1.6
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(15, 0)
    ctx.lineTo(-10, -10)
    ctx.lineTo(-6, 0)
    ctx.lineTo(-10, 10)
    ctx.closePath()
    ctx.fillStyle = '#0a0b0f'
    ctx.fill()
    ctx.strokeStyle = '#f1ece9'
    ctx.lineWidth = 1.8
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.restore()
  }
}
