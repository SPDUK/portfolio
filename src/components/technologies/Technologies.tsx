import React, { useRef } from 'react'
import { Cloud, LayoutTemplate, ServerCog } from 'lucide-react'
import { useRevealTimeline } from '../../hooks/useRevealTimeline'

import {
  javascript,
  typescript,
  react,
  redux,
  graphql,
  gatsby,
  css,
  sass,
  nodejs,
  ruby,
  rails,
  elixir,
  phoenix,
  crystal,
  mongodb,
  postgresql,
  heroku,
  docker,
  webpack,
  aws,
  vscode,
  digitalocean,
  git,
  ubuntu,
  ai,
  claudeCode,
  codex,
  cursor,
} from '../../utils/svgs'
import { Technology } from './types'

const groups = [
  {
    title: 'Front End',
    accent: 'front-end',
    icon: LayoutTemplate,
    technologies: [
      { title: 'JavaScript', svg: javascript },
      { title: 'TypeScript', svg: typescript },
      { title: 'React', svg: react },
      { title: 'Redux', svg: redux },
      { title: 'GraphQL', svg: graphql },
      { title: 'Gatsby', svg: gatsby },
      { title: 'CSS', svg: css },
      { title: 'Sass', svg: sass },
    ],
  },
  {
    title: 'Back End',
    accent: 'back-end',
    icon: ServerCog,
    technologies: [
      { title: 'Node.js', svg: nodejs },
      { title: 'Ruby', svg: ruby },
      { title: 'Rails', svg: rails },
      { title: 'Elixir', svg: elixir },
      { title: 'Phoenix', svg: phoenix },
      { title: 'Crystal', svg: crystal },
      { title: 'MongoDB', svg: mongodb },
      { title: 'PostgreSQL', svg: postgresql },
    ],
  },
  {
    title: 'DevOps & Tools',
    accent: 'devops',
    icon: Cloud,
    technologies: [
      { title: 'Heroku', svg: heroku },
      { title: 'Docker', svg: docker },
      { title: 'Webpack', svg: webpack },
      { title: 'AWS', svg: aws },
      { title: 'DigitalOcean', svg: digitalocean },
      { title: 'Git', svg: git },
      { title: 'Ubuntu', svg: ubuntu },
      { title: 'VS Code', svg: vscode },
      { title: 'AI', svg: ai },
      { title: 'Codex', svg: codex },
      { title: 'Claude Code', svg: claudeCode },
      { title: 'Cursor', svg: cursor },
    ],
  },
]

const TechBadge = ({ title, svg }: Pick<Technology, 'title' | 'svg'>) => (
  <span className="tech-badge">
    <img src={svg} alt="" aria-hidden="true" />
    {title}
  </span>
)

export const Technologies = () => {
  const sectionRef = useRef<HTMLElement>(null)
  useRevealTimeline(sectionRef, { y: 22, stagger: 0.05 })

  return (
    <section className="technologies-section" ref={sectionRef}>
      <div className="section-heading" data-reveal>
        <span>
          Technologies <i />
        </span>
        <h2>
          The tools I use to <span className="text-gradient">build</span>
        </h2>
        <p>A selection of technologies I work with across the stack.</p>
      </div>

      <div className="tech-group-grid">
        {groups.map(({ title, accent, icon: Icon, technologies }) => (
          <article
            className={`tech-group tech-group--${accent} glass-panel`}
            data-reveal
            key={title}
          >
            <span className="tech-group__art" aria-hidden="true" />
            <header>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
            </header>
            <div>
              {technologies.map(tech => (
                <TechBadge key={tech.title} {...tech} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
