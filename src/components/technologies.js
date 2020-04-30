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
  { title: 'JavaScript', svg: javascript },
  { title: 'Vue', svg: vue },
  { title: 'React', svg: react },
  { title: 'Redux', svg: redux },
  { title: 'GraphQL', svg: graphql },
  { title: 'Gatsby', svg: gatsby },
  { title: 'CSS', svg: css },
  { title: 'Sass', svg: sass },
]

const backEnd = [
  { title: 'Node.js', svg: nodejs },
  { title: 'Ruby', svg: ruby },
  { title: 'Rails', svg: rails },
  { title: 'Elixir', svg: elixir },
  { title: 'Phoenix', svg: phoenix },
  { title: 'Crystal', svg: crystal },
  { title: 'MongoDB', svg: mongodb },
  { title: 'PostgreSQL', svg: postgresql },
]

const tools = [
  { title: 'Heroku', svg: heroku },
  { title: 'Docker', svg: docker },
  { title: 'Webpack', svg: webpack },
  { title: 'AWS', svg: aws },
  { title: 'DigitalOcean', svg: digitalocean },
  { title: 'Git', svg: git },
  { title: 'Ubuntu', svg: ubuntu },
  { title: 'VS Code', svg: vscode },
]
const createTechnology = ({ title, svg }) => (
  <Technology key={title} svg={svg} title={title} />
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
