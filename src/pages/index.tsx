import React from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo'
import { Hero } from '../components/Hero/Hero'
import { Technologies } from '../components/Technologies'
import { WorkHistory } from '../components/WorkHistory'

const HomeIndex = () => (
  <Layout wide>
    <SEO
      title="Senior Frontend Engineer & AI Product Builder"
      description="Steve P is a Cambridge-based Senior Software Engineer and frontend lead building AI-native product experiences, React and TypeScript UI systems, and practical agentic developer workflows."
      pathname="/"
    />
    <Hero />
    <WorkHistory />
    <Technologies />
  </Layout>
)

export default HomeIndex
