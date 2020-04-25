import React from 'react'

import { Link } from 'gatsby'

export default function hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <h1>Hi, I'm Steve</h1>
          <p className="hero-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptas
            fugiat temporibus explicabo blanditiis omnis, ipsam ipsum odit!
            Ducimus magni debitis maiores in.
          </p>
          <div className="hero-cta">
            <Link className="button button-primary" to="/projects">
              Projects
            </Link>
            <Link className="button" to="/blog">
              Blog Posts
            </Link>
          </div>
        </div>
        <div className="hero-figure anime-element">
          <svg
            className="placeholder"
            width="528"
            height="396"
            viewBox="0 0 528 396"
          >
            <rect width="528" height="396" style={{ fill: 'transparent' }} />
          </svg>
          <div
            className="hero-figure-box hero-figure-box-01"
            data-rotation="45deg"
          ></div>
          <div
            className="hero-figure-box hero-figure-box-02"
            data-rotation="-45deg"
          ></div>
          <div
            className="hero-figure-box hero-figure-box-03"
            data-rotation="0deg"
          ></div>
          <div
            className="hero-figure-box hero-figure-box-04"
            data-rotation="-135deg"
          ></div>
          <div className="hero-figure-box hero-figure-box-05"></div>
          <div className="hero-figure-box hero-figure-box-06"></div>
          <div className="hero-figure-box hero-figure-box-07"></div>
          <div
            className="hero-figure-box hero-figure-box-08"
            data-rotation="-22deg"
          ></div>
          <div
            className="hero-figure-box hero-figure-box-09"
            data-rotation="-52deg"
          ></div>
          <div
            className="hero-figure-box hero-figure-box-10"
            data-rotation="-50deg"
          ></div>
        </div>
      </div>
    </section>
  )
}
