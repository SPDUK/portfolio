import React from 'react'

import { Layout } from '../components/Layout/Layout'
import { SEO } from '../components/Seo'
import { Hero } from '../components/Hero/Hero'
import { Technologies } from '../components/Technologies'

const HomeIndex = () => (
  <Layout wide>
    <SEO
      title="Frontend Web Developer & AI Product Builder"
      description="Steve is a Cambridge-based frontend web developer and senior software engineer building React, TypeScript, responsive UI systems, and AI-native product experiences."
      pathname="/"
    />
    <Hero />
    <Technologies />
  </Layout>
)

export default HomeIndex
