/* eslint-disable no-nested-ternary */
import { z } from 'zod'

export type AppId =
  | 'about'
  | 'projects'
  | 'writing'
  | 'terminal'
  | 'arcade'
  | 'signal-lab'
  | 'photography'
  | 'wallpapers'
  | 'settings'
  | 'contact'
  | 'system'
const wallpaperIds = [
  'afterglow',
  'night-drive',
  'redshift',
  'feedback',
  'last-train',
] as const
export type WallpaperId = (typeof wallpaperIds)[number]
export interface DesktopPreferences {
  wallpaper: WallpaperId
  motion: boolean
  sound: boolean
}
export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}
export interface DesktopWindow {
  id: AppId
  view: ViewId
  minimized: boolean
  floating: boolean
  rect: WindowRect
}
export type LayoutNode =
  | { kind: 'leaf'; id: AppId }
  | {
      kind: 'split'
      axis: 'horizontal' | 'vertical'
      ratio: number
      first: LayoutNode
      second: LayoutNode
    }
  | { kind: 'tabs'; ids: AppId[]; selected: AppId }
export type ViewId = 'desktop' | 'projects' | 'writing' | 'play'
export interface ViewState {
  layout: LayoutNode | null
  focused: AppId | null
  maximized: AppId | null
  solo: AppId | null
  showDesktop: boolean
}
export interface DesktopState {
  version: 2
  windows: DesktopWindow[]
  activeView: ViewId
  views: Partial<Record<ViewId, ViewState>>
  routes: Partial<Record<AppId, string>>
}
type AppDefinition = {
  id: AppId
  label: string
  shortLabel?: string
  path: string
  subtitle: string
} & ({ role: 'primary'; home: ViewId } | { role: 'secondary' })
export const apps: AppDefinition[] = [
  {
    id: 'about',
    role: 'primary',
    home: 'desktop',
    label: 'About',
    path: '/',
    subtitle: 'Steve, software engineer',
  },
  {
    id: 'projects',
    role: 'primary',
    home: 'projects',
    label: 'Projects',
    path: '/projects',
    subtitle: 'Current work and earlier projects',
  },
  {
    id: 'writing',
    role: 'primary',
    home: 'writing',
    label: 'Writing',
    path: '/blog',
    subtitle: 'Notes on software development',
  },
  {
    id: 'terminal',
    role: 'secondary',
    label: 'Terminal',
    path: '/terminal',
    subtitle: 'A different way to explore',
  },
  {
    id: 'arcade',
    role: 'secondary',
    label: 'Arcade',
    path: '/arcade',
    subtitle: 'Classic games, a puzzle, pixel art and beats',
  },
  {
    id: 'signal-lab',
    role: 'secondary',
    label: 'Signal Lab',
    path: '/signal-lab',
    subtitle: 'Interactive patterns in Canvas',
  },
  {
    id: 'photography',
    role: 'secondary',
    label: 'Photography',
    shortLabel: 'Photos',
    path: '/photography',
    subtitle: 'A collection of travel photographs',
  },
  {
    id: 'contact',
    role: 'secondary',
    label: 'Contact',
    path: '/contact',
    subtitle: 'Start a conversation',
  },
  {
    id: 'wallpapers',
    role: 'secondary',
    label: 'Wallpapers',
    path: '/wallpapers',
    subtitle: 'Set the atmosphere',
  },
  {
    id: 'settings',
    role: 'secondary',
    label: 'Settings',
    path: '/settings',
    subtitle: 'Make yourself at home',
  },
  {
    id: 'system',
    role: 'secondary',
    label: 'About this site',
    path: '/made-with',
    subtitle: 'The engineering behind this portfolio',
  },
]
export const defaultPreferences: DesktopPreferences = {
  wallpaper: 'afterglow',
  motion: true,
  sound: false,
}
export const makeWindow = (
  id: AppId,
  view: ViewId = 'desktop',
): DesktopWindow => ({
  id,
  view,
  minimized: false,
  floating: false,
  rect: { x: 80, y: 55, width: 640, height: 470 },
})
const leaf = (id: AppId): LayoutNode => ({ kind: 'leaf', id })
export const views: {
  id: ViewId
  label: string
  description: string
  entry: AppId
  preset: LayoutNode
  solo: boolean
}[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    description: 'About Steve · current role and selected work',
    entry: 'about',
    preset: leaf('about'),
    solo: false,
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Selected work · room to explore',
    entry: 'projects',
    preset: leaf('projects'),
    solo: true,
  },
  {
    id: 'writing',
    label: 'Writing',
    description: 'Notes & ideas · a quiet place to read',
    entry: 'writing',
    preset: leaf('writing'),
    solo: true,
  },
  {
    id: 'play',
    label: 'Play',
    description: 'The arcade · take a little break',
    entry: 'arcade',
    preset: leaf('arcade'),
    solo: false,
  },
]
const emptyView = (): ViewState => ({
  layout: null,
  focused: null,
  maximized: null,
  solo: null,
  showDesktop: false,
})
export const viewState = (
  state: DesktopState,
  id = state.activeView,
): ViewState => state.views[id] || emptyView()
export const isPrimaryApp = (id: AppId): boolean =>
  apps.some(app => app.id === id && app.role === 'primary')
