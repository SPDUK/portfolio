import React, { useMemo, useRef, useState } from 'react'
import { Link, graphql } from 'gatsby'
import {
  ArrowRight,
  ExternalLink,
  Infinity,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Layout } from '../components/Layout'
import { SEO } from '../components/Seo/Seo'
import { MagicCard } from '../components/ui/magic-card'
import { getProjectMeta } from '../data/redesign'
import { useRevealTimeline } from '../hooks/useRevealTimeline'

interface ProjectImageFluid {
  src: string
  srcSet: string
  sizes: string
}

interface ProjectNode {
  fields: {
    slug: string
  }
  frontmatter: {
    title: string
    featured: boolean
    date: string
    image: {
      childImageSharp: {
        fluid: ProjectImageFluid
      }
    }
  }
}

interface ProjectsIndexProps {
  data: {
    allMarkdownRemark: {
      edges: {
        node: ProjectNode
      }[]
    }
  }
}

const categories = [
  'All Projects',
  'Web App',
  'Tool',
  'Game',
  'API',
  'Experiment',
]

const ProjectTags = ({ tags }: { tags: string[] }) => (
  <div className="tag-row">
    {tags.map(tag => (
      <span className="meta-chip" key={tag}>
        {tag}
      </span>
    ))}
  </div>
)

const ProjectIcon = ({
  icon,
  image,
  accent,
}: {
  icon: string
  image: string
  accent: string
}) => (
  <span className={`project-icon project-icon--${accent}`}>
    {image ? <img src={image} alt="" aria-hidden="true" /> : icon}
  </span>
)

const ProjectCardTooltip = ({ children }: { children: React.ReactNode }) => {
  const mouseX = useMotionValue(0)
  const tooltipX = useSpring(mouseX, {
    damping: 28,
    mass: 0.5,
    stiffness: 280,
  })
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const updateMouseX = (
    event:
      | React.PointerEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - rect.left - rect.width / 2)
  }

  return (
    <div
      className="project-card-tooltip-region"
      data-card-reveal
      data-tooltip-visible={isTooltipVisible}
      onBlurCapture={() => setIsTooltipVisible(false)}
      onFocusCapture={() => setIsTooltipVisible(true)}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => {
        setIsTooltipVisible(false)
        mouseX.set(0)
      }}
      onMouseMove={updateMouseX}
      onPointerEnter={() => setIsTooltipVisible(true)}
      onPointerLeave={() => {
        setIsTooltipVisible(false)
        mouseX.set(0)
      }}
      onPointerMove={updateMouseX}
    >
      {children}
      <div aria-hidden="true" className="project-card-tooltip">
        <motion.div
          className="project-card-tooltip__panel"
          style={{ x: tooltipX }}
        >
          <span className="project-card-tooltip__title">Coded before AI!</span>
          <span className="project-card-tooltip__underline">
            Wow, such manual code
          </span>
        </motion.div>
      </div>
    </div>
  )
}

