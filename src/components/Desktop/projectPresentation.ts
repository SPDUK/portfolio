interface ProjectPresentation {
  order?: number
  contribution: string
  status?: 'Retired'
}

const presentations: Partial<Record<string, ProjectPresentation>> = {
  '/poe-wishlist': {
    order: 0,
    contribution:
      'Built a React wishlist and Phoenix API with scheduled price imports, currency tracking, and Path of Building imports.',
    status: 'Retired',
  },
  '/screen-recorder': {
    order: 1,
    contribution:
      'Connected area selection to FFmpeg in a toggleable Linux recording script, with start and stop notifications.',
  },
  '/slushy.gg': {
    order: 2,
    contribution:
      'Built a Next.js image gallery backed by the Cloudinary API, so new uploads appear without a site redeploy.',
  },
  '/portfolio': {
    contribution:
      'Built an earlier Gatsby portfolio with Markdown publishing, animated layouts, and a saved light or dark theme.',
  },
  '/old-portfolio': {
    contribution:
      'Built a Rails publishing site with Markdown posts, drafts, admin authorization, and editable project categories.',
  },
}

export function projectPresentation(slug: string) {
  return presentations[slug.replace(/\/$/, '')]
}
