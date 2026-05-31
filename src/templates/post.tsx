import React, { useEffect } from 'react'
import { Link, graphql } from 'gatsby'
import { ToastContainer } from 'react-toastify'
import * as svgs from '../utils/svgs'
import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import addCopyCodeButtons from '../utils/addCopyCodeButtons'
import addRunCodeButtons from '../utils/addRunCodeButtons'

import addHeaderLinks from '../utils/addHeaderLinks'
import { postLength, formatDate } from '../utils/posts'

import '../styles/post.css'

interface BlogPostLink {
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
  }
}

interface BlogPostTemplateProps {
  data: {
    site: {
      siteMetadata: {
        title: string
      }
    }
    markdownRemark: {
      fileAbsolutePath: string
      excerpt: string
      html: string
      frontmatter: {
        title: string
        date: string
        type?: keyof typeof svgs
        action?: string
      }
    }
  }
  pageContext: {
    previous?: BlogPostLink
    next?: BlogPostLink
  }
  location: {
    pathname: string
  }
}

const BlogPostTemplate = ({
  data,
  pageContext,
  location,
}: BlogPostTemplateProps) => {
  const { frontmatter, html, excerpt, fileAbsolutePath } = data.markdownRemark

  const { previous, next } = pageContext

  // add copyCode button to any code divs in the markdown - loads after mount (DOM manipulation)
  useEffect(() => {
    if (frontmatter.action === 'copy') {
      addCopyCodeButtons()
    }

    if (frontmatter.action === 'code') {
      addRunCodeButtons()
    }

    addHeaderLinks()
  })

  return (
    <Layout>
      <ToastContainer />
      <SEO title={frontmatter.title} description={excerpt} />
      <article className={`post ${frontmatter.action}`}>
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
                  Suggest edit on GitHub
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
        action
      }
    }
  }
`
