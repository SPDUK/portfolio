import React from 'react'
import '../styles/index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './navbar'

const Layout = ({ location, title, children }) => (
  <>
    <Navbar />
    <ToastContainer />
    <div className="container layout">
      <main>{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  </>
)

export default Layout
