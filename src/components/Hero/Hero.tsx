import React, { useRef } from 'react'
import { Link } from 'gatsby'
import { ArrowRight, Code2, MapPin, Rocket } from 'lucide-react'
import { CardBody, CardContainer, CardItem } from '../ui/3d-card'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

export const Hero = () => {
  const heroRef = useRef<HTMLElement>(null)
  useRevealTimeline(heroRef, { y: 20, stagger: 0.07 })

  return (
    <section className="home-hero" ref={heroRef}>
      <div className="home-hero__copy">
        <h1 data-reveal>
          Hi, I'm <span className="text-gradient">Steve</span>
          <span className="wave">👋</span>
        </h1>
        <p className="home-hero__role" data-reveal>
          Senior Software Engineer and AI product builder
        </p>
        <p data-reveal>I'm self-taught and I love making things on the web! </p>
        <div className="home-hero__actions" data-reveal>
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

      <CardContainer
        containerClassName="hero-visual-tilt py-0"
        className="hero-visual-tilt__inner"
      >
        <CardBody className="hero-visual-tilt__body h-auto w-full">
          <div className="hero-visual glass-panel" data-reveal>
            <CardItem
              className="hero-visual__terminal"
              translateZ={34}
              aria-hidden="true"
            >
              <span data-reveal>&gt; self_taught = true"</span>
              <span data-reveal>&gt; frontend_lead = true</span>
              <span data-reveal>&gt; company = "Zuora"</span>
              <span data-reveal>
                &gt; focus = ["javascript", "functional_programming"],
              </span>
              <span data-reveal>
                &gt; ai_tooling = ["codex", "claude", "cursor"]
              </span>
              <span data-reveal>&gt; always_learning = true</span>
            </CardItem>
            <CardItem className="hero-visual__image" translateZ={12}>
              <span />
            </CardItem>
            <CardItem
              className="hero-visual__location"
              data-reveal
              translateZ={58}
            >
              <MapPin aria-hidden="true" />
              Cambridge, UK
            </CardItem>
            <CardItem
              className="hero-visual__floating glass-panel"
              data-reveal
              translateZ={74}
            >
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
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </section>
  )
}
