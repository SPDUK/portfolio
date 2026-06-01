import React, { useRef } from 'react'
import { BadgeCheck, Bot, BriefcaseBusiness } from 'lucide-react'
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
          forward-deployed customer workflows, and data-rich subscription
          experiences at Zuora.
        </p>
      </div>

      <div className="work-overview glass-panel" data-reveal>
        <div>
          <span className="work-overview__icon">
            <BriefcaseBusiness aria-hidden="true" />
          </span>
          <div>
            <p className="section-kicker">Currently at Zuora</p>
            <h3>
              Senior Software Engineer, frontend lead, and forward-deployed
              engineer
            </h3>
          </div>
        </div>
        <p>
          I'm focused on building AI-native product workflows while acting close
          to the customer: architecting the frontend, demoing product direction,
          turning field feedback into implementation decisions, and upskilling
          Sales, CSEs, and engineers on AI-assisted workflows.
        </p>
        <div className="work-overview__tags" aria-label="Current focus areas">
          <span>AI agents</span>
          <span>Forward deployed engineering</span>
          <span>Frontend leadership</span>
          <span>Frontend architecture</span>
          <span>Customer demos</span>
          <span>Zuora data integration</span>
          <span>Sales and CSE enablement</span>
        </div>
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

      <aside className="work-ai-note glass-panel" data-reveal>
        <Bot aria-hidden="true" />
        <div>
          <h3>AI engineering focus</h3>
          <p>
            I build with Codex, Claude Code, Cursor, and agentic workflows as
            part of my day-to-day process, then turn that learning into demos,
            training, and practical patterns other engineers and customer-facing
            teams can use.
          </p>
        </div>
      </aside>
    </section>
  )
}
