import React from 'react'

const Technology = ({ svg, title, href }) => (
  <a href={href} className="technology">
    <img src={svg} alt={title} />
    <span>{title}</span>
  </a>
)

export default Technology
