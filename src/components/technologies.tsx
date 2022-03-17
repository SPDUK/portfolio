import React, { useEffect } from 'react'
import Technology from './technology'

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
} from '../utils/svgs'
import { ScrollRevealObject } from '../types/scrollreveal'

interface ITechnology {
  title: string
  svg: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  href: string
}

const frontEnd: ITechnology[] = [
  {
    title: 'JavaScript',
    svg: javascript,
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    title: 'Typescript',
    svg: typescript,
    href: 'https://www.typescriptlang.org/',
  },
  { title: 'React', svg: react, href: 'https://www.reactjs.org' },
  { title: 'Redux', svg: redux, href: 'https://redux.js.org/' },
  { title: 'GraphQL', svg: graphql, href: 'https://graphql.org/' },
  { title: 'Gatsby', svg: gatsby, href: 'https://www.gatsbyjs.org' },
  {
    title: 'CSS',
    svg: css,
    href: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
  },
  { title: 'Sass', svg: sass, href: 'https://sass-lang.com/' },
]

const backEnd: ITechnology[] = [
  { title: 'Node.js', svg: nodejs, href: 'https://nodejs.org/' },
  { title: 'Ruby', svg: ruby, href: 'https://www.ruby-lang.org' },
  { title: 'Rails', svg: rails, href: 'https://rubyonrails.org/' },
  { title: 'Elixir', svg: elixir, href: 'https://elixir-lang.org' },
  { title: 'Phoenix', svg: phoenix, href: 'https://www.phoenixframework.org' },
  { title: 'Crystal', svg: crystal, href: 'https://crystal-lang.org/' },
  { title: 'MongoDB', svg: mongodb, href: 'https://www.mongodb.com' },
  { title: 'PostgreSQL', svg: postgresql, href: 'https://www.postgresql.org' },
]

const tools: ITechnology[] = [
  { title: 'Heroku', svg: heroku, href: 'https://www.heroku.com' },
  { title: 'Docker', svg: docker, href: 'https://www.docker.com' },
  { title: 'Webpack', svg: webpack, href: 'https://webpack.js.org' },
  { title: 'AWS', svg: aws, href: 'https://aws.amazon.com/' },
  {
    title: 'DigitalOcean',
    svg: digitalocean,
    href: 'https://www.digitalocean.com',
  },
  { title: 'Git', svg: git, href: 'https://git-scm.com/' },
  { title: 'Ubuntu', svg: ubuntu, href: 'https://ubuntu.com/' },
  { title: 'VS Code', svg: vscode, href: 'https://code.visualstudio.com/' },
]
const createTechnology = ({ title, svg, href }: ITechnology) => (
  <Technology key={title} svg={svg} title={title} href={href} />
)

const Technologies = () => {
  useEffect(() => {
    // have to require here as importing at top breaks SSR
    // eslint-disable-next-line
    const ScrollReveal = require('scrollreveal').default as ScrollRevealObject

    ScrollReveal().reveal('.technologies a, .technologies h3', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'left',
      interval: 75,
    })

    return () => ScrollReveal().destroy()
  }, [])

  return (
    <div className="technologies">
      <h1 className="technologies__title">Technologies</h1>
      <div>
        <h3>Front End</h3>
        <div className="technologies__row">
          {frontEnd.map(createTechnology)}
        </div>
      </div>

      <div>
        <h3>Back End</h3>
        <div className="technologies__row">{backEnd.map(createTechnology)}</div>
      </div>

      <div>
        <h3>DevOps & Tools</h3>
        <div className="technologies__row">{tools.map(createTechnology)}</div>
      </div>
    </div>
  )
}

export default Technologies
