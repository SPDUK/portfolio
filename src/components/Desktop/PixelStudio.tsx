import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  Download,
  Eraser,
  FlipHorizontal2,
  Heart,
  Pencil,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react'
import {
  PIXEL_PALETTE,
  PIXEL_SIZE,
  commitPixels,
  createBlankPixels,
  createHeartPixels,
  createPixelHistory,
  paintPixelLine,
  parsePixelDraft,
  redoPixels,
  serializePixelDraft,
  undoPixels,
} from './pixelStudioLogic'
import type {
  Pixel,
  PixelColor,
  PixelHistory,
  PixelPoint,
} from './pixelStudioLogic'
import './pixel-studio.css'

const DRAFT_KEY = 'eclipse-pixel-studio-v1'
const rows = Array.from({ length: PIXEL_SIZE }, (_, index) => index)
const draftLabels = {
  opening: 'Opening your canvas…',
  saved: 'Draft saved on this device.',
  session: 'Storage is unavailable. Save a PNG to keep your work.',
}
const exportLabels = {
  idle: '384 × 384 PNG · transparent background',
  saving: 'Preparing your PNG…',
  saved: 'PNG downloaded. Go show it off.',
  error: 'Couldn’t save the PNG. Try again.',
}

type Stroke = {
  pointerId: number
  node: HTMLDivElement
  pixels: Pixel[]
  last: PixelPoint
  color: Pixel
  mirror: boolean
}

function pointAt(event: React.PointerEvent<HTMLDivElement>): PixelPoint {
  const bounds = event.currentTarget.getBoundingClientRect()
  return {
    x: Math.max(
      0,
      Math.min(
        PIXEL_SIZE - 1,
        Math.floor(((event.clientX - bounds.left) / bounds.width) * PIXEL_SIZE),
      ),
    ),
    y: Math.max(
      0,
      Math.min(
        PIXEL_SIZE - 1,
        Math.floor(((event.clientY - bounds.top) / bounds.height) * PIXEL_SIZE),
      ),
    ),
  }
}

function colorName(pixel: Pixel): string {
  return PIXEL_PALETTE.find(color => color.id === pixel)?.name || 'Transparent'
}

function colorHex(pixel: Pixel): string {
  return PIXEL_PALETTE.find(color => color.id === pixel)?.hex || 'transparent'
}

