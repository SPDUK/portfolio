import React, { useCallback, useRef } from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import '../styles/made-with.css'
import { useRevealTimeline } from '../hooks/useRevealTimeline'
import stackImage from '../../content/assets/made-with-stack.png'

interface MadeWithItem {
  title: string
  link: string
  description: string
  detail: string
  tone: string
}

const tools: MadeWithItem[] = [
  {
    title: 'Gatsby',
    link: 'https://www.gatsbyjs.com/',
    description: 'The React framework behind the portfolio build.',
    detail:
      'Static generation, image handling, routing, metadata, and content workflows.',
    tone: 'Foundation',
  },
  {
    title: 'shadcn',
    link: 'https://ui.shadcn.com/',
    description: 'Component primitives and interaction patterns.',
    detail:
      'Used as a practical base for accessible controls and reusable UI decisions.',
    tone: 'Interface',
  },
  {
    title: 'Tailwind CSS',
    link: 'https://tailwindcss.com/',
    description: 'Utility styling foundation for the refreshed UI system.',
    detail:
      'Pairs with custom CSS tokens for fast iteration without losing the site voice.',
    tone: 'Styling',
  },
  {
    title: 'GSAP',
    link: 'https://gsap.com/',
    description: 'Motion system for page transitions and component reveals.',
    detail:
      'Adds measured movement while preserving readable content and reduced-motion paths.',
    tone: 'Motion',
  },
  {
    title: 'Codex',
    link: 'https://openai.com/codex/',
    description: 'The primary AI agent.',
    detail:
      'Used for implementation passes, design iteration, QA loops, and focused code changes.',
    tone: 'Agent',
  },
  {
    title: 'Mobile Codex',
    link: 'https://github.com/spduk/mobilecodex',
    description:
      "An agent skill I built to continue building even when I'm away from my PC.",
    detail:
      'Keeps previews, screenshots, and progress summaries moving from a phone.',
    tone: 'Skill',
  },
]

const MadeWith = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useRevealTimeline(pageRef, { y: 18, stagger: 0.045 })

  const createListItem = useCallback(
    ({ title, link, description, detail, tone }: MadeWithItem) => (
      <li className="made-with-tool" data-reveal key={title}>
        <span className="made-with-tool__meta">{tone}</span>
        <a
          className="made-with-tool__title"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {title}
        </a>
        <span className="made-with-tool__description">{description}</span>
        <span className="made-with-tool__detail">{detail}</span>
      </li>
    ),
    [],
  )

  return (
    <Layout wide>
      <SEO
        title="Made With"
        description="The focused stack behind Steve P's portfolio: Gatsby, shadcn, Tailwind CSS, GSAP, Codex, and Mobile Codex."
        pathname="/made-with/"
      />
      <div className="made-with" ref={pageRef}>
        <section className="made-with-hero" aria-labelledby="made-with-title">
          <div className="made-with-hero__copy">
            <h1
              className="made-with-hero__title"
              id="made-with-title"
              data-reveal
            >
              The stack behind this portfolio.
            </h1>
            <p data-reveal>
              A compact set of tools for a site that needs to feel fast,
              expressive, maintainable, and honest about how it gets built.
            </p>
          </div>

          <figure className="made-with-hero__visual" data-reveal>
            <img
              src={stackImage}
              alt="Abstract neon build stack connecting interface, code, component, motion, and mobile workflow modules."
            />
          </figure>
        </section>

        <section className="made-with__tools" aria-label="Built with tools">
          <ul>{tools.map(createListItem)}</ul>
        </section>
      </div>
    </Layout>
  )
}

export default MadeWith