export const primaryApp = (view: ViewId): AppId | null =>
  apps.find(app => app.role === 'primary' && app.home === view)?.id || null
const appHome = (id: AppId) => {
  const app = apps.find(item => item.id === id)
  return app?.role === 'primary'
    ? views.find(view => view.id === app.home)
    : undefined
}
const updateView = (
  state: DesktopState,
  patch: Partial<ViewState>,
  id = state.activeView,
): DesktopState => ({
  ...state,
  views: { ...state.views, [id]: { ...viewState(state, id), ...patch } },
})
export function initialDesktop(id: AppId = 'about'): DesktopState {
  const empty: DesktopState = {
    version: 2,
    windows: [],
    activeView: 'desktop',
    views: {},
    routes: {},
  }
  const desktop = normalizeDesktop(enterView(empty, 'desktop'))
  return id === 'about'
    ? desktop
    : desktopReducer(desktop, { type: 'open', id })
}
function removeNode(node: LayoutNode | null, id: AppId): LayoutNode | null {
  if (!node) return null
  if (node.kind === 'leaf') return node.id === id ? null : node
  if (node.kind === 'tabs') {
    const ids = node.ids.filter(item => item !== id)
    return ids.length > 1
      ? {
          ...node,
          ids,
          selected: ids.includes(node.selected) ? node.selected : ids[0],
        }
      : ids.length
        ? leaf(ids[0])
        : null
  }
  const first = removeNode(node.first, id)
  const second = removeNode(node.second, id)
  return first && second ? { ...node, first, second } : first || second
}
function insertNode(
  node: LayoutNode | null,
  id: AppId,
  target: AppId,
  depth = 0,
): LayoutNode {
  if (!node) return leaf(id)
  const selectedTarget =
    depth === 0 && !layoutIds(node).includes(target)
      ? layoutIds(node)[0]
      : target
  if (node.kind === 'leaf') {
    if (node.id !== selectedTarget && depth > 0) return node
    return depth >= 2
      ? { kind: 'tabs', ids: [node.id, id], selected: id }
      : {
          kind: 'split',
          axis: depth % 2 ? 'vertical' : 'horizontal',
          ratio: 0.5,
          first: node,
          second: leaf(id),
        }
  }
  if (node.kind === 'tabs')
    return node.ids.includes(selectedTarget)
      ? { ...node, ids: [...node.ids, id], selected: id }
      : node
  const first = insertNode(node.first, id, selectedTarget, depth + 1)
  const second = insertNode(node.second, id, selectedTarget, depth + 1)
  if (first === node.first && second === node.second && depth === 0)
    return { kind: 'tabs', ids: [...layoutIds(node), id], selected: id }
  return { ...node, first, second }
}
export function layoutIds(node: LayoutNode): AppId[] {
  return node.kind === 'leaf'
    ? [node.id]
    : node.kind === 'tabs'
      ? node.ids
      : [...layoutIds(node.first), ...layoutIds(node.second)]
}
function selectNode(node: LayoutNode | null, id: AppId): LayoutNode | null {
  return !node
    ? null
    : node.kind === 'tabs'
      ? { ...node, selected: node.ids.includes(id) ? id : node.selected }
      : node.kind === 'split'
        ? {
            ...node,
            first: selectNode(node.first, id),
            second: selectNode(node.second, id),
          }
        : node
}
function resizeNode(
  node: LayoutNode | null,
  path: string,
  ratio: number,
): LayoutNode | null {
  if (!node || node.kind !== 'split') return node
  if (!path) return { ...node, ratio: Math.max(0.2, Math.min(0.8, ratio)) }
  return path[0] === '0'
    ? { ...node, first: resizeNode(node.first, path.slice(1), ratio) }
    : { ...node, second: resizeNode(node.second, path.slice(1), ratio) }
}
function placeNode(
  node: LayoutNode | null,
  id: AppId,
  target: AppId,
  placement: 'center' | 'left' | 'right' | 'top' | 'bottom',
): LayoutNode | null {
  if (!node) return leaf(id)
  if (
    (node.kind === 'leaf' && node.id === target) ||
    (node.kind === 'tabs' && node.ids.includes(target))
  ) {
    if (placement === 'center')
      return { kind: 'tabs', ids: [...layoutIds(node), id], selected: id }
    const before = placement === 'left' || placement === 'top'
    return {
      kind: 'split',
      axis:
        placement === 'left' || placement === 'right'
          ? 'horizontal'
          : 'vertical',
      ratio: 0.5,
      first: before ? leaf(id) : node,
      second: before ? node : leaf(id),
    }
  }
  return node.kind === 'split'
    ? {
        ...node,
        first: placeNode(node.first, id, target, placement),
        second: placeNode(node.second, id, target, placement),
      }
    : node
}
export interface TileGeometry {
  boxes: Partial<Record<AppId, WindowRect>>
  tabs: { ids: AppId[]; selected: AppId; rect: WindowRect }[]
  dividers: {
    path: string
    axis: 'horizontal' | 'vertical'
    ratio: number
    rect: WindowRect
    extent: number
    minimumRatio: number
  }[]
}
function layoutMinimum(node: LayoutNode): { width: number; height: number } {
  const ids = layoutIds(node)
  const reader = ids.some(
    id => id === 'about' || id === 'projects' || id === 'writing',
  )
  return {
    width: reader ? 420 : 360,
    height:
      (reader ? 320 : ids.includes('arcade') ? 300 : 240) +
      (node.kind === 'leaf' ? 0 : 30),
  }
}
function canSplit(node: LayoutNode, rect: WindowRect): boolean {
  if (node.kind !== 'split') return false
  const first = layoutMinimum(node.first)
  const second = layoutMinimum(node.second)
  return node.axis === 'horizontal'
    ? rect.width >= first.width + second.width + 12 &&
        rect.height >= Math.max(first.height, second.height)
    : rect.height >= first.height + second.height + 12 &&
        rect.width >= Math.max(first.width, second.width)
}
export function tileGeometry(
  node: LayoutNode | null,
  width: number,
  height: number,
  focused: AppId | null,
  primary: AppId | null = null,
): TileGeometry {
  const result: TileGeometry = { boxes: {}, tabs: [], dividers: [] }
  const walk = (entry: LayoutNode, rect: WindowRect, path: string) => {
    if (entry.kind === 'leaf') {
      result.boxes[entry.id] = rect
      return
    }
    if (entry.kind === 'tabs' || !canSplit(entry, rect)) {
      const ids = layoutIds(entry)
      const selected =
        focused && ids.includes(focused)
          ? focused
          : entry.kind === 'tabs'
            ? entry.selected
            : ids[0]
      result.tabs.push({ ids, selected, rect })
      result.boxes[selected] = {
        ...rect,
        y: rect.y + 30,
        height: rect.height - 30,
      }
      return
    }
    const horizontal = entry.axis === 'horizontal'
    const available = (horizontal ? rect.width : rect.height) - 12
    const firstMinimum = layoutMinimum(entry.first)
    const secondMinimum = layoutMinimum(entry.second)
    const protectedRoot =
      !path &&
      horizontal &&
      entry.first.kind === 'leaf' &&
      entry.first.id === primary
    const min = horizontal
      ? Math.max(firstMinimum.width, protectedRoot ? rect.width / 2 : 0)
      : firstMinimum.height
    const secondMin = horizontal ? secondMinimum.width : secondMinimum.height
    const firstSize = Math.max(
      min,
      Math.min(available - secondMin, available * entry.ratio),
    )
    const first = {
      ...rect,
      ...(horizontal ? { width: firstSize } : { height: firstSize }),
    }
    const second = {
      ...rect,
      ...(horizontal
        ? { x: rect.x + firstSize + 12, width: available - firstSize }
        : { y: rect.y + firstSize + 12, height: available - firstSize }),
    }
    const divider = {
      ...rect,
      ...(horizontal
        ? { x: rect.x + firstSize, width: 12 }
        : { y: rect.y + firstSize, height: 12 }),
    }
    result.dividers.push({
      path,
      axis: entry.axis,
      ratio: entry.ratio,
      rect: divider,
      extent: available,
      minimumRatio: protectedRoot ? 0.5 : 0.2,
    })
    walk(entry.first, first, `${path}0`)
    walk(entry.second, second, `${path}1`)
  }
  if (node) walk(node, { x: 0, y: 0, width, height }, '')
  return result
}
export function desktopGeometry(
  state: DesktopState,
  size: { width: number; height: number },
): TileGeometry {
  const current = viewState(state)
  return tileGeometry(
    current.layout,
    size.width,
    size.height,
    current.focused,
    primaryApp(state.activeView),
  )
}
export type DesktopAction =
  | { type: 'open'; id: AppId }
  | { type: 'view'; id: ViewId }
  | { type: 'route'; id: AppId; href: string; acknowledged?: boolean }
  | { type: 'focus'; id: AppId }
  | { type: 'close' | 'minimize' | 'maximize' | 'float'; id: AppId }
  | { type: 'rect'; id: AppId; rect: WindowRect }
  | { type: 'desktop' | 'arrange' }
  | { type: 'split'; path: string; ratio: number }
  | {
      type: 'place'
      id: AppId
      target: AppId
      placement: 'center' | 'left' | 'right' | 'top' | 'bottom'
    }
  | { type: 'restore'; state: DesktopState }
  | { type: 'reset' }

