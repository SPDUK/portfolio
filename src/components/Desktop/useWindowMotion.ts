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
  const animations = useRef<Animation[]>([])
  useBrowserLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    animations.current.forEach(animation => animation.cancel())
    animations.current = []
    const bounds = stage.getBoundingClientRect()
    const next = new Map<string, WindowRect>()
    const animate =
      enabled &&
      !interacting &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stage
      .querySelectorAll<HTMLElement>('[data-app]:not([hidden])')
      .forEach(element => {
        const id = element.dataset.app
        const rect = element.getBoundingClientRect()
        const box = {
          x: rect.left - bounds.left,
          y: rect.top - bounds.top,
          width: rect.width,
          height: rect.height,
        }
        const from = previous.current.get(id)
        next.set(id, box)
        if (!animate || typeof element.animate !== 'function') return
        if (!from) {
          animations.current.push(
            element.animate(
              [
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' },
            ),
          )
        } else if (
          Math.abs(from.x - box.x) +
            Math.abs(from.y - box.y) +
            Math.abs(from.width - box.width) +
            Math.abs(from.height - box.height) >
          1
        ) {
          animations.current.push(
            element.animate(
              [
                {
                  left: `${from.x}px`,
                  top: `${from.y}px`,
                  width: `${from.width}px`,
                  height: `${from.height}px`,
                },
                {
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                },
              ],
              { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' },
            ),
          )
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
