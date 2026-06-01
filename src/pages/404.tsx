import React, { useRef } from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo/Seo'
import { useRevealTimeline } from '../hooks/useRevealTimeline'

const NotFoundPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  useRevealTimeline(pageRef, { y: 18 })

  return (
    <Layout>
      <SEO
        title="404: Not Found"
        description="This page could not be found on Steve P's portfolio."
        pathname="/404/"
      />
      <div className="not-found-page" ref={pageRef}>
        <h1 data-reveal>Not Found</h1>
        <p data-reveal>You just hit a route that doesn&#39;t exist.</p>
      </div>
    </Layout>
  )
}

export default NotFoundPage
