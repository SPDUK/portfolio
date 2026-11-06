import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import { routeKey } from './model'
import type { NavigationTransition } from './model'
import './page-transitions.css'

type Direction = 'forward' | 'backward'
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
interface PageNavigation {
  target: string
  update: () => void
  scope: () => NavigationTransition
  direction?: Direction
  isCurrent?: () => boolean
}
interface PageTransitionOptions {
  stageRef: RefObject<HTMLDivElement>
  href: string
  enabled: boolean
  scopeForRoute: (target: string) => NavigationTransition
  prepareRoute: (target: string) => Promise<unknown>
  restoreRoute: (target: string) => void
  historyIntent: (target: string) => void
}

function historyKey() {
  const value: unknown = window.history.state
  return value && typeof value === 'object' && 'key' in value ? value.key : null
}

function visible(element: Element | null, stage: HTMLElement) {
  if (!(element instanceof HTMLElement) || element.closest('[hidden]'))
    return false
  const rect = element.getBoundingClientRect()
  const bounds = stage.getBoundingClientRect()
  const scroller = element.closest('.os-library-scroll')
  const clip = scroller?.getBoundingClientRect() || bounds
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > Math.max(bounds.top, clip.top) &&
    rect.top < Math.min(bounds.bottom, clip.bottom) &&
    rect.right > bounds.left &&
    rect.left < bounds.right
  )
}

function sharedContent(stage: HTMLElement, route: string) {
  const reader = Array.from(
    stage.querySelectorAll<HTMLElement>('[data-document-route]'),
  ).find(
    node =>
      routeKey(node.dataset.documentRoute) === route && visible(node, stage),
  )
  const card = Array.from(
    stage.querySelectorAll<HTMLElement>('[data-document-link]'),
  ).find(
    node =>
      routeKey(node.dataset.documentLink) === route && visible(node, stage),
  )
  const content = reader || card
  return {
    title: content?.querySelector<HTMLElement>('h1,h2,h3'),
  }
}