const ProjectsIndex = ({ data }: ProjectsIndexProps) => {
  const pageRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Projects')
  const [query, setQuery] = useState('')
  const [newestFirst, setNewestFirst] = useState(true)
  const projects = data.allMarkdownRemark.edges.map(({ node }) => node)
  const featured = projects.filter(({ frontmatter }) => frontmatter.featured)

  const filteredProjects = useMemo(
    () =>
      projects
        .filter(({ frontmatter }) => !frontmatter.featured)
        .filter(({ frontmatter }) => {
          const meta = getProjectMeta(frontmatter.title)
          const matchesCategory =
            selectedCategory === 'All Projects' ||
            meta.category === selectedCategory
          const matchesQuery = frontmatter.title
            .toLowerCase()
            .includes(query.toLowerCase())

          return matchesCategory && matchesQuery
        })
        .sort((a, b) => {
          const aTime = new Date(a.frontmatter.date).getTime()
          const bTime = new Date(b.frontmatter.date).getTime()
          return newestFirst ? bTime - aTime : aTime - bTime
        }),
    [projects, query, selectedCategory, newestFirst],
  )

  useRevealTimeline(pageRef, { y: 20, stagger: 0.06 })
  useRevealTimeline(gridRef, {
    targets: '[data-card-reveal]',
    dependencies: [
      filteredProjects.length,
      newestFirst,
      query,
      selectedCategory,
    ],
    y: 12,
    stagger: 0.035,
    duration: 0.34,
  })

  return (
    <Layout wide>
      <SEO
        title="Projects"
        description="Selected projects by Steve P across React, TypeScript, frontend architecture, product UI, automation, and AI-assisted engineering workflows."
        pathname="/projects/"
      />
      <section className="projects-page" ref={pageRef}>
        <div className="page-hero page-hero--split">
          <div data-reveal>
            <h1>
              Things I've <span className="text-gradient">Built</span>
            </h1>
            <p>
              A collection of experiments, products, tools and web apps I've
              built and shipped.
            </p>
            <div className="stats-strip glass-panel">
              <span>
                <strong>15+</strong>
                Projects
              </span>
              <span>
                <strong>10+</strong>
                Technologies
              </span>
              <span>
                <strong>
                  <Infinity aria-hidden="true" />
                </strong>
                Ideas shipped
              </span>
            </div>
          </div>

          <div className="featured-projects" data-reveal>
            {featured.slice(0, 2).map(({ fields, frontmatter }) => {
              const meta = getProjectMeta(frontmatter.title)

              return (
                <article
                  className="featured-project glass-panel"
                  key={fields.slug}
                >
                  <div className="featured-project__copy">
                    <div className="featured-project__meta">
                      <span className="featured-label">
                        <Star aria-hidden="true" />
                        Featured
                      </span>
                      <ProjectIcon
                        icon={meta.icon}
                        image={meta.image}
                        accent={meta.accent}
                      />
                    </div>
                    <h2>{frontmatter.title}</h2>
                    <p>{meta.description}</p>
                    <ProjectTags tags={meta.technologies} />
                    <Link
                      className="neon-button neon-button--primary"
                      to={fields.slug}
                    >
                      Check it out
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="featured-project__image">
                    <img
                      alt={frontmatter.title}
                      decoding="async"
                      loading="lazy"
                      sizes={frontmatter.image.childImageSharp.fluid.sizes}
                      src={frontmatter.image.childImageSharp.fluid.src}
                      srcSet={frontmatter.image.childImageSharp.fluid.srcSet}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="toolbar-row" data-reveal>
          <div className="filter-chips glass-panel">
            {categories.map(category => (
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
          <label className="search-field glass-panel">
            <Search aria-hidden="true" />
            <span className="sr-only">Search projects</span>
            <input
              value={query}
              placeholder="Search projects..."
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <button
            className="sort-button glass-panel"
            type="button"
            onClick={() => setNewestFirst(!newestFirst)}
          >
            <SlidersHorizontal aria-hidden="true" />
            {newestFirst ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {filteredProjects.length ? (
          <div className="project-grid" ref={gridRef}>
            {filteredProjects.map(({ fields, frontmatter }) => {
              const meta = getProjectMeta(frontmatter.title)

              return (
                <ProjectCardTooltip key={fields.slug}>
                  <MagicCard
                    className="project-card project-card--magic"
                    gradientColor="rgba(34, 230, 255, 0.12)"
                    gradientFrom="rgba(34, 230, 255, 0.72)"
                    gradientSize={240}
                    gradientTo="rgba(180, 92, 255, 0.72)"
                  >
                    <Link className="project-card__link" to={fields.slug}>
                      <ProjectIcon
                        icon={meta.icon}
                        image={meta.image}
                        accent={meta.accent}
                      />
                      <span className="project-card__external">
                        <ExternalLink aria-hidden="true" />
                      </span>
                      <div>
                        <h2>{frontmatter.title}</h2>
                        <p>{meta.category}</p>
                      </div>
                      <ProjectTags tags={meta.technologies.slice(0, 3)} />
                    </Link>
                  </MagicCard>
                </ProjectCardTooltip>
              )
            })}
          </div>
        ) : (
          <div ref={gridRef}>
            <div className="empty-state glass-panel" data-card-reveal>
              <Sparkles aria-hidden="true" />
              <h2>No projects found</h2>
              <p>Try a different search term or filter.</p>
            </div>
          </div>
        )}
      </section>
    </Layout>
  )
}

export default ProjectsIndex

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { fileAbsolutePath: { regex: "/(projects)/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            featured
            date
            image {
              childImageSharp {
                fluid(maxWidth: 1200, quality: 92) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
        }
      }
    }
  }
`
