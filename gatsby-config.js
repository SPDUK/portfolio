module.exports = {
  siteMetadata: {
    title: `Steve`,
    author: {
      name: `Steve`,
    },
    description: `Steve is a Senior Software Engineer building AI products and frontend systems. Explore his projects, writing, browser games and interactive experiments.`,
    keywords: `Steve, SPDUK, senior software engineer, AI products, frontend systems, React, TypeScript, interactive portfolio, creative coding, browser games`,
    siteUrl: `https://spdevuk.com`,
    image: `/social-preview.png`,
    social: {
      github: `SPDUK`,
    },
  },
  plugins: [
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/projects`,
        name: `projects`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Steve's interactive portfolio`,
        short_name: `SPDEV`,
        start_url: `/`,
        background_color: `#080809`,
        theme_color: `#B91F2E`,
        display: `minimal-ui`,
        icon: `content/assets/site-favicon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-postcss`,
    // removes any offline serviceworker they may have cached
    'gatsby-plugin-remove-serviceworker',
    `gatsby-plugin-nprogress`,
    `gatsby-plugin-netlify`,
  ],
}