function enterView(state: DesktopState, id: ViewId): DesktopState {
  const definition = views.find(view => view.id === id)
  let next = { ...state, activeView: id }
  if (!state.views[id]) {
    const members = layoutIds(definition.preset)
    next = {
      ...next,
      windows: [
        ...state.windows,
        ...members
          .filter(app => !state.windows.some(win => win.id === app))
          .map(app => makeWindow(app, id)),
      ],
      views: {
        ...state.views,
        [id]: { ...emptyView(), layout: definition.preset },
      },
    }
  }
  if (id === 'play') return openWindow(next, 'arcade')
  const primary = primaryApp(id)
  if (!primary) return next
  const existing = next.windows.some(win => win.id === primary)
  next = {
    ...next,
    windows: existing
      ? next.windows.map(win =>
          win.id === primary
            ? { ...win, view: id, minimized: false, floating: false }
            : win,
        )
      : [...next.windows, makeWindow(primary, id)],
  }
  return updateView(next, {
    focused: primary,
    solo: definition.solo ? primary : null,
    maximized: null,
    showDesktop: false,
  })
}

function dockNode(
  node: LayoutNode | null,
  id: AppId,
  primary: AppId | null,
  target: AppId | null,
): LayoutNode {
  if (
    primary &&
    node?.kind === 'split' &&
    node.first.kind === 'leaf' &&
    node.first.id === primary
  )
    return {
      ...node,
      second: insertNode(
        node.second,
        id,
        target && layoutIds(node.second).includes(target)
          ? target
          : layoutIds(node.second)[0],
        1,
      ),
    }
  if (primary && node?.kind === 'leaf' && node.id === primary)
    return {
      kind: 'split',
      axis: 'horizontal',
      ratio: 0.6,
      first: node,
      second: leaf(id),
    }
  return insertNode(node, id, target || id)
}

