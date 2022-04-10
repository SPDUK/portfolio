import React from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not Found" />
    <h1>Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export default NotFoundPage
