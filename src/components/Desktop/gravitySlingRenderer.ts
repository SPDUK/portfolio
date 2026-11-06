import { SLING_SPACE } from './gravitySlingLogic'
import type {
  SlingAim,
  SlingCourse,
  SlingPoint,
  SlingShot,
} from './gravitySlingLogic'

interface SlingScene {
  course: SlingCourse
  aim: SlingAim
  shot: SlingShot | null
  previousTrail: readonly SlingPoint[]
  preview: readonly SlingPoint[]
}

function path(ctx: CanvasRenderingContext2D, points: readonly SlingPoint[]) {
  ctx.beginPath()
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y)
    else ctx.lineTo(point.x, point.y)
  })
  ctx.stroke()
}

function circle(
  ctx: CanvasRenderingContext2D,
  center: SlingPoint,
  radius: number,
) {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
}

export function drawGravitySling(
  ctx: CanvasRenderingContext2D,
  { course, aim, shot, previousTrail, preview }: SlingScene,
) {
  const { width, height } = ctx.canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#0b0b0f'
  ctx.fillRect(0, 0, width, height)
  const scale = Math.min(width / SLING_SPACE.width, height / SLING_SPACE.height)
  ctx.setTransform(
    scale,
    0,
    0,
    scale,
    (width - SLING_SPACE.width * scale) / 2,
    (height - SLING_SPACE.height * scale) / 2,
  )
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, SLING_SPACE.width, SLING_SPACE.height)
  ctx.clip()

  ctx.lineWidth = 1
  ctx.strokeStyle = '#38252c'
  for (const radius of [course.body.radius + 28, 124, 185]) {
    circle(ctx, course.body, radius)
    ctx.stroke()
  }
  ctx.strokeStyle = '#65404a'
  for (let index = 0; index < 12; index += 1) {
    const angle = (index * Math.PI) / 6
    const radius = course.body.radius + 8
    ctx.beginPath()
    ctx.moveTo(
      course.body.x + Math.cos(angle) * radius,
      course.body.y + Math.sin(angle) * radius,
    )
    ctx.lineTo(
      course.body.x + Math.cos(angle) * (radius + 4),
      course.body.y + Math.sin(angle) * (radius + 4),
    )
    ctx.stroke()
  }
  circle(ctx, course.body, course.body.radius)
  ctx.fillStyle = '#2a1a20'
  ctx.fill()
  ctx.strokeStyle = '#ac606c'
  ctx.lineWidth = 1.5
  ctx.stroke()
  circle(ctx, course.body, course.body.radius - 7)
  ctx.strokeStyle = '#61333e'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.strokeStyle = '#b87983'
  ctx.beginPath()
  ctx.moveTo(course.body.x - 5, course.body.y)
  ctx.lineTo(course.body.x + 5, course.body.y)
  ctx.moveTo(course.body.x, course.body.y - 5)
  ctx.lineTo(course.body.x, course.body.y + 5)
  ctx.stroke()

  if (!shot && previousTrail.length) {
    ctx.strokeStyle = '#65525b'
    ctx.lineWidth = 1.4
    path(ctx, previousTrail)
  }
  if (!shot) {
    ctx.setLineDash([5, 6])
    ctx.strokeStyle = '#e3a4ae'
    ctx.lineWidth = 1.6
    path(ctx, preview)
    ctx.setLineDash([])
    const angle = (-aim.angle * Math.PI) / 180
    const length = 28
    const tip = {
      x: course.launch.x + Math.cos(angle) * length,
      y: course.launch.y + Math.sin(angle) * length,
    }
    ctx.strokeStyle = '#f5e4e8'
    ctx.beginPath()
    ctx.moveTo(
      tip.x - Math.cos(angle - 0.5) * 8,
      tip.y - Math.sin(angle - 0.5) * 8,
    )
    ctx.lineTo(tip.x, tip.y)
    ctx.lineTo(
      tip.x - Math.cos(angle + 0.5) * 8,
      tip.y - Math.sin(angle + 0.5) * 8,
    )
    ctx.stroke()
  }

  circle(ctx, course.receiver, course.receiver.radius)
  ctx.strokeStyle = shot?.phase === 'hit' ? '#ffd8d9' : '#ff8391'
  ctx.lineWidth = shot?.phase === 'hit' ? 3 : 2
  ctx.stroke()
  if (shot?.phase === 'hit') {
    circle(ctx, course.receiver, course.receiver.radius + 7)
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.strokeStyle = '#ab5b69'
  ctx.lineWidth = 1
  for (let index = 0; index < 4; index += 1) {
    const angle = (index * Math.PI) / 2
    ctx.beginPath()
    ctx.moveTo(
      course.receiver.x + Math.cos(angle) * (course.receiver.radius + 5),
      course.receiver.y + Math.sin(angle) * (course.receiver.radius + 5),
    )
    ctx.lineTo(
      course.receiver.x + Math.cos(angle) * (course.receiver.radius + 12),
      course.receiver.y + Math.sin(angle) * (course.receiver.radius + 12),
    )
    ctx.stroke()
  }

  circle(ctx, course.launch, 8)
  ctx.fillStyle = '#0b0b0f'
  ctx.fill()
  ctx.strokeStyle = '#f0dcdf'
  ctx.lineWidth = 1.5
  ctx.stroke()
  circle(ctx, course.launch, 2)
  ctx.fillStyle = '#f0dcdf'
  ctx.fill()

  if (shot) {
    ctx.strokeStyle = '#ff7d8b'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    path(ctx, [...shot.trail, shot.position])
    circle(ctx, shot.position, shot.phase === 'hit' ? 5 : 4)
    ctx.fillStyle = '#ffe9e9'
    ctx.fill()
    if (shot.phase === 'collision') {
      ctx.strokeStyle = '#ff7d8b'
      ctx.beginPath()
      ctx.moveTo(shot.position.x - 6, shot.position.y - 6)
      ctx.lineTo(shot.position.x + 6, shot.position.y + 6)
      ctx.moveTo(shot.position.x + 6, shot.position.y - 6)
      ctx.lineTo(shot.position.x - 6, shot.position.y + 6)
      ctx.stroke()
    }
  }

  ctx.font = '11px "IBM Plex Mono", monospace'
  ctx.fillStyle = '#d3b5bf'
  ctx.textAlign = 'center'
  ctx.fillText('LAUNCH', course.launch.x, course.launch.y + 29)
  ctx.fillText(
    'RECEIVER',
    course.receiver.x,
    course.receiver.y + course.receiver.radius + 30,
  )
  ctx.fillStyle = '#c794a1'
  ctx.fillText(
    'GRAVITY',
    course.body.x,
    course.body.y + course.body.radius + 31,
  )
  ctx.restore()
}
