import React, { useMemo, useRef, useState } from 'react'
import { Link, graphql } from 'gatsby'
import {
  ArrowRight,
  ExternalLink,
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
import { useScrollRevealTimeline } from '../hooks/useScrollRevealTimeline'

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
    desktopImage?: {
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

const bentoVariants = [
  'deck-lead',
  'deck-standard',
  'deck-wide',
  'deck-tall',
  'deck-standard',
  'deck-compact',
  'deck-wide',
  'deck-standard',
  'deck-tall',
  'deck-standard',
  'deck-wide',
  'deck-compact',
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

const getProjectCardVariant = (
  index: number,
  meta: ReturnType<typeof getProjectMeta>,
) => {
  if (index === 0) {
    return 'deck-lead'
  }

  if (meta.technologies.length >= 3 && index % 3 === 1) {
    return 'deck-wide'
  }

  if (meta.category === 'Game' || meta.category === 'API') {
    return 'deck-tall'
  }

  return bentoVariants[index % bentoVariants.length]
}

const ProjectCardTooltip = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => {
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
      className={`project-card-tooltip-region ${className}`.trim()}
      data-card-reveal
      data-scroll-reveal
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
  const projects = useMemo(
    () => data.allMarkdownRemark.edges.map(({ node }) => node),
    [data.allMarkdownRemark.edges],
  )
  const featured = projects.filter(({ frontmatter }) => frontmatter.featured)
  const projectStats = useMemo(() => {
    const metas = projects.map(({ frontmatter }) =>
      getProjectMeta(frontmatter.title),
    )

    return {
      categories: new Set(metas.map(meta => meta.category)).size,
      technologies: new Set(metas.flatMap(meta => meta.technologies)).size,
    }
  }, [projects])

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
  useScrollRevealTimeline(gridRef, {
    targets: '[data-scroll-reveal]',
    dependencies: [
      filteredProjects.length,
      newestFirst,
      query,
      selectedCategory,
    ],
    y: 30,
    stagger: 0.055,
    duration: 0.58,
    rootMargin: '0px',
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
              My <span className="text-gradient">Projects</span>
            </h1>
            <p>
              A collection of projects I have built across web apps, tools,
              games, automation, and product experiments.
            </p>
            <div className="stats-strip glass-panel">
              <span>
                <strong>{projects.length}</strong>
                Projects
              </span>
              <span>
                <strong>{projectStats.technologies}</strong>
                Technologies
              </span>
              <span>
                <strong>{projectStats.categories}</strong>
                Categories
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
                    <picture>
                      {frontmatter.desktopImage && (
                        <source
                          media="(min-width: 861px)"
                          sizes={
                            frontmatter.desktopImage.childImageSharp.fluid.sizes
                          }
                          srcSet={
                            frontmatter.desktopImage.childImageSharp.fluid
                              .srcSet
                          }
                        />
                      )}
                      <img
                        alt={frontmatter.title}
                        decoding="async"
                        loading="eager"
                        sizes={frontmatter.image.childImageSharp.fluid.sizes}
                        src={frontmatter.image.childImageSharp.fluid.src}
                        srcSet={frontmatter.image.childImageSharp.fluid.srcSet}
                      />
                    </picture>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="toolbar-row project-toolbar glass-panel" data-reveal>
          <div
            aria-label="Project categories"
            className="filter-chips"
            role="group"
          >
            {categories.map(category => (
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
          <div className="project-toolbar__actions">
            <label className="search-field">
              <Search aria-hidden="true" />
              <span className="sr-only">Search projects</span>
              <input
                autoComplete="off"
                type="search"
                value={query}
                placeholder="Search projects..."
                onChange={event => setQuery(event.target.value)}
              />
            </label>
            <button
              className="sort-button"
              type="button"
              aria-pressed={!newestFirst}
              onClick={() => setNewestFirst(!newestFirst)}
            >
              <SlidersHorizontal aria-hidden="true" />
              {newestFirst ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {filteredProjects.length ? (
          <div className="project-grid" ref={gridRef}>
            {filteredProjects.map(({ fields, frontmatter }, index) => {
              const meta = getProjectMeta(frontmatter.title)
              const variant = getProjectCardVariant(index, meta)

              return (
                <ProjectCardTooltip className={variant} key={fields.slug}>
                  <MagicCard
                    className={`project-card project-card--magic project-card--${meta.accent}`}
                    gradientColor="rgba(34, 230, 255, 0.12)"
                    gradientFrom="rgba(34, 230, 255, 0.72)"
                    gradientSize={240}
                    gradientTo="rgba(180, 92, 255, 0.72)"
                  >
                    <Link className="project-card__link" to={fields.slug}>
                      <div className="project-card__topline">
                        <ProjectIcon
                          icon={meta.icon}
                          image={meta.image}
                          accent={meta.accent}
                        />
                        <span className="project-card__external">
                          <ExternalLink aria-hidden="true" />
                        </span>
                      </div>
                      <div className="project-card__body">
                        <p className="project-card__category">
                          {meta.category}
                        </p>
                        <h2>{frontmatter.title}</h2>
                        <p className="project-card__description">
                          {meta.description}
                        </p>
                      </div>
                      <ProjectTags tags={meta.technologies} />
                    </Link>
                  </MagicCard>
                </ProjectCardTooltip>
              )
            })}
          </div>
        ) : (
          <div ref={gridRef}>
            <div
              className="empty-state glass-panel"
              data-card-reveal
              data-scroll-reveal
            >
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
            desktopImage {
              childImageSharp {
                fluid(maxWidth: 900, quality: 92) {
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
