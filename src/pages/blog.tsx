import React, { useMemo, useState } from 'react'
import { Link, graphql } from 'gatsby'
import {
  ArrowRight,
  Calendar,
  GitBranch as Github,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import * as svgs from '../utils/svgs'
import { formatDate, postLength } from '../utils/posts'
import { getBlogTypeLabel } from '../data/redesign'

interface BlogNode {
  fields: {
    slug: string
  }
  excerpt: string
  html: string
  frontmatter: {
    date: string
    title: string
    type?: keyof typeof svgs
  }
}

interface BlogIndexProps {
  data: {
    allMarkdownRemark: {
      edges: {
        node: BlogNode
      }[]
    }
  }
}

const preferredCategories = [
  'All',
  'JavaScript',
  'Web Dev',
  'AI',
  'Career',
  'DevOps',
  'Tools',
]

const PostIcon = ({ type }: { type?: keyof typeof svgs }) => {
  const imgSrc = type ? svgs[type] : undefined

  return (
    <span className="post-icon">
      {imgSrc ? <img src={imgSrc} alt="" aria-hidden="true" /> : <Sparkles />}
    </span>
  )
}

const PostMeta = ({ date, html }: { date: string; html?: string }) => (
  <span className="post-meta">
    <Calendar aria-hidden="true" />
    {formatDate(date)}
    {html && (
      <>
        <i />
        {postLength(html)} read
      </>
    )}
  </span>
)

const BlogIndex = ({ data }: BlogIndexProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [query, setQuery] = useState('')
  const posts = data.allMarkdownRemark.edges.map(({ node }) => node)
  const featuredPost =
    posts.find(({ frontmatter }) =>
      frontmatter.title.toLowerCase().includes('ai text to speech'),
    ) || posts[0]

  const filteredPosts = useMemo(
    () =>
      posts.filter(({ frontmatter }) => {
        const label = getBlogTypeLabel(frontmatter.type)
        const title = frontmatter.title.toLowerCase()
        const matchesCategory =
          selectedCategory === 'All' ||
          label === selectedCategory ||
          title.includes(selectedCategory.toLowerCase())
        const matchesQuery = title.includes(query.toLowerCase())

        return matchesCategory && matchesQuery
      }),
    [posts, query, selectedCategory],
  )

  return (
    <Layout wide>
      <SEO title="Blog" />
      <section className="blog-page">
        <div className="page-hero page-hero--blog">
          <div>
            <h1>
              Writing & <span className="text-gradient">Notes</span>
            </h1>
            <p>
              Thoughts on development, AI, JavaScript, and building on the web.
            </p>
            <p>
              Practical guides, tutorials, and ideas from my journey as a
              developer. I write about the things I'm learning, building, and
              experimenting with.
            </p>
          </div>

          <div className="blog-feature-area">
            <label className="search-field glass-panel">
              <Search aria-hidden="true" />
              <span className="sr-only">Search posts</span>
              <input
                value={query}
                placeholder="Search posts..."
                onChange={event => setQuery(event.target.value)}
              />
            </label>
            <div className="filter-chips filter-chips--full">
              {preferredCategories.map(category => (
                <button
                  className={selectedCategory === category ? 'is-active' : ''}
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {featuredPost && (
              <Link
                className="featured-post glass-panel"
                to={featuredPost.fields.slug}
              >
                <div className="featured-post__art">
                  <span className="featured-label">
                    <Star aria-hidden="true" />
                    Featured
                  </span>
                  <div className="featured-post__placeholder">
                    <PostIcon type={featuredPost.frontmatter.type} />
                  </div>
                </div>
                <div>
                  <span className="section-kicker">Featured article</span>
                  <h2>{featuredPost.frontmatter.title}</h2>
                  <p>{featuredPost.excerpt}</p>
                  <div className="tag-row">
                    <span className="meta-chip">
                      {getBlogTypeLabel(featuredPost.frontmatter.type)}
                    </span>
                    {featuredPost.frontmatter.type && (
                      <span className="meta-chip">
                        {featuredPost.frontmatter.type}
                      </span>
                    )}
                  </div>
                  <PostMeta
                    date={featuredPost.frontmatter.date}
                    html={featuredPost.html}
                  />
                </div>
                <span className="featured-post__arrow">
                  <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            )}
          </div>
        </div>

        {filteredPosts.length ? (
          <div className="post-grid">
            {filteredPosts.map(({ fields, frontmatter }) => (
              <Link
                className="post-card glass-panel"
                to={fields.slug}
                key={fields.slug}
              >
                <PostIcon type={frontmatter.type} />
                <div>
                  <h2>{frontmatter.title}</h2>
                  <PostMeta date={frontmatter.date} />
                </div>
                <span className="meta-chip">
                  {getBlogTypeLabel(frontmatter.type)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel">
            <Sparkles aria-hidden="true" />
            <h2>No posts found</h2>
            <p>Try a different search term or filter.</p>
          </div>
        )}

        <aside className="github-cta glass-panel">
          <span className="github-cta__icon">
            <Sparkles aria-hidden="true" />
          </span>
          <div>
            <h2>Enjoying the articles?</h2>
            <p>Follow along for more tutorials, thoughts, and builds.</p>
          </div>
          <a
            href="https://github.com/SPDUK/portfolio"
            target="_blank"
            rel="noreferrer"
          >
            <Github aria-hidden="true" />
            Star on GitHub
          </a>
          <a
            className="neon-button neon-button--primary"
            href="https://github.com/SPDUK"
            target="_blank"
            rel="noreferrer"
          >
            Follow on GitHub
            <ArrowRight aria-hidden="true" />
          </a>
        </aside>
      </section>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fileAbsolutePath: { regex: "/(blog)/" } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 170)
          html
          fields {
            slug
          }
          frontmatter {
            date
            title
            type
          }
        }
      }
    }
  }
`
