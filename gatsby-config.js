module.exports = {
  siteMetadata: {
    title: `Steve P | Senior Frontend Engineer & AI Product Builder`,
    author: {
      name: `Steve P`,
    },
    description: `Steve P is a Cambridge-based Senior Software Engineer and frontend lead building AI-native product experiences, enterprise React UI systems, and agentic developer workflows.`,
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
        name: `SPDUK Portfolio`,
        short_name: `SPDUK`,
        start_url: `/`,
        background_color: `#050816`,
        theme_color: `#4c8dff`,
        display: `minimal-ui`,
        icon: `content/assets/site-favicon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-postcss`,
    // removes any offline serviceworker they may have cached
    'gatsby-plugin-remove-serviceworker',
    {
      resolve: 'gatsby-plugin-web-font-loader',
      options: {
        google: {
          families: ['Fira Sans', 'IBM Plex Sans'],
        },
      },
    },
    `gatsby-plugin-nprogress`,
    `gatsby-plugin-netlify`,
  ],
}
