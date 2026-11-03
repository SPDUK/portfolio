import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'gatsby'
import { z } from 'zod'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Code2,
  Copy,
  FileText,
  Folder,
  Gamepad2,
  GitBranch as Github,
  Mail,
  MapPin,
  Orbit,
  Search,
  Terminal as TerminalIcon,
  X,
} from 'lucide-react'
import type { AppId, DesktopPreferences } from './model'
import { apps } from './model'
import { gameRoute, games, parseGameId } from './arcadeCatalog'
import {
  cleanExcerpt,
  ContentItem,
  displayDate,
  documentSchema,
  PortfolioDocument,
  useContent,
} from './content'
import './apps.css'
import { projectPresentation } from './projectPresentation'

export interface AppsProps {
  appId: AppId
  active: boolean
  openApp: (id: AppId) => void
  navigate: (path: string) => void
  preferences: DesktopPreferences
  setPreferences: (patch: Partial<DesktopPreferences>) => void
  replayStartup: () => void
  resetDesktop: () => void
  routeContent?: React.ReactNode
  routePath?: string
}

async function copyText(text: string) {
  if (!navigator.clipboard) throw new Error('Clipboard unavailable')
  await navigator.clipboard.writeText(text)
}

function contentSummary(item: ContentItem) {
  if (item.fields.kind === 'writing') return cleanExcerpt(item.excerpt)
  return (
    projectPresentation(item.fields.slug)?.contribution ||
    cleanExcerpt(item.excerpt)
      .replace(/\s+(?:View Site\b|Code on Github\b|Tools Used:).*$/i, '')
      .replace(
        /\s+(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/,
        '',
      )
      .trim()
  )
}

function CurrentPortfolio() {
  return (
    <Link className="os-current-project" to="/made-with">
      <Code2 size={22} aria-hidden="true" />
      <div>
        <h2>Interactive portfolio</h2>
        <p>
          The site you're exploring. A custom desktop interface for my projects,
          writing, games and experiments, built with React and TypeScript.
        </p>
        <span>
          How this site works <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export const WALLPAPERS = [
  {
    id: 'eclipse',
    name: 'Eclipse',
    subtitle: 'A quiet world beneath a crimson sun.',
  },
  {
    id: 'cinder',
    name: 'Cinder',
    subtitle: 'Obsidian ridges. A distant glow.',
  },
  {
    id: 'red-rain',
    name: 'Red Rain',
    subtitle: 'Late nights in the machine city.',
  },
] satisfies {
  id: DesktopPreferences['wallpaper']
  name: string
  subtitle: string
}[]

function About({
  openApp,
  navigate,
}: {
  openApp: AppsProps['openApp']
  navigate: AppsProps['navigate']
}) {
  return (
    <div className="os-about">
      <div className="os-about-heading">
        <span className="os-about-monogram" aria-hidden="true">
          <img src="/brand/sp-monogram.png" alt="" width={54} height={54} />
        </span>
        <div>
          <h1>
            Steve<span className="os-accent">.</span>
          </h1>
        </div>
      </div>
      <p className="os-about-intro">
        Senior Software Engineer building AI products and frontend systems.
      </p>
      <p className="os-about-description">
        Projects, writing, games, and things I built because I wanted to see if
        I could.
      </p>
      <div className="os-action-row">
        <button
          type="button"
          className="os-primary"
          onClick={() => openApp('projects')}
        >
          Explore my work <ArrowUpRight size={16} />
        </button>
        <button type="button" onClick={() => openApp('contact')}>
          Get in touch <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="os-about-divider">
        <h2>Selected work</h2>
        <button type="button" onClick={() => openApp('projects')}>
          View all <ArrowUpRight size={12} />
        </button>
      </div>
      <CurrentPortfolio />
      <div className="os-selected-work">
        <button type="button" onClick={() => openApp('signal-lab')}>
          <Orbit size={22} aria-hidden="true" />
          <span>
            <strong>Signal Lab</strong>
            <span className="os-selected-work-description">
              A visual experiment built for this site. Shape animated patterns
              and save a frame.
            </span>
          </span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            openApp('arcade')
            navigate(gameRoute('asteroids'))
          }}
        >
          <Gamepad2 size={22} aria-hidden="true" />
          <span>
            <strong>Arcade</strong>
            <span className="os-selected-work-description">
              My browser versions of Asteroids, Snake and Breakout, with
              keyboard and touch controls.
            </span>
          </span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="os-about-divider">
        <h2>Current work</h2>
      </div>
      <div className="os-focus-card">
        <Code2 size={20} />
        <div>
          <h3>
            <a href="https://www.zuora.com/" target="_blank" rel="noreferrer">
              Zuora <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </h3>
          <p>
            At Zuora, I'm a Senior Software Engineer &amp; Forward Deployed
            Engineer focused on AI. I build product experiences and work with
            customers to turn practical problems into working software.
          </p>
        </div>
      </div>
      <footer className="os-about-footer">
        <span>
          <MapPin size={12} /> Cambridge, UK
        </span>
        <a href="https://github.com/SPDUK" target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size={12} />
        </a>
        <button type="button" onClick={() => openApp('writing')}>
          Writing <ArrowUpRight size={12} />
        </button>
      </footer>
    </div>
  )
}

export function DocumentView({
  item,
  active,
  initialDocument,
}: {
  item: ContentItem
  active: boolean
  initialDocument?: PortfolioDocument
}) {
  const [document, setDocument] = useState<PortfolioDocument | null>(
    initialDocument || null,
  )
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [notice, setNotice] = useState('')
  const [headings, setHeadings] = useState<{ id: string; title: string }[]>([])
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (initialDocument && initialDocument.id === item.id) {
      setDocument(initialDocument)
      return undefined
    }
    const controller = new AbortController()
    setDocument(null)
    setHeadings([])
    setError(false)
    fetch(`/os-content/${item.id}.json`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Document unavailable')
        return response.json()
      })
      .then(json => setDocument(documentSchema.parse(json)))
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
    return () => controller.abort()
  }, [item.id, attempt, initialDocument])
  useEffect(() => {
    if (!active)
      body.current?.querySelectorAll('audio,video').forEach(media => {
        if (media instanceof HTMLMediaElement) media.pause()
      })
  }, [active])
  useEffect(() => {
    if (!document || !body.current) return undefined
    const article = body.current
    const cleanups: (() => void)[] = []
    article.querySelectorAll('pre').forEach(pre => {
      const button = window.document.createElement('button')
      button.className = 'os-copy-code'
      button.textContent = 'Copy code'
      button.type = 'button'
      const copy = () =>
        copyText(
          pre.querySelector('code')?.textContent || pre.textContent || '',
        )
          .then(() => setNotice('Code copied'))
          .catch(() =>
            setNotice('Copy unavailable. Select the code to copy it.'),
          )
      button.addEventListener('click', copy)
      pre.after(button)
      cleanups.push(() => {
        button.removeEventListener('click', copy)
        button.remove()
      })
    })
    const sections = Array.from(
      article.querySelectorAll<HTMLHeadingElement>('h2,h3,h4'),
    ).map((heading, index) => {
      const title = heading.textContent?.trim() || `Section ${index + 1}`
      const originalId = heading.id
      if (!originalId)
        heading.id = `${document.slug.replace(/[^a-z0-9]+/gi, '-')}-section-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      const anchor = window.document.createElement('a')
      anchor.href = `#${heading.id}`
      anchor.textContent = ' #'
      anchor.setAttribute('aria-label', `Link to ${title}`)
      heading.append(anchor)
      cleanups.push(() => {
        anchor.remove()
        if (originalId) heading.id = originalId
        else heading.removeAttribute('id')
      })
      return { id: heading.id, title }
    })
    setHeadings(sections)
    const frame = window.requestAnimationFrame(() => {
      const section = sections.find(
        heading => `#${heading.id}` === window.location.hash,
      )
      if (section)
        window.document
          .getElementById(section.id)
          ?.scrollIntoView({ block: 'start' })
    })
    cleanups.push(() => window.cancelAnimationFrame(frame))
    return () => cleanups.forEach(cleanup => cleanup())
  }, [document])
  if (error)
    return (
      <div className="os-empty">
        <h2>This document could not be loaded.</h2>
        <p>Your workspace is still available.</p>
        <button type="button" onClick={() => setAttempt(value => value + 1)}>
          Try again
        </button>
        <a href={item.fields.slug}>Open document directly</a>
      </div>
    )
  if (!document)
    return (
      <div className="os-document">
        <h1>{item.frontmatter.title}</h1>
        <p>{contentSummary(item)}</p>
        <p role="status">Loading article…</p>
      </div>
    )
  return (
    <article className={`os-document os-document--${document.kind}`}>
      <h1>{document.title}</h1>
      <span className="os-content-meta">
        {item.fields.category} <span aria-hidden="true">/</span>{' '}
        {document.kind === 'projects' && 'Originally published '}
        {displayDate(document.date)}
        {document.kind === 'projects' && (
          <>
            <span aria-hidden="true">/</span>{' '}
            {projectPresentation(document.slug)?.status || 'Historical project'}
          </>
        )}
      </span>
      {document.kind === 'projects' && item.frontmatter.image && (
        <figure className="os-document-cover">
          <a
            href={item.frontmatter.image.publicURL}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={item.frontmatter.image.publicURL}
              alt={`${document.title} preview`}
            />
            <span>
              Open full-size preview <ArrowUpRight size={14} />
            </span>
          </a>
        </figure>
      )}
      {headings.length >= 4 && (
        <details className="os-document-contents">
          <summary>On this page</summary>
          <nav aria-label="On this page">
            <ol>
              {headings.map(heading => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )}
      <div
        className="os-document-body"
        ref={body}
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
      <p className="os-copy-status" role="status">
        {notice}
      </p>
      <a
        className="os-source-link"
        href={`https://github.com/SPDUK/react-portfolio/tree/master/content/${document.kind === 'projects' ? 'projects' : 'blog'}${document.slug}index.md`}
        target="_blank"
        rel="noreferrer"
      >
        View source <ArrowUpRight size={14} />
      </a>
    </article>
  )
}

const librarySessionSchema = z.object({
  version: z.literal(1),
  tabs: z.array(z.string()).max(100),
  selected: z.string().nullable(),
  query: z.string().max(200),
  category: z.string().max(100),
  scroll: z.record(z.string(), z.number().finite().min(0).max(10000000)),
})
type LibrarySession = z.infer<typeof librarySessionSchema>

function Library({
  kind,
  items,
  routePath,
  routeContent,
  active,
  navigate,
}: {
  kind: 'projects' | 'writing'
  items: ContentItem[]
  routePath: string
  routeContent?: React.ReactNode
  active: boolean
  navigate: AppsProps['navigate']
}) {
  const library = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const initialRoute = useRef(routePath)
  const restored = useRef(false)
  const restoringScroll = useRef<{ key: string; top: number } | null>(null)
  const [ready, setReady] = useState(false)
  const initialItem =
    items.find(
      item =>
        item.fields.kind === kind &&
        item.fields.slug.replace(/\/$/, '') === routePath.replace(/\/$/, ''),
    ) || null
  const [session, setSession] = useState<LibrarySession>(() => ({
    version: 1,
    tabs: initialItem ? [initialItem.id] : [],
    selected: initialItem?.id || null,
    query: '',
    category: 'All',
    scroll: {},
  }))
  const snapshot = useRef(session)
  snapshot.current = session
  const { query, category } = session
  const collection = items.filter(item => item.fields.kind === kind)
  if (kind === 'projects')
    collection.sort(
      (a, b) =>
        (projectPresentation(a.fields.slug)?.order ?? Infinity) -
        (projectPresentation(b.fields.slug)?.order ?? Infinity),
    )
  const selected = collection.find(item => item.id === session.selected) || null
  const tabs = session.tabs.flatMap(id => {
    const item = collection.find(entry => entry.id === id)
    return item ? [item] : []
  })
  const base = kind === 'projects' ? '/projects' : '/blog'
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const result = librarySessionSchema.safeParse(
        JSON.parse(sessionStorage.getItem(`spdev-library-${kind}`) || 'null'),
      )
      if (result.success) {
        const entries = items.filter(item => item.fields.kind === kind)
        const ids = new Set(entries.map(item => item.id))
        const saved = result.data
        const openTabs = Array.from(
          new Set(saved.tabs.filter(id => ids.has(id))),
        )
        const routed = entries.find(
          item =>
            item.fields.slug.replace(/\/$/, '') ===
            initialRoute.current.replace(/\/$/, ''),
        )
        let selectedId = routed?.id || null
        if (
          !initialRoute.current &&
          saved.selected &&
          openTabs.includes(saved.selected)
        )
          selectedId = saved.selected
        if (selectedId && !openTabs.includes(selectedId))
          openTabs.push(selectedId)
        setSession({
          ...saved,
          tabs: openTabs,
          selected: selectedId,
          category: entries.some(
            item => item.fields.category === saved.category,
          )
            ? saved.category
            : 'All',
          scroll: Object.fromEntries(
            Object.entries(saved.scroll).filter(
              ([id]) => id === 'index' || ids.has(id),
            ),
          ),
        })
      }
    } catch {
      // A private session can use the library without browser storage.
    }
    setReady(true)
  }, [items, kind])
  useEffect(() => {
    if (!ready) return
    try {
      sessionStorage.setItem(`spdev-library-${kind}`, JSON.stringify(session))
    } catch {
      // A private session can use the library without browser storage.
    }
  }, [kind, ready, session])
  useEffect(() => {
    if (!active)
      library.current?.querySelectorAll('audio,video').forEach(media => {
        if (media instanceof HTMLMediaElement) media.pause()
      })
  }, [active])
  useEffect(() => {
    const item = items.find(
      entry =>
        entry.fields.kind === kind &&
        entry.fields.slug.replace(/\/$/, '') === routePath.replace(/\/$/, ''),
    )
    if (item) {
      setSession(previous => ({
        ...previous,
        selected: item.id,
        tabs: previous.tabs.includes(item.id)
          ? previous.tabs
          : [...previous.tabs, item.id],
      }))
    } else if (routePath.replace(/\/$/, '') === base)
      setSession(previous => ({ ...previous, selected: null }))
  }, [items, kind, routePath, base])
  useEffect(() => {
    const element = scroller.current
    const content = element?.firstElementChild
    if (!ready || !active || !element || !content) return undefined
    if (selected?.id && window.location.hash) {
      restoringScroll.current = null
      return undefined
    }
    const key = selected?.id || 'index'
    restoringScroll.current = {
      key,
      top: snapshot.current.scroll[key] || 0,
    }
    const restore = () => {
      const pending = restoringScroll.current
      if (!pending || pending.key !== key) return
      element.scrollTop = pending.top
      if (Math.abs(element.scrollTop - pending.top) < 1)
        restoringScroll.current = null
    }
    restore()
    const observer = new ResizeObserver(restore)
    observer.observe(content)
    const cancelRestore = () => {
      restoringScroll.current = null
    }
    element.addEventListener('wheel', cancelRestore, { passive: true })
    element.addEventListener('pointerdown', cancelRestore, { passive: true })
    element.addEventListener('keydown', cancelRestore)
    return () => {
      observer.disconnect()
      element.removeEventListener('wheel', cancelRestore)
      element.removeEventListener('pointerdown', cancelRestore)
      element.removeEventListener('keydown', cancelRestore)
    }
  }, [ready, active, selected?.id, routeContent])

  function selectDocument(item: ContentItem | null) {
    setSession(previous => ({
      ...previous,
      selected: item?.id || null,
      tabs:
        item && !previous.tabs.includes(item.id)
          ? [...previous.tabs, item.id]
          : previous.tabs,
    }))
  }

  const categories = [
    'All',
    ...Array.from(new Set(collection.map(item => item.fields.category))),
  ]
  const filtered = collection.filter(
    item =>
      (category === 'All' || item.fields.category === category) &&
      `${item.frontmatter.title} ${item.excerpt} ${item.fields.technologies.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const showLatest = kind === 'writing' && !query.trim() && category === 'All'
  const showCurrent = kind === 'projects' && !query.trim() && category === 'All'
  return (
    <div className={`os-library os-library--${kind}`} ref={library}>
      <nav className="os-document-tabs" aria-label={`${kind} document tabs`}>
        <button
          type="button"
          className={`os-collection-tab${!selected ? ' is-active' : ''}`}
          aria-current={!selected ? 'page' : undefined}
          onClick={() => {
            selectDocument(null)
            navigate(base)
          }}
        >
          <Folder size={15} aria-hidden="true" />
          <span>{kind === 'projects' ? 'All projects' : 'All writing'}</span>
        </button>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`os-document-tab${selected?.id === tab.id ? ' is-active' : ''}`}
          >
            <button
              type="button"
              aria-current={selected?.id === tab.id ? 'page' : undefined}
              title={tab.frontmatter.title}
              onClick={() => {
                selectDocument(tab)
                navigate(tab.fields.slug)
              }}
            >
              <FileText size={14} aria-hidden="true" />
              <span>{tab.frontmatter.title}</span>
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.frontmatter.title}`}
              onClick={() => {
                setSession(previous => ({
                  ...previous,
                  tabs: previous.tabs.filter(id => id !== tab.id),
                  selected:
                    previous.selected === tab.id ? null : previous.selected,
                }))
                if (selected?.id === tab.id) {
                  navigate(base)
                }
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </nav>
      <div
        className="os-library-scroll"
        ref={scroller}
        role="region"
        aria-label={
          selected
            ? `${selected.frontmatter.title} document`
            : `${kind} collection`
        }
        onScroll={event => {
          if (!ready || !active || restoringScroll.current) return
          const top = event.currentTarget.scrollTop
          const key = selected?.id || 'index'
          setSession(previous =>
            previous.scroll[key] === top
              ? previous
              : { ...previous, scroll: { ...previous.scroll, [key]: top } },
          )
        }}
      >
        <div className={`os-library-page${selected ? ' is-reading' : ''}`}>
          {selected ? (
            <div className="os-reader">
              <button
                type="button"
                className="os-back"
                onClick={() => {
                  selectDocument(null)
                  navigate(base)
                }}
              >
                <ChevronLeft size={14} /> Back to {kind}
              </button>
              {routeContent &&
              selected.fields.slug.replace(/\/$/, '') ===
                routePath.replace(/\/$/, '') ? (
                <div className="os-route-document">{routeContent}</div>
              ) : (
                <DocumentView
                  key={selected.id}
                  item={selected}
                  active={active}
                />
              )}
            </div>
          ) : (
            <>
              <header className="os-library-header">
                <h1>{kind === 'projects' ? 'Projects' : 'Writing'}</h1>
                <p>
                  {kind === 'projects'
                    ? "Things I've built, including this portfolio and an archive of earlier projects."
                    : 'Notes on software development and the tools I use.'}
                </p>
              </header>
              {showCurrent && <CurrentPortfolio />}
              {kind === 'projects' && (
                <h2 className="os-project-archive-heading">Earlier projects</h2>
              )}
              <div className="os-library-toolbar">
                <label className="os-search">
                  <Search size={15} />
                  <span className="os-sr-only">Search {kind}</span>
                  <input
                    type="search"
                    placeholder={`Search ${kind}…`}
                    value={query}
                    maxLength={200}
                    onChange={event =>
                      setSession(previous => ({
                        ...previous,
                        query: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="os-category">
                  <span className="os-sr-only">Category</span>
                  <select
                    value={category}
                    onChange={event =>
                      setSession(previous => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                  >
                    {categories.map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="os-library-count" role="status">
                {filtered.length}{' '}
                {kind === 'projects' ? 'archived project' : 'note'}
                {filtered.length !== 1 && 's'}
              </div>
              <div className={`os-content-list ${kind}`}>
                {filtered.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {showLatest && index === 1 && (
                      <div className="os-writing-archive-heading">
                        <h2>Earlier notes</h2>
                      </div>
                    )}
                    <Link
                      to={item.fields.slug}
                      onClick={event => {
                        if (
                          !event.metaKey &&
                          !event.ctrlKey &&
                          !event.shiftKey &&
                          !event.altKey &&
                          event.button === 0
                        )
                          selectDocument(item)
                      }}
                      className={`os-content-card${showLatest && index === 0 ? ' is-featured' : ''}`}
                    >
                      {kind === 'projects' && (
                        <div className="os-project-cover">
                          {item.frontmatter.image ? (
                            <img
                              src={item.frontmatter.image.publicURL}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <Code2 size={40} aria-hidden="true" />
                          )}
                        </div>
                      )}
                      <div className="os-card-copy">
                        <h2>{item.frontmatter.title}</h2>
                        <span className="os-content-meta">
                          {item.fields.category}
                          <span aria-hidden="true">/</span>
                          {displayDate(item.frontmatter.date)}
                          {kind === 'projects' && (
                            <>
                              <span aria-hidden="true">/</span>
                              {projectPresentation(item.fields.slug)?.status ||
                                'Historical project'}
                            </>
                          )}
                        </span>
                        <p>{contentSummary(item)}</p>
                        <div className="os-card-footer">
                          {kind === 'projects' && (
                            <div className="os-chip-row">
                              {item.fields.technologies
                                .slice(0, 3)
                                .map(technology => (
                                  <span key={technology}>{technology}</span>
                                ))}
                            </div>
                          )}
                          <ArrowUpRight
                            className="os-card-arrow"
                            size={18}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                  </React.Fragment>
                ))}
              </div>
              {!filtered.length && (
                <div className="os-empty">
                  <h2>No matching {kind}.</h2>
                  <p>Try another search or browse everything.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSession(previous => ({
                        ...previous,
                        query: '',
                        category: 'All',
                      }))
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type TerminalEntry = { command: string; output: string }
const appCommands: Record<string, AppId> = {
  ...Object.fromEntries(apps.map(app => [app.id, app.id])),
  blog: 'writing',
  signal: 'signal-lab',
}
const commands = [
  'help',
  'neofetch',
  ...Object.keys(appCommands),
  'ls',
  'open',
  ...Object.keys(appCommands).map(command => `open ${command}`),
  'play',
  ...games.map(game => `play ${game.id}`),
  'wallpaper',
  'date',
  'clear',
]
function TerminalApp({
  items,
  openApp,
  navigate,
  preferences,
  setPreferences,
}: Pick<
  AppsProps,
  'openApp' | 'navigate' | 'preferences' | 'setPreferences'
> & { items: ContentItem[] }) {
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<TerminalEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showFetch, setShowFetch] = useState(true)
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' })
  const [started] = useState(() => Date.now())
  const output = useRef<HTMLDivElement>(null)
  const projects = items.filter(item => item.fields.kind === 'projects').length
  const writing = items.length - projects
  useEffect(() => {
    if (output.current && entries.length)
      output.current.scrollTop = output.current.scrollHeight
  }, [entries])
  function execute(value: string) {
    const [command, argument] = value.trim().toLowerCase().split(/\s+/)
    if (!command) return
    let result = ''
    if (command === 'clear') {
      setEntries([])
      setShowFetch(false)
      setInput('')
      setHistoryIndex(-1)
      setAnnouncement(previous => ({
        id: previous.id + 1,
        text: 'Terminal cleared.',
      }))
      return
    }
    if (command === 'neofetch') {
      setShowFetch(true)
      result = `Session uptime: ${Math.floor((Date.now() - started) / 60000)}m · Wallpaper: ${preferences.wallpaper}`
    } else if (command === 'help')
      result = `${apps.map(app => app.id).join(' · ')}\nopen <app> · play ${games.map(game => game.id).join('|')}\nwallpaper eclipse|cinder|red-rain\nneofetch · ls · date · clear\n↑ ↓ history   Tab complete`
    else if (command === 'ls')
      result = apps.map(app => `${app.id}/`).join('   ')
    else if (command === 'date') result = new Date().toLocaleString()
    else if (command === 'wallpaper') {
      const wallpaper = WALLPAPERS.find(item => item.id === argument)
      if (wallpaper) {
        setPreferences({ wallpaper: wallpaper.id })
        result = `Wallpaper set to ${wallpaper.name}.`
      } else result = 'Choose eclipse, cinder, or red-rain.'
    } else if (command === 'play') {
      const game = parseGameId(argument)
      if (game) {
        openApp('arcade')
        navigate(gameRoute(game))
        result = `Opened ${games.find(item => item.id === game).label}.`
      } else result = `Choose ${games.map(item => item.id).join(', ')}.`
    } else {
      const app =
        command === 'open' ? appCommands[argument] : appCommands[command]
      if (app) {
        openApp(app)
        result = `Opened ${argument || command}.`
      } else result = `Command not found: ${command}. Type help.`
    }
    setEntries(previous => [
      ...previous.slice(-99),
      { command: value, output: result },
    ])
    setAnnouncement(previous => ({ id: previous.id + 1, text: result }))
    setInput('')
    setHistoryIndex(-1)
  }
  return (
    <div className="os-terminal">
      <div className="os-terminal-scroll" ref={output}>
        {showFetch && (
          <>
            <p className="os-terminal-command">
              <span>steve@spdev</span> ~ $ neofetch
            </p>
            <div className="os-neofetch">
              <img
                className="os-terminal-mark"
                src="/brand/sp-monogram.png"
                alt=""
                width={112}
                height={112}
              />
              <dl>
                <dt className="os-fetch-user">
                  steve<span>@</span>spdev
                </dt>
                <dd className="os-fetch-rule">────────────────────</dd>
                <dt>Site</dt>
                <dd>SPDEV / interactive portfolio</dd>
                <dt>Host</dt>
                <dd>Cambridge, UK</dd>
                <dt>Role</dt>
                <dd>Senior Software Engineer</dd>
                <dt>Stack</dt>
                <dd>React · TypeScript</dd>
                <dt>Shell</dt>
                <dd>Portfolio terminal</dd>
                <dt>Files</dt>
                <dd>
                  {projects} projects · {writing} posts
                </dd>
                <dt>Theme</dt>
                <dd>Eclipse / dark</dd>
                <dd
                  className="os-terminal-swatches"
                  aria-label="Black and crimson palette"
                >
                  {[
                    '#373033',
                    '#66141e',
                    '#8f1927',
                    '#b91f2e',
                    '#ff5261',
                    '#aea5a7',
                    '#f1ece9',
                  ].map(color => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </dd>
              </dl>
            </div>
            <p className="os-terminal-hint">
              Welcome to my corner of the internet.
              <br />
              Type{' '}
              <button type="button" onClick={() => execute('help')}>
                help
              </button>{' '}
              to explore.
            </p>
          </>
        )}
        {entries.map((entry, index) => (
          <div className="os-terminal-entry" key={`${index}-${entry.command}`}>
            <p>
              <span>steve@spdev</span> ~ $ {entry.command}
            </p>
            <pre>{entry.output}</pre>
          </div>
        ))}
      </div>
      <form
        onSubmit={event => {
          event.preventDefault()
          execute(input)
        }}
        className="os-terminal-input"
      >
        <label htmlFor="os-terminal-command">
          <span>❯</span>
          <span className="os-sr-only">Terminal command</span>
        </label>
        <input
          id="os-terminal-command"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={input}
          placeholder="Type a command…"
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Tab' && !event.shiftKey && input) {
              const match = commands.find(command =>
                command.startsWith(input.toLowerCase()),
              )
              if (match && match !== input.toLowerCase()) {
                event.preventDefault()
                setInput(match)
              }
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              const next = Math.min(historyIndex + 1, entries.length - 1)
              setHistoryIndex(next)
              setInput(entries[entries.length - 1 - next]?.command || '')
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              const next = Math.max(-1, historyIndex - 1)
              setHistoryIndex(next)
              setInput(
                next < 0
                  ? ''
                  : entries[entries.length - 1 - next]?.command || '',
              )
            }
          }}
        />
        <button aria-label="Run command" type="submit">
          <ArrowDownLeft size={16} />
        </button>
      </form>
      <div
        className="os-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span key={announcement.id}>{announcement.text}</span>
      </div>
    </div>
  )
}

function WallpaperPicker({
  preferences,
  setPreferences,
}: Pick<AppsProps, 'preferences' | 'setPreferences'>) {
  return (
    <div className="os-wallpapers">
      <h1>Wallpaper</h1>
      <div className="os-wallpaper-list">
        {WALLPAPERS.map(wallpaper => (
          <button
            type="button"
            key={wallpaper.id}
            aria-pressed={preferences.wallpaper === wallpaper.id}
            className={
              preferences.wallpaper === wallpaper.id ? 'is-selected' : ''
            }
            onClick={() => setPreferences({ wallpaper: wallpaper.id })}
          >
            <img
              src={`/wallpapers/${wallpaper.id}.webp`}
              alt={wallpaper.subtitle}
              loading="lazy"
            />
            <span>
              <strong>{wallpaper.name}</strong>
              {preferences.wallpaper === wallpaper.id && <Check size={16} />}
              <small>{wallpaper.subtitle}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Settings({
  preferences,
  setPreferences,
  replayStartup,
  resetDesktop,
  openApp,
}: Pick<
  AppsProps,
  | 'preferences'
  | 'setPreferences'
  | 'replayStartup'
  | 'resetDesktop'
  | 'openApp'
>) {
  const [confirmReset, setConfirmReset] = useState(false)
  return (
    <div className="os-settings">
      <h1>Settings</h1>
      <p>Changes stay in this browser.</p>
      <h2>Appearance & sound</h2>
      <button
        type="button"
        className="os-setting-row"
        onClick={() => openApp('wallpapers')}
      >
        <span>
          <strong>Wallpaper</strong>
          <small>
            {WALLPAPERS.find(item => item.id === preferences.wallpaper)?.name}
          </small>
        </span>
        <ArrowUpRight size={16} />
      </button>
      <label className="os-setting-row">
        <span>
          <strong>Interface animations</strong>
          <small>
            Animate windows, views, and the launcher. Respects your system’s
            reduced-motion preference.
          </small>
        </span>
        <input
          type="checkbox"
          aria-label="Interface animations"
          checked={preferences.motion}
          onChange={event => setPreferences({ motion: event.target.checked })}
        />
      </label>
      <label className="os-setting-row">
        <span>
          <strong>Game sounds</strong>
          <small>Play quiet effects during games.</small>
        </span>
        <input
          type="checkbox"
          aria-label="Game sounds"
          checked={preferences.sound}
          onChange={event => setPreferences({ sound: event.target.checked })}
        />
      </label>
      <h2>Desktop</h2>
      <button type="button" className="os-setting-row" onClick={replayStartup}>
        <span>
          <strong>Replay startup</strong>
          <small>Watch the session come to life again.</small>
        </span>
        <TerminalIcon size={16} />
      </button>
      <div className="os-setting-row">
        <span>
          <strong>Reset desktop</strong>
          <small>Restore the opening layout. Best scores are kept.</small>
        </span>
        <button
          type="button"
          onClick={() => {
            if (confirmReset) {
              resetDesktop()
              setConfirmReset(false)
            } else setConfirmReset(true)
          }}
        >
          {confirmReset ? 'Confirm reset' : 'Reset'}
        </button>
        {confirmReset && (
          <button type="button" onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
        )}
      </div>
      <h2>Keyboard</h2>
      <div className="os-shortcuts">
        <span>Open launcher</span>
        <kbd>Ctrl / ⌘ K</kbd>
        <span>Dismiss overlay</span>
        <kbd>Esc</kbd>
        <span>Move between controls</span>
        <kbd>Tab</kbd>
        <span>Terminal history</span>
        <kbd>↑ ↓</kbd>
      </div>
      <p className="os-settings-note">
        Arrange menus let you group, tile, and resize windows without dragging.
      </p>
      <button
        type="button"
        className="os-source-link"
        onClick={() => openApp('system')}
      >
        About this site <ArrowUpRight size={14} />
      </button>
    </div>
  )
}

function Contact() {
  const [copied, setCopied] = useState('')
  return (
    <div className="os-contact">
      <h1>Get in touch</h1>
      <p>
        Email me about engineering work, AI products, or something you've seen
        here.
      </p>
      <a className="os-contact-link" href="mailto:spdevuk@gmail.com">
        <Mail size={18} />
        <span>
          <small>EMAIL</small>spdevuk@gmail.com
        </span>
        <ArrowUpRight size={18} />
      </a>
      <button
        type="button"
        className="os-copy-email"
        onClick={() =>
          copyText('spdevuk@gmail.com')
            .then(() => setCopied('Email copied'))
            .catch(() => setCopied('Select the email address to copy it.'))
        }
      >
        {copied === 'Email copied' ? <Check size={14} /> : <Copy size={14} />}{' '}
        Copy email address
      </button>
      <p role="status" className="os-copy-status">
        {copied}
      </p>
      <a
        className="os-contact-link"
        href="https://github.com/SPDUK"
        target="_blank"
        rel="noreferrer"
      >
        <Github size={18} />
        <span>
          <small>GITHUB</small>github.com/SPDUK
        </span>
        <ArrowUpRight size={18} />
      </a>
      <footer>
        <MapPin size={14} /> Based in Cambridge, United Kingdom
      </footer>
    </div>
  )
}

function SystemInfo() {
  return (
    <article className="os-engineering">
      <h1>How this site works</h1>
      <p className="os-engineering-intro">
        I built this portfolio around a desktop interface so projects, writing,
        games and experiments could share one place. React and TypeScript handle
        the interactive parts. Articles also have their own URLs and render
        before JavaScript runs.
      </p>
      <section>
        <h2>A layout tree, with one state owner</h2>
        <p>
          A window is a leaf. A split contains two layouts and a ratio. A tab
          group contains window IDs and a selected ID. This recursive model
          supports nested arrangements without a separate structure for each
          possible screen.
        </p>
        <p>
          The desktop reducer handles opening, docking, grouping, and closing.
          Its normalization step removes duplicate or missing windows and
          repairs focus. Primary apps keep their home view and a usable share of
          the layout. Those constraints reduce layout freedom, but keep the
          portfolio content reachable after rearranging tools.
        </p>
        <p className="os-engineering-reference">
          Implemented in <code>model.ts</code> and <code>Desktop.tsx</code>.
        </p>
      </section>
      <section>
        <h2>Recovering a saved workspace</h2>
        <p>
          The versioned desktop snapshot lives in session storage. Zod checks it
          before restoration, and the reader migrates the older format. Layout
          recovery checks window IDs against the restored windows, discards
          stale references, and repairs incomplete arrangements. Invalid
          snapshots fall back to the opening workspace.
        </p>
        <p>
          Preferences use local storage. Article tabs, filters, and reading
          positions use a separate session snapshot. Storage can be denied by
          the browser, so persistence is optional and the apps still work.
        </p>
      </section>
      <section>
        <h2>Articles are public pages</h2>
        <p>
          Gatsby renders the original Markdown into HTML at each article URL. A
          direct link contains the article before JavaScript runs. Inside the
          desktop, project and writing apps add document tabs and load the same
          content through validated JSON payloads.
        </p>
        <p>
          This keeps the desktop interaction separate from publishing. Older
          writing retains its original date and body, while the project index
          can explain what is historical and what has been retired.
        </p>
        <p className="os-engineering-reference">
          Implemented in <code>post.tsx</code>, <code>content.ts</code>, and{' '}
          <code>Apps.tsx</code>.
        </p>
      </section>
      <section>
        <h2>Game rules outside the renderer</h2>
        <p>
          Asteroids, Snake and Breakout keep their game rules separate from the
          canvas renderer. Snake moves at timed intervals. Asteroids and
          Breakout use fixed simulation steps, so movement is independent of the
          display's refresh rate.
        </p>
        <p>
          The animation loop caps elapsed time after a delayed frame. Games
          pause when their app becomes inactive, the browser loses focus, or the
          page becomes hidden. Returning to the game requires a resume, rather
          than advancing a run while it cannot be seen.
        </p>
        <p className="os-engineering-reference">
          Implemented in <code>gameLogic.ts</code>,{' '}
          <code>asteroidsLogic.ts</code>, <code>Arcade.tsx</code>, and{' '}
          <code>Asteroids.tsx</code>.
        </p>
      </section>
      <section>
        <h2>Patterns drawn from parameters</h2>
        <p>
          Signal Lab draws animated patterns in Canvas 2D from a preset, seed,
          elapsed time and pointer position. Its renderer has no simulation
          state to recover. You can shape the pattern and save the current frame
          as a PNG. Animation pauses when the app loses attention.
        </p>
        <p className="os-engineering-reference">
          Implemented in <code>signalRenderer.ts</code> and{' '}
          <code>SignalLab.tsx</code>.
        </p>
      </section>
      <section>
        <h2>Checking the behavior</h2>
        <p>
          Node tests cover layout ownership, repeated launches, saved-state
          recovery, routing, and game collisions. TypeScript and ESLint check
          the source. The build verification script checks emitted article HTML,
          canonical URLs, content payloads, app routes, and sharing images.
        </p>
        <p className="os-engineering-reference">
          Run <code>test:unit</code>, <code>type-check</code>, <code>lint</code>
          , and <code>build</code>, followed by <code>verify:build</code>.
        </p>
      </section>
      <a
        className="os-primary"
        href="https://github.com/SPDUK/react-portfolio"
        target="_blank"
        rel="noreferrer"
      >
        Explore the source <ArrowUpRight size={16} />
      </a>
    </article>
  )
}

export function Apps(props: AppsProps) {
  const { appId, openApp, routePath, routeContent, active, navigate } = props
  const items = useContent()
  let content: React.ReactNode
  switch (appId) {
    case 'about':
      content = <About openApp={openApp} navigate={navigate} />
      break
    case 'projects':
    case 'writing':
      content = (
        <Library
          kind={appId}
          items={items}
          routePath={routePath || ''}
          routeContent={routeContent}
          active={active}
          navigate={navigate}
        />
      )
      break
    case 'terminal':
      content = <TerminalApp items={items} {...props} />
      break
    case 'wallpapers':
      content = <WallpaperPicker {...props} />
      break
    case 'settings':
      content = <Settings {...props} />
      break
    case 'contact':
      content = <Contact />
      break
    case 'system':
      content = <SystemInfo />
      break
    default:
      content = null
  }
  return <div className={`os-app-content os-app-${appId}`}>{content}</div>
}
