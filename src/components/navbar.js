import React from 'react'
import { Link } from 'gatsby'
import ThemeToggle from './theme-toggle'

const Nav = () => (
  <nav className="navbar">
    <Link to="/">SP</Link>

    <div>
      <ThemeToggle />
    </div>
  </nav>
)

export default Nav
