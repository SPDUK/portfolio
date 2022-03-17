import React, { useEffect, useState } from 'react'
import { Link, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Layout from '../components/layout'
import SEO from '../components/seo'

import '../styles/projects.css'

const ProjectsIndex = ({ data, location }) => {
  const [carouselIdx, setCarouselIdx] = useState(0)

  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  const featured = posts.filter(({ node }) => node.frontmatter.featured)
  const notFeatured = posts.filter(({ node }) => !node.frontmatter.featured)

  useEffect(() => {
    // have to require here as importing at top breaks SSR
    // eslint-disable-next-line
    const ScrollReveal = require('scrollreveal').default

    ScrollReveal().reveal('.projects__list a', {
      duration: 600,
      distance: '20px',
      easing: 'cubic-bezier(0.5, -0.01, 0, 1.005)',
      origin: 'bottom',
      interval: 75,
    })

    return () => ScrollReveal().destroy()
  }, [])

  const handleCarouselChange = idx => {
    setCarouselIdx(idx)
  }

  return (
    <div>
      <div className="projects__carousel">
        <Carousel
          showArrows
          showStatus={false}
          showThumbs={false}
          autoPlay
          interval={5000}
          onChange={handleCarouselChange}
        >
          {featured.map(({ node }, idx) => (
            <div className="projects__carousel-item" key={node.fields.slug}>
              <div className="projects__carousel-text-wrapper container">
                <div className="projects__carousel-text">
                  <h1>{node.frontmatter.title}</h1>
                  <Link
                    tabIndex={idx === carouselIdx ? 0 : -1}
                    aria-label={node.frontmatter.title}
                    to={node.fields.slug}
                    className="btn btn--primary"
                  >
                    Check it out
                  </Link>
                </div>
              </div>

              <Img
                fluid={node.frontmatter.image.childImageSharp.fluid}
                alt={node.frontmatter.title}
              />
            </div>
          ))}
        </Carousel>
      </div>
      <Layout location={location} title={siteTitle}>
        <SEO title="Projects" />
        <div className="projects__list">
          {notFeatured.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <Link
                to={node.fields.slug}
                key={node.fields.slug}
                aria-label={title}
              >
                <h4>{title}</h4>
                <Img
                  fluid={node.frontmatter.image.childImageSharp.fluid}
                  alt={node.frontmatter.title}
                />
              </Link>
            )
          })}
        </div>
      </Layout>
    </div>
  )
}

export default ProjectsIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
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
            image {
              childImageSharp {
                fluid(maxWidth: 2048, quality: 100) {
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
