import React from 'react'
import { Link } from 'gatsby'
import '../styles/index.css'
import { toggleTheme, setTheme } from '../utils/theme'

const Layout = ({ location, title, children }) => {
  // set data-theme on layout load
  setTheme()
  toggleTheme()

  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1>
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <h3>
        <Link to="/">{title}</Link>
      </h3>
    )
  }
  return (
    <div className="container">
      <header>{header}</header>
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
