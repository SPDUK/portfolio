export const PIXEL_SIZE = 12

export type PixelColor =
  | 'ink'
  | 'cloud'
  | 'crimson'
  | 'rose'
  | 'peach'
  | 'gold'
  | 'mint'
  | 'cyan'
  | 'blue'
  | 'violet'

export const PIXEL_PALETTE: {
  id: PixelColor
  name: string
  hex: string
}[] = [
  { id: 'ink', name: 'Ink', hex: '#252735' },
  { id: 'cloud', name: 'Cloud', hex: '#f3f3f5' },
  { id: 'crimson', name: 'Crimson', hex: '#b91f2e' },
  { id: 'rose', name: 'Rose', hex: '#ff7185' },
  { id: 'peach', name: 'Peach', hex: '#ffba91' },
  { id: 'gold', name: 'Gold', hex: '#f9d66a' },
  { id: 'mint', name: 'Mint', hex: '#87d4ad' },
  { id: 'cyan', name: 'Ice', hex: '#8fdbef' },
  { id: 'blue', name: 'Blue', hex: '#718fe9' },
  { id: 'violet', name: 'Lilac', hex: '#bb9de7' },
]

export type Pixel = PixelColor | null
export type PixelPoint = { x: number; y: number }
export type PixelHistory = {
  pixels: Pixel[]
  past: Pixel[][]
  future: Pixel[][]
}

const HISTORY_LIMIT = 50

export function createBlankPixels(): Pixel[] {
  return Array.from({ length: PIXEL_SIZE * PIXEL_SIZE }, (): Pixel => null)
}

export function createHeartPixels(): Pixel[] {
  const pixels = createBlankPixels()
  const heart = [
    '............',
    '............',
    '...##..##...',
    '..########..',
    '.##########.',
    '.##########.',
    '..########..',
    '...######...',
    '....####....',
    '.....##.....',
    '............',
    '............',
  ]
  heart.forEach((row, y) => {
    Array.from(row).forEach((cell, x) => {
      if (cell === '#') pixels[y * PIXEL_SIZE + x] = 'crimson'
    })
  })
  for (const index of [3 * PIXEL_SIZE + 3, 4 * PIXEL_SIZE + 2])
    pixels[index] = 'rose'
  return pixels
}

export function createPixelHistory(pixels: Pixel[]): PixelHistory {
  return { pixels: [...pixels], past: [], future: [] }
}

export function commitPixels(
  history: PixelHistory,
  pixels: Pixel[],
): PixelHistory {
  if (history.pixels.every((pixel, index) => pixel === pixels[index]))
    return history
  return {
    pixels: [...pixels],
    past: [...history.past, history.pixels].slice(-HISTORY_LIMIT),
    future: [],
  }
}

export function undoPixels(history: PixelHistory): PixelHistory {
  const pixels = history.past[history.past.length - 1]
  if (!pixels) return history
  return {
    pixels,
    past: history.past.slice(0, -1),
    future: [history.pixels, ...history.future],
  }
}

export function redoPixels(history: PixelHistory): PixelHistory {
  const pixels = history.future[0]
  if (!pixels) return history
  return {
    pixels,
    past: [...history.past, history.pixels],
    future: history.future.slice(1),
  }
}

export function paintPixelLine({
  pixels,
  from,
  to,
  color,
  mirror,
}: {
  pixels: Pixel[]
  from: PixelPoint
  to: PixelPoint
  color: Pixel
  mirror: boolean
}): Pixel[] {
  const next = [...pixels]
  let { x, y } = from
  const dx = Math.abs(to.x - from.x)
  const dy = -Math.abs(to.y - from.y)
  const stepX = from.x < to.x ? 1 : -1
  const stepY = from.y < to.y ? 1 : -1
  let error = dx + dy
  for (;;) {
    if (x >= 0 && x < PIXEL_SIZE && y >= 0 && y < PIXEL_SIZE) {
      next[y * PIXEL_SIZE + x] = color
      if (mirror) next[y * PIXEL_SIZE + PIXEL_SIZE - 1 - x] = color
    }
    if (x === to.x && y === to.y) break
    const twiceError = 2 * error
    if (twiceError >= dy) {
      error += dy
      x += stepX
    }
    if (twiceError <= dx) {
      error += dx
      y += stepY
    }
  }
  return next
}

function isPixel(input: unknown): input is Pixel {
  return input === null || PIXEL_PALETTE.some(color => color.id === input)
}

export function serializePixelDraft(pixels: Pixel[]): string {
  return JSON.stringify({ version: 1, size: PIXEL_SIZE, pixels })
}

export function parsePixelDraft(input: string | null): Pixel[] | null {
  if (!input) return null
  try {
    const draft: unknown = JSON.parse(input)
    if (
      typeof draft !== 'object' ||
      draft === null ||
      !('version' in draft) ||
      draft.version !== 1 ||
      !('size' in draft) ||
      draft.size !== PIXEL_SIZE ||
      !('pixels' in draft) ||
      !Array.isArray(draft.pixels) ||
      draft.pixels.length !== PIXEL_SIZE * PIXEL_SIZE ||
      !draft.pixels.every(isPixel)
    )
      return null
    return [...draft.pixels]
  } catch {
    return null
  }
}
