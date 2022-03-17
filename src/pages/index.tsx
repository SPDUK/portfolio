import React from 'react'
import { graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'
import Hero from '../components/hero'
import { Technologies } from '../components/technologies'

const BlogIndex = () => (
  <Layout>
    <SEO title="Home" />
    <Hero />
    <Technologies />
  </Layout>
)

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
