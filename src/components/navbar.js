import React, { useEffect, useState } from 'react'
import { Link } from 'gatsby'
import ThemeToggle from './theme-toggle'

const Nav = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const menuOptions = [
    { title: 'Home', to: '/', mobileOnly: true },
    { title: 'Blog', to: '/blog' },
    { title: 'Projects', to: '/projects' },
    { title: 'GitHub', href: 'https://www.github.com/SPDUK' },
  ]

  const createMenuLinks = ({ title, to, href, mobileOnly }) => {
    if (mobileOnly && !isMobile) return
    return href ? (
      <a key={title} href={href}>
        {title}
      </a>
    ) : (
      <Link key={title} to={to}>
        {title}
      </Link>
    )
  }

  // resize listener for mount and unmount cleanup
  useEffect(() => {
    const handleResize = ({ target }) => {
      if (target.innerWidth < 768) setIsMobile(true)
      if (target.innerWidth >= 768) setIsMobile(false)
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const menu = menuOptions.map(createMenuLinks)

  return (
    <nav className="navbar">
      <div className="container navbar__container">
        <div className="navbar__desktop">{menu}</div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export default Nav
