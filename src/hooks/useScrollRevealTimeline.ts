import { RefObject } from 'react'
import { gsap, motion, prefersReducedMotion, useGSAP } from '../utils/motion'

interface ScrollRevealTimelineOptions {
  targets?: string
  dependencies?: unknown[]
  y?: number
  x?: number
  scale?: number
  rotateX?: number
  stagger?: number
  duration?: number
  threshold?: number
  rootMargin?: string
}

export const useScrollRevealTimeline = (
  scope: RefObject<HTMLElement>,
  {
    targets = '[data-scroll-reveal]',
    dependencies = [],
    y = 28,
    x = 0,
    scale = 0.97,
    rotateX = 7,
    stagger = 0.06,
    duration = motion.sectionDuration,
    threshold = 0.18,
    rootMargin = '0px 0px -12% 0px',
  }: ScrollRevealTimelineOptions = {},
) => {
  useGSAP(
    (_context, contextSafe) => {
      const elements = scope.current
        ? Array.from(scope.current.querySelectorAll<HTMLElement>(targets))
        : []

      if (!elements.length) {
        return
      }

      if (prefersReducedMotion()) {
        gsap.set(elements, {
          autoAlpha: 1,
          clearProps: 'transform,opacity,filter,willChange,visibility',
        })
        return
      }

      elements.forEach(element => {
        delete element.dataset.scrollRevealed
      })

      gsap.set(elements, {
        autoAlpha: 0,
        x,
        y,
        scale,
        rotateX,
        transformPerspective: 900,
        transformOrigin: '50% 72%',
        filter: 'blur(10px)',
        willChange: 'transform, opacity, filter',
      })

      let pending: HTMLElement[] = []
      let frame = 0
      let observer: IntersectionObserver

      const revealBatch = contextSafe((batch: HTMLElement[]) => {
        const sortedBatch = [...batch].sort((a, b) => {
          const aRect = a.getBoundingClientRect()
          const bRect = b.getBoundingClientRect()
          const rowDelta = aRect.top - bRect.top

          return Math.abs(rowDelta) > 24 ? rowDelta : aRect.left - bRect.left
        })

        sortedBatch.forEach((element, index) => {
          if (element.dataset.scrollRevealed === 'true') {
            return
          }

          element.dataset.scrollRevealed = 'true'
          observer.unobserve(element)

          gsap.to(element, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            duration,
            delay: index * stagger,
            ease: motion.ease,
            clearProps: 'transform,filter,willChange',
          })
        })
      })

      const flush = () => {
        frame = 0
        const batch = pending
        pending = []
        revealBatch(batch)
      }

      observer = new IntersectionObserver(
        entries => {
          const entering = entries
            .filter(entry => entry.isIntersecting)
            .map(entry => entry.target as HTMLElement)
            .filter(element => element.dataset.scrollRevealed !== 'true')

          if (!entering.length) {
            return
          }

          pending.push(...entering)

          if (!frame) {
            frame = window.requestAnimationFrame(flush)
          }
        },
        { threshold, rootMargin },
      )

      elements.forEach(element => observer.observe(element))

      return () => {
        observer.disconnect()

        if (frame) {
          window.cancelAnimationFrame(frame)
        }

        elements.forEach(element => {
          delete element.dataset.scrollRevealed
        })
      }
    },
    {
      scope,
      dependencies,
      revertOnUpdate: true,
    },
  )
}
