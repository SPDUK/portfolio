import React, { useRef } from 'react'
import { BadgeCheck } from 'lucide-react'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

import experienceBuilderImage from '../../../content/assets/work-experience-builder.png'

const currentRole = {
  title: 'Experience Builder AI Agent',
  eyebrow: 'Current role',
  image: experienceBuilderImage,
  summary:
    'Lead frontend on a new Zuora Experience Builder project, architecting the React and TypeScript frontend and building an AI agent that helps create first-class components with direct Zuora data integration.',
  points: [
    'AI-assisted component generation',
    'Zuora data-aware frontend workflows',
    'React and TypeScript frontend architecture',
    'Customer demos and forward-deployed feedback loops',
  ],
}

export const WorkHistory = () => {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealTimeline(sectionRef, { y: 22 })

  return (
    <section className="work-section" id="work" ref={sectionRef}>
      <div className="section-heading" data-reveal>
        <span>
          Current role <i />
        </span>
        <h2>
          Frontend leadership, <span className="text-gradient">AI enabled</span>
        </h2>
        <p>
          My current focus is building enterprise frontend systems, AI agents,
          forward-deployed customer workflows and UI/UX experiences.
        </p>
      </div>

      <div className="work-case-grid work-case-grid--single">
        <article className="work-case-card glass-panel" data-reveal>
          <div className="work-case-card__image">
            <img src={currentRole.image} alt="" aria-hidden="true" />
          </div>
          <div className="work-case-card__body">
            <p className="section-kicker">{currentRole.eyebrow}</p>
            <h3>{currentRole.title}</h3>
            <p>{currentRole.summary}</p>
            <ul>
              {currentRole.points.map(point => (
                <li key={point}>
                  <BadgeCheck aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}
