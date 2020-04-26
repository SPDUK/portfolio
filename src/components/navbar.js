import React, { useState } from 'react'
import { Link } from 'gatsby'
import anime from 'animejs'
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

  const animateNavIn = () => {
    // fade opacity in,
    // stagger in downwards

    anime
      .timeline({
        duration: 400,
        easing: 'easeInOutExpo',
      })
      .add({
        targets: '.navbar__menu',
        opacity: 1,
        height: '100%',

        // delay: anime.random(100, 400),
      })
      .add({
        targets: '.navbar__menu a',
        opacity: 1,
        // delay: anime.random(100, 400),
      })
  }

  const animateNavOut = () => {
    // fade opacity out
    // stagger out upwards

    anime
      .timeline({
        duration: 400,
        easing: 'easeInOutExpo',
      })
      .add({
        targets: '.navbar__menu a',
        opacity: 0,
        delay: anime.random(100, 400),
      })
      .add({
        targets: '.navbar__menu',
        opacity: 0,
        delay: anime.random(100, 400),
      })
  }
  const handleToggleMenu = () => {
    // if (!open) animateNavIn()
    // else animateNavOut()

    setOpen(!open)
  }

  return (
    <nav className={`navbar ${open && 'navbar--open'}`}>
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
