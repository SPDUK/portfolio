import React from 'react'
import { graphql, Link } from 'gatsby'
import { SEO } from '../components/Seo'
import { DocumentView } from '../components/Desktop/Apps'
import { ContentItem, PortfolioDocument } from '../components/Desktop/content'

interface PostLink {
  fields: { slug: string }
  frontmatter: { title: string }
}

interface PostProps {
  data: { markdownRemark: ContentItem & { html: string } }
  pageContext: {
    previous?: PostLink
    next?: PostLink
    shareImage: string
    shareImageAlt: string
  }
  location: { pathname: string }
}

export default function BlogPostTemplate({
  data,
  pageContext,
  location,
}: PostProps) {
  const { markdownRemark: item } = data
  const document: PortfolioDocument = {
    id: item.id,
    slug: item.fields.slug,
    title: item.frontmatter.title,
    date: item.frontmatter.date,
    html: item.html,
    excerpt: item.excerpt,
    kind: item.fields.kind,
  }
  return (
    <>
      <SEO
        title={item.frontmatter.title}
        description={item.excerpt}
        pathname={location.pathname}
        image={pageContext.shareImage}
        imageAlt={pageContext.shareImageAlt}
        meta={[
          {
            property: 'og:type',
            content: item.fields.kind === 'writing' ? 'article' : 'website',
          },
        ]}
      />
      <DocumentView item={item} active initialDocument={document} />
      <nav className="os-article-neighbors" aria-label="Related documents">
        {pageContext.previous && (
          <Link to={pageContext.previous.fields.slug}>
            <small>Previous</small>
            {pageContext.previous.frontmatter.title}
          </Link>
        )}
        {pageContext.next && (
          <Link to={pageContext.next.fields.slug}>
            <small>Next</small>
            {pageContext.next.frontmatter.title}
          </Link>
        )}
      </nav>
    </>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt(pruneLength: 180)
      fields {
        slug
        kind
        category
        technologies
      }
      frontmatter {
        title
        date
        featured
        image {
          publicURL
        }
      }
    }
  }
`
