import React from 'react'
import '../styles/index.css'
import Navbar from './navbar'

const Layout = ({ location, title, children }) => (
  <>
    <Navbar />
    <div className="container layout">
      <main>{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  </>
)

export default Layout
