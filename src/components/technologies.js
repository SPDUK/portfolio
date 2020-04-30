import React, { useEffect } from 'react'
import Technology from './technology'

// importing them like this allows webpack to load all the svgs without additional network requests, tedious but faster
// fontend
import javascript from '../../content/assets/javascript.svg'
import vue from '../../content/assets/vue.svg'
import react from '../../content/assets/react.svg'
import redux from '../../content/assets/redux.svg'
import graphql from '../../content/assets/graphql.svg'
import gatsby from '../../content/assets/gatsby.svg'
import css from '../../content/assets/css.svg'
import sass from '../../content/assets/sass.svg'
// backend
import nodejs from '../../content/assets/nodejs.svg'
import ruby from '../../content/assets/ruby.svg'
import rails from '../../content/assets/rails.svg'
import elixir from '../../content/assets/elixir.svg'
import phoenix from '../../content/assets/phoenix.svg'
import crystal from '../../content/assets/crystal.svg'
import mongodb from '../../content/assets/mongodb.svg'
import postgresql from '../../content/assets/postgresql.svg'

// tools
import heroku from '../../content/assets/heroku.svg'
import docker from '../../content/assets/docker.svg'
import webpack from '../../content/assets/webpack.svg'
import aws from '../../content/assets/aws.svg'
import vscode from '../../content/assets/vscode.svg'
import digitalocean from '../../content/assets/digitalocean.svg'
import git from '../../content/assets/git.svg'
import ubuntu from '../../content/assets/ubuntu.svg'

const frontEnd = [
  {
    title: 'JavaScript',
    svg: javascript,
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  { title: 'Vue', svg: vue, href: 'https://www.vuejs.org' },
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

const backEnd = [
  { title: 'Node.js', svg: nodejs, href: 'https://nodejs.org/' },
  { title: 'Ruby', svg: ruby, href: 'https://www.ruby-lang.org' },
  { title: 'Rails', svg: rails, href: 'https://rubyonrails.org/' },
  { title: 'Elixir', svg: elixir, href: 'https://elixir-lang.org' },
  { title: 'Phoenix', svg: phoenix, href: 'https://www.phoenixframework.org' },
  { title: 'Crystal', svg: crystal, href: 'https://crystal-lang.org/' },
  { title: 'MongoDB', svg: mongodb, href: 'https://www.mongodb.com' },
  { title: 'PostgreSQL', svg: postgresql, href: 'https://www.postgresql.org' },
]

const tools = [
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
const createTechnology = ({ title, svg, href }) => (
  <Technology key={title} svg={svg} title={title} href={href} />
)

const Technologies = () => {
  useEffect(() => {
    // have to require here as importing at top breaks SSR
    // eslint-disable-next-line
    const ScrollReveal = require('scrollreveal').default

    ScrollReveal().reveal('.technologies div, .technologies h1', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'top',
      interval: 100,
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
