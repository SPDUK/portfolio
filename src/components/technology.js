import React from 'react'

const Technology = ({ svg, title }) => (
  <div className="technology">
    <img src={svg} alt={title} />
    <span>{title}</span>
  </div>
)

export default Technology
