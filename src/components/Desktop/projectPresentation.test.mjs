import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterProjects,
  projectCatalog,
  projectPresentation,
} from './projectPresentation.ts'

const document = (slug, title, category = 'Web apps') => ({
  id: slug,
  excerpt: `${title} project`,
  fields: { slug, kind: 'projects', category, technologies: ['React'] },
  frontmatter: { title, date: '2020-01-01', featured: false, image: null },
})
const items = [
  document('/portfolio/', 'Portfolio'),
  document('/poe-wishlist/', 'PoE Wishlist'),
  document('/kishu-stack/', 'Kishu Stack', 'Tools'),
]

test('selected projects lead the catalog without replacing the historical portfolio', () => {
  const entries = projectCatalog(items)
  assert.deepEqual(
    entries.slice(0, 2).map(entry => entry.href),
    ['/kishu-stack/', '/made-with'],
  )
  assert.equal(entries.length, 4)
  assert.equal(new Set(entries.map(entry => entry.href)).size, 4)
  assert.equal(
    entries.find(entry => entry.href === '/portfolio/').status,
    'Historical project',
  )
  assert.equal(
    entries.find(entry => entry.href === '/poe-wishlist/').status,
    'Retired',
  )
  assert.equal(items[0].fields.slug, '/portfolio/')
})

test('search includes featured page titles, contributions and technology with category filtering', () => {
  const entries = projectCatalog(items)
  assert.deepEqual(
    filterProjects(entries, '  INTERACTIVE PORTFOLIO  ', 'All').map(
      entry => entry.href,
    ),
    ['/made-with'],
  )
  assert.deepEqual(
    filterProjects(entries, 'interactive portfolio', 'Tools'),
    [],
  )
  assert.equal(
    filterProjects(entries, 'TypeScript', 'All').some(
      entry => entry.href === '/made-with',
    ),
    true,
  )
  assert.deepEqual(
    filterProjects(entries, 'model preferences', 'All').map(
      entry => entry.href,
    ),
    ['/kishu-stack/'],
  )
  assert.deepEqual(filterProjects(entries, 'does-not-exist', 'All'), [])
  assert.equal(filterProjects(entries, '', 'All').length, entries.length)
})

test('selected case studies have a factual overview and usable evidence links', () => {
  for (const slug of ['/kishu-stack/', '/made-with/']) {
    const overview = projectPresentation(slug).overview
    assert.ok(
      overview.problem &&
        overview.contribution &&
        overview.decision &&
        overview.evidence,
    )
    assert.ok(
      overview.links.some(link => link.href.startsWith('https://github.com/')),
    )
    assert.ok(
      overview.links.every(
        link => link.label && /^(https:\/\/|\/)/.test(link.href),
      ),
    )
  }
  assert.equal(projectPresentation('/portfolio/').overview, undefined)
})
