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
        Senior Software Engineer from <strong>Cambridge, UK.</strong>
      </p>
      <p>
        I'm an AI-focused frontend lead building agentic product experiences,
        enterprise UI systems, and clean data-rich workflows. I use tools like{' '}
        <strong>Codex</strong>, <strong>Claude Code</strong>, and{' '}
        <strong>Cursor</strong> every day, and I help other engineers adopt AI
        effectively.
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
        <span>&gt; role = "senior_software_engineer"</span>
        <span>&gt; frontend_lead = true</span>
        <span>&gt; focus = ["ai_agents",</span>
        <span>&nbsp;&nbsp;"enterprise_frontend"]</span>
        <span>&gt; ai_tooling = ["codex", "claude", "cursor"]</span>
        <span>&gt; location = "Cambridge, UK"</span>
        <span>&gt; teaching_ai_workflows = true</span>
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
          AI leverage.
          <br />
          Product craft.
          <br />
          Senior delivery.
          <br />
          Real impact.
        </p>
      </div>
    </div>
  </section>
)
