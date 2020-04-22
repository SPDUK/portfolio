import React, { useState, useEffect } from 'react'
import { Link } from 'gatsby'
import '../styles/index.css'
import { toggleTheme, setTheme } from '../utils/theme'

const Layout = ({ location, title, children }) => {
  const [loading, setLoading] = useState(true)
  // const rootPath = `${__PATH_PREFIX__}/`

  // set theme on page load
  useEffect(() => {
    setTheme()
    setLoading(false)
  }, [])

  return loading ? (
    <div />
  ) : (
    <div className="container">
      <header>
        <Link to="/">{title}</Link>
        <nav>
          <button type="button" onClick={toggleTheme}>
            Toggle Theme
          </button>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.org">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
