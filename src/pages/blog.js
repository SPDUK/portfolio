import React from 'react'
import { Link, graphql } from 'gatsby'
import Bio from '../components/bio'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as svgs from '../utils/svgs'
import { isNewPost } from '../utils/posts'

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="My Blog" />
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
                    <span>{node.frontmatter.date}</span>
                  </header>
                  <section></section>
                </div>
              </article>
              {isNewPost(node.frontmatter.date) && (
                <span className="blog-list__new pill">New!</span>
              )}
            </Link>
          )
        })}
      </div>
      <Bio />
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
