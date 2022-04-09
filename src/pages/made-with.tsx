/* eslint-disable react/no-unused-prop-types */ // I have no idea why this tsx file is expecting proptypes

import React, { useCallback, useEffect } from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import '../styles/made-with.css'
import { ScrollRevealObject } from '../types/scrollreveal'
// I have no idea why ESL
interface MadeWithItem {
  title: string
  link: string
  description?: string
}

const MadeWith = () => {
  const tools: MadeWithItem[] = [
    {
      title: 'Gatsby',
      link: 'https://www.gatsbyjs.org',
    },
    {
      title: 'Prism.js',
      link: 'https://prismjs.com/',
    },
    {
      title: 'ScrollReveal.js',
      link: 'https://scrollrevealjs.org/',
    },
    {
      title: 'Anime.js',
      link: 'https://animejs.com/',
      description: 'Used for custom animations on the homepage',
    },
    {
      title: 'PostCSS',
      link: 'https://postcss.org/',
      description:
        'Allowing me to use Sass-like CSS but without needing .scss files',
    },
    {
      title: 'HiQ',
      link: 'https://jonathanharrell.github.io/hiq/',
      description:
        'Used as a base for markdown content as well as a base for CSS var customization',
    },
  ]

  const inspiration: MadeWithItem[] = [
    {
      title: 'Dan Abramov',
      link: 'https://overreacted.io/',
      description:
        'Theme switcher and his method of using it within gatsby via dangerouslySetInnerHTML',
    },
    {
      title: 'Calvin Kipperman',
      link: 'https://kipperman.co/',
      description: 'Design for technologies layout on homepage',
    },
    {
      title: 'Tania Rascia',
      link: 'https://www.taniarascia.com/',
      description: 'Blog layout',
    },
    {
      title: 'Blizzard',
      link: 'https://www.blizzard.com/en-gb/',
      description: 'Carousel & Animations',
    },

    {
      title: 'Apple',
      link: 'https://www.apple.com/macbook-pro-16/',
      description: 'Blurry navbar',
    },
    {
      title: 'Atom One Dark syntax theme',
      link: 'https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme',
      description: 'Dark theme colours',
    },
  ]

  useEffect(() => {
    // have to require here as importing at top breaks SSR
    // eslint-disable-next-line
    const ScrollReveal = require('scrollreveal').default as ScrollRevealObject

    ScrollReveal().reveal('.made-with h3, .made-with li', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'bottom',
      interval: 75,
    })

    return () => ScrollReveal().destroy()
  }, [])

  const createListItem = useCallback(
    ({ title, link, description }: MadeWithItem) => (
      <li className="made-with__list-item">
        <a href={link}>{title}</a>
        {description && <span>{description}</span>}
      </li>
    ),
    []
  )

  return (
    <Layout>
      <SEO title="Made With" />
      <div className="made-with">
        <div className="made-with__tools">
          <h3>Tools Used</h3>
          <ul>{tools.map(createListItem)}</ul>
        </div>
        <div className="made-with__inspiration">
          <h3>Inspiration taken from</h3>
          <ul>{inspiration.map(createListItem)}</ul>
        </div>
      </div>
    </Layout>
  )
}

export default MadeWith
