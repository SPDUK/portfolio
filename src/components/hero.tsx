import React, { useEffect } from 'react'

import { Link } from 'gatsby'

import anime from 'animejs'
import '../styles/hero.css'

const Hero = () => {
  useEffect(() => {
    anime
      .timeline({
        targets: '.hero__box--05',
      })
      .add({
        duration: 400,
        easing: 'easeInOutExpo',
        scaleX: [0.05, 0.05],
        scaleY: [0, 1],
        perspective: '500px',
        delay: anime.random(0, 400),
      })
      .add({
        duration: 400,
        easing: 'easeInOutExpo',
        scaleX: 1,
      })
      .add({
        duration: 800,
        rotateY: '-15deg',
        rotateX: '8deg',
        rotateZ: '-1deg',
      })

    anime
      .timeline({
        targets: '.hero__box--06, .hero__box--07',
      })
      .add({
        duration: 400,
        easing: 'easeInOutExpo',
        scaleX: [0.05, 0.05],
        scaleY: [0, 1],
        perspective: '500px',
        delay: anime.random(0, 400),
      })
      .add({
        duration: 400,
        easing: 'easeInOutExpo',
        scaleX: 1,
      })
      .add({
        duration: 800,
        rotateZ: '20deg',
      })

    anime({
      targets:
        '.hero__box--01, .hero__box--02, .hero__box--03, .hero__box--04, .hero__box--08, .hero__box--09, .hero__box--10',
      duration: anime.random(600, 800),
      delay: anime.random(600, 800),
      rotate: [anime.random(-360, 360), el => el.getAttribute('data-rotation')],
      scale: [0.7, 1],
      opacity: [0, 1],
      easing: 'easeInOutExpo',
    })
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

export default Hero