function openWindow(state: DesktopState, id: AppId): DesktopState {
  const home = appHome(id)
  if (home) {
    const next = enterView(state, home.id)
    return updateView(next, { focused: id, solo: id, maximized: null })
  }
  const existing = state.windows.find(win => win.id === id)
  const current = viewState(state)
  const alreadyTiled =
    existing?.view === state.activeView &&
    !existing.minimized &&
    !existing.floating
  const next = {
    ...state,
    windows: existing
      ? state.windows.map(win =>
          win.id === id
            ? {
                ...win,
                view: state.activeView,
                minimized: false,
                floating: false,
              }
            : win,
        )
      : [...state.windows, makeWindow(id, state.activeView)],
  }
  return updateView(next, {
    layout: alreadyTiled
      ? selectNode(current.layout, id)
      : dockNode(
          removeNode(current.layout, id),
          id,
          primaryApp(state.activeView),
          current.focused,
        ),
    focused: id,
    maximized: null,
    solo: null,
    showDesktop: false,
  })
}

function normalizeDesktop(state: DesktopState): DesktopState {
  const windows = state.windows
    .filter(
      (win, index) =>
        state.windows.findIndex(other => other.id === win.id) === index,
    )
    .map(win => {
      const home = appHome(win.id)
      return home && (win.view !== home.id || win.floating)
        ? { ...win, view: home.id, floating: false }
        : win
    })
  const normalized: DesktopState = {
    ...state,
    windows:
      windows.length === state.windows.length &&
      windows.every((win, index) => win === state.windows[index])
        ? state.windows
        : windows,
    views: {},
  }
  views.forEach(definition => {
    const saved = state.views[definition.id]
    const members = windows.filter(
      win => win.view === definition.id && !win.minimized,
    )
    if (!saved && !members.length) return
    const current = saved || emptyView()
    const allowed = new Set(
      members.filter(win => !win.floating).map(win => win.id),
    )
    const seen = new Set<AppId>()
    const prune = (node: LayoutNode | null): LayoutNode | null => {
      if (!node) return null
      if (node.kind === 'leaf') {
        if (!allowed.has(node.id) || seen.has(node.id)) return null
        seen.add(node.id)
        return node
      }
      if (node.kind === 'tabs') {
        const ids = node.ids.filter(id => {
          if (!allowed.has(id) || seen.has(id)) return false
          seen.add(id)
          return true
        })
        return ids.length > 1
          ? ids.length === node.ids.length
            ? node
            : {
                ...node,
                ids,
                selected: ids.includes(node.selected) ? node.selected : ids[0],
              }
          : ids.length
            ? leaf(ids[0])
            : null
      }
      const first = prune(node.first)
      const second = prune(node.second)
      return first && second
        ? first === node.first && second === node.second
          ? node
          : { ...node, first, second }
        : first || second
    }
    let layout = prune(current.layout)
    const primary = primaryApp(definition.id)
    const visiblePrimary = primary && allowed.has(primary) ? primary : null
    const ratio =
      visiblePrimary &&
      layout?.kind === 'split' &&
      layout.axis === 'horizontal' &&
      layout.first.kind === 'leaf' &&
      layout.first.id === visiblePrimary
        ? Math.max(0.5, Math.min(0.8, layout.ratio))
        : 0.6
    if (visiblePrimary) {
      const companions = removeNode(layout, visiblePrimary)
      if (
        layout?.kind !== 'split' ||
        layout.axis !== 'horizontal' ||
        layout.first.kind !== 'leaf' ||
        layout.first.id !== visiblePrimary ||
        layout.ratio !== ratio
      )
        layout = companions
          ? {
              kind: 'split',
              axis: 'horizontal',
              ratio,
              first: leaf(visiblePrimary),
              second: companions,
            }
          : layout?.kind === 'leaf' && layout.id === visiblePrimary
            ? layout
            : leaf(visiblePrimary)
    }
    allowed.forEach(id => {
      if (!seen.has(id) && id !== visiblePrimary)
        layout = dockNode(layout, id, visiblePrimary, current.focused)
    })
    const present = (id: AppId | null) =>
      members.some(win => win.id === id) ? id : null
    const nextView: ViewState = {
      ...current,
      layout,
      focused:
        present(current.focused) || visiblePrimary || members[0]?.id || null,
      maximized: present(current.maximized),
      solo: present(current.solo),
    }
    normalized.views[definition.id] =
      layout === current.layout &&
      nextView.focused === current.focused &&
      nextView.maximized === current.maximized &&
      nextView.solo === current.solo
        ? current
        : nextView
  })
  if (views.every(view => normalized.views[view.id] === state.views[view.id]))
    normalized.views = state.views
  return normalized
}

