# SPDEV OS

Steve's portfolio as a black and crimson Unix-inspired desktop. Built with Gatsby, React, TypeScript, and Markdown.

The desktop opens with Steve's current role and selected work. Projects leads with Kishu Stack and this portfolio, followed by the historical archive; one catalog powers both the shortlist and search. Project overviews explain the contribution, decisions, and evidence before the full article.

Launch Writing, Terminal, Arcade, Photography, Wallpapers, Settings, or Contact from the app launcher. Contact stays available in the desktop panel and the phone's About / Projects / Contact / Apps navigation. Existing workspaces restore normally; fresh visits and resets start with About alone. Every full visit or reload opens with an automatic boot: pieces of the SP logo illuminate in place, terminal commands type into fixed rows, and each step changes from pending to complete before the next begins. The complete opening takes about three seconds, including the workspace fade, with typing speed adapting to longer titles. A crimson phosphor terminal powers on with a brief screen glow, CRT scanlines, and deeper edge shading; the scanlines, glow, and edge shading fade away with the boot cover, leaving the desktop and apps clear. The workspace fades into view without shifting. The intro has no skip control and runs in full regardless of desktop or system animation preferences. In-app navigation does not replay it; Settings offers a replay. Arrange windows with the visible Arrange controls, or use the single-app layout on a phone. Eclipse is the only theme. Wallpapers are static and artwork retains their original colors.

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

## Play

Arcade includes Asteroids, Snake, Breakout, **Lights Out** (a circuit puzzle with hints), **Pixel Studio** (draw, mirror, undo, and export a transparent PNG), **Beat Lab** (an eight-step drum machine), **Gravity Sling** (aim a probe around a planet through three courses), and **Prism Relay** (rotate mirrors to connect a beam through three puzzles). Drawings and beat patterns save in this browser. Beat Lab starts sound only after you press Play and pauses when you leave it. All eight activities are available from the responsive CRT launcher or Terminal's `play` command. Browse with the keyboard, mouse wheel, or touch, then choose Start game. The launcher fits its window's width and height, keeping Start and the key guide visible on desktop, tablet, and phone screens.

## Content and assets

Markdown lives in `content/blog` and `content/projects`. Existing slugs remain public URLs. The desktop reads generated document payloads when switching between content tabs. Project screenshots and article illustrations preserve their original colors.

The Photography collection contains ten original photographs, with the red flower featured first. Add travel photos directly to `content/photography` and run `npm run photos`. Filenames set the order and never appear as titles. The gallery reveals 12 frames at a time, downloads visible images through a two-request queue, and opens each image in a fullscreen viewer. See [add your travel photographs](content/photography/README.md) for supported formats and loading behavior.

Original wallpaper sources live in `content/assets/wallpaper-source`. The collection includes Afterglow (digital blur, the default), Night Drive (bokeh), Redshift (dithering), Feedback (punk screenprint), and Last Train (anime background). Run `node scripts/prepare-os-assets.cjs` to regenerate stills, thumbnails, the favicon, and the social preview. Local fonts and their license live in `static/fonts`. Wallpaper provenance and generation prompts live in `static/wallpapers/manifest.json`.

Keep current site assets, source artwork, and images used by Markdown in the repository. Temporary screenshots and storyboards belong in the ignored `proof/` directory; old captures and design boards have been removed.

See [the Eclipse specification](docs/design/eclipse-spec.md), [implementation and verification](docs/os-implementation.md), and [the decision log](docs/os-decisions.tsv). Historical Unixporn tokens remain archived. Sakura and light-mode proposals are retired.
