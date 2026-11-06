import { RefObject, useEffect, useLayoutEffect, useRef } from 'react'
import type { DesktopState, WindowRect } from './model'

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useWindowMotion(
  stageRef: RefObject<HTMLDivElement>,
  state: DesktopState,
  enabled: boolean,
  interacting: boolean,
) {
  const previous = useRef(new Map<string, WindowRect>())
  const animations = useRef(new Map<string, Animation>())
  const wasEnabled = useRef(false)
  useBrowserLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const elements = Array.from(
      stage.querySelectorAll<HTMLElement>('[data-app]:not([hidden])'),
    )
    const inFlight = new Map<string, { rect: DOMRect; opacity: number }>()
    elements.forEach(element => {
      if (animations.current.has(element.dataset.app))
        inFlight.set(element.dataset.app, {
          rect: element.getBoundingClientRect(),
          opacity: Number(window.getComputedStyle(element).opacity),
        })
    })
    animations.current.forEach(animation => animation.cancel())
    animations.current.clear()
    const next = new Map<string, WindowRect>()
    const animate =
      enabled &&
      wasEnabled.current &&
      !interacting &&
      !document.documentElement.hasAttribute('data-page-transition') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    wasEnabled.current = enabled
    elements.forEach(element => {
      const id = element.dataset.app
      const rect = element.getBoundingClientRect()
      const box = {
        x: rect.left - bounds.left,
        y: rect.top - bounds.top,
        width: rect.width,
        height: rect.height,
      }
      const previousBox = previous.current.get(id)
      const moving = inFlight.get(id)
      const from =
        previousBox && moving && rect.width && rect.height
          ? {
              x: previousBox.x + moving.rect.left - rect.left,
              y: previousBox.y + moving.rect.top - rect.top,
              width: (previousBox.width * moving.rect.width) / rect.width,
              height: (previousBox.height * moving.rect.height) / rect.height,
            }
          : previousBox
      next.set(id, box)
      if (!animate || typeof element.animate !== 'function') return
      let animation: Animation
      if (!from) {
        animation = element.animate(
          [
            {
              opacity: 0,
              transform: 'translateY(10px) scale(.985)',
              transformOrigin: 'top left',
            },
            { opacity: 1, transform: 'none', transformOrigin: 'top left' },
          ],
          { duration: 280, easing: 'cubic-bezier(.16,1,.3,1)' },
        )
      } else if (
        Math.abs(from.x - box.x) +
          Math.abs(from.y - box.y) +
          Math.abs(from.width - box.width) +
          Math.abs(from.height - box.height) >
        1
      ) {
        animation = element.animate(
          [
            {
              transform: `translate(${from.x - box.x}px, ${from.y - box.y}px) scale(${from.width / box.width}, ${from.height / box.height})`,
              transformOrigin: 'top left',
              opacity: moving?.opacity ?? 1,
            },
            {
              transform: 'none',
              transformOrigin: 'top left',
              opacity: 1,
            },
          ],
          { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' },
        )
      }
      if (!animation) return
      animations.current.set(id, animation)
      animation.onfinish = () => {
        if (animations.current.get(id) === animation)
          animations.current.delete(id)
      }
    })
    previous.current = next
  }, [
    stageRef,
    state.activeView,
    state.windows,
    state.views,
    enabled,
    interacting,
  ])
  useEffect(
    () => () => animations.current.forEach(animation => animation.cancel()),
    [],
  )
}
