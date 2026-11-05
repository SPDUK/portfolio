import type { ContentItem } from './content'

interface ProjectOverview {
  problem: string
  contribution: string
  decision: string
  evidence: string
  links: { label: string; href: string }[]
}

interface ProjectPresentation {
  order?: number
  selectedOrder?: number
  contribution: string
  status?: 'Current' | 'Retired'
  overview?: ProjectOverview
}

const presentations: Partial<Record<string, ProjectPresentation>> = {
  '/kishu-stack': {
    order: 0,
    selectedOrder: 0,
    contribution:
      'Built a plugin that brings task routing, design guidance, and model preferences into one working mode for AI coding agents.',
    status: 'Current',
    overview: {
      problem:
        'Give AI coding agents a consistent way to work without repeating the same guidance for every task.',
      contribution:
        'Combined existing engineering and design workflows with my own routing, preferences, and plugin packaging for Codex, Cursor, and Claude Code.',
      decision:
        'Build from pinned upstream sources, keeping personal model preferences outside the generated bundle so updates preserve them.',
      evidence:
        'A reusable plugin and three working demos: a fictional MMO site, a trading dashboard, and a creative studio booking flow.',
      links: [
        {
          label: 'Explore Kishu and demos',
          href: 'https://spduk.github.io/kishu-stack/',
        },
        {
          label: 'View repository',
          href: 'https://github.com/SPDUK/kishu-stack',
        },
      ],
    },
  },
  '/made-with': {
    selectedOrder: 1,
    contribution:
      'Built a React and TypeScript desktop for projects, writing, and interactive experiments, with shareable pages and a responsive window system.',
    status: 'Current',
    overview: {
      problem:
        'Make a personal desktop enjoyable to explore while keeping projects and writing easy to find, read, and share.',
      contribution:
        'Built the window system, content navigation, responsive layouts, browser games, and visual experiments in React and TypeScript.',
      decision:
        'Keep desktop state in one reducer and publish each article as a server-rendered page with its own URL.',
      evidence:
        'The site you are using, backed by tests for layout recovery, routing, game behavior, and generated public pages.',
      links: [
        { label: 'Explore the desktop', href: '/' },
        {
          label: 'View repository',
          href: 'https://github.com/SPDUK/react-portfolio',
        },
      ],
    },
  },
  '/poe-wishlist': {
    order: 1,
    contribution:
      'Built a React wishlist and Phoenix API with scheduled price imports, currency tracking, and Path of Building imports.',
    status: 'Retired',
  },
  '/screen-recorder': {
    order: 2,
    contribution:
      'Connected area selection to FFmpeg in a toggleable Linux recording script, with start and stop notifications.',
  },
  '/slushy.gg': {
    order: 3,
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

export interface ProjectEntry {
  id: string
  href: string
  title: string
  summary: string
  category: string
  technologies: string[]
  image: string | null
  date: string | null
  status: 'Current' | 'Retired' | 'Historical project'
  selectedOrder?: number
  document: ContentItem | null
}

export function projectSummary(item: ContentItem) {
  return (
    projectPresentation(item.fields.slug)?.contribution ||
    item.excerpt
      .replace(/^Example on Github\s*/i, '')
      .replace(/^Introduction\s*/i, '')
      .replace(/\s+(?:View Site\b|Code on Github\b|Tools Used:).*$/i, '')
      .replace(
        /\s+(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/,
        '',
      )
      .trim()
  )
}

export function projectCatalog(items: ContentItem[]): ProjectEntry[] {
  const current = presentations['/made-with']
  const entries: ProjectEntry[] = items
    .filter(item => item.fields.kind === 'projects')
    .sort(
      (a, b) =>
        (projectPresentation(a.fields.slug)?.order ?? Infinity) -
        (projectPresentation(b.fields.slug)?.order ?? Infinity),
    )
    .map(item => {
      const presentation = projectPresentation(item.fields.slug)
      return {
        id: item.id,
        href: item.fields.slug,
        title: item.frontmatter.title,
        summary: projectSummary(item),
        category: item.fields.category,
        technologies: item.fields.technologies,
        image: item.frontmatter.image?.publicURL || null,
        date: item.frontmatter.date,
        status: presentation?.status || 'Historical project',
        selectedOrder: presentation?.selectedOrder,
        document: item,
      }
    })
  entries.push({
    id: 'interactive-portfolio',
    href: '/made-with',
    title: 'Interactive portfolio',
    summary: current.contribution,
    category: 'Web apps',
    technologies: ['React', 'TypeScript', 'Gatsby'],
    image: null,
    date: null,
    status: 'Current',
    selectedOrder: current.selectedOrder,
    document: null,
  })
  return entries.sort(
    (a, b) => (a.selectedOrder ?? Infinity) - (b.selectedOrder ?? Infinity),
  )
}

export function filterProjects(
  entries: ProjectEntry[],
  query: string,
  category: string,
) {
  const term = query.trim().toLowerCase()
  return entries.filter(
    entry =>
      (category === 'All' || entry.category === category) &&
      `${entry.title} ${entry.summary} ${entry.category} ${entry.technologies.join(' ')}`
        .toLowerCase()
        .includes(term),
  )
}
