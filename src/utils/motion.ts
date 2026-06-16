import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export const motion = {
  ease: 'power3.out',
  sharpEase: 'power2.out',
  pageDuration: 0.52,
  sectionDuration: 0.58,
  itemDuration: 0.48,
  hoverDuration: 0.22,
  fastDuration: 0.24,
  stagger: 0.055,
  cardStagger: 0.045,
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, useGSAP }
