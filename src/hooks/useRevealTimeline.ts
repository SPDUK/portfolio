import { RefObject } from 'react'
import { gsap, motion, prefersReducedMotion, useGSAP } from '../utils/motion'

interface RevealTimelineOptions {
  targets?: string
  dependencies?: unknown[]
  y?: number
  x?: number
  scale?: number
  stagger?: number
  delay?: number
  duration?: number
}

export const useRevealTimeline = (
  scope: RefObject<HTMLElement>,
  {
    targets = '[data-reveal]',
    dependencies = [],
    y = 18,
    x = 0,
    scale = 1,
    stagger = motion.stagger,
    delay = 0,
    duration = motion.sectionDuration,
  }: RevealTimelineOptions = {},
) => {
  useGSAP(
    (_context, contextSafe) => {
      const runReveal = contextSafe(() => {
        const elements = scope.current
          ? Array.from(scope.current.querySelectorAll<HTMLElement>(targets))
          : []

        if (!elements.length) {
          return
        }

        if (prefersReducedMotion()) {
          gsap.set(elements, {
            autoAlpha: 1,
            clearProps: 'transform,opacity',
          })
          return
        }

        gsap.fromTo(
          elements,
          {
            autoAlpha: 0,
            x,
            y,
            scale,
            filter: 'blur(8px)',
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration,
            delay,
            ease: motion.ease,
            stagger,
            clearProps: 'filter',
          },
        )
      })
      const frame = window.requestAnimationFrame(runReveal)

      return () => window.cancelAnimationFrame(frame)
    },
    {
      scope,
      dependencies,
      revertOnUpdate: true,
    },
  )
}
