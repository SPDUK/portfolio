import React, { useRef } from 'react'
import { Link } from 'gatsby'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

import './footer.css'

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null)
  useRevealTimeline(footerRef, { y: 10, duration: 0.36 })

  return (
    <footer className="footer" ref={footerRef}>
      <Link
        className="footer__link"
        to="/made-with"
        data-reveal
        aria-label="Built with blue heart"
      >
        <span className="footer__label">Built with</span>
        <span className="footer__emoji" aria-hidden="true">
          💙
        </span>
      </Link>
    </footer>
  )
}
