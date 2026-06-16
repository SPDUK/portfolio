import React, { useMemo, useRef, useState } from 'react'
import { Link, graphql } from 'gatsby'
import {
  ArrowRight,
  Calendar,
  GitBranch as Github,
  Search,
  Sparkles,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import { MagicCard } from '../components/ui/magic-card'
import * as svgs from '../utils/svgs'
import { formatDate, postLength } from '../utils/posts'
import { getBlogTypeLabel } from '../data/redesign'
import { useRevealTimeline } from '../hooks/useRevealTimeline'
import writingNotesVisual from '../../content/assets/writing-notes-visual.png'

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

const preferredCategories = ['All', 'JavaScript', 'Web Dev', 'AI', 'Tools']

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
  const pageRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [query, setQuery] = useState('')
  const posts = data.allMarkdownRemark.edges.map(({ node }) => node)

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

  useRevealTimeline(pageRef, { y: 20, stagger: 0.06 })
  useRevealTimeline(gridRef, {
    targets: '[data-card-reveal]',
    dependencies: [filteredPosts.length, query, selectedCategory],
    y: 12,
    stagger: 0.035,
    duration: 0.34,
  })

  return (
    <Layout wide>
      <SEO
        title="Blog"
        description="Technical notes from Steve P on JavaScript, React, frontend engineering, AI tooling, developer workflows, and building practical web products."
        pathname="/blog/"
      />
      <section className="blog-page" ref={pageRef}>
        <div className="page-hero page-hero--blog">
          <div data-reveal>
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

          <figure className="blog-hero-visual" data-reveal>
            <img
              src={writingNotesVisual}
              alt="Neon writing workspace showing notes, drafts, and connected article cards."
            />
          </figure>
        </div>

        <div
          className="toolbar-row blog-toolbar project-toolbar glass-panel"
          data-reveal
        >
          <div
            aria-label="Post categories"
            className="filter-chips"
            role="group"
          >
            {preferredCategories.map(category => (
              <button
                aria-pressed={selectedCategory === category}
                className={selectedCategory === category ? 'is-active' : ''}
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search aria-hidden="true" />
            <span className="sr-only">Search posts</span>
            <input
              autoComplete="off"
              type="search"
              value={query}
              placeholder="Search posts..."
              onChange={event => setQuery(event.target.value)}
            />
          </label>
        </div>

        {filteredPosts.length ? (
          <div className="post-grid" ref={gridRef}>
            {filteredPosts.map(({ fields, frontmatter }) => (
              <MagicCard
                className="post-card post-card--magic"
                data-card-reveal
                gradientColor="rgba(34, 230, 255, 0.12)"
                gradientFrom="rgba(34, 230, 255, 0.72)"
                gradientSize={260}
                gradientTo="rgba(180, 92, 255, 0.72)"
                key={fields.slug}
              >
                <Link className="post-card__link" to={fields.slug}>
                  <PostIcon type={frontmatter.type} />
                  <div>
                    <h2>{frontmatter.title}</h2>
                    <PostMeta date={frontmatter.date} />
                  </div>
                  <span className="meta-chip">
                    {getBlogTypeLabel(frontmatter.type)}
                  </span>
                </Link>
              </MagicCard>
            ))}
          </div>
        ) : (
          <div ref={gridRef}>
            <div className="empty-state glass-panel" data-card-reveal>
              <Sparkles aria-hidden="true" />
              <h2>No posts found</h2>
              <p>Try a different search term or filter.</p>
            </div>
          </div>
        )}

        <aside className="github-cta glass-panel" data-reveal>
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
