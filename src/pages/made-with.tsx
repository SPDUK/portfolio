/* eslint-disable react/no-unused-prop-types */ // I have no idea why this tsx file is expecting proptypes

import React, { useCallback, useRef } from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import '../styles/made-with.css'
import { useRevealTimeline } from '../hooks/useRevealTimeline'
// I have no idea why ESL
interface MadeWithItem {
  title: string
  link: string
  description?: string
}

const MadeWith = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const tools: MadeWithItem[] = [
    {
      title: 'shadcn',
      link: 'https://ui.shadcn.com/',
      description: 'Component primitives and interaction patterns',
    },
    {
      title: 'Tailwind CSS',
      link: 'https://tailwindcss.com/',
      description: 'Utility styling foundation for the refreshed UI system',
    },
    {
      title: 'GSAP',
      link: 'https://gsap.com/',
      description: 'Motion system for page transitions and component reveals',
    },
    {
      title: 'Codex',
      link: 'https://openai.com/codex/',
      description: 'Agentic implementation workflow for shipping the redesign',
    },
    {
      title: 'Mobile Codex',
      link: 'https://github.com/spduk/mobilecodex',
      description: 'Phone preview and remote QA workflow for mobile handoff',
    },
  ]

  useRevealTimeline(pageRef, { y: 18, stagger: 0.045 })

  const createListItem = useCallback(
    ({ title, link, description }: MadeWithItem) => (
      <li className="made-with__list-item" data-reveal key={title}>
        <a href={link} target="_blank" rel="noreferrer">
          {title}
        </a>
        {description && <span>{description}</span>}
      </li>
    ),
    [],
  )

  return (
    <Layout>
      <SEO
        title="Made With"
        description="The focused stack behind Steve P's portfolio: shadcn, Tailwind CSS, GSAP, Codex, and Mobile Codex."
        pathname="/made-with/"
      />
      <div className="made-with" ref={pageRef}>
        <div className="made-with__tools">
          <h3 data-reveal>Built With</h3>
          <ul>{tools.map(createListItem)}</ul>
        </div>
      </div>
    </Layout>
  )
}

export default MadeWith
