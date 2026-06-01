/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'
import { SiteQuery } from '../../types/siteQuery'

interface Meta {
  property?: string
  name?: string
  content: string
}
interface SEOProps {
  description?: string
  lang?: string
  meta?: Meta[]
  pathname?: string
  title: string
}

export const SEO = ({
  description = '',
  lang = 'en',
  meta = [],
  pathname = '',
  title,
}: SEOProps) => {
  const {
    favicon,
    site,
    socialPreview,
  }: {
    favicon: { publicURL: string }
    site: SiteQuery
    socialPreview: { publicURL: string }
  } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          image
          siteUrl
          author {
            name
          }
          social {
            github
          }
        }
      }
      favicon: file(relativePath: { eq: "site-favicon.png" }) {
        publicURL
      }
      socialPreview: file(relativePath: { eq: "social-preview.png" }) {
        publicURL
      }
    }
  `)

  const metaDescription = description || site.siteMetadata.description
  const siteUrl = site.siteMetadata.siteUrl || ''
  const canonicalUrl = `${siteUrl}${pathname || '/'}`
  const previewPath = socialPreview.publicURL || site.siteMetadata.image || ''
  const previewImage = previewPath.startsWith('http')
    ? previewPath
    : `${siteUrl}${previewPath}`
  const faviconPath = favicon.publicURL
  const githubHandle = site.siteMetadata.social?.github || 'SPDUK'
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.siteMetadata.author?.name || 'Steve P',
    alternateName: ['SPDUK', 'SPDEVUK'],
    jobTitle: 'Senior Software Engineer, Frontend Lead',
    url: siteUrl,
    image: previewImage,
    sameAs: [`https://github.com/${githubHandle}`],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cambridge',
      addressCountry: 'GB',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Zuora',
    },
    knowsAbout: [
      'React',
      'TypeScript',
      'JavaScript',
      'Frontend architecture',
      'Enterprise UI systems',
      'AI agents',
      'Agentic developer workflows',
      'Codex',
      'Claude Code',
      'Cursor',
      'Gatsby',
    ],
    description: metaDescription,
  }
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteMetadata.title,
    url: siteUrl,
    description: site.siteMetadata.description,
    author: {
      '@type': 'Person',
      name: personSchema.name,
    },
  }
  const defaultMeta: Meta[] = [
    {
      name: `description`,
      content: metaDescription,
    },
    {
      name: `keywords`,
      content: `Senior Software Engineer Cambridge, frontend lead, React engineer, TypeScript engineer, AI product engineer, agentic workflows, enterprise UI systems, Codex, Claude Code, Cursor`,
    },
    {
      property: `og:title`,
      content: title,
    },
    {
      property: `og:description`,
      content: metaDescription,
    },
    {
      property: `og:type`,
      content: `website`,
    },
    {
      property: `og:image`,
      content: previewImage,
    },
    {
      property: `og:image:width`,
      content: `1200`,
    },
    {
      property: `og:image:height`,
      content: `630`,
    },
    {
      property: `og:image:alt`,
      content: `Steve P senior software engineer and AI frontend lead portfolio preview`,
    },
    {
      property: `og:url`,
      content: canonicalUrl,
    },
    {
      name: `twitter:card`,
      content: `summary_large_image`,
    },
    {
      name: `twitter:image`,
      content: previewImage,
    },
  ]

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      link={[
        {
          rel: `icon`,
          type: `image/png`,
          href: faviconPath,
        },
        {
          rel: `apple-touch-icon`,
          href: faviconPath,
        },
        {
          rel: `canonical`,
          href: canonicalUrl,
        },
      ]}
      meta={[...defaultMeta, ...meta]}
      script={[
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify([personSchema, websiteSchema]),
        },
      ]}
    />
  )
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  pathname: PropTypes.string,
  title: PropTypes.string.isRequired,
}
