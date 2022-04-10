import React from 'react'
import '../../styles/index.css'

import { Navbar } from '../Navbar'

import 'react-toastify/dist/ReactToastify.css'
import 'react-toggle/style.css'
import { Footer } from '../Footer'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => (
  <>
    <Navbar />
    <div className="container layout">
      <main>{children}</main>
    </div>
    <Footer />
  </>
)
