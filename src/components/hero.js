import React from 'react'

import { Link } from 'gatsby'

export default function hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <h1>Hi, I'm Steve</h1>
          <p className="hero__paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas
            fugiat temporibus explicabo blanditiis omnis, ipsam ipsum odit!
            Ducimus magni debitis maiores in.
          </p>
          <div className="hero__cta">
            <Link to="/projects">Projects</Link>
            <Link to="/blog">Blog Posts</Link>
          </div>
        </div>
        <figure className="hero__figure anime-element">
          <svg
            className="placeholder"
            width="528"
            height="396"
            viewBox="0 0 528 396"
          >
            <rect width="528" height="396" style={{ fill: 'transparent' }} />
          </svg>
          <div className="hero__box hero__box--01" data-rotation="45deg"></div>
          <div className="hero__box hero__box--02" data-rotation="-45deg"></div>
          <div className="hero__box hero__box--03" data-rotation="0deg"></div>
          <div
            className="hero__box hero__box--04"
            data-rotation="-135deg"
          ></div>
          <div className="hero__box hero__box--05"></div>
          <div className="hero__box hero__box--06"></div>
          <div className="hero__box hero__box--07"></div>
          <div className="hero__box hero__box--08" data-rotation="-22deg"></div>
          <div className="hero__box hero__box--09" data-rotation="-52deg"></div>
          <div className="hero__box hero__box--10" data-rotation="-50deg"></div>
        </figure>
      </div>
    </section>
  )
}
