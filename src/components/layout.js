import React from 'react'
import '../styles/index.css'
import Navbar from './navbar'
import 'react-toastify/dist/ReactToastify.css'
import 'react-toggle/style.css'

const Layout = ({ location, title, children }) => (
  <>
    <Navbar />
    <div className="container layout">
      <main>{children}</main>
      <footer>
        © <a href="https://www.github.com/SPDUK">SPDUK</a>{' '}
        {new Date().getFullYear()}
      </footer>
    </div>
  </>
)

export default Layout