export default function PixelStudio({ active }: { active: boolean }) {
  const hintId = useId()
  const [history, setHistory] = useState(() =>
    createPixelHistory(createHeartPixels()),
  )
  const [preview, setPreview] = useState<Pixel[] | null>(null)
  const [selectedColor, setSelectedColor] = useState<PixelColor>('rose')
  const [erasing, setErasing] = useState(false)
  const [mirror, setMirror] = useState(false)
  const [focusedPixel, setFocusedPixel] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [draftState, setDraftState] = useState<'opening' | 'saved' | 'session'>(
    'opening',
  )
  const [exportState, setExportState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const board = useRef<HTMLDivElement>(null)
  const historyRef = useRef(history)
  const stroke = useRef<Stroke | null>(null)
  const mounted = useRef(false)
  const download = useRef<{ url: string; timer: number } | null>(null)

  const replaceHistory = useCallback((next: PixelHistory) => {
    historyRef.current = next
    setHistory(next)
    setExportState('idle')
  }, [])

  const finishStroke = useCallback(() => {
    const { current } = stroke
    if (!current) return
    stroke.current = null
    replaceHistory(commitPixels(historyRef.current, current.pixels))
    setPreview(null)
    if (current.node.hasPointerCapture(current.pointerId))
      current.node.releasePointerCapture(current.pointerId)
  }, [replaceHistory])

  useEffect(() => {
    mounted.current = true
    try {
      const saved = parsePixelDraft(window.localStorage.getItem(DRAFT_KEY))
      if (saved) replaceHistory(createPixelHistory(saved))
    } catch {
      setDraftState('session')
    }
    setHydrated(true)
    return () => {
      mounted.current = false
      const { current } = stroke
      stroke.current = null
      if (current?.node.hasPointerCapture(current.pointerId))
        current.node.releasePointerCapture(current.pointerId)
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          serializePixelDraft(current?.pixels || historyRef.current.pixels),
        )
      } catch {
        // The drawing remains usable when device storage is unavailable.
      }
      if (download.current) {
        URL.revokeObjectURL(download.current.url)
        clearTimeout(download.current.timer)
      }
    }
  }, [replaceHistory])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        serializePixelDraft(history.pixels),
      )
      setDraftState('saved')
    } catch {
      setDraftState('session')
    }
  }, [history.pixels, hydrated])

  useEffect(() => {
    if (!active) finishStroke()
  }, [active, finishStroke])

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) finishStroke()
    }
    window.addEventListener('blur', finishStroke)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', finishStroke)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [finishStroke])

  const pixels = preview || history.pixels
  const painted = pixels.filter(pixel => pixel !== null).length
  const paintColor = erasing ? null : selectedColor

  const focusCell = (index: number) => {
    setFocusedPixel(index)
    board.current
      ?.querySelector<HTMLButtonElement>(`[data-pixel-index="${index}"]`)
      ?.focus({ preventScroll: true })
  }

  const paintCell = (index: number) => {
    if (!active) return
    finishStroke()
    const point = { x: index % PIXEL_SIZE, y: Math.floor(index / PIXEL_SIZE) }
    replaceHistory(
      commitPixels(
        historyRef.current,
        paintPixelLine({
          pixels: historyRef.current.pixels,
          from: point,
          to: point,
          color: paintColor,
          mirror,
        }),
      ),
    )
  }

  const undo = () => {
    finishStroke()
    replaceHistory(undoPixels(historyRef.current))
  }

  const redo = () => {
    finishStroke()
    replaceHistory(redoPixels(historyRef.current))
  }

  const applyPreset = (next: Pixel[]) => {
    finishStroke()
    replaceHistory(commitPixels(historyRef.current, next))
  }

  const startStroke = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || event.button !== 0 || stroke.current) return
    event.preventDefault()
    const point = pointAt(event)
    focusCell(point.y * PIXEL_SIZE + point.x)
    event.currentTarget.setPointerCapture(event.pointerId)
    const next = paintPixelLine({
      pixels: historyRef.current.pixels,
      from: point,
      to: point,
      color: paintColor,
      mirror,
    })
    stroke.current = {
      pointerId: event.pointerId,
      node: event.currentTarget,
      pixels: next,
      last: point,
      color: paintColor,
      mirror,
    }
    setPreview(next)
    setExportState('idle')
  }

  const moveStroke = (event: React.PointerEvent<HTMLDivElement>) => {
    const { current } = stroke
    if (!active || !current || current.pointerId !== event.pointerId) return
    const point = pointAt(event)
    current.pixels = paintPixelLine({
      pixels: current.pixels,
      from: current.last,
      to: point,
      color: current.color,
      mirror: current.mirror,
    })
    current.last = point
    setPreview(current.pixels)
  }

  const cellKey = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!active || event.ctrlKey || event.metaKey || event.altKey) return
    const x = index % PIXEL_SIZE
    const y = Math.floor(index / PIXEL_SIZE)
    let next = index
    switch (event.key) {
      case 'ArrowLeft':
        next = y * PIXEL_SIZE + Math.max(0, x - 1)
        break
      case 'ArrowRight':
        next = y * PIXEL_SIZE + Math.min(PIXEL_SIZE - 1, x + 1)
        break
      case 'ArrowUp':
        next = Math.max(0, y - 1) * PIXEL_SIZE + x
        break
      case 'ArrowDown':
        next = Math.min(PIXEL_SIZE - 1, y + 1) * PIXEL_SIZE + x
        break
      case 'Home':
        next = y * PIXEL_SIZE
        break
      case 'End':
        next = y * PIXEL_SIZE + PIXEL_SIZE - 1
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        paintCell(index)
        return
      default:
        return
    }
    event.preventDefault()
    focusCell(next)
  }

  const exportPng = () => {
    finishStroke()
    setExportState('saving')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 384
      canvas.height = 384
      const context = canvas.getContext('2d')
      if (!context) {
        setExportState('error')
        return
      }
      historyRef.current.pixels.forEach((pixel, index) => {
        if (pixel === null) return
        context.fillStyle = colorHex(pixel)
        context.fillRect(
          (index % PIXEL_SIZE) * 32,
          Math.floor(index / PIXEL_SIZE) * 32,
          32,
          32,
        )
      })
      canvas.toBlob(blob => {
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
        link.download = 'pixel-studio.png'
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

  return (
    <section className="os-play-toy os-pixel" aria-label="Pixel Studio">
      <header className="os-play-header">
        <h2>Pixel Studio</h2>
        <p>A tiny canvas. Room for a little character.</p>
      </header>

      <div className="os-pixel-workbench">
        <div className="os-pixel-canvas-area">
          <div className="os-pixel-measure" aria-hidden="true">
            <span>12 × 12</span>
            <span>{painted} / 144 pixels</span>
          </div>
          <div
            className="os-pixel-board"
            ref={board}
            role="grid"
            tabIndex={-1}
            aria-label="Drawing canvas"
            aria-describedby={hintId}
            aria-rowcount={PIXEL_SIZE}
            aria-colcount={PIXEL_SIZE}
            aria-disabled={!active}
            data-mirror={mirror}
            data-erasing={erasing}
            onKeyDown={event => {
              if (!active || !(event.ctrlKey || event.metaKey) || event.altKey)
                return
              if (event.key.toLowerCase() === 'z') {
                event.preventDefault()
                if (event.shiftKey) redo()
                else undo()
              } else if (event.key.toLowerCase() === 'y') {
                event.preventDefault()
                redo()
              }
            }}
            onPointerDown={startStroke}
            onPointerMove={moveStroke}
            onPointerUp={event => {
              if (stroke.current?.pointerId === event.pointerId) finishStroke()
            }}
            onPointerCancel={event => {
              if (stroke.current?.pointerId === event.pointerId) finishStroke()
            }}
            onLostPointerCapture={event => {
              if (stroke.current?.pointerId === event.pointerId) finishStroke()
            }}
          >
            {rows.map(y => (
              <div className="os-pixel-row" role="row" key={y}>
                {rows.map(x => {
                  const index = y * PIXEL_SIZE + x
                  return (
                    <button
                      type="button"
                      role="gridcell"
                      key={x}
                      data-pixel-index={index}
                      aria-label={`Row ${y + 1}, column ${x + 1}: ${colorName(pixels[index])}`}
                      tabIndex={active && focusedPixel === index ? 0 : -1}
                      style={{ backgroundColor: colorHex(pixels[index]) }}
                      onFocus={() => setFocusedPixel(index)}
                      onKeyDown={event => cellKey(event, index)}
                      onClick={event => {
                        if (event.detail === 0) paintCell(index)
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <p className="os-play-note os-pixel-hint" id={hintId}>
            Drag to draw. Or use arrow keys, then Space to paint.
          </p>
        </div>

        <div className="os-pixel-tools">
          <fieldset className="os-pixel-palette" disabled={!active}>
            <legend>Make your mark</legend>
            <div className="os-pixel-swatches">
              {PIXEL_PALETTE.map(color => (
                <button
                  type="button"
                  key={color.id}
                  aria-label={color.name}
                  title={color.name}
                  aria-pressed={!erasing && selectedColor === color.id}
                  onClick={() => {
                    finishStroke()
                    setSelectedColor(color.id)
                    setErasing(false)
                  }}
                >
                  <span style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </fieldset>
          <span className="os-pixel-current">
            {erasing ? 'Transparent' : colorName(selectedColor)}
          </span>
          <div className="os-pixel-tool-buttons">
            <button
              type="button"
              aria-pressed={!erasing}
              disabled={!active}
              onClick={() => {
                finishStroke()
                setErasing(false)
              }}
            >
              <Pencil size={16} aria-hidden="true" /> Pencil
            </button>
            <button
              type="button"
              aria-pressed={erasing}
              disabled={!active}
              onClick={() => {
                finishStroke()
                setErasing(true)
              }}
            >
              <Eraser size={16} aria-hidden="true" /> Eraser
            </button>
            <button
              type="button"
              aria-pressed={mirror}
              disabled={!active}
              onClick={() => {
                finishStroke()
                setMirror(current => !current)
              }}
            >
              <FlipHorizontal2 size={16} aria-hidden="true" /> Mirror
            </button>
          </div>
          <p className="os-play-note os-pixel-mirror-note">
            {mirror
              ? 'Both sides, in perfect sync.'
              : 'Mirror your next bright idea.'}
          </p>
        </div>
      </div>

      <div className="os-play-actions os-pixel-actions">
        <div className="os-pixel-history">
          <button
            type="button"
            aria-label="Undo"
            title="Undo (Ctrl or Command + Z)"
            disabled={!active || (!history.past.length && !preview)}
            onClick={undo}
          >
            <Undo2 size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo (Ctrl or Command + Shift + Z)"
            disabled={!active || !history.future.length}
            onClick={redo}
          >
            <Redo2 size={17} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          disabled={!active}
          onClick={() => applyPreset(createHeartPixels())}
        >
          <Heart size={16} aria-hidden="true" /> Heart preset
        </button>
        <button
          type="button"
          disabled={!active || painted === 0}
          onClick={() => applyPreset(createBlankPixels())}
        >
          <Trash2 size={16} aria-hidden="true" /> Clear
        </button>
        <button
          type="button"
          className="os-play-primary os-pixel-export"
          disabled={!active || exportState === 'saving'}
          onClick={exportPng}
        >
          <Download size={16} aria-hidden="true" />
          {exportState === 'saving' ? 'Saving…' : 'Save PNG'}
        </button>
      </div>
      <div className="os-pixel-footer">
        <p className="os-play-note">{draftLabels[draftState]}</p>
        <p className="os-play-note" role="status" aria-live="polite">
          {exportLabels[exportState]}
        </p>
      </div>
    </section>
  )
}