export function usePageTransitions({
  stageRef,
  href,
  enabled,
  scopeForRoute,
  prepareRoute,
  restoreRoute,
  historyIntent,
}: PageTransitionOptions) {
  const currentRoute = useRef(href)
  const motion = useRef(enabled)
  const routeScope = useRef(scopeForRoute)
  routeScope.current = scopeForRoute
  const routePreparation = useRef(prepareRoute)
  routePreparation.current = prepareRoute
  const historyRoute = useRef(restoreRoute)
  historyRoute.current = restoreRoute
  const historyRequest = useRef(historyIntent)
  historyRequest.current = historyIntent
  const cancelPreparation = useRef<() => void>(() => {})
  currentRoute.current = href
  motion.current = enabled
  const active = useRef<ViewTransition | null>(null)
  const queued = useRef<PageNavigation | null>(null)
  const updating = useRef(false)
  const releaseRoute = useRef<{ route: string; resolve: () => void } | null>(
    null,
  )
  const cleanup = useRef<() => void>(() => {})
  const positions = useRef(new Map<unknown, number>())
  const position = useRef(0)
  const replayingHistory = useRef(false)
  const [settling, setSettling] = useState(false)
  const disposed = useRef(false)

  useBrowserLayoutEffect(() => {
    const key = historyKey()
    const known = positions.current.get(key)
    position.current = known ?? position.current + 1
    positions.current.set(key, position.current)
    if (releaseRoute.current?.route === routeKey(href)) {
      releaseRoute.current.resolve()
      releaseRoute.current = null
    }
  })

  const drain = useCallback(async () => {
    if (updating.current) return
    updating.current = true
    try {
      while (queued.current && !disposed.current) {
        const request = queued.current
        queued.current = null
        const scope = request.scope()
        const canAnimate =
          scope.kind !== 'none' &&
          motion.current &&
          document.startViewTransition &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let preparationTimer = 0
        const prepared = canAnimate
          ? await Promise.race([
              routePreparation.current(request.target).then(
                () => true,
                () => false,
              ),
              new Promise<boolean>(resolve => {
                cancelPreparation.current = () => resolve(false)
                preparationTimer = window.setTimeout(() => resolve(false), 200)
              }),
            ])
          : false
        window.clearTimeout(preparationTimer)
        cancelPreparation.current = () => {}
        if (!queued.current && !disposed.current) {
          const stage = stageRef.current
          const pageSurface =
            scope.kind === 'page'
              ? stage?.querySelector<HTMLElement>(
                  `#os-window-${scope.app}:not([hidden]) .os-library-scroll`,
                )
              : stage
          if (
            !stage ||
            !pageSurface ||
            scope.kind === 'none' ||
            !prepared ||
            !motion.current ||
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            request.update()
          } else {
            cleanup.current()
            const root = document.documentElement
            const from = routeKey(currentRoute.current)
            const to = routeKey(request.target)
            const returning = ['/projects', '/blog', '/'].includes(to)
            root.dataset.pageTransition =
              request.direction || (returning ? 'backward' : 'forward')
            root.dataset.pageTransitionScope = scope.kind
            const marked: {
              element: HTMLElement
              name: string
              transitionClass: string
            }[] = []
            const mark = (
              element: HTMLElement | null | undefined,
              name: string,
              transitionClass?: string,
            ) => {
              if (!element || !visible(element, stage)) return false
              marked.push({
                element,
                name: element.style.viewTransitionName,
                transitionClass: element.style.getPropertyValue(
                  'view-transition-class',
                ),
              })
              element.style.viewTransitionName = name
              if (transitionClass)
                element.style.setProperty(
                  'view-transition-class',
                  transitionClass,
                )
              return true
            }
            const clearNames = () => {
              marked.splice(0).forEach(({ element, name, transitionClass }) => {
                element.style.viewTransitionName = name
                if (transitionClass)
                  element.style.setProperty(
                    'view-transition-class',
                    transitionClass,
                  )
                else element.style.removeProperty('view-transition-class')
              })
            }
            const surface = () =>
              scope.kind === 'page'
                ? stage.querySelector<HTMLElement>(
                    `#os-window-${scope.app}:not([hidden]) .os-library-scroll`,
                  ) || pageSurface
                : stage
            const readingRoute =
              scope.kind === 'page'
                ? pageSurface.querySelector<HTMLElement>(
                    '[data-document-route]',
                  )?.dataset.documentRoute
                : undefined
            const sharedRoute = returning ? routeKey(readingRoute || from) : to
            const source = sharedContent(stage, sharedRoute)
            mark(surface(), 'os-page')
            const hasTitle = mark(source.title, 'os-page-title')
            const canStageArticle = CSS.supports(
              'view-transition-class: os-article-part',
            )
            const captureArticle = (
              article: Element,
              phase: 'incoming' | 'outgoing',
            ) => {
              const parts = Array.from(
                article.querySelectorAll<HTMLElement>(
                  ':scope > :not(h1):not(.os-document-body):not(.os-project-overview), :scope > .os-document-body > *, :scope > .os-project-overview > *',
                ),
              ).filter(element => visible(element, stage))
              parts.forEach((element, index) => {
                mark(
                  element,
                  `os-article-part-${phase}-${index}`,
                  `os-article-part os-article-${phase} os-article-step-${Math.min(index, 5)}`,
                )
              })
              mark(
                article
                  .closest('.os-reader')
                  ?.querySelector<HTMLElement>('.os-back'),
                `os-article-controls-${phase}`,
                `os-article-part os-article-${phase} os-article-step-0`,
              )
              return Math.min(Math.max(parts.length - 1, 0), 5)
            }
            const reversingArticle =
              scope.kind === 'page' &&
              root.dataset.pageTransition === 'backward' &&
              canStageArticle
            const outgoing = reversingArticle
              ? sharedContent(stage, routeKey(readingRoute || from))
              : source
            const outgoingArticle = outgoing.title?.closest('.os-document')
            if (
              reversingArticle &&
              outgoingArticle &&
              visible(outgoing.title || null, stage)
            ) {
              root.dataset.pageTransitionSequence = returning
                ? 'article-return'
                : 'article-back'
              if (!hasTitle) mark(outgoing.title, 'os-page-title')
              root.style.setProperty(
                '--article-return-last-step',
                String(captureArticle(outgoingArticle, 'outgoing')),
              )
            }
            const cardClip = (title: HTMLElement | undefined | null) => {
              const card = title?.closest('[data-document-link]')
              if (!card || !visible(card, stage)) return false
              const bounds = surface().getBoundingClientRect()
              const box = card.getBoundingClientRect()
              const top = Math.max(0, box.top - bounds.top)
              const right = Math.max(0, bounds.right - box.right)
              const bottom = Math.max(0, bounds.bottom - box.bottom)
              const left = Math.max(0, box.left - bounds.left)
              root.style.setProperty(
                '--page-card-clip',
                `inset(${top}px ${right}px ${bottom}px ${left}px round 6px)`,
              )
              root.dataset.pageTransitionShared = 'card'
              return true
            }
            if (!returning && hasTitle) cardClip(source.title)
            let release = () => {}
            const committed = new Promise<void>(resolve => {
              release = resolve
              if (from !== to) releaseRoute.current = { route: to, resolve }
              else resolve()
            })
            const timeout = window.setTimeout(() => {
              active.current?.skipTransition()
              release()
            }, 3000)
            cleanup.current = () => {
              clearNames()
              delete root.dataset.pageTransition
              delete root.dataset.pageTransitionScope
              delete root.dataset.pageTransitionShared
              delete root.dataset.pageTransitionSequence
              root.style.removeProperty('--page-card-clip')
              root.style.removeProperty('--article-return-last-step')
            }
            const transition = document.startViewTransition(() => {
              if (
                disposed.current ||
                (request.isCurrent && !request.isCurrent())
              ) {
                release()
                return
              }
              flushSync(() => {
                setSettling(true)
                request.update()
              })
              clearNames()
              mark(surface(), 'os-page')
              const destination = sharedContent(stage, sharedRoute)
              const article = destination.title?.closest('.os-document')
              const staged =
                !returning &&
                article &&
                visible(destination.title || null, stage) &&
                canStageArticle
              if (hasTitle || staged) mark(destination.title, 'os-page-title')
              if (returning && hasTitle) cardClip(destination.title)
              if (staged) {
                if (root.dataset.pageTransitionSequence !== 'article-back')
                  root.dataset.pageTransitionSequence = 'article'
                captureArticle(article, 'incoming')
              } else if (
                root.dataset.pageTransitionSequence === 'article-back' &&
                article
              ) {
                captureArticle(article, 'incoming')
              }
            })
            active.current = transition
            // A skipped animation must still finish its navigation and release the queue.
            transition.ready.catch(() => {})
            transition.finished
              .finally(() => {
                if (active.current !== transition) return
                cleanup.current()
                active.current = null
                setSettling(false)
              })
              .catch(() => {})
            await transition.updateCallbackDone.catch(() => {})
            // Reach schedules route renders in requestAnimationFrame. Awaiting one
            // inside the native update callback would prevent that frame from running.
            await committed
            window.clearTimeout(timeout)
          }
        }
      }
    } finally {
      updating.current = false
    }
  }, [stageRef])

  const transition = useCallback(
    (request: PageNavigation) => {
      queued.current = request
      cancelPreparation.current()
      releaseRoute.current?.resolve()
      releaseRoute.current = null
      active.current?.skipTransition()
      drain().catch(() => {})
    },
    [drain],
  )

  useEffect(() => {
    disposed.current = false
    const popstate = (event: PopStateEvent) => {
      if (
        replayingHistory.current ||
        !motion.current ||
        !document.startViewTransition ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return
      const next = positions.current.get(historyKey())
      const historyState: unknown = event.state
      const target = window.location.pathname + window.location.search
      historyRequest.current(target)
      if (routeKey(target) === routeKey(currentRoute.current)) return
      event.stopImmediatePropagation()
      transition({
        target,
        isCurrent: () =>
          window.location.pathname + window.location.search === target,
        direction:
          next !== undefined && next > position.current
            ? 'forward'
            : 'backward',
        scope: () => routeScope.current(target),
        update: () => {
          historyRoute.current(target)
          replayingHistory.current = true
          window.dispatchEvent(
            new PopStateEvent('popstate', { state: historyState }),
          )
          replayingHistory.current = false
        },
      })
    }
    window.addEventListener('popstate', popstate, true)
    return () => {
      window.removeEventListener('popstate', popstate, true)
      disposed.current = true
      queued.current = null
      cancelPreparation.current()
      active.current?.skipTransition()
      releaseRoute.current?.resolve()
      cleanup.current()
    }
  }, [stageRef, transition])

  useEffect(() => {
    if (!enabled) active.current?.skipTransition()
  }, [enabled])

  return { transition, settling }
}
