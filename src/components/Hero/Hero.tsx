import React from 'react'
import { Link } from 'gatsby'
import { ArrowRight, Code2, MapPin, Rocket } from 'lucide-react'

export const Hero = () => (
  <section className="home-hero">
    <div className="home-hero__copy">
      <h1>
        Hi, I'm <span className="text-gradient">Steve</span>
      </h1>
      <p className="home-hero__role">
        Full-Stack Developer from <strong>Cambridge, UK.</strong>
      </p>
      <p>
        I'm a self-taught developer who loves to make things on the web. I enjoy
        turning ideas into usable products and solving real problems with clean,
        maintainable code. I focus on <strong>JavaScript</strong> and{' '}
        <strong>functional programming.</strong>
      </p>
      <div className="home-hero__actions">
        <Link className="neon-button neon-button--primary" to="/projects">
          <Rocket aria-hidden="true" />
          View Projects
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="neon-button" to="/blog">
          <Code2 aria-hidden="true" />
          Read Blog Posts
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>

    <div className="hero-visual glass-panel">
      <div className="hero-visual__terminal" aria-hidden="true">
        <span>&gt; self_taught = true</span>
        <span>&gt; love_to_build = true</span>
        <span>&gt; focus = ["javascript",</span>
        <span>&nbsp;&nbsp;"functional_programming"]</span>
        <span>&gt; location = "Cambridge, UK"</span>
        <span>&gt; always_learning = true</span>
        <span>&gt; _</span>
      </div>
      <div className="hero-visual__image">
        <span />
      </div>
      <div className="hero-visual__location">
        <MapPin aria-hidden="true" />
        Cambridge, UK
      </div>
      <div className="hero-visual__floating glass-panel">
        <span>
          <Code2 aria-hidden="true" />
        </span>
        <p>
          Clean code.
          <br />
          Thoughtful UX.
          <br />
          Real impact.
        </p>
      </div>
    </div>
  </section>
)
