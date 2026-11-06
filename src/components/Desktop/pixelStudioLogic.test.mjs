import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PIXEL_SIZE,
  PIXEL_PALETTE,
  commitPixels,
  createBlankPixels,
  createHeartPixels,
  createPixelHistory,
  paintPixelLine,
  parsePixelDraft,
  redoPixels,
  serializePixelDraft,
  undoPixels,
} from './pixelStudioLogic.ts'

test('A fast drag draws a continuous stroke and mirrored paint can be erased', () => {
  const pixels = paintPixelLine({
    pixels: createBlankPixels(),
    from: { x: 1, y: 1 },
    to: { x: 4, y: 4 },
    color: 'rose',
    mirror: true,
  })
  for (let i = 1; i <= 4; i += 1) {
    assert.equal(pixels[i * PIXEL_SIZE + i], 'rose')
    assert.equal(pixels[i * PIXEL_SIZE + PIXEL_SIZE - 1 - i], 'rose')
  }
  assert.equal(pixels.filter(Boolean).length, 8)
  const erased = paintPixelLine({
    pixels,
    from: { x: 4, y: 4 },
    to: { x: 1, y: 1 },
    color: null,
    mirror: true,
  })
  assert.deepEqual(erased, createBlankPixels())
  assert.equal(pixels.filter(Boolean).length, 8)
})

test('A whole drag is one undo, and new work clears the redo branch', () => {
  let history = createPixelHistory(createBlankPixels())
  let stroke = history.pixels
  for (let x = 0; x < 6; x += 1)
    stroke = paintPixelLine({
      pixels: stroke,
      from: { x, y: 2 },
      to: { x: x + 1, y: 2 },
      color: 'mint',
      mirror: false,
    })
  history = commitPixels(history, stroke)
  assert.equal(history.past.length, 1)
  const undone = undoPixels(history)
  assert.deepEqual(undone.pixels, createBlankPixels())
  assert.deepEqual(redoPixels(undone).pixels, stroke)
  const replacement = commitPixels(undone, createHeartPixels())
  assert.equal(replacement.future.length, 0)
  assert.equal(redoPixels(replacement), replacement)
})

test('Clear and presets can be undone; unchanged work keeps history intact', () => {
  const original = createPixelHistory(createHeartPixels())
  assert.equal(commitPixels(original, [...original.pixels]), original)
  assert.equal(undoPixels(original), original)
  const cleared = commitPixels(original, createBlankPixels())
  assert.deepEqual(undoPixels(cleared).pixels, original.pixels)
  assert.deepEqual(redoPixels(undoPixels(cleared)).pixels, createBlankPixels())
})

test('Drafts restore transparent pixels and every palette color', () => {
  const pixels = createHeartPixels()
  PIXEL_PALETTE.forEach((color, index) => {
    pixels[index] = color.id
  })
  assert.deepEqual(parsePixelDraft(serializePixelDraft(pixels)), pixels)
})

test('Malformed, incompatible and untrusted draft values are ignored', () => {
  const valid = JSON.parse(serializePixelDraft(createBlankPixels()))
  for (const value of [
    null,
    '',
    '{',
    'null',
    '[]',
    JSON.stringify({ ...valid, size: 16 }),
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, pixels: [null] }),
    JSON.stringify({ ...valid, pixels: Array(144).fill('#b91f2e') }),
    JSON.stringify({ ...valid, pixels: Array(144).fill(3) }),
    JSON.stringify({ ...valid, pixels: Array(144).fill({ color: 'rose' }) }),
  ])
    assert.equal(parsePixelDraft(value), null)
})