function reduceDesktop(
  state: DesktopState,
  action: DesktopAction,
): DesktopState {
  const current = viewState(state)
  switch (action.type) {
    case 'open':
      return openWindow(state, action.id)
    case 'view':
      return enterView(state, action.id)
    case 'route': {
      const next = action.acknowledged
        ? state
        : action.id === 'about'
          ? enterView(state, 'desktop')
          : openWindow(state, action.id)
      return { ...next, routes: { ...next.routes, [action.id]: action.href } }
    }
    case 'focus': {
      const win = state.windows.find(item => item.id === action.id)
      if (!win || win.view !== state.activeView || win.minimized) return state
      return updateView(state, {
        focused: action.id,
        layout: selectNode(current.layout, action.id),
        showDesktop: false,
        maximized:
          current.maximized && current.maximized !== action.id
            ? null
            : current.maximized,
        solo: current.solo && current.solo !== action.id ? null : current.solo,
      })
    }
    case 'close':
    case 'minimize': {
      const win = state.windows.find(item => item.id === action.id)
      if (!win) return state
      const old = viewState(state, win.view)
      const windows =
        action.type === 'close'
          ? state.windows.filter(item => item.id !== action.id)
          : state.windows.map(item =>
              item.id === action.id ? { ...item, minimized: true } : item,
            )
      const nextFocus =
        windows
          .filter(item => item.view === win.view && !item.minimized)
          .slice(-1)[0]?.id || null
      return updateView(
        { ...state, windows },
        {
          layout: removeNode(old.layout, action.id),
          focused: old.focused === action.id ? nextFocus : old.focused,
          maximized: old.maximized === action.id ? null : old.maximized,
          solo: old.solo === action.id ? null : old.solo,
        },
        win.view,
      )
    }
    case 'maximize':
      if (
        isPrimaryApp(action.id) &&
        (current.maximized === action.id || current.solo === action.id)
      )
        return reduceDesktop(state, { type: 'arrange' })
      return updateView(state, {
        focused: action.id,
        maximized:
          current.maximized === action.id || current.solo === action.id
            ? null
            : action.id,
        solo: null,
        showDesktop: false,
      })
    case 'arrange': {
      const primary = primaryApp(state.activeView)
      let next = updateView(
        {
          ...state,
          windows: state.windows.map(win =>
            win.view === state.activeView && !win.minimized
              ? { ...win, floating: false }
              : win,
          ),
        },
        { maximized: null, solo: null, showDesktop: false },
      )
      const companion = next.windows.some(
        win =>
          win.view === state.activeView &&
          !win.minimized &&
          !isPrimaryApp(win.id),
      )
      const main = next.windows.some(
        win => win.id === primary && !win.minimized,
      )
      if (main && !companion) {
        next = openWindow(next, 'terminal')
        next = updateView(next, { focused: current.focused || primary })
      }
      return next
    }
    case 'float': {
      const win = state.windows.find(item => item.id === action.id)
      if (!win || isPrimaryApp(action.id)) return state
      return updateView(
        {
          ...state,
          windows: state.windows.map(item =>
            item.id === action.id
              ? { ...item, floating: !item.floating }
              : item,
          ),
        },
        {
          layout: win.floating
            ? dockNode(
                current.layout,
                action.id,
                primaryApp(state.activeView),
                current.focused,
              )
            : removeNode(current.layout, action.id),
          focused: action.id,
          maximized: null,
          solo: null,
        },
      )
    }
    case 'rect':
      return {
        ...state,
        windows: state.windows.map(win =>
          win.id === action.id ? { ...win, rect: action.rect } : win,
        ),
      }
    case 'desktop':
      return updateView(state, { showDesktop: !current.showDesktop })
    case 'split':
      return updateView(state, {
        layout: resizeNode(current.layout, action.path, action.ratio),
      })
    case 'place': {
      if (action.id === action.target || isPrimaryApp(action.id)) return state
      const source = state.windows.find(win => win.id === action.id)
      const target = state.windows.find(win => win.id === action.target)
      if (
        !source ||
        !target ||
        target.floating ||
        source.view !== target.view ||
        target.view !== state.activeView
      )
        return state
      return updateView(
        {
          ...state,
          windows: state.windows.map(win =>
            win.id === action.id
              ? { ...win, floating: false, minimized: false }
              : win,
          ),
        },
        {
          layout: isPrimaryApp(action.target)
            ? dockNode(
                removeNode(current.layout, action.id),
                action.id,
                action.target,
                null,
              )
            : placeNode(
                removeNode(current.layout, action.id),
                action.id,
                action.target,
                action.placement,
              ),
          focused: action.id,
          maximized: null,
          solo: null,
        },
      )
    }
    case 'restore':
      return action.state
    case 'reset':
      return initialDesktop()
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}

export function desktopReducer(
  state: DesktopState,
  action: DesktopAction,
): DesktopState {
  return normalizeDesktop(reduceDesktop(state, action))
}

export const focusedRoute = (state: DesktopState) => {
  const id =
    viewState(state).focused ||
    views.find(view => view.id === state.activeView).entry
  return state.routes[id] || apps.find(app => app.id === id).path
}

export function routeKey(href: string): string {
  const query = href.indexOf('?')
  const path = query < 0 ? href : href.slice(0, query)
  return (path.replace(/\/$/, '') || '/') + (query < 0 ? '' : href.slice(query))
}

export type DocumentRoutes = Partial<Record<string, 'projects' | 'writing'>>
export function resolveApp(
  href: string,
  documents: DocumentRoutes = {},
): AppId | null {
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\'))
    return null
  const path = href.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  return apps.find(app => app.path === path)?.id || documents[path] || null
}
function readRoutes(
  value: unknown,
  documents: DocumentRoutes,
): Partial<Record<AppId, string>> {
  const result = z.record(z.string(), z.string()).safeParse(value)
  const routes: Partial<Record<AppId, string>> = {}
  if (result.success)
    Object.entries(result.data).forEach(([id, href]) => {
      const owner = resolveApp(href, documents)
      if (owner === id) routes[owner] = href
    })
  return routes
}
function readJson(value: string | null | undefined): unknown {
  try {
    return JSON.parse(value || 'null')
  } catch {
    return null
  }
}

export function readDesktop(
  value: string | null,
  documents: DocumentRoutes = {},
  legacyRoutes: string | null = null,
): DesktopState | null {
  try {
    const raw: unknown = JSON.parse(value || 'null')
    const current = desktopStorageSchema.safeParse(raw)
    const legacy = legacyStorageSchema.safeParse(raw)
    if (!current.success && !legacy.success) return null
    if (raw && typeof raw === 'object' && 'version' in raw && !current.success)
      return null
    const windows: DesktopWindow[] = current.success
      ? current.data.windows
      : legacy.data.windows.map(win => ({
          id: win.id,
          minimized: win.minimized,
          floating: win.floating,
          rect: win.rect,
          view:
            appHome(win.id)?.id ||
            (win.workspace === 1
              ? 'projects'
              : win.workspace === 2
                ? 'play'
                : 'desktop'),
        }))
    const unique = windows
      .filter(
        (win, index) =>
          windows.findIndex(other => other.id === win.id) === index,
      )
      .map(win => ({ ...win, view: appHome(win.id)?.id || win.view }))
    const restored: DesktopState = {
      version: 2,
      windows: unique,
      activeView: current.success
        ? current.data.activeView
        : legacy.data.workspace === 1
          ? 'projects'
          : legacy.data.workspace === 2
            ? 'play'
            : 'desktop',
      views: {},
      routes: readRoutes(
        current.success ? current.data.routes : readJson(legacyRoutes),
        documents,
      ),
    }
    views.forEach(definition => {
      const members = unique.filter(win => win.view === definition.id)
      const saved = current.success ? current.data.views[definition.id] : null
      if (!members.length && !saved) return
      const tiled = members
        .filter(win => !win.minimized && !win.floating)
        .map(win => win.id)
      const legacyIndex =
        definition.id === 'desktop'
          ? 0
          : definition.id === 'projects'
            ? 1
            : definition.id === 'play'
              ? 2
              : -1
      const candidate =
        saved?.layout ||
        (!current.success && legacy.data.layouts?.[legacyIndex])
      const parsed = parseLayout(candidate, tiled)
      const presetIds = layoutIds(definition.preset)
      const layout =
        parsed &&
        layoutIds(parsed).length === tiled.length &&
        new Set(layoutIds(parsed)).size === tiled.length
          ? parsed
          : tiled.length === presetIds.length &&
              presetIds.every(id => tiled.includes(id))
            ? definition.preset
            : tiled.reduce<LayoutNode | null>(
                (node, id) => insertNode(node, id, tiled[0]),
                null,
              )
      const present = (id: AppId | null | undefined) =>
        members.some(win => win.id === id && !win.minimized) ? id : null
      const legacyFocused = !current.success ? legacy.data.focused : null
      restored.views[definition.id] = {
        layout,
        focused:
          present(saved?.focused || legacyFocused) ||
          members.find(win => !win.minimized)?.id ||
          null,
        maximized: present(saved?.maximized),
        solo: present(saved?.solo),
        showDesktop: saved?.showDesktop || false,
      }
    })
    if (!restored.views[restored.activeView])
      return normalizeDesktop(enterView(restored, restored.activeView))
    return normalizeDesktop(restored)
  } catch {
    return null
  }
}
function parseLayout(
  value: unknown,
  allowed: AppId[],
  depth = 0,
): LayoutNode | null {
  if (depth > 12 || !value || typeof value !== 'object' || !('kind' in value))
    return null
  if (value.kind === 'leaf' && 'id' in value) {
    const id = allowed.find(item => item === value.id)
    return id ? leaf(id) : null
  }
  if (
    value.kind === 'tabs' &&
    'ids' in value &&
    Array.isArray(value.ids) &&
    'selected' in value
  ) {
    const ids = value.ids
      .map(item => allowed.find(id => id === item))
      .filter((id): id is AppId => !!id)
    if (ids.length === 0 || ids.length !== value.ids.length) return null
    return {
      kind: 'tabs',
      ids,
      selected: ids.find(id => id === value.selected) || ids[0],
    }
  }
  if (
    value.kind === 'split' &&
    'first' in value &&
    'second' in value &&
    'axis' in value &&
    'ratio' in value &&
    typeof value.ratio === 'number' &&
    Number.isFinite(value.ratio) &&
    (value.axis === 'horizontal' || value.axis === 'vertical')
  ) {
    const first = parseLayout(value.first, allowed, depth + 1)
    const second = parseLayout(value.second, allowed, depth + 1)
    return first && second
      ? {
          kind: 'split',
          first,
          second,
          axis: value.axis,
          ratio: Math.max(0.2, Math.min(0.8, value.ratio)),
        }
      : null
  }
  return null
}

const appIdSchema = z.custom<AppId>((value): value is AppId =>
  apps.some(app => app.id === value),
)
const rectSchema = z.object({
  x: z.number().finite().min(0),
  y: z.number().finite().min(0),
  width: z.number().finite().min(1),
  height: z.number().finite().min(1),
})
const viewIdSchema = z.enum(['desktop', 'projects', 'writing', 'play'])
const viewSchema = z.object({
  layout: z.unknown(),
  focused: appIdSchema.nullable(),
  maximized: appIdSchema.nullable(),
  solo: appIdSchema.nullable(),
  showDesktop: z.boolean(),
})
const desktopStorageSchema = z.object({
  version: z.literal(2),
  windows: z.array(
    z.object({
      id: appIdSchema,
      view: viewIdSchema,
      minimized: z.boolean(),
      floating: z.boolean(),
      rect: rectSchema,
    }),
  ),
  activeView: viewIdSchema,
  views: z.partialRecord(viewIdSchema, viewSchema),
  routes: z.unknown(),
})
const legacyStorageSchema = z.object({
  windows: z.array(
    z.object({
      id: appIdSchema,
      workspace: z.number().int().min(0).max(2),
      minimized: z.boolean(),
      floating: z.boolean(),
      rect: rectSchema,
    }),
  ),
  workspace: z.number().int().min(0).max(2),
  focused: appIdSchema.optional(),
  layouts: z.array(z.unknown()).optional(),
})
const preferencesSchema = z.object({
  wallpaper: z.enum(wallpaperIds).catch(defaultPreferences.wallpaper),
  motion: z.boolean(),
  sound: z.boolean(),
})
export function readPreferences(value: string | null): DesktopPreferences {
  try {
    const parsed = preferencesSchema.safeParse(JSON.parse(value || 'null'))
    return parsed.success
      ? { ...defaultPreferences, ...parsed.data }
      : defaultPreferences
  } catch {
    return defaultPreferences
  }
}
