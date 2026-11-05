import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  ImageOff,
  RotateCcw,
  X,
} from 'lucide-react'
import { z } from 'zod'
import './photography.css'

const variantSchema = z.object({
  src: z.string().regex(/^\/photography\/[a-f0-9]{20}-\d+\.webp$/),
  width: z.number().int().positive(),
})
const photoSchema = z.object({
  id: z.string().min(1).brand<'PhotoId'>(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  variants: z.tuple([variantSchema]).rest(variantSchema),
})
const photosSchema = z
  .array(photoSchema)
  .refine(
    photos => new Set(photos.map(photo => photo.id)).size === photos.length,
    'Photograph IDs must be unique',
  )
const manifestSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('original'), photos: photosSchema }),
  z.object({
    kind: z.literal('demo'),
    source: z
      .url()
      .refine(url => new URL(url).origin === 'https://images.unsplash.com'),
    photos: photosSchema,
  }),
])
type Manifest = z.infer<typeof manifestSchema>
type Photo = Manifest['photos'][number]
type Page =
  | { kind: 'awaiting-tail'; count: number; tail: Photo['id'] }
  | { kind: 'available'; count: number }
  | { kind: 'complete'; count: number }
type Catalog =
  | { kind: 'loading' }
  | { kind: 'ready'; manifest: Manifest; page: Page }
  | { kind: 'error' }
type CatalogAction =
  | { kind: 'request' }
  | { kind: 'loaded'; manifest: Manifest }
  | { kind: 'failed' }
  | { kind: 'settled'; id: Photo['id'] }
  | { kind: 'more' }
type GalleryImage = { src: string; width: number }
type GalleryPhase =
  | { kind: 'idle' }
  | {
      kind: 'requesting'
      previous: GalleryImage | null
      attemptedWidth: number
    }
  | { kind: 'decoded'; image: GalleryImage }
  | { kind: 'error'; previous: GalleryImage | null; attemptedWidth: number }
type GalleryEntry = {
  photo: Photo
  index: number
  node: HTMLButtonElement | null
  visible: boolean
  width: number
  phase: GalleryPhase
}
type Frame = { photo: Photo; index: number }
type Viewer =
  | { kind: 'closed' }
  | { kind: 'loading'; target: Frame; previous: Frame | null }
  | { kind: 'transitioning'; current: Frame; previous: Frame | null }
  | { kind: 'ready'; current: Frame }
  | { kind: 'error'; target: Frame; previous: Frame | null }
interface PhotographyProps {
  active: boolean
  motion: boolean
}

const PAGE_SIZE = 12
const FILMSTRIP_SIZE = 7
const EMPTY_PHOTOS: Photo[] = []
const fullSource = (photo: Photo) =>
  photo.variants[photo.variants.length - 1].src

function galleryImage(phase: GalleryPhase): GalleryImage | null {
  if (phase.kind === 'decoded') return phase.image
  if (phase.kind === 'requesting' || phase.kind === 'error')
    return phase.previous
  return null
}

function filmstripStart(index: number, total: number) {
  return Math.max(
    0,
    Math.min(index - Math.floor(FILMSTRIP_SIZE / 2), total - FILMSTRIP_SIZE),
  )
}

function pageFor(photos: Photo[], count: number): Page {
  const tail = photos[count - 1]
  return count >= photos.length || !tail
    ? { kind: 'complete', count }
    : { kind: 'awaiting-tail', count, tail: tail.id }
}

