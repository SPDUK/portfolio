import React, { useRef } from 'react'
import { gsap, motion, prefersReducedMotion, useGSAP } from '../../utils/motion'

interface MotionPageProps {
  children: React.ReactNode
  path?: string
}

export const MotionPage = ({ children, path }: MotionPageProps) => {
  const pageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const runPageTransition = contextSafe(() => {
        if (!pageRef.current) {
          return
        }

        if (prefersReducedMotion()) {
          gsap.set(pageRef.current, {
            autoAlpha: 1,
            clearProps: 'transform,opacity',
          })
          return
        }

        gsap.fromTo(
          pageRef.current,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: motion.pageDuration,
            ease: motion.ease,
          },
        )
      })
      const frame = window.requestAnimationFrame(runPageTransition)

      return () => window.cancelAnimationFrame(frame)
    },
    {
      scope: pageRef,
      dependencies: [path],
      revertOnUpdate: true,
    },
  )

  return (
    <div className="motion-page" data-motion-page ref={pageRef}>
      {children}
    </div>
  )
}
