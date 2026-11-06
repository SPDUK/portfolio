import { graphql, useStaticQuery } from 'gatsby'
import { z } from 'zod'

export interface ContentItem {
  id: string
  excerpt: string
  fields: {
    slug: string
    kind: 'projects' | 'writing'
    category: string
    technologies: string[]
  }
  frontmatter: {
    title: string
    date: string | null
    featured: boolean | null
    image: { publicURL: string } | null
  }
}

export const documentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  date: z.string().nullable(),
  html: z.string(),
  excerpt: z.string(),
  kind: z.enum(['projects', 'writing']),
})
export type PortfolioDocument = z.infer<typeof documentSchema>

const documents = new Map<string, PortfolioDocument>()
const loadingDocuments = new Map<string, Promise<PortfolioDocument>>()

export function cachedDocument(id: string) {
  return documents.get(id) || null
}

export function rememberDocument(document: PortfolioDocument) {
  documents.set(document.id, document)
  return document
}

export function loadDocument(id: string): Promise<PortfolioDocument> {
  const cached = documents.get(id)
  if (cached) return Promise.resolve(cached)
  const loading = loadingDocuments.get(id)
  if (loading !== undefined) return loading
  const request = fetch(`/os-content/${encodeURIComponent(id)}.json`)
    .then(response => {
      if (!response.ok) throw new Error('Document unavailable')
      return response.json()
    })
    .then(json => rememberDocument(documentSchema.parse(json)))
    .finally(() => loadingDocuments.delete(id))
  loadingDocuments.set(id, request)
  return request
}

export function useContent(): ContentItem[] {
  const data = useStaticQuery<{ allMarkdownRemark: { nodes: ContentItem[] } }>(
    graphql`
      query DesktopContentIndex {
        allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
          nodes {
            id
            excerpt(pruneLength: 160)
            fields {
              slug
              kind
              category
              technologies
            }
            frontmatter {
              title
              date
              featured
              image {
                publicURL
              }
            }
          }
        }
      }
    `,
  )
  return data.allMarkdownRemark.nodes
}

export const cleanExcerpt = (text: string) =>
  text
    .replace(/^Listen to this post!?\s*/i, '')
    .replace(/^Example on Github\s*/i, '')
    .replace(/^Introduction\s*/i, '')

export function displayDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
