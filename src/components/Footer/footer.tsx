import React, { useRef } from 'react'
import { Zap } from 'lucide-react'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

import './footer.css'

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null)
  useRevealTimeline(footerRef, { y: 10, duration: 0.36 })

  return (
    <footer className="footer" ref={footerRef}>
      <span className="footer__mark" data-reveal>
        <Zap aria-hidden="true" />
      </span>
      <span data-reveal>
        Always learning. <strong>Always building.</strong>
      </span>
    </footer>
  )
}
