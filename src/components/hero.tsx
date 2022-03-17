import React, { useEffect } from 'react'

import { Link } from 'gatsby'

import '../styles/hero.css'
import { animateHero } from '../utils/animations/animateHero'

const Hero = () => {
  useEffect(() => {
    animateHero()
  }, [])

  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <h1>
            Hi, I'm Steve <span>👋</span>
          </h1>
          <p>
            Full-Stack Developer from Cambridge, UK. <br />
            I'm self-taught and I love making things on the web,
            <br />
            focusing on JavaScript and functional programming.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" to="/projects">
              Projects
            </Link>
            <Link className="btn" to="/blog">
              Blog Posts
            </Link>
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
          <div className="hero__box hero__box--01" data-rotation="45deg" />
          <div className="hero__box hero__box--02" data-rotation="-45deg" />
          <div className="hero__box hero__box--03" data-rotation="0deg" />
          <div className="hero__box hero__box--04" data-rotation="-135deg" />
          <div className="hero__box hero__box--05" />
          <div className="hero__box hero__box--06" />
          <div className="hero__box hero__box--07" />
          <div className="hero__box hero__box--08" data-rotation="-22deg" />
          <div className="hero__box hero__box--09" data-rotation="-52deg" />
          <div className="hero__box hero__box--10" data-rotation="-50deg" />
        </figure>
      </div>
    </section>
  )
}

export default Hero
