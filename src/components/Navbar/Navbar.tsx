import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'gatsby'
import { ExternalLink, Menu, X } from 'lucide-react'
import { gsap, motion, prefersReducedMotion, useGSAP } from '../../utils/motion'

import './navbar.css'

const links = [
  { title: 'Home', to: '/' },
  { title: 'Blog', to: '/blog' },
  { title: 'Projects', to: '/projects' },
]

const githubLink = {
  title: 'GitHub',
  href: 'https://www.github.com/SPDUK',
}

interface NavbarProps {
  wide?: boolean
}

export const Navbar = ({ wide = false }: NavbarProps) => {
  const navbarRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useGSAP(
    () => {
      if (!navbarRef.current || prefersReducedMotion()) {
        return
      }

      gsap.fromTo(
        '.navbar__container',
        { autoAlpha: 0, y: -18, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: motion.fastDuration,
          ease: motion.ease,
          clearProps: 'transform,opacity,visibility',
        },
      )
    },
    { scope: navbarRef },
  )

  useGSAP(
    () => {
      if (!open || prefersReducedMotion()) {
        return
      }

      gsap.fromTo(
        '.navbar__mobile-panel',
        { autoAlpha: 0, y: -18, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: motion.itemDuration,
          ease: motion.ease,
          clearProps: 'transform,opacity,visibility',
        },
      )

      gsap.fromTo(
        '.navbar__mobile-link',
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: motion.itemDuration,
          ease: motion.ease,
          stagger: motion.stagger,
          delay: 0.06,
          clearProps: 'transform,opacity,visibility',
        },
      )
    },
    { scope: navbarRef, dependencies: [open], revertOnUpdate: true },
  )

  useEffect(() => {
    let ticking = false

    const update = () => {
      ticking = false
      setIsScrolled(window.scrollY > 24)
    }

    const requestUpdate = () => {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useEffect(() => {
    const htmlDocument = document.querySelector('html')
    htmlDocument?.classList.toggle('no-scroll', open)

    return () => htmlDocument?.classList.remove('no-scroll')
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const renderLocalLinks = (mobile = false) =>
    links.map(({ title, to }) => (
      <Link
        key={`${mobile ? 'mobile' : 'desktop'}-${title}`}
        to={to}
        activeClassName="navbar__link--active"
        className={mobile ? 'navbar__link navbar__mobile-link' : 'navbar__link'}
        onClick={() => setOpen(false)}
      >
        <span className="navbar__link-label">{title}</span>
      </Link>
    ))

  const renderGithubLink = (mobile = false) => (
    <a
      className={mobile ? 'navbar__link navbar__mobile-link' : 'navbar__link'}
      href={githubLink.href}
      target="_blank"
      rel="noreferrer"
      onClick={() => setOpen(false)}
    >
      <span className="navbar__link-label">{githubLink.title}</span>
      <ExternalLink aria-hidden="true" />
    </a>
  )

  return (
    <header
      className={[
        'navbar',
        isScrolled ? 'navbar--scrolled' : '',
        open ? 'navbar--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={navbarRef}
    >
      <div
        className={
          wide
            ? 'site-container site-container--wide navbar__container'
            : 'site-container navbar__container'
        }
      >
        <nav className="navbar__desktop-menu" aria-label="Primary navigation">
          {renderLocalLinks()}
          {renderGithubLink()}
        </nav>

        <div className="navbar__actions">
          <button
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-controls="mobile-navigation"
            aria-expanded={open}
            className="navbar__toggle"
            type="button"
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            className="navbar__mobile-scrim"
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <nav
            className="navbar__mobile-menu"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            <div className="navbar__mobile-panel">
              <div className="navbar__mobile-header">
                <button
                  aria-label="Close navigation"
                  className="navbar__mobile-close"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="navbar__mobile-links">
                {renderLocalLinks(true)}
                {renderGithubLink(true)}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