function catalogReducer(state: Catalog, action: CatalogAction): Catalog {
  switch (action.kind) {
    case 'request':
      return { kind: 'loading' }
    case 'loaded':
      return {
        kind: 'ready',
        manifest: action.manifest,
        page: pageFor(
          action.manifest.photos,
          Math.min(PAGE_SIZE, action.manifest.photos.length),
        ),
      }
    case 'failed':
      return { kind: 'error' }
    case 'settled':
      return state.kind === 'ready' &&
        state.page.kind === 'awaiting-tail' &&
        state.page.tail === action.id
        ? { ...state, page: { kind: 'available', count: state.page.count } }
        : state
    case 'more':
      return state.kind === 'ready' && state.page.kind === 'available'
        ? {
            ...state,
            page: pageFor(
              state.manifest.photos,
              Math.min(
                state.page.count + PAGE_SIZE,
                state.manifest.photos.length,
              ),
            ),
          }
        : state
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

function useGalleryAdmission({
  root,
  enabled,
  onSettled,
}: {
  root: React.RefObject<HTMLDivElement>
  enabled: boolean
  onSettled: (id: Photo['id']) => void
}) {
  const entries = useRef(new Map<Photo['id'], GalleryEntry>())
  const observer = useRef<IntersectionObserver | null>(null)
  const sizeObserver = useRef<ResizeObserver | null>(null)
  const nodes = useRef(new Map<Element, GalleryEntry>())
  const options = useRef({ enabled, onSettled })
  const mounted = useRef(false)
  const [, publish] = useReducer((value: number) => value + 1, 0)
  options.current = { enabled, onSettled }

  const drain = useCallback(function admit() {
    if (!mounted.current || !options.current.enabled) return
    const all = [...entries.current.values()]
    let slots =
      2 - all.filter(entry => entry.phase.kind === 'requesting').length
    const queue = all
      .flatMap(entry => {
        if (!entry.visible || !entry.node || entry.phase.kind === 'requesting')
          return []
        const desiredWidth =
          (entry.width || entry.node.clientWidth) * window.devicePixelRatio
        const variant =
          entry.photo.variants.find(
            candidate => candidate.width >= desiredWidth,
          ) ?? entry.photo.variants[entry.photo.variants.length - 1]
        if (
          entry.phase.kind === 'decoded' &&
          variant.width <= entry.phase.image.width
        )
          return []
        if (
          entry.phase.kind === 'error' &&
          variant.width <= entry.phase.attemptedWidth
        )
          return []
        return [{ entry, variant }]
      })
      .sort((first, second) => first.entry.index - second.entry.index)
    for (const { entry, variant } of queue) {
      if (slots <= 0) break
      slots -= 1
      const previous = galleryImage(entry.phase)
      entry.phase = {
        kind: 'requesting',
        previous,
        attemptedWidth: variant.width,
      }
      const image = new window.Image()
      image.decoding = 'async'
      image.src = variant.src
      image
        .decode()
        .then(
          () => {
            entry.phase = {
              kind: 'decoded',
              image: { src: variant.src, width: variant.width },
            }
          },
          () => {
            entry.phase = {
              kind: 'error',
              previous,
              attemptedWidth: variant.width,
            }
          },
        )
        .then(() => {
          if (!mounted.current) return
          publish()
          options.current.onSettled(entry.photo.id)
          admit()
        })
    }
    if (queue.length && slots < 2) publish()
  }, [])

  const register = useCallback(
    (photo: Photo, index: number, node: HTMLButtonElement | null) => {
      const existing = entries.current.get(photo.id)
      if (existing?.node) {
        observer.current?.unobserve(existing.node)
        sizeObserver.current?.unobserve(existing.node)
        nodes.current.delete(existing.node)
      }
      const entry: GalleryEntry = existing ?? {
        photo,
        index,
        node: null,
        visible: false,
        width: 0,
        phase: { kind: 'idle' },
      }
      entry.node = node
      entry.visible = false
      entries.current.set(photo.id, entry)
      if (node) {
        nodes.current.set(node, entry)
        observer.current?.observe(node)
        sizeObserver.current?.observe(node)
      }
    },
    [],
  )

  useEffect(() => {
    mounted.current = true
    const intersection = new IntersectionObserver(
      changes => {
        for (const change of changes) {
          const entry = nodes.current.get(change.target)
          if (entry)
            entry.visible =
              change.isIntersecting && change.intersectionRatio > 0
        }
        drain()
      },
      { root: root.current, rootMargin: '0px', threshold: 0.001 },
    )
    observer.current = intersection
    const resize = new ResizeObserver(changes => {
      for (const change of changes) {
        const entry = nodes.current.get(change.target)
        if (entry) entry.width = change.contentRect.width
      }
      drain()
    })
    sizeObserver.current = resize
    nodes.current.forEach((_, node) => {
      intersection.observe(node)
      resize.observe(node)
    })
    window.addEventListener('resize', drain)
    return () => {
      mounted.current = false
      intersection.disconnect()
      resize.disconnect()
      observer.current = null
      sizeObserver.current = null
      window.removeEventListener('resize', drain)
    }
  }, [drain, root])

  useEffect(() => {
    drain()
  }, [enabled, drain])
  return { entries: entries.current, register }
}

function PhotoButton({
  photo,
  index,
  featured,
  phase,
  register,
  onOpen,
}: {
  photo: Photo
  index: number
  featured: boolean
  phase: GalleryPhase
  register: (
    photo: Photo,
    index: number,
    node: HTMLButtonElement | null,
  ) => void
  onOpen: (frame: Frame, opener: HTMLButtonElement) => void
}) {
  const image = galleryImage(phase)
  const attach = useCallback(
    (node: HTMLButtonElement | null) => register(photo, index, node),
    [photo, index, register],
  )
  return (
    <button
      ref={attach}
      className={`os-photo-tile ${featured ? 'os-photo-feature' : ''}`}
      data-phase={phase.kind}
      type="button"
      onClick={event => onOpen({ photo, index }, event.currentTarget)}
      aria-label={`View photograph ${index + 1} fullscreen`}
      aria-busy={phase.kind === 'idle' || phase.kind === 'requesting'}
    >
      {phase.kind === 'error' && !image && (
        <span className="os-photo-tile-error">
          <ImageOff size={24} />
          <span>Photograph unavailable</span>
          <small>Select to try the full image</small>
        </span>
      )}
      {image && (
        <img
          src={image.src}
          width={photo.width}
          height={photo.height}
          alt={`Travel photograph ${index + 1}`}
          decoding="async"
        />
      )}
      <span className="os-photo-expand" aria-hidden="true">
        <Expand size={16} />
        {featured && <span>View photograph</span>}
      </span>
    </button>
  )
}

function FilmstripThumbnail({ photo }: { photo: Photo }) {
  const [phase, setPhase] = useState<'requesting' | 'decoded' | 'error'>(
    'requesting',
  )
  if (phase === 'error') return <ImageOff size={16} aria-hidden="true" />
  return (
    <img
      src={photo.variants[0].src}
      width={photo.width}
      height={photo.height}
      alt=""
      decoding="async"
      data-ready={phase === 'decoded'}
      onLoad={event => {
        event.currentTarget.decode().then(
          () => setPhase('decoded'),
          () => setPhase('error'),
        )
      }}
      onError={() => setPhase('error')}
    />
  )
}

function Filmstrip({
  photos,
  startIndex,
  selected,
  locked,
  choose,
}: {
  photos: Photo[]
  startIndex: number
  selected: Photo['id']
  locked: boolean
  choose: (index: number) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const [admitted, setAdmitted] = useState(new Set<Photo['id']>())
  useEffect(() => {
    const strip = root.current
    if (!strip) return undefined
    strip
      .querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const nodes = new Map<Element, Photo['id']>()
    const observer = new IntersectionObserver(
      changes => {
        const visible = changes
          .filter(
            change => change.isIntersecting && change.intersectionRatio > 0,
          )
          .flatMap(change => {
            const id = nodes.get(change.target)
            return id ? [id] : []
          })
        if (visible.length)
          setAdmitted(previous => new Set([...previous, ...visible]))
      },
      { root: strip, rootMargin: '0px', threshold: 0.001 },
    )
    strip.querySelectorAll('button').forEach((button, index) => {
      const photo = photos[index]
      if (photo) {
        nodes.set(button, photo.id)
        observer.observe(button)
      }
    })
    return () => observer.disconnect()
  }, [photos, selected])
  return (
    <div
      ref={root}
      className="os-photo-filmstrip"
      aria-label="Choose a photograph"
    >
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          data-photo-index={startIndex + index}
          aria-label={`View photograph ${startIndex + index + 1}`}
          aria-current={selected === photo.id ? 'true' : undefined}
          aria-disabled={locked}
          onClick={() => choose(startIndex + index)}
        >
          {admitted.has(photo.id) && <FilmstripThumbnail photo={photo} />}
        </button>
      ))}
    </div>
  )
}

