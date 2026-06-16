import React from 'react'
import { Link } from 'gatsby'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'

const NotFoundPage = () => (
  <Layout>
    <SEO
      title="404: Not Found"
      description="This page could not be found on Steve P's portfolio."
      pathname="/404/"
    />
    <div className="not-found-page">
      <section className="not-found-content" aria-labelledby="not-found-title">
        <p className="not-found-code">404</p>
        <h1 id="not-found-title">Page not found</h1>
        <Link className="not-found-link" to="/">
          Go home
        </Link>
      </section>
    </div>
  </Layout>
)

export default NotFoundPage
