import React, { useRef } from 'react'
import { ArrowRight, BadgeCheck, Bot, BriefcaseBusiness } from 'lucide-react'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

import experienceBuilderImage from '../../../content/assets/work-experience-builder.png'
import zephrJourneyImage from '../../../content/assets/work-zephr-journey.png'

const caseStudies = [
  {
    title: 'Experience Builder AI Agent',
    eyebrow: 'Current role',
    image: experienceBuilderImage,
    summary:
      'Lead frontend on a new Zuora Experience Builder project, architecting the frontend and building an AI agent that helps create first-class components with direct Zuora data integration.',
    points: [
      'AI-assisted component generation',
      'Zuora data-aware frontend workflows',
      'Frontend architecture and product leadership',
      'Customer demos and forward-deployed feedback loops',
    ],
  },
  {
    title: 'Zephr Payments & Forms',
    eyebrow: 'Previous team',
    image: zephrJourneyImage,
    summary:
      'Frontend lead on complex Zephr initiatives across payments, configurable forms, subscriber experience flows, and cross-functional enablement.',
    points: [
      'Payment and registration journey UX',
      'Configurable form systems',
      'Cross-functional delivery on complex initiatives',
      'Training and upskilling Sales and CSE teams',
    ],
  },
]

export const WorkHistory = () => {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealTimeline(sectionRef, { y: 22 })

  return (
    <section className="work-section" id="work" ref={sectionRef}>
      <div className="section-heading" data-reveal>
        <span>
          Work history <i />
        </span>
        <h2>
          Senior engineering, <span className="text-gradient">AI enabled</span>
        </h2>
        <p>
          Current and recent work across enterprise frontend systems, AI agents,
          forward-deployed customer work, payments, forms, and data-rich
          subscription experiences.
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

      <div className="work-case-grid">
        {caseStudies.map(({ title, eyebrow, image, summary, points }) => (
          <article
            className="work-case-card glass-panel"
            data-reveal
            key={title}
          >
            <div className="work-case-card__image">
              <img src={image} alt="" aria-hidden="true" />
            </div>
            <div className="work-case-card__body">
              <p className="section-kicker">{eyebrow}</p>
              <h3>{title}</h3>
              <p>{summary}</p>
              <ul>
                {points.map(point => (
                  <li key={point}>
                    <BadgeCheck aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <span className="work-case-card__placeholder">
                Case study placeholder
                <ArrowRight aria-hidden="true" />
              </span>
            </div>
          </article>
        ))}
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
