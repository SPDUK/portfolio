import React, { useState } from 'react'
import { Link } from 'gatsby'
import ThemeToggle from './theme-toggle'

const Nav = () => {
  const [open, setOpen] = useState(false)

  const menuOptions = [
    { title: 'Home', to: '/', mobileOnly: true },
    { title: 'Blog', to: '/blog' },
    { title: 'Projects', to: '/projects' },
    { title: 'GitHub', href: 'https://www.github.com/SPDUK' },
  ]

  const createMenuLinks = ({ title, to, href }) =>
    href ? (
      <a key={title} href={href}>
        {title}
      </a>
    ) : (
      <Link key={title} to={to}>
        {title}
      </Link>
    )

  const menu = menuOptions.map(createMenuLinks)

  const handleToggleMenu = () => {
    // if (!open) animateNavIn()
    // else animateNavOut()

    setOpen(!open)
  }

  const navbarClass = open ? 'navbar navbar--open' : 'navbar'

  return (
    <nav className={navbarClass}>
      <div className="container navbar__container">
        <button
          type="button"
          className="navbar__toggle"
          onClick={handleToggleMenu}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <div>
          <ThemeToggle />
        </div>
      </div>
      <div className="navbar__menu">{menu}</div>
    </nav>
  )
}

export default Nav
