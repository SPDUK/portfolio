const path = require(`path`)
const fs = require('fs/promises')
const { createFilePath } = require(`gatsby-source-filesystem`)
const {
  prepareGlobalShareImage,
  prepareDocumentShareImages,
} = require('./scripts/prepare-share-images.cjs')

exports.onPreBootstrap = prepareGlobalShareImage

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/post.tsx`)
  const utilityPage = path.resolve('./src/templates/desktop-app.tsx')
  for (const app of [
    'terminal',
    'arcade',
    'signal-lab',
    'wallpapers',
    'settings',
    'contact',
  ]) {
    createPage({
      path: `/${app}`,
      component: utilityPage,
      context: { appId: app },
    })
  }
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }, limit: 1000) {
        edges {
          node {
            id
            html
            excerpt(pruneLength: 180)
            fileAbsolutePath
            fields {
              slug
            }
            frontmatter {
              title
              date
              type
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges
  const shareImages = await prepareDocumentShareImages(
    posts.map(({ node }) => ({
      title: node.frontmatter.title,
      slug: node.fields.slug,
      kind: /[\\/]projects[\\/]/.test(node.fileAbsolutePath)
        ? 'projects'
        : 'writing',
    })),
  )

  const documentDirectory = path.resolve('./public/os-content')
  await fs.mkdir(documentDirectory, { recursive: true })
  await Promise.all(
    posts.map(({ node }) =>
      fs.writeFile(
        path.join(documentDirectory, `${node.id}.json`),
        JSON.stringify({
          id: node.id,
          slug: node.fields.slug,
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          html: node.html,
          excerpt: node.excerpt,
          kind: /[\\/]projects[\\/]/.test(node.fileAbsolutePath)
            ? 'projects'
            : 'writing',
        }),
      ),
    ),
  )

  posts.forEach(post => {
    const sameKind = posts.filter(
      ({ node }) =>
        /[\\/]projects[\\/]/.test(node.fileAbsolutePath) ===
        /[\\/]projects[\\/]/.test(post.node.fileAbsolutePath),
    )
    const position = sameKind.findIndex(({ node }) => node.id === post.node.id)
    const link = entry =>
      entry
        ? {
            fields: { slug: entry.node.fields.slug },
            frontmatter: { title: entry.node.frontmatter.title },
          }
        : null
    const previous = link(sameKind[position + 1])
    const next = link(sameKind[position - 1])

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        shareImage: shareImages.get(post.node.fields.slug).image,
        shareImageAlt: shareImages.get(post.node.fields.slug).imageAlt,
        appId: /[\\/]projects[\\/]/.test(post.node.fileAbsolutePath)
          ? 'projects'
          : 'writing',
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
    const project = /[\\/]projects[\\/]/.test(node.fileAbsolutePath)
    const toolsLine = node.rawMarkdownBody?.match(/Tools Used:.*$/im)?.[0] || ''
    const technologies = Array.from(
      toolsLine.matchAll(/\[([^\]]+)\]\(/g),
      match => match[1],
    )
    if (!technologies.length && toolsLine) {
      technologies.push(
        ...toolsLine
          .replace(/Tools Used:\s*/i, '')
          .replace(/\*|`/g, '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      )
    }
    createNodeField({
      node,
      name: 'kind',
      value: project ? 'projects' : 'writing',
    })
    createNodeField({ node, name: 'technologies', value: technologies })
    createNodeField({
      node,
      name: 'category',
      value: project
        ? /snake|pokebattles/i.test(node.frontmatter.title)
          ? 'Games'
          : /recorder|scraper|downloader/i.test(node.frontmatter.title)
            ? 'Tools'
            : 'Web apps'
        : node.frontmatter.type || 'Notes',
    })
  }
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  })
}
