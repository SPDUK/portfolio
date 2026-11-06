/* eslint-disable no-nested-ternary */
import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { navigate } from 'gatsby'
import {
  UserRound,
  FolderClosed,
  BookOpen,
  Terminal,
  Gamepad2,
  Orbit,
  Camera,
  Mail,
  Image,
  Settings,
  Command,
  Minus,
  X,
  Maximize2,
  LayoutGrid,
  Search,
  PanelsTopLeft,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import { Apps } from './Apps'
import {
  AppId,
  apps,
  defaultPreferences,
  DesktopPreferences,
  DesktopWindow,
  DesktopAction,
  DesktopState,
  desktopReducer,
  initialDesktop,
  readDesktop,
  desktopGeometry,
  navigationTransition,
  isPrimaryApp,
  readPreferences,
  views,
  viewState,
  focusedRoute,
  resolveApp,
  routeKey,
  DocumentRoutes,
  ViewId,
} from './model'
import { loadDocument, useContent } from './content'
import { useWindowMotion } from './useWindowMotion'
import { usePageTransitions } from './usePageTransitions'
import { useStartup } from './useStartup'
import { BootSequence } from './BootSequence'
import { gameRoute, parseGameRoute } from './arcadeCatalog'
import './desktop.css'

const Arcade = React.lazy(() => import('./Arcade'))
const SignalLab = React.lazy(() => import('./SignalLab'))
const Photography = React.lazy(() => import('./Photography'))
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
const railApps: AppId[] = [
  'about',
  'projects',
  'writing',
  'terminal',
  'arcade',
  'signal-lab',
  'photography',
  'contact',
]
const icons = {
  about: UserRound,
  projects: FolderClosed,
  writing: BookOpen,
  terminal: Terminal,
  arcade: Gamepad2,
  'signal-lab': Orbit,
  photography: Camera,
  contact: Mail,
  wallpapers: Image,
  settings: Settings,
  system: Command,
}
function PhotographyPlaceholder() {
  return (
    <div
      className="os-photography-placeholder"
      aria-label="Photography"
      aria-busy="true"
    >
      <span />
      <div />
      <div>
        <span />
        <span />
      </div>
    </div>
  )
}
class AppBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    const { failed } = this.state
    const { children } = this.props
    return failed ? (
      <div className="os-app-error" role="alert">
        <h2>This app needs a fresh start.</h2>
        <p>Your other windows are still available.</p>
        <button type="button" onClick={() => this.setState({ failed: false })}>
          Retry app
        </button>
      </div>
    ) : (
      children
    )
  }
}
interface DesktopProps {
  children: React.ReactNode
  location?: { pathname?: string; search?: string }
  data?: { markdownRemark?: { fields?: { kind?: string } } }
}
export const Desktop = ({ children, location, data }: DesktopProps) => {
  const path = location?.pathname || '/'
  const currentHref = path + (location?.search || '')
  const content = useContent()
  const documents = useMemo(
    () =>
      content.reduce<DocumentRoutes>((routes, item) => {
        routes[item.fields.slug.replace(/\/$/, '')] = item.fields.kind
        return routes
      }, {}),
    [content],
  )
  const currentApp = resolveApp(currentHref, documents)
  const detail = !apps.some(
    app => app.path === (path.replace(/\/$/, '') || '/'),
  )
  const [state, setState] = useState(() => {
    const initial = initialDesktop(currentApp || 'about')
    return currentApp
      ? desktopReducer(initial, {
          type: 'route',
          id: currentApp,
          href: currentHref,
          acknowledged: true,
        })
      : initial
  })
  const stateRef = useRef(state)
  const dispatch = useCallback((action: DesktopAction) => {
    const next = desktopReducer(stateRef.current, action)
    stateRef.current = next
    setState(next)
    return next
  }, [])
  const currentView = viewState(state)
  const expanded = currentView.solo || currentView.maximized
  const { routes } = state
  const [preferences, setPrefs] =
    useState<DesktopPreferences>(defaultPreferences)
  const [ready, setReady] = useState(false)
  const [compact, setCompact] = useState(false)
  const [restored, setRestored] = useState(false)
  const {
    phase: startupPhase,
    active: boot,
    complete: finishBoot,
    reveal: revealBoot,
    replay: replayBoot,
  } = useStartup(ready)
  const [launcher, setLauncher] = useState(false)
  const [query, setQuery] = useState('')
  const [clock, setClock] = useState('')
  const [stageSize, setStageSize] = useState({ width: 1280, height: 720 })
  const [pageVisible, setPageVisible] = useState(true)
  const [menu, setMenu] = useState<AppId | null>(null)
  const [interacting, setInteracting] = useState(false)
  const [collectionRequest, setCollectionRequest] = useState(0)
  const [contentFocusRequest, setContentFocusRequest] = useState(0)
  const pendingContentFocus = useRef<AppId | null>(null)
  const requestContentFocus = useCallback((id: AppId) => {
    pendingContentFocus.current = id
    setContentFocusRequest(value => value + 1)
  }, [])
  const searchRef = useRef<HTMLInputElement>(null)
  const launcherRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const requestedHref = useRef(routeKey(currentHref))
  const supersededRoutes = useRef(new Set<string>())
  const transitionScope = (after: DesktopState) =>
    navigationTransition({
      before: stateRef.current,
      after,
      compact,
      size: stageSize,
    })
  const pendingHref = useRef<string | null>(null)
  const observedHref = useRef(routeKey(currentHref))
  const hrefRef = useRef(currentHref)
  const recordHistoryRequest = useCallback((target: string) => {
    const key = routeKey(target)
    if (pendingHref.current && pendingHref.current !== key)
      supersededRoutes.current.add(pendingHref.current)
    requestedHref.current = key
    pendingHref.current = null
  }, [])
  const { transition: pageTransition, settling: pageTransitioning } =
    usePageTransitions({
      stageRef,
      href: currentHref,
      enabled: preferences.motion && ready && !boot,
      historyIntent: recordHistoryRequest,
      scopeForRoute: target => {
        const id = resolveApp(target, documents)
        return id
          ? transitionScope(
              desktopReducer(stateRef.current, {
                type: 'route',
                id,
                href: target,
              }),
            )
          : { kind: 'none' }
      },
      prepareRoute: target => {
        const document = content.find(
          item => routeKey(item.fields.slug) === routeKey(target),
        )
        return document ? loadDocument(document.id) : Promise.resolve()
      },
      restoreRoute: target => {
        const id = resolveApp(target, documents)
        if (id) {
          dispatch({ type: 'route', id, href: target })
          requestContentFocus(id)
        }
      },
    })
  const startupPreviousFocus = useRef<HTMLElement | null>(null)
  const startupWasActive = useRef(true)
  const previousFocus = useRef<HTMLElement | null>(null)
  const entryRef = useRef({ path, currentHref, currentApp, documents })
  const requestNavigation = (target: string, replace = false) => {
    const key = routeKey(target)
    requestedHref.current = key
    if (key === routeKey(hrefRef.current)) return
    if (pendingHref.current && pendingHref.current !== key)
      supersededRoutes.current.add(pendingHref.current)
    pendingHref.current = key
    hrefRef.current = target
    navigate(target, { replace })
  }
  const structuralAction = (action: DesktopAction) => {
    const next = dispatch(action)
    setMenu(null)
    requestNavigation(focusedRoute(next), true)
    const { focused, showDesktop } = viewState(next)
    if (
      focused &&
      (action.type === 'close' ||
        action.type === 'minimize' ||
        (action.type === 'desktop' && !showDesktop))
    )
      requestContentFocus(focused)
  }
  const setPreferences = (patch: Partial<DesktopPreferences>) =>
    setPrefs(p => ({ ...p, ...patch }))
  const openApp = (id: AppId) => {
    const nextState = (before: DesktopState) => {
      const next = desktopReducer(before, { type: 'open', id })
      return id === 'projects'
        ? desktopReducer(next, {
            type: 'route',
            id,
            href: '/projects',
            acknowledged: true,
          })
        : next
    }
    const next = nextState(stateRef.current)
    const target = focusedRoute(next)
    pageTransition({
      target,
      scope: () => transitionScope(nextState(stateRef.current)),
      direction:
        views.findIndex(view => view.id === next.activeView) <
        views.findIndex(view => view.id === stateRef.current.activeView)
          ? 'backward'
          : 'forward',
      update: () => {
        dispatch({ type: 'open', id })
        if (id === 'projects') {
          dispatch({ type: 'route', id, href: '/projects', acknowledged: true })
          setCollectionRequest(value => value + 1)
        }
        setLauncher(false)
        setMenu(null)
        requestContentFocus(id)
        requestNavigation(target)
      },
    })
  }
  const openView = (id: ViewId) => {
    const nextState = (before: DesktopState) => {
      const next = desktopReducer(before, { type: 'view', id })
      return id === 'projects'
        ? desktopReducer(next, {
            type: 'route',
            id: 'projects',
            href: '/projects',
            acknowledged: true,
          })
        : next
    }
    const next = nextState(stateRef.current)
    const target = focusedRoute(next)
    pageTransition({
      target,
      scope: () => transitionScope(nextState(stateRef.current)),
      direction:
        views.findIndex(view => view.id === id) <
        views.findIndex(view => view.id === stateRef.current.activeView)
          ? 'backward'
          : 'forward',
      update: () => {
        const selected = dispatch({ type: 'view', id })
        if (id === 'projects') {
          dispatch({
            type: 'route',
            id: 'projects',
            href: '/projects',
            acknowledged: true,
          })
          setCollectionRequest(value => value + 1)
        }
        setMenu(null)
        const { focused } = viewState(selected)
        if (focused) requestContentFocus(focused)
        requestNavigation(target)
      },
    })
  }
  const goTo = (target: string, replace?: boolean, update?: () => void) => {
    const id = resolveApp(target, documents)
    const nextState = (before: DesktopState) => {
      if (!id) return before
      const existing = before.windows.some(
        win =>
          win.id === id && win.view === before.activeView && !win.minimized,
      )
      const next = existing
        ? desktopReducer(before, { type: 'focus', id })
        : before
      return desktopReducer(next, {
        type: 'route',
        id,
        href: target,
        acknowledged: existing,
      })
    }
    const change = () => {
      update?.()
      if (id) {
        const before = stateRef.current
        const existing = before.windows.find(
          win =>
            win.id === id && win.view === before.activeView && !win.minimized,
        )
        if (existing) dispatch({ type: 'focus', id })
        dispatch({
          type: 'route',
          id,
          href: target,
          acknowledged: !!existing,
        })
        requestContentFocus(id)
        if (routeKey(target) === '/projects' && currentApp !== 'projects')
          setCollectionRequest(value => value + 1)
      }
      requestNavigation(target, replace)
    }
    if (replace && id === 'arcade' && currentApp === 'arcade') {
      change()
      return
    }
    pageTransition({
      target,
      scope: () => transitionScope(nextState(stateRef.current)),
      update: change,
    })
  }
  const focusWindow = (id: AppId) => {
    if (viewState(stateRef.current).focused === id) return
    dispatch({ type: 'focus', id })
  }
  useWindowMotion(
    stageRef,
    state,
    preferences.motion && ready && !boot,
    interacting,
  )
  const resetDesktop = () => {
    dispatch({ type: 'reset' })
    requestContentFocus('about')
    requestNavigation('/')
  }
  useEffect(() => {
    const {
      currentHref: entryHref,
      currentApp: entryApp,
      documents: entryDocuments,
    } = entryRef.current
    const media = window.matchMedia('(max-width: 1099px)')
    const updateSize = () => setCompact(media.matches)
    updateSize()
    media.addEventListener('change', updateSize)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    try {
      const storedV2 = sessionStorage.getItem('spdev-desktop-v2')
      const saved = readDesktop(
        storedV2 || sessionStorage.getItem('spdev-desktop'),
        entryDocuments,
        sessionStorage.getItem('spdev-routes'),
      )
      if (saved) {
        dispatch({ type: 'restore', state: saved })
        setRestored(true)
      }
      if (entryApp) dispatch({ type: 'route', id: entryApp, href: entryHref })
      const stored = readPreferences(localStorage.getItem('spdev-preferences'))
      setPrefs({ ...stored, motion: stored.motion && !reduced.matches })
    } catch {
      if (reduced.matches) setPrefs(p => ({ ...p, motion: false }))
    }
    setReady(true)
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
    tick()
    const timer = window.setInterval(tick, 10000)
    return () => {
      media.removeEventListener('change', updateSize)
      window.clearInterval(timer)
    }
  }, [dispatch])
  useEffect(() => {
    const update = () => {
      const bounds = stageRef.current?.getBoundingClientRect()
      if (bounds) setStageSize({ width: bounds.width, height: bounds.height })
    }
    const observer = new ResizeObserver(update)
    if (stageRef.current) observer.observe(stageRef.current)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  useEffect(() => {
    const onHistory = () => {
      recordHistoryRequest(window.location.pathname + window.location.search)
    }
    window.addEventListener('popstate', onHistory)
    return () => window.removeEventListener('popstate', onHistory)
  }, [recordHistoryRequest])
  useBrowserLayoutEffect(() => {
    const key = routeKey(currentHref)
    if (observedHref.current === key) return
    if (supersededRoutes.current.has(key) && requestedHref.current !== key) {
      supersededRoutes.current.delete(key)
      observedHref.current = key
      hrefRef.current = currentHref
      requestNavigation(requestedHref.current, true)
      return
    }
    supersededRoutes.current.delete(key)
    const acknowledged = pendingHref.current === key
    pendingHref.current = null
    observedHref.current = key
    hrefRef.current = currentHref
    if (currentApp) {
      requestContentFocus(currentApp)
      dispatch({
        type: 'route',
        id: currentApp,
        href: currentHref,
        acknowledged,
      })
    }
  }, [currentHref, currentApp, dispatch, requestContentFocus])
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem('spdev-desktop-v2', JSON.stringify(state))
      } catch {
        /* Browser policies can deny storage access. */
      }
  }, [state, ready])
  useEffect(() => {
    stageRef.current
      ?.querySelectorAll('section[hidden] audio')
      .forEach(audio => {
        if (audio instanceof HTMLMediaElement) audio.pause()
      })
  }, [state, compact])
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem('spdev-preferences', JSON.stringify(preferences))
      } catch {
        /* Browser policies can deny storage access. */
      }
  }, [preferences, ready])
  useEffect(() => {
    if (launcher) {
      previousFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      searchRef.current?.focus()
    } else previousFocus.current?.focus()
  }, [launcher])
  useEffect(() => {
    const shell = stageRef.current?.parentElement
    const controls = shell?.querySelectorAll<HTMLElement>(
      '.os-skip,.os-panel,.os-rail,.os-stage,.os-desktop-footer,.os-mobile-bar',
    )
    const bootOwnsFocus =
      boot &&
      ready &&
      ['active', 'running'].includes(
        document.documentElement.dataset.spdevStartup,
      )
    const owned: HTMLElement[] = []
    controls?.forEach(element => {
      if ((!launcher && !bootOwnsFocus) || element.inert) return
      element.inert = true
      if (bootOwnsFocus) element.dataset.startupInert = 'true'
      owned.push(element)
    })
    return () =>
      owned.forEach(element => {
        element.inert = false
        delete element.dataset.startupInert
      })
  }, [launcher, boot, ready])
  useEffect(() => {
    if (boot || !startupWasActive.current) return
    startupWasActive.current = false
    const previous = startupPreviousFocus.current
    startupPreviousFocus.current = null
    if (previous?.isConnected && !previous.closest('[hidden], [inert]')) {
      previous.focus({ preventScroll: true })
      return
    }
    const { focused } = viewState(stateRef.current)
    const app = focused
      ? stageRef.current?.querySelector<HTMLElement>(
          `#os-window-${focused}:not([hidden])`,
        )
      : stageRef.current
    const target =
      app?.querySelector<HTMLElement>('h1') ||
      app?.querySelector<HTMLElement>('.os-window-content')
    if (target) {
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
  }, [boot])
  useEffect(() => {
    const id = pendingContentFocus.current
    if (
      !ready ||
      launcher ||
      boot ||
      pageTransitioning ||
      !id ||
      currentApp !== id
    )
      return undefined
    let nextFrame = 0
    const frame = window.requestAnimationFrame(() => {
      nextFrame = window.requestAnimationFrame(() => {
        const app = stageRef.current?.querySelector<HTMLElement>(
          `#os-window-${id}:not([hidden])`,
        )
        const target = app?.querySelector<HTMLElement>('h1, .os-window-content')
        const heading = app?.querySelector<HTMLElement>('h1')
        const destination = heading || target
        if (!destination || pendingContentFocus.current !== id) return
        destination.tabIndex = -1
        destination.focus({ preventScroll: true })
        pendingContentFocus.current = null
      })
    })
    return () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(nextFrame)
    }
  }, [
    ready,
    launcher,
    boot,
    pageTransitioning,
    currentHref,
    currentApp,
    contentFocusRequest,
  ])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (boot) return
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setLauncher(value => !value)
      }
      if (event.key === 'Escape') {
        setLauncher(false)
        setMenu(null)
      }
      if (launcher && event.key === 'Tab') {
        const controls =
          launcherRef.current?.querySelectorAll<HTMLElement>('button,input')
        const first = controls?.[0]
        const last = controls?.[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [launcher, boot])
  const drag = (
    event: React.PointerEvent,
    win: DesktopWindow,
    resize = false,
  ) => {
    if (compact || expanded || (!resize && !win.floating)) return
    if (event.target instanceof HTMLElement && event.target.closest('button'))
      return
    event.preventDefault()
    setInteracting(true)
    focusWindow(win.id)
    const start = win.rect
    const stage = stageRef.current?.getBoundingClientRect()
    const maxW = stage?.width || window.innerWidth - 100
    const maxH = stage?.height || window.innerHeight - 80
    const move = (e: PointerEvent) => {
      const dx = e.clientX - event.clientX
      const dy = e.clientY - event.clientY
      const rect = resize
        ? {
            ...win.rect,
            width: Math.max(
              360,
              Math.min(maxW - win.rect.x, win.rect.width + dx),
            ),
            height: Math.max(
              240,
              Math.min(maxH - win.rect.y, win.rect.height + dy),
            ),
          }
        : {
            ...win.rect,
            x: Math.max(0, Math.min(maxW - win.rect.width, start.x + dx)),
            y: Math.max(0, Math.min(maxH - win.rect.height, start.y + dy)),
          }
      dispatch({ type: 'rect', id: win.id, rect })
    }
    const end = () => {
      setInteracting(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end, { once: true })
  }
  const visible = state.windows.filter(
    win => win.view === state.activeView && !win.minimized,
  )
  const tiled = visible.filter(win => !win.floating)
  const initialLayout = state.activeView === 'desktop' && tiled.length === 2
  const rendered = state.windows
  const filtered = apps.filter(app =>
    `${app.label} ${app.subtitle}`.toLowerCase().includes(query.toLowerCase()),
  )
  const resizeSplit = (
    event: React.PointerEvent,
    divider: { path: string; axis: string; ratio: number; extent: number },
  ) => {
    event.preventDefault()
    setInteracting(true)
    const start = divider.axis === 'horizontal' ? event.clientX : event.clientY
    const move = (moveEvent: PointerEvent) =>
      dispatch({
        type: 'split',
        path: divider.path,
        ratio:
          divider.ratio +
          ((divider.axis === 'horizontal'
            ? moveEvent.clientX
            : moveEvent.clientY) -
            start) /
            divider.extent,
      })
    const end = () => {
      setInteracting(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end, { once: true })
  }
  const geometry = desktopGeometry(state, stageSize)
  const startupApp = currentView.focused || currentApp
  const startupRoute = startupApp
    ? routes[startupApp] || currentHref
    : currentHref
  const startupDocument = content.find(
    item =>
      item.fields.slug.replace(/\/$/, '') ===
      startupRoute.split('?')[0].replace(/\/$/, ''),
  )
  const startupDestination =
    startupDocument?.frontmatter.title ||
    apps.find(app => app.id === startupApp)?.label ||
    'Portfolio'
  return (
    <div
      onClickCapture={event => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const anchor =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>(
                '.os-window-content a[href]',
              )
            : null
        if (
          !anchor ||
          anchor.target ||
          anchor.hasAttribute('download') ||
          anchor.origin !== window.location.origin
        )
          return
        const target = anchor.pathname + anchor.search
        if (anchor.hash || !resolveApp(target, documents)) return
        event.preventDefault()
        event.stopPropagation()
        goTo(target)
      }}
      className={`os-desktop ${preferences.motion ? 'os-motion' : ''} ${ready ? 'os-ready' : ''} ${boot ? 'os-booting' : ''}`}
      data-startup={startupPhase}
    >
      {!detail && children}
      <div
        className={`os-wallpaper os-wallpaper--${preferences.wallpaper}`}
        aria-hidden="true"
      >
        <div
          className="os-wallpaper-image"
          style={{
            backgroundImage: `url(/wallpapers/${preferences.wallpaper}.webp)`,
          }}
        />
        <div className="os-wallpaper-shade" />
      </div>
      <a className="os-skip" href="#os-workspace">
        Skip to workspace
      </a>
      <header className="os-panel" data-startup-clock={boot ? '' : undefined}>
        <button
          type="button"
          className="os-brand"
          onClick={() => {
            setQuery('')
            setLauncher(true)
          }}
          aria-label="Open app launcher"
        >
          <img
            className="os-mark"
            src="/brand/sp-monogram.png"
            alt=""
            width={28}
            height={28}
          />
          <strong>SPDEV</strong>
          <ChevronRight size={12} />
        </button>
        <nav className="os-workspaces" aria-label="Desktop views">
          {views.map((view, index) => (
            <button
              type="button"
              key={view.id}
              aria-label={`${view.label} view`}
              aria-current={state.activeView === view.id ? 'page' : undefined}
              onClick={() => openView(view.id)}
            >
              <span>0{index + 1}</span>
              <span>{view.label}</span>
              {state.views[view.id] && <i />}
            </button>
          ))}
        </nav>
        <div className="os-panel-right">
          <button
            type="button"
            className="os-panel-contact"
            onClick={() => openApp('contact')}
            aria-current={
              currentView.focused === 'contact' ? 'page' : undefined
            }
          >
            <Mail size={15} aria-hidden="true" /> Contact
          </button>
          <button
            type="button"
            aria-label={
              preferences.sound ? 'Mute game sound' : 'Enable game sound'
            }
            onClick={() => setPreferences({ sound: !preferences.sound })}
          >
            {preferences.sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <time>{clock || '--:--'}</time>
          <button
            type="button"
            aria-label="Open Settings"
            onClick={() => openApp('settings')}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>
      <nav
        className="os-rail"
        aria-label="Applications"
        data-startup-clock={boot ? '' : undefined}
      >
        <button
          type="button"
          className="os-launcher-button"
          aria-label="Open app launcher"
          onClick={() => {
            setQuery('')
            setLauncher(true)
          }}
        >
          <Command size={23} />
          <span>Apps</span>
        </button>
        <div className="os-rail-line" />
        {railApps
          .flatMap(id => apps.filter(app => app.id === id))
          .map(app => {
            const Icon = icons[app.id]
            const running = state.windows.some(w => w.id === app.id)
            return (
              <a
                href={app.path}
                key={app.id}
                aria-label={app.label}
                title={app.label}
                className={`${running ? 'is-running' : ''} ${currentView.focused === app.id && !currentView.showDesktop ? 'is-active' : ''}`}
                onClick={event => {
                  if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
                    event.preventDefault()
                    openApp(app.id)
                  }
                }}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span>{app.shortLabel || app.label}</span>
              </a>
            )
          })}
        <a
          href="https://github.com/SPDUK"
          target="_blank"
          rel="noreferrer"
          aria-label="Open GitHub profile in a new tab"
        >
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>GitHub</span>
        </a>
        <div className="os-rail-bottom">
          <button
            type="button"
            aria-label="Choose wallpaper"
            onClick={() => openApp('wallpapers')}
          >
            <Image size={21} />
            <span>Scenes</span>
          </button>
          <button
            type="button"
            aria-label={
              currentView.showDesktop ? 'Restore windows' : 'Show wallpaper'
            }
            onClick={() => structuralAction({ type: 'desktop' })}
          >
            <PanelsTopLeft size={21} />
            <span>{currentView.showDesktop ? 'Restore' : 'Hide all'}</span>
          </button>
        </div>
      </nav>
      <main
        id="os-workspace"
        data-startup-clock={boot ? '' : undefined}
        className={`os-stage ${initialLayout ? 'os-layout-welcome' : ''} ${expanded ? 'os-has-maximized' : ''} ${currentView.showDesktop ? 'os-show-desktop' : ''}`}
        data-count={Math.min(tiled.length, 4)}
        data-view={state.activeView}
        data-interacting={interacting || undefined}
        ref={stageRef}
      >
        {!currentApp && (
          <section className="os-window is-focused is-maximized">
            <div className="os-window-content">{children}</div>
          </section>
        )}
        {currentApp && (visible.length === 0 || currentView.showDesktop) && (
          <section className="os-desktop-message" aria-label="Desktop">
            <h1>
              Curiosity,
              <br />
              left running.
            </h1>
            <p>Tools I wanted. Ideas I had to try.</p>
            <div className="os-desktop-actions">
              <button type="button" onClick={() => openApp('projects')}>
                Explore projects <ArrowUpRight size={16} aria-hidden="true" />
              </button>
              {currentView.showDesktop && visible.length > 0 && (
                <button
                  type="button"
                  className="os-desktop-restore"
                  onClick={() => structuralAction({ type: 'desktop' })}
                >
                  <PanelsTopLeft size={16} aria-hidden="true" /> Restore windows
                </button>
              )}
            </div>
          </section>
        )}
        {rendered.map(win => {
          const app = apps.find(item => item.id === win.id)
          const Icon = icons[win.id]
          const primary = isPrimaryApp(win.id)
          const arrangementTargets = primary
            ? []
            : visible.filter(
                other =>
                  other.id !== win.id &&
                  !other.floating &&
                  !isPrimaryApp(other.id),
              )
          const box = geometry.boxes[win.id]
          const hidden =
            !currentApp ||
            win.minimized ||
            win.view !== state.activeView ||
            currentView.showDesktop ||
            (!!expanded && expanded !== win.id) ||
            (compact && currentView.focused !== win.id) ||
            (!compact && !win.floating && !box)
          const focused = currentView.focused === win.id && !hidden
          const active = focused && !launcher && !boot && pageVisible
          const rect = win.floating
            ? {
                x: Math.min(
                  win.rect.x,
                  Math.max(
                    0,
                    stageSize.width - Math.min(win.rect.width, stageSize.width),
                  ),
                ),
                y: Math.min(
                  win.rect.y,
                  Math.max(
                    0,
                    stageSize.height -
                      Math.min(win.rect.height, stageSize.height),
                  ),
                ),
                width: Math.min(win.rect.width, stageSize.width),
                height: Math.min(win.rect.height, stageSize.height),
              }
            : box
          const style: React.CSSProperties =
            rect && !compact && expanded !== win.id
              ? {
                  position: 'absolute',
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                  zIndex: win.floating ? (active ? 12 : 10) : 1,
                }
              : {}
          return (
            <section
              key={win.id}
              id={`os-window-${win.id}`}
              data-app={win.id}
              className={`os-window os-window--${win.id} ${focused ? 'is-focused' : ''} ${win.floating ? 'is-floating' : ''} ${expanded === win.id ? 'is-maximized' : ''}`}
              style={style}
              hidden={hidden}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault()
                const id = apps.find(
                  item =>
                    item.id ===
                    event.dataTransfer.getData('application/spdev-window'),
                )?.id
                if (!id) return
                const bounds = event.currentTarget.getBoundingClientRect()
                const x = (event.clientX - bounds.left) / bounds.width
                const y = (event.clientY - bounds.top) / bounds.height
                structuralAction({
                  type: 'place',
                  id,
                  target: win.id,
                  placement:
                    x < 0.22
                      ? 'left'
                      : x > 0.78
                        ? 'right'
                        : y < 0.22
                          ? 'top'
                          : y > 0.78
                            ? 'bottom'
                            : 'center',
                })
              }}
              aria-label={`${app.label} window`}
              onPointerDown={() => focusWindow(win.id)}
              onFocusCapture={() => focusWindow(win.id)}
            >
              <div
                className="os-titlebar"
                role="presentation"
                draggable={!compact && !win.floating && !primary}
                onDragStart={event => {
                  setInteracting(true)
                  event.dataTransfer.setData('application/spdev-window', win.id)
                }}
                onDragEnd={() => setInteracting(false)}
                onPointerDown={event => drag(event, win)}
                onDoubleClick={() => dispatch({ type: 'maximize', id: win.id })}
              >
                <div className="os-window-title">
                  <Icon size={14} />
                  <span>
                    {win.id === 'terminal'
                      ? 'steve@spdev: ~'
                      : app.label.toLowerCase()}
                  </span>
                </div>
                <div className="os-window-controls">
                  <button
                    type="button"
                    className="os-arrange-button"
                    aria-label={`Arrange ${app.label}`}
                    aria-expanded={menu === win.id}
                    onClick={() => setMenu(menu === win.id ? null : win.id)}
                  >
                    <LayoutGrid size={13} />
                    <span>Arrange</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Minimize ${app.label}`}
                    onClick={() =>
                      structuralAction({ type: 'minimize', id: win.id })
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    className={
                      primary ? 'os-presentation-button' : 'os-maximize-button'
                    }
                    aria-label={`${primary ? (expanded === win.id ? 'Tile' : 'Focus') : expanded === win.id ? 'Restore' : 'Maximize'} ${app.label}`}
                    title={
                      primary
                        ? expanded === win.id
                          ? 'Tile beside other apps'
                          : 'Focus across the workspace'
                        : undefined
                    }
                    onClick={() =>
                      dispatch(
                        primary && expanded === win.id
                          ? { type: 'arrange' }
                          : { type: 'maximize', id: win.id },
                      )
                    }
                  >
                    {primary && expanded === win.id ? (
                      <PanelsTopLeft size={13} />
                    ) : (
                      <Maximize2 size={12} />
                    )}
                    {primary && (
                      <span>{expanded === win.id ? 'Tile' : 'Focus'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="os-close"
                    aria-label={`Close ${app.label}`}
                    onClick={() =>
                      structuralAction({ type: 'close', id: win.id })
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              {menu === win.id && (
                <div className="os-window-menu">
                  {expanded && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'arrange' })
                        setMenu(null)
                      }}
                    >
                      Restore arranged windows
                    </button>
                  )}
                  {arrangementTargets.map(other => (
                    <button
                      type="button"
                      key={other.id}
                      onClick={() =>
                        structuralAction({
                          type: 'place',
                          id: win.id,
                          target: other.id,
                          placement: 'center',
                        })
                      }
                    >
                      Group with{' '}
                      {apps.find(item => item.id === other.id)?.label}
                    </button>
                  ))}
                  {arrangementTargets.map(other => (
                    <details key={`place-${other.id}`}>
                      <summary>
                        Arrange with{' '}
                        {apps.find(item => item.id === other.id)?.label}
                      </summary>
                      {(['left', 'right', 'top', 'bottom'] as const).map(
                        placement => (
                          <button
                            type="button"
                            key={placement}
                            onClick={() =>
                              structuralAction({
                                type: 'place',
                                id: win.id,
                                target: other.id,
                                placement,
                              })
                            }
                          >
                            Place {placement}
                          </button>
                        ),
                      )}
                    </details>
                  ))}
                  {!win.floating &&
                    geometry.dividers
                      .filter(
                        divider =>
                          primary ||
                          divider.path ||
                          !visible.some(other => isPrimaryApp(other.id)),
                      )
                      .map(divider => (
                        <details key={`resize-${divider.path}`}>
                          <summary>
                            Resize{' '}
                            {divider.axis === 'horizontal' ? 'columns' : 'rows'}{' '}
                            {divider.path}
                          </summary>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: 'split',
                                path: divider.path,
                                ratio: divider.ratio - 0.05,
                              })
                            }
                          >
                            Decrease first pane
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: 'split',
                                path: divider.path,
                                ratio: divider.ratio + 0.05,
                              })
                            }
                          >
                            Increase first pane
                          </button>
                        </details>
                      ))}
                  {!primary && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'float', id: win.id })
                        setMenu(null)
                      }}
                    >
                      {win.floating ? 'Tile window' : 'Float window'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'maximize', id: win.id })
                      setMenu(null)
                    }}
                  >
                    {primary
                      ? expanded === win.id
                        ? 'Tile beside other apps'
                        : 'Focus across the workspace'
                      : 'Maximize / restore'}
                  </button>
                  <details>
                    <summary>Go to view</summary>
                    {views.map(view => (
                      <button
                        type="button"
                        key={view.id}
                        onClick={() => openView(view.id)}
                      >
                        {view.label}
                      </button>
                    ))}
                  </details>
                  {win.floating && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'rect',
                            id: win.id,
                            rect: { ...win.rect, x: 16, y: 16 },
                          })
                        }
                      >
                        Move to top left
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'rect',
                            id: win.id,
                            rect: {
                              ...win.rect,
                              width: Math.min(800, win.rect.width + 80),
                              height: Math.min(600, win.rect.height + 40),
                            },
                          })
                        }
                      >
                        Increase size
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'rect',
                            id: win.id,
                            rect: {
                              ...win.rect,
                              width: Math.max(360, win.rect.width - 80),
                              height: Math.max(240, win.rect.height - 40),
                            },
                          })
                        }
                      >
                        Decrease size
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="os-window-content">
                <AppBoundary>
                  {detail && !data?.markdownRemark && currentApp === win.id ? (
                    children
                  ) : win.id === 'arcade' ? (
                    <Suspense
                      fallback={
                        <div className="os-loading">Loading arcade…</div>
                      }
                    >
                      {ready ? (
                        <Arcade
                          active={active}
                          sound={preferences.sound}
                          motion={preferences.motion}
                          initialGame={parseGameRoute(routes.arcade)}
                          onGameChange={game =>
                            goTo(game ? gameRoute(game) : '/arcade', true)
                          }
                          onSoundChange={sound => setPreferences({ sound })}
                          onExit={() =>
                            structuralAction({ type: 'minimize', id: 'arcade' })
                          }
                        />
                      ) : (
                        <div className="os-loading">Loading arcade…</div>
                      )}
                    </Suspense>
                  ) : win.id === 'signal-lab' ? (
                    <Suspense
                      fallback={
                        <div className="os-loading">Loading Signal Lab…</div>
                      }
                    >
                      {ready ? (
                        <SignalLab
                          active={active}
                          motion={preferences.motion}
                        />
                      ) : (
                        <div className="os-loading">Loading Signal Lab…</div>
                      )}
                    </Suspense>
                  ) : win.id === 'photography' ? (
                    <Suspense fallback={<PhotographyPlaceholder />}>
                      {ready ? (
                        <Photography
                          active={active}
                          motion={preferences.motion}
                        />
                      ) : (
                        <PhotographyPlaceholder />
                      )}
                    </Suspense>
                  ) : win.id === 'terminal' && !ready ? (
                    <div className="os-loading">Starting terminal…</div>
                  ) : (
                    <Apps
                      appId={win.id}
                      active={active}
                      openApp={openApp}
                      navigate={(target, update) => goTo(target, false, update)}
                      collectionRequest={collectionRequest}
                      preferences={preferences}
                      setPreferences={setPreferences}
                      replayStartup={() => {
                        startupPreviousFocus.current =
                          document.activeElement instanceof HTMLElement
                            ? document.activeElement
                            : null
                        startupWasActive.current = true
                        setLauncher(false)
                        setMenu(null)
                        replayBoot()
                      }}
                      resetDesktop={resetDesktop}
                      routePath={routes[win.id] || app.path}
                      routeContent={
                        detail &&
                        currentApp === win.id &&
                        !pageTransitioning &&
                        routeKey(routes[win.id] || app.path) ===
                          routeKey(currentHref)
                          ? children
                          : undefined
                      }
                    />
                  )}
                </AppBoundary>
              </div>
              {win.floating && !compact && (
                <div
                  className="os-resize"
                  onPointerDown={event => drag(event, win, true)}
                  aria-hidden="true"
                />
              )}
            </section>
          )
        })}
        {currentApp &&
          !compact &&
          !expanded &&
          !currentView.showDesktop &&
          geometry.tabs.map(group => (
            <nav
              className="os-tile-tabs"
              key={group.ids.join('-')}
              style={{
                left: group.rect.x,
                top: group.rect.y,
                width: group.rect.width,
              }}
              aria-label="Grouped windows"
            >
              {group.ids.map(id => (
                <button
                  type="button"
                  aria-pressed={group.selected === id}
                  aria-controls={`os-window-${id}`}
                  key={id}
                  onClick={() => focusWindow(id)}
                >
                  {apps.find(app => app.id === id)?.label}
                </button>
              ))}
            </nav>
          ))}
        {currentApp &&
          !compact &&
          !expanded &&
          !currentView.showDesktop &&
          geometry.dividers.map(divider => (
            <input
              key={divider.path}
              className={`os-tile-divider os-tile-divider--${divider.axis}`}
              aria-label={`Resize ${divider.axis} split ${divider.path || 'main'}`}
              type="range"
              min={divider.minimumRatio * 100}
              max="80"
              value={divider.ratio * 100}
              onPointerDown={event => resizeSplit(event, divider)}
              onChange={event =>
                dispatch({
                  type: 'split',
                  path: divider.path,
                  ratio: Number(event.target.value) / 100,
                })
              }
              style={{
                left: divider.rect.x,
                top: divider.rect.y,
                width: divider.rect.width,
                height: divider.rect.height,
              }}
            />
          ))}
      </main>
      <footer
        className="os-desktop-footer"
        data-startup-clock={boot ? '' : undefined}
      >
        <button
          type="button"
          onClick={() => {
            setQuery('')
            setLauncher(true)
          }}
        >
          <Search size={12} /> Find an app <kbd>Ctrl / ⌘ K</kbd>
        </button>
      </footer>
      <nav
        className="os-mobile-bar"
        aria-label="Primary navigation"
        data-startup-clock={boot ? '' : undefined}
      >
        <button
          type="button"
          onClick={() => openApp('about')}
          aria-current={currentView.focused === 'about' ? 'page' : undefined}
        >
          <UserRound size={18} aria-hidden="true" />
          About
        </button>
        <button
          type="button"
          onClick={() => openApp('projects')}
          aria-current={
            currentView.focused === 'projects' ||
            currentView.focused === 'system'
              ? 'page'
              : undefined
          }
        >
          <FolderClosed size={18} aria-hidden="true" />
          Projects
        </button>
        <button
          type="button"
          onClick={() => openApp('contact')}
          aria-current={currentView.focused === 'contact' ? 'page' : undefined}
        >
          <Mail size={18} aria-hidden="true" />
          Contact
        </button>
        <button
          type="button"
          aria-label="Open app launcher"
          onClick={() => {
            setQuery('')
            setLauncher(true)
          }}
        >
          <Command size={18} />
          Apps
        </button>
      </nav>
      {launcher && (
        <div
          className="os-launcher-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setLauncher(false)
          }}
        >
          <div
            className="os-launcher"
            role="dialog"
            aria-modal="true"
            aria-label="App launcher"
            ref={launcherRef}
          >
            <div className="os-launcher-search">
              <Search size={19} />
              <input
                ref={searchRef}
                placeholder="Search portfolio apps"
                aria-label="Search portfolio apps"
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && filtered[0])
                    openApp(filtered[0].id)
                }}
              />
              <button type="button" onClick={() => setLauncher(false)}>
                esc
              </button>
            </div>
            <div className="os-launcher-list">
              {filtered.map(app => {
                const Icon = icons[app.id]
                return (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => openApp(app.id)}
                  >
                    <span className="os-launcher-icon">
                      <Icon size={22} />
                    </span>
                    <span>
                      <strong>{app.label}</strong>
                      <small>{app.subtitle}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <div className="os-empty">
                  No matching apps. Try another name.
                </div>
              )}
            </div>
            <div className="os-launcher-hint">↵ to open · esc to close</div>
          </div>
        </div>
      )}
      <BootSequence
        phase={startupPhase}
        ready={ready}
        workspace={
          views.find(view => view.id === state.activeView)?.label || 'Desktop'
        }
        destination={startupDestination}
        restored={restored}
        onReveal={revealBoot}
        onComplete={finishBoot}
      />
    </div>
  )
}
export const wrapPageElement = ({
  element,
  props,
}: {
  element: React.ReactNode
  props?: DesktopProps
}) => (
  <Desktop location={props?.location} data={props?.data}>
    {element}
  </Desktop>
)
