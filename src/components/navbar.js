import React from 'react'
import { Link } from 'gatsby'

import { toggleTheme } from '../utils/theme'

const Nav = () => (
  <nav className="navbar">
    <Link to="/">Home</Link>
    <div>
      <button type="button" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  </nav>
)

export default Nav
