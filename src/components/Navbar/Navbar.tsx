import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import { ExternalLink, Menu, X } from 'lucide-react'

import './navbar.css'

const links = [
  { title: 'Home', to: '/' },
  { title: 'Blog', to: '/blog' },
  { title: 'Projects', to: '/projects' },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const htmlDocument = document.querySelector('html')
    htmlDocument?.classList.toggle('no-scroll', open)

    return () => htmlDocument?.classList.remove('no-scroll')
  }, [open])

  const menuLinks = links.map(({ title, to }) => (
    <Link
      key={title}
      to={to}
      activeClassName="navbar__link--active"
      className="navbar__link"
      onClick={() => setOpen(false)}
    >
      {title}
    </Link>
  ))

  return (
    <header className="navbar">
      <div className="site-container navbar__container">
        <Link to="/" className="navbar__brand" aria-label="SPDEVUK home">
          <span>SP</span>
          <i />
        </Link>

        <nav className="navbar__desktop-menu" aria-label="Primary navigation">
          {menuLinks}
          <a
            className="navbar__link"
            href="https://www.github.com/SPDUK"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ExternalLink aria-hidden="true" />
          </a>
        </nav>

        <div className="navbar__actions">
          <button
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            className="navbar__toggle"
            type="button"
            onClick={() => setOpen(!open)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="navbar__mobile-menu" aria-label="Mobile navigation">
          {menuLinks}
          <a
            className="navbar__link"
            href="https://www.github.com/SPDUK"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ExternalLink aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  )
}