function selectedFrame(viewer: Viewer): Frame | null {
  if (viewer.kind === 'closed') return null
  if (viewer.kind === 'ready' || viewer.kind === 'transitioning')
    return viewer.current
  return viewer.target
}

function displayedFrame(viewer: Viewer): Frame | null {
  if (viewer.kind === 'ready' || viewer.kind === 'transitioning')
    return viewer.current
  if (viewer.kind === 'loading' || viewer.kind === 'error')
    return viewer.previous
  return null
}

export default function Photography({ active, motion }: PhotographyProps) {
  const [catalog, dispatchCatalog] = useReducer(catalogReducer, {
    kind: 'loading',
  })
  const [catalogRetry, setCatalogRetry] = useState(0)
  const [viewer, setViewer] = useState<Viewer>({ kind: 'closed' })
  const [systemMotion, setSystemMotion] = useState(true)
  const root = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeControl = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const activeRef = useRef(active)
  const fullRequest = useRef<Promise<void> | null>(null)
  const previousCount = useRef(0)
  const captionId = useId()
  const photos =
    catalog.kind === 'ready' ? catalog.manifest.photos : EMPTY_PHOTOS
  const count = catalog.kind === 'ready' ? catalog.page.count : 0
  const selected = selectedFrame(viewer)
  const displayed = displayedFrame(viewer)
  const locked = viewer.kind === 'loading' || viewer.kind === 'transitioning'
  const motionEnabled = motion && systemMotion
  const onSettled = useCallback((id: Photo['id']) => {
    dispatchCatalog({ kind: 'settled', id })
  }, [])
  const gallery = useGalleryAdmission({
    root,
    enabled: active && viewer.kind === 'closed',
    onSettled,
  })
  const stripStart = filmstripStart(selected?.index ?? 0, photos.length)
  const stripPhotos = useMemo(
    () => photos.slice(stripStart, stripStart + FILMSTRIP_SIZE),
    [photos, stripStart],
  )
  activeRef.current = active

  const close = useCallback(() => {
    dialog.current?.close()
    setViewer({ kind: 'closed' })
    if (activeRef.current && opener.current?.isConnected)
      opener.current.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemMotion(!preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    dispatchCatalog({ kind: 'request' })
    const load = async () => {
      try {
        const response = await fetch('/photography/manifest.json', {
          signal: controller.signal,
        })
        if (!response.ok)
          throw new Error('The photograph collection could not be loaded')
        const payload: unknown = await response.json()
        const manifest = manifestSchema.parse(payload)
        if (!controller.signal.aborted)
          dispatchCatalog({ kind: 'loaded', manifest })
      } catch {
        if (!controller.signal.aborted) dispatchCatalog({ kind: 'failed' })
      }
    }
    load()
    return () => controller.abort()
  }, [catalogRetry])

  useEffect(() => {
    if (count > previousCount.current && previousCount.current > 0) {
      const first = photos[previousCount.current]
      if (first)
        gallery.entries.get(first.id)?.node?.focus({ preventScroll: true })
    }
    previousCount.current = count
  }, [count, photos, gallery.entries])

  useEffect(() => {
    const node = dialog.current
    if (!node) return
    if (active && selected) {
      if (!node.open) node.showModal()
    } else {
      const button = opener.current
      const wasInert = button?.inert
      // Native focus restoration must not reactivate an inactive app.
      if (button && !active) button.inert = true
      node.close()
      if (button && !active) button.inert = wasInert ?? false
      setViewer(current =>
        current.kind === 'closed' ? current : { kind: 'closed' },
      )
    }
  }, [active, selected])

  useEffect(() => {
    const node = dialog.current
    return () => node?.close()
  }, [])

  useEffect(() => {
    if (viewer.kind !== 'loading') return undefined
    let cancelled = false
    const { target, previous } = viewer
    const prepare = async () => {
      await fullRequest.current
      if (cancelled) return
      const image = new window.Image()
      image.decoding = 'async'
      image.src = fullSource(target.photo)
      const request = image.decode()
      const settled = request.then<void, void>(
        () => {},
        () => {},
      )
      fullRequest.current = settled
      try {
        await request
        if (!cancelled)
          setViewer(current =>
            current.kind === 'loading' && current.target === target
              ? { kind: 'transitioning', current: target, previous }
              : current,
          )
      } catch {
        if (!cancelled)
          setViewer(current =>
            current.kind === 'loading' && current.target === target
              ? { kind: 'error', target, previous }
              : current,
          )
      } finally {
        if (fullRequest.current === settled) fullRequest.current = null
      }
    }
    prepare()
    return () => {
      cancelled = true
    }
  }, [viewer])

  useEffect(() => {
    if (viewer.kind !== 'transitioning') return undefined
    const finish = () =>
      setViewer(current =>
        current.kind === 'transitioning'
          ? { kind: 'ready', current: current.current }
          : current,
      )
    if (!motionEnabled) {
      finish()
      return undefined
    }
    const timeout = window.setTimeout(finish, 1100)
    return () => window.clearTimeout(timeout)
  }, [viewer, motionEnabled])

  const openPhoto = (frame: Frame, button: HTMLButtonElement) => {
    opener.current = button
    setViewer({ kind: 'loading', target: frame, previous: null })
  }
  const choosePhoto = (index: number) => {
    const photo = photos[index]
    if (!photo || !selected || locked || index === selected.index) return
    const focused = dialog.current?.querySelector<HTMLButtonElement>(
      '.os-photo-filmstrip button:focus',
    )
    if (focused) {
      const focusedIndex = Number(focused.dataset.photoIndex)
      const nextStart = filmstripStart(index, photos.length)
      if (
        focusedIndex < nextStart ||
        focusedIndex >= nextStart + FILMSTRIP_SIZE
      )
        closeControl.current?.focus({ preventScroll: true })
    }
    setViewer(current => {
      if (current.kind !== 'ready' && current.kind !== 'error') return current
      const from = current.kind === 'ready' ? current.current : current.target
      if (from.index === index) return current
      return {
        kind: 'loading',
        target: { photo, index },
        previous: current.kind === 'ready' ? current.current : current.previous,
      }
    })
  }
  const handleKey = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    event.stopPropagation()
    if (event.key === 'Tab') {
      const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      )
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')
      event.preventDefault()
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const index = selected?.index ?? -1
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      choosePhoto(index + 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      choosePhoto(index - 1)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      choosePhoto(0)
    }
    if (event.key === 'End') {
      event.preventDefault()
      choosePhoto(photos.length - 1)
    }
  }

  return (
    <div ref={root} className="os-photography" data-motion={motionEnabled}>
      <header className="os-photo-header">
        <h1>
          Photography<span>.</span>
        </h1>
        {catalog.kind === 'ready' && (
          <span className="os-photo-count">
            {catalog.manifest.kind === 'demo'
              ? 'Demo collection'
              : 'Travel photographs'}
            <span aria-hidden="true"> / </span>
            {count} of {photos.length}
          </span>
        )}
      </header>
      {catalog.kind === 'loading' && (
        <div
          className="os-photo-catalog-skeleton"
          aria-label="Photograph collection"
          aria-busy="true"
        >
          <div className="os-photo-tile os-photo-feature" />
          <div className="os-photo-contact-sheet">
            <div className="os-photo-tile" />
            <div className="os-photo-tile" />
          </div>
        </div>
      )}
      {catalog.kind === 'error' && (
        <div className="os-photo-message" role="alert">
          <ImageOff size={28} />
          <h2>The photographs couldn’t load.</h2>
          <p>Try the collection again.</p>
          <button
            type="button"
            onClick={() => setCatalogRetry(value => value + 1)}
          >
            <RotateCcw size={15} />
            Try again
          </button>
        </div>
      )}
      {catalog.kind === 'ready' && photos.length === 0 && (
        <div className="os-photo-message">
          <h2>A little further afield.</h2>
          <p>Photographs from the road are on their way.</p>
        </div>
      )}
      {catalog.kind === 'ready' && photos[0] && (
        <div className="os-photo-collection">
          <PhotoButton
            photo={photos[0]}
            index={0}
            featured
            phase={gallery.entries.get(photos[0].id)?.phase ?? { kind: 'idle' }}
            register={gallery.register}
            onOpen={openPhoto}
          />
          <p className="os-photo-feature-caption">Select a frame to explore</p>
          <div
            className="os-photo-contact-sheet"
            aria-label="Photograph collection"
          >
            {photos.slice(1, count).map((photo, index) => (
              <PhotoButton
                key={photo.id}
                photo={photo}
                index={index + 1}
                featured={false}
                phase={gallery.entries.get(photo.id)?.phase ?? { kind: 'idle' }}
                register={gallery.register}
                onOpen={openPhoto}
              />
            ))}
          </div>
          <div className="os-photo-pagination">
            <span aria-live="polite" aria-atomic="true">
              {count} of {photos.length} photographs
            </span>
            {catalog.page.kind !== 'complete' && (
              <button
                type="button"
                aria-disabled={catalog.page.kind !== 'available'}
                onClick={() => dispatchCatalog({ kind: 'more' })}
              >
                More photographs
                <ArrowRight size={15} />
              </button>
            )}
          </div>
          {catalog.manifest.kind === 'demo' && (
            <p className="os-photo-credit">
              One demo photograph, repeated.{' '}
              <a
                href={catalog.manifest.source}
                target="_blank"
                rel="noreferrer"
              >
                Image from Unsplash
                <ArrowRight size={12} />
              </a>
            </p>
          )}
        </div>
      )}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Native dialog owns modal keyboard navigation. */}
      <dialog
        ref={dialog}
        className="os-photo-viewer"
        data-motion={motionEnabled}
        aria-label="Fullscreen photograph viewer"
        aria-describedby={captionId}
        onKeyDown={handleKey}
        onCancel={event => {
          event.preventDefault()
          event.stopPropagation()
          close()
        }}
        onClose={() => setViewer({ kind: 'closed' })}
        onClick={event => {
          if (event.target === event.currentTarget) close()
        }}
      >
        {selected && (
          <>
            <div className="os-photo-viewer-top">
              <span>
                Photography<span className="os-photo-viewer-dot">.</span>
              </span>
              <button
                ref={closeControl}
                type="button"
                className="os-photo-close"
                aria-label="Close fullscreen viewer"
                onClick={close}
              >
                <X size={21} />
                <span>Close</span>
              </button>
            </div>
            <div
              className="os-photo-viewer-stage"
              aria-busy={locked}
              onClick={event => {
                if (event.target === event.currentTarget) close()
              }}
              role="presentation"
            >
              <div className="os-photo-image-stack" data-phase={viewer.kind}>
                {viewer.kind === 'transitioning' && viewer.previous && (
                  <img
                    key={`outgoing-${viewer.previous.photo.id}`}
                    className="os-photo-outgoing"
                    src={fullSource(viewer.previous.photo)}
                    alt=""
                    aria-hidden="true"
                    width={viewer.previous.photo.width}
                    height={viewer.previous.photo.height}
                  />
                )}
                {displayed && (
                  <img
                    key={`current-${displayed.photo.id}`}
                    className="os-photo-current"
                    src={fullSource(displayed.photo)}
                    alt={`Travel photograph ${displayed.index + 1}`}
                    width={displayed.photo.width}
                    height={displayed.photo.height}
                  />
                )}
                {!displayed && viewer.kind === 'loading' && (
                  <div
                    className="os-photo-viewer-skeleton"
                    style={{
                      aspectRatio: `${selected.photo.width} / ${selected.photo.height}`,
                      width: `min(100cqw, calc(100cqh * ${selected.photo.width / selected.photo.height}))`,
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
              {viewer.kind === 'error' && (
                <div className="os-photo-image-recovery" role="alert">
                  <ImageOff size={25} />
                  <p>This photograph couldn’t load.</p>
                  <button
                    type="button"
                    onClick={() =>
                      setViewer(current =>
                        current.kind === 'error'
                          ? {
                              kind: 'loading',
                              target: current.target,
                              previous: current.previous,
                            }
                          : current,
                      )
                    }
                  >
                    <RotateCcw size={15} />
                    Try again
                  </button>
                </div>
              )}
              <button
                type="button"
                className="os-photo-previous"
                aria-label="Previous photograph"
                aria-disabled={locked || selected.index <= 0}
                onClick={() => choosePhoto(selected.index - 1)}
              >
                <ArrowLeft size={23} />
              </button>
              <button
                type="button"
                className="os-photo-next"
                aria-label="Next photograph"
                aria-disabled={locked || selected.index >= photos.length - 1}
                onClick={() => choosePhoto(selected.index + 1)}
              >
                <ArrowRight size={23} />
              </button>
            </div>
            <div className="os-photo-viewer-bottom">
              <div
                className="os-photo-viewer-caption"
                id={captionId}
                aria-live="polite"
                aria-atomic="true"
              >
                <span>
                  {selected.index + 1}
                  <span className="os-photo-caption-divider"> / </span>
                  {photos.length}
                </span>
              </div>
              <Filmstrip
                photos={stripPhotos}
                startIndex={stripStart}
                selected={selected.photo.id}
                locked={locked}
                choose={choosePhoto}
              />
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}
