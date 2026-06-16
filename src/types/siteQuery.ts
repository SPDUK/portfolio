export interface SiteQuery {
  siteMetadata: {
    title: string
    description?: string
    keywords: string
    siteUrl?: string
    image?: string
    author?: {
      name: string
    }
    social?: {
      github?: string
    }
  }
}
