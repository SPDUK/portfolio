import React, { useEffect } from 'react'
import { Link, graphql } from 'gatsby'
import { ToastContainer } from 'react-toastify'
import * as svgs from '../utils/svgs'
import Layout from '../components/layout'
import SEO from '../components/seo'
import addCopyCodeButtons from '../utils/addCopyCodeButtons'
import addHeaderLinks from '../utils/addHeaderLinks'
import { postLength, formatDate } from '../utils/posts.js'

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const { frontmatter, html, excerpt, fileAbsolutePath } = data.markdownRemark

  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  // add copyCode button to any code divs in the markdown - loads after mount (DOM manipulation)
  useEffect(() => {
    addCopyCodeButtons()
    addHeaderLinks()
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <ToastContainer />
      <SEO title={frontmatter.title} description={excerpt} />
      <article className="post">
        <header>
          {frontmatter.type && (
            <img src={svgs[frontmatter.type]} alt={frontmatter.type} />
          )}
          <div>
            <h1>{frontmatter.title}</h1>
            <span>
              {formatDate(frontmatter.date)} — {postLength(html)} read
            </span>
            {fileAbsolutePath.match(/blog/) && (
              <>
                {' / '}
                <a
                  href={`https://www.github.com/SPDUK/react-portfolio/tree/master/content/blog/${location.pathname}index.md`}
                >
                  Edit on GitHub
                </a>
              </>
            )}
          </div>
        </header>
        <section dangerouslySetInnerHTML={{ __html: html }} />
        <hr />
      </article>

      <nav className="post__footer">
        <ul>
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fileAbsolutePath
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        type
      }
    }
  }
`
