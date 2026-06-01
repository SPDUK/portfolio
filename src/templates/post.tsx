import React, { useEffect } from 'react'
import { Link, graphql } from 'gatsby'
import { Toaster, toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Code2,
  ExternalLink,
  GitBranch as Github,
  Headphones,
} from 'lucide-react'
import * as svgs from '../utils/svgs'
import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import addCopyCodeButtons from '../utils/addCopyCodeButtons'
import addRunCodeButtons from '../utils/addRunCodeButtons'
import addHeaderLinks from '../utils/addHeaderLinks'
import { postLength, formatDate } from '../utils/posts'
import { getBlogTypeLabel } from '../data/redesign'

interface PostLink {
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
  }
}

interface BlogPostTemplateProps {
  data: {
    markdownRemark: {
      excerpt: string
      html: string
      fileAbsolutePath: string
      frontmatter: {
        title: string
        date: string
        type?: keyof typeof svgs
        action?: string
      }
    }
  }
  pageContext: {
    previous?: PostLink
    next?: PostLink
  }
  location: {
    pathname: string
  }
}

const ArticleTypeBadge = ({ type }: { type?: keyof typeof svgs }) => {
  const imgSrc = type ? svgs[type] : undefined

  return (
    <span className="article-type-badge">
      {imgSrc ? <img src={imgSrc} alt="" aria-hidden="true" /> : <Code2 />}
      {getBlogTypeLabel(type)}
    </span>
  )
}

const ArticleLinkCard = ({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: typeof Github
  title: string
  description: string
}) => (
  <a
    className="article-link-card glass-panel"
    href={href}
    target="_blank"
    rel="noreferrer"
  >
    <span>
      <Icon aria-hidden="true" />
    </span>
    <span>
      <strong>{title}</strong>
      <small>{description}</small>
    </span>
    <ExternalLink aria-hidden="true" />
  </a>
)

const BlogPostTemplate = ({
  data,
  pageContext,
  location,
}: BlogPostTemplateProps) => {
  const { frontmatter, html, excerpt, fileAbsolutePath } = data.markdownRemark
  const { previous, next } = pageContext
  const isBlogPost = fileAbsolutePath.match(/blog/)
  const sourceUrl = `https://www.github.com/SPDUK/react-portfolio/tree/master/content/blog/${location.pathname}index.md`
  const audioMarkup = html.match(/<audio[\s\S]*?<\/audio>/i)?.[0]
  const audioSource = audioMarkup?.match(
    /<source[^>]+src=["']([^"']+)["']/i,
  )?.[1]
  const audioType =
    audioMarkup?.match(/<source[^>]+type=["']([^"']+)["']/i)?.[1] ?? 'audio/mp3'
  const articleHtml = (audioMarkup ? html.replace(audioMarkup, '') : html)
    .replace(/<h[1-6][^>]*>\s*Listen to this post!?\s*<\/h[1-6]>/i, '')
    .replace(
      /<hr\s*\/?>\s*<p>\s*<a[^>]*>\s*Example on GitHub\s*<\/a>\s*<\/p>/i,
      '',
    )
  const cleanExcerpt = excerpt
    .replace(/^Listen to this post!\s*/i, '')
    .replace(/^Example on Github\s*/i, '')
    .replace(/^Introduction\s*/i, '')

  useEffect(() => {
    if (frontmatter.action === 'copy') {
      addCopyCodeButtons()
      document.querySelectorAll('.gatsby-highlight button').forEach(button => {
        button.addEventListener('click', () => toast.success('Code copied'))
      })
    }

    if (frontmatter.action === 'code') {
      addRunCodeButtons()
    }

    addHeaderLinks()
  }, [frontmatter.action])

  return (
    <Layout>
      <Toaster richColors theme="dark" />
      <SEO title={frontmatter.title} description={cleanExcerpt} />
      <article className="article-page">
        <nav className="article-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/blog">Blog</Link>
          <span>/</span>
          <Link to="/blog">{getBlogTypeLabel(frontmatter.type)}</Link>
          <span>/</span>
          <span>Tutorial</span>
        </nav>

        <header className="article-header">
          <ArticleTypeBadge type={frontmatter.type} />
          <h1>{frontmatter.title}</h1>
          <div className="article-meta-row">
            <span>
              <CalendarClock aria-hidden="true" />
              {formatDate(frontmatter.date)}
            </span>
            <i />
            <span>
              <BookOpen aria-hidden="true" />
              {postLength(html)} read
            </span>
            {isBlogPost && (
              <>
                <i />
                <a href={sourceUrl} target="_blank" rel="noreferrer">
                  <Github aria-hidden="true" />
                  Suggest edit on GitHub
                </a>
              </>
            )}
          </div>
          <p>{cleanExcerpt}</p>
          <div className="article-header__accent" aria-hidden="true" />
        </header>

        <section className="article-audio-shell glass-panel">
          <Headphones aria-hidden="true" />
          <div>
            <h2>Listen to this post</h2>
            <span>AI narration</span>
          </div>
          {audioSource ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <audio controls preload="metadata">
              <source src={audioSource} type={audioType} />
            </audio>
          ) : (
            <p>Audio narration is not available for this post yet.</p>
          )}
        </section>

        {isBlogPost && (
          <section className="article-links">
            <h2>Useful links</h2>
            <div>
              <ArticleLinkCard
                href="https://github.com/SPDUK"
                icon={Github}
                title="Example on GitHub"
                description="See related example projects"
              />
              <ArticleLinkCard
                href={sourceUrl}
                icon={Code2}
                title="Source on GitHub"
                description="View this article's source"
              />
            </div>
          </section>
        )}

        <section
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </article>

      <nav className="article-pager">
        {previous ? (
          <Link
            className="article-pager__card glass-panel"
            to={previous.fields.slug}
            rel="prev"
          >
            <ArrowLeft aria-hidden="true" />
            <span>
              <small>Previous article</small>
              {previous.frontmatter.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <a
          className="article-pager__card glass-panel"
          href="https://www.github.com/SPDUK"
          target="_blank"
          rel="noreferrer"
        >
          <Github aria-hidden="true" />
          <span>
            <small>Discuss on GitHub</small>
            Join the conversation
          </span>
        </a>
        {next ? (
          <Link
            className="article-pager__card glass-panel"
            to={next.fields.slug}
            rel="next"
          >
            <span>
              <small>Next article</small>
              {next.frontmatter.title}
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fileAbsolutePath
      excerpt(pruneLength: 180)
      html
      frontmatter {
        title
        date
        type
        action
      }
    }
  }
`
