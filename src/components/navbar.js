import React from 'react'
import { Link } from 'gatsby'
import ThemeToggle from './theme-toggle'

const Nav = () => (
  <nav className="navbar">
    <div className="container navbar__container">
      <Link to="/">SP</Link>
      <div>
        <ThemeToggle />
      </div>
    </div>
  </nav>
)

export default Nav
