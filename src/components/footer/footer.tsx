import React from 'react'
import { Zap } from 'lucide-react'

import './footer.css'

export const Footer = () => (
  <footer className="footer">
    <span className="footer__mark">
      <Zap aria-hidden="true" />
    </span>
    <span>
      Always learning. <strong>Always building.</strong>
    </span>
  </footer>
)
