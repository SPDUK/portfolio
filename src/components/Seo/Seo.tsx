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
  title: string
}

export const SEO = ({
  description = '',
  lang = 'en',
  meta = [],
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
  const previewPath = socialPreview.publicURL || site.siteMetadata.image || ''
  const previewImage = previewPath.startsWith('http')
    ? previewPath
    : `${siteUrl}${previewPath}`
  const faviconPath = favicon.publicURL
  const defaultMeta: Meta[] = [
    {
      name: `description`,
      content: metaDescription,
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
      content: `SPDUK senior software engineer portfolio preview`,
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
      ]}
      meta={[...defaultMeta, ...meta]}
    />
  )
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}
