import React from 'react'
import '../../styles/index.css'

import { Navbar } from '../Navbar'
import { Footer } from '../Footer'

import 'react-toastify/dist/ReactToastify.css'

interface LayoutProps {
  children: React.ReactNode
  wide?: boolean
}

export const PageBackdrop = () => (
  <div className="page-backdrop" aria-hidden="true">
    <div className="page-backdrop__orb page-backdrop__orb--left" />
    <div className="page-backdrop__orb page-backdrop__orb--right" />
    <div className="page-backdrop__orb page-backdrop__orb--bottom" />
    <div className="page-backdrop__grid" />
  </div>
)

export const Layout = ({ children, wide = false }: LayoutProps) => (
  <>
    <PageBackdrop />
    <Navbar />
    <div
      className={
        wide
          ? 'site-container site-container--wide layout'
          : 'site-container layout'
      }
    >
      <main>{children}</main>
    </div>
    <Footer />
  </>
)
