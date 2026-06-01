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
        </h1>
        <p className="home-hero__role" data-reveal>
          Senior Frontend Engineer and AI product builder from{' '}
          <strong>Cambridge, UK.</strong>
        </p>
        <p data-reveal>
          I'm a frontend lead at Zuora building AI-native product workflows,
          enterprise React and TypeScript UI systems, and clean data-rich
          customer experiences. I use <strong>Codex</strong>,{' '}
          <strong>Claude Code</strong>, and <strong>Cursor</strong> every day,
          then turn that learning into practical workflows other engineers can
          adopt.
        </p>
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
              <span data-reveal>&gt; role = "senior_frontend_engineer"</span>
              <span data-reveal>&gt; frontend_lead = true</span>
              <span data-reveal>&gt; company = "Zuora"</span>
              <span data-reveal>&gt; focus = ["ai_agents",</span>
              <span data-reveal>&nbsp;&nbsp;"enterprise_frontend"]</span>
              <span data-reveal>
                &gt; ai_tooling = ["codex", "claude", "cursor"]
              </span>
              <span data-reveal>&gt; location = "Cambridge, UK"</span>
              <span data-reveal>&gt; teaching_ai_workflows = true</span>
              <span data-reveal>&gt; _</span>
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
                AI leverage.
                <br />
                React systems.
                <br />
                Product craft.
                <br />
                Current role.
              </p>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </section>
  )
}
