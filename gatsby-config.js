module.exports = {
  siteMetadata: {
    title: `Steve`,
    author: {
      name: `Steve`,
    },
    description: `Steve is a Cambridge-based frontend web developer and senior software engineer building React, TypeScript, responsive UI systems, and AI-native product experiences.`,
    keywords: `Steve, SPDUK, SPDEVUK, frontend web developer, frontend developer, frontend engineer, frontend designer, web developer Cambridge, Cambridge web developer, UK frontend developer, React developer, TypeScript developer, JavaScript developer, CSS expert, HTML expert, responsive web design, responsive UI, UI designer, UX designer, user interface design, user experience design, web development, remote web developer, contract frontend developer, freelance frontend developer, AI product builder, AI product engineer, agentic workflows, Codex, Claude Code, Cursor, Gatsby`,
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
