import React from 'react'
import { Link } from 'gatsby'

import './footer.css'

export const Footer = () => (
  <footer className="footer">
    Made with{' '}
    <Link to="/made-with" className="footer__emoji">
      💙
    </Link>{' '}
    by
    <a href="https://www.github.com/SPDUK">SPDUK</a>
  </footer>
)
