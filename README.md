# SPDEV OS

Steve's portfolio as a black and crimson Unix-inspired desktop. Built with Gatsby, React, TypeScript, and Markdown.

Launch Projects, Writing, Terminal, Arcade, Wallpapers, Settings, or Contact. The Desktop, Projects, Writing, and Play views provide useful starting layouts. Projects and Writing open in a focused view. Arrange windows with the visible Arrange controls, or use the single-app layout on a phone. Eclipse is the only theme. Wallpapers are static and artwork retains its original colors.

## Run locally

```powershell
npm ci --legacy-peer-deps
npm start
```

The development server runs at http://localhost:8000.

```powershell
npm run build
npm run serve
```

The production preview runs at http://localhost:9000.

## Verify

```powershell
npm run test:unit
npm run type-check
npm run lint
npm run build
npm run verify:build
```

The build audit checks original document routes, server-rendered content, canonical links, app routes, wallpaper files, and the dark-only HTML shell.

## Content and assets

Markdown lives in `content/blog` and `content/projects`. Existing slugs remain public URLs. The desktop reads generated document payloads when switching between content tabs. Project screenshots and article illustrations preserve their original colors.

Original wallpaper sources live in `content/assets/wallpaper-source`. Run `node scripts/prepare-os-assets.cjs` to regenerate stills, thumbnails, the favicon, and the social preview. Local fonts and their license live in `static/fonts`. Wallpaper provenance lives in `static/wallpapers/manifest.json`.

See [the Eclipse specification](docs/design/eclipse-spec.md), [implementation and verification](docs/os-implementation.md), and [the decision log](docs/os-decisions.tsv). Older Unixporn sheets are inspiration only. Sakura and light-mode proposals are retired.
