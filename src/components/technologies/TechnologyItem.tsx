import React from 'react'

import './technologies.css'
import { Technology } from './types'

export const TechnologyItem = ({ svg, title, href }: Technology) => (
  <a href={href} className="technology">
    <img src={svg} alt={title} />
    <span>{title}</span>
  </a>
)
