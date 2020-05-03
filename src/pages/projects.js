import React from 'react'
import { Link, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Bio from '../components/bio'
import Layout from '../components/layout'
import SEO from '../components/seo'

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  const featured = posts.filter(({ node }) => node.frontmatter.featured)
  const notFeatured = posts.filter(({ node }) => !node.frontmatter.featured)

  return (
    <div>
      <div className="projects__carousel">
        <Carousel
          showArrows
          showStatus={false}
          infiniteLoop
          // onChange={onChange}
          // onClickItem={onClickItem}
          // onClickThumb={onClickThumb}
        >
          {featured.map(({ node }) => (
            <div key={node.fields.slug}>
              <Img
                class="projects__carousel--image"
                fluid={node.frontmatter.image.childImageSharp.fluid}
                alt={node.frontmatter.title}
              />
            </div>
          ))}
        </Carousel>
      </div>
      <Layout location={location} title={siteTitle}>
        <SEO title="All posts" />

        {notFeatured.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <article key={node.fields.slug}>
              <Img
                fluid={node.frontmatter.image.childImageSharp.fluid}
                alt={node.frontmatter.title}
              />
              <header>
                <h3>
                  <Link to={node.fields.slug}>{title}</Link>
                </h3>
                <small>{node.frontmatter.date}</small>
              </header>
            </article>
          )
        })}

        <Bio />
      </Layout>
    </div>
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
      filter: { fileAbsolutePath: { regex: "/(projects)/" } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
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
