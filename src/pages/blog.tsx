import React, { useEffect } from 'react'
import { Link, graphql } from 'gatsby'
import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import * as svgs from '../utils/svgs'
import { isNewPost, formatDate } from '../utils/posts'

import '../styles/blog-page.css'

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  useEffect(() => {
    // have to require here as importing at top breaks SSR
    // eslint-disable-next-line
    const ScrollReveal = require('scrollreveal').default

    ScrollReveal().reveal('.blog-list a', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'bottom',
      interval: 75,
    })

    return () => ScrollReveal().destroy()
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Blog" />
      <div className="blog-list">
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <Link to={node.fields.slug} key={node.fields.slug}>
              <article>
                <img
                  src={svgs[node.frontmatter.type]}
                  alt={node.frontmatter.type}
                />
                <div>
                  <header>
                    <h1>{title}</h1>
                    <span>{formatDate(node.frontmatter.date)}</span>
                  </header>
                </div>
              </article>
              {isNewPost(node.frontmatter.date) && (
                <span className="blog-list__new pill">New!</span>
              )}
            </Link>
          )
        })}
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/(blog)/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            type
          }
        }
      }
    }
  }
`
