import React from 'react'
import '../styles/index.css'
import Navbar from './navbar'
import Footer from './footer'
import 'react-toastify/dist/ReactToastify.css'
import 'react-toggle/style.css'

const Layout = ({ location, title, children }) => (
  <>
    <Navbar />
    <div className="container layout">
      <main>{children}</main>
    </div>
    <Footer />
  </>
)

export default Layout
