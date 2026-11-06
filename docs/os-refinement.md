# Eclipse refinement

## Workflow

- [x] Ground the request and inspect the current shell.
- [x] Sketch two workspace/view alternatives in parallel.
- [x] Compare, select, and synthesize the design.
- [x] Implement shell, content presentation, and motion.
- [x] Verify production behavior and responsive screenshots.
- [x] Record results and limits.

Architect phases are Ground, Sketch, Agree, Implement, Scrap. Agree has no user checkpoint. Arena phases are Frame, Fan out, Cross-judge, Pick, Graft, Verify. A cross-family judge is unavailable because all configured available models are GPT-family; the coordinator will compare both designs.

## Success criteria

1. Writing opens alone at nearly full-screen size and the top tabs have useful defaults.
2. Window management remains available and discoverable without overcrowding the interface.
3. Shell geometry uses the screen corners with small consistent margins.
4. Motion communicates app and view changes and respects reduced motion.
5. Artwork retains original color and documents, routes, games, and persistence still work.
6. Wallpapers ship as static images with no video assets or ambient particle layer.

## Throughput checkpoint

The risky change is the relationship between app routes, workspace selection, and restored layout. Compare two state models before implementation. Keep model/shell behavior changes under one owner and content styling under another. The coordinator owns visual direction, shell styling, production browser verification, and the final integration.

## Reference observations

- [end-4 Hyprland](https://github.com/end-4/dots-hyprland). Inspected the published window-overview and settings screenshots. Compact edge chrome, neutral readable panels, useful overview states, and original color imagery guide the redesign.
- [Caelestia Shell](https://github.com/caelestia-dots/shell). Its fluid shell and integrated launcher/workspace approach inform transitions and discoverability. No source code is copied.
- [Ax-Shell](https://github.com/Axenide/Ax-Shell). Inspected the published desktop screenshot. The compact grouped top controls inform the panel treatment. This archived project is visual inspiration only.

The user then requested static wallpapers. Keep the original WebP artwork. Remove video playback, particles, and wallpaper animation controls. Interface motion remains independently configurable.

## Design synthesis

Candidate A is the base. Its retained view arrangements match the request that each top tab is a useful place. Candidate B makes entry deterministic but throws away custom arrangements on every tab switch. Both agree on fixed launch policy and one mounted instance per app.

| Criterion            | A                               | B                                  |
| -------------------- | ------------------------------- | ---------------------------------- |
| Focused Writing      | Pass                            | Pass                               |
| Useful top tabs      | Pass, retained destinations     | Pass, preset commands              |
| Layout continuity    | Pass                            | Placement resets on entry          |
| Route ownership      | Single acknowledged route entry | Single transition/navigation owner |
| Implementation reach | Adapts existing layout trees    | Replaces workspace model entirely  |

Keep A's named, retained views and fixed primary ownership. Graft B's deterministic explicit launch behavior and one shared app registry. Retain the flat window pool and existing layout algorithms instead of nesting app instances inside view sessions. The view registry owns labels, primary apps, home views, presets, and solo entry. Default views are Desktop, Projects, Writing, and Play. Projects and Writing open alone. Desktop starts with About and Terminal. Play starts with Arcade. Utilities can be arranged within the current view. Replace cross-view Move with view navigation and clear Arrange controls. A separate-family judge is unavailable; the coordinator read both candidates and made this selection.

## Verification results

- All 31 unit tests pass. Twenty cover named views, geometry, route entry, persistence, legacy migration, and retention. Eleven cover game behavior.
- TypeScript passes. ESLint has zero errors and one existing warning for rendering repository-owned Markdown HTML.
- Production build exits successfully and generates 43 pages. The build audit verifies 32 server-rendered documents, eight app routes, and three static wallpapers with thumbnails. It rejects MP4/WebM wallpaper output.
- Browser checks cover default Desktop, solo Projects and Writing, Play defaults, document tabs, Back/Forward, direct article reload, floating and re-expanding Writing, and retained maximized Terminal after changing views.
- The clean production tab reports no console errors after direct article reload. Project image computed styles report filter none and normal blending. No wallpaper video exists in the rendered shell.
- Responsive checks cover 1440 x 900, the browser's default 1280 x 720, 390 x 844, and 320 x 568. Named view controls fit and the page has no horizontal overflow at the phone sizes.
- Review caught maximized geometry declarations that overrode window animations and nonsolo views losing maximized state. Both are fixed. Startup replay now checks the system reduced-motion preference even when interface animations are enabled.
- Comment review found zero required deletions, restores, or unresolved constraints.

Experience First led to focused reading views and larger original-color project previews. Model the Domain led to a shared view registry and explicit solo presentation separate from saved arrangements. Prove It Works led to production route checks and responsive browser verification.

The saved desktop, writing, projects, and mobile screenshots were removed during repository image cleanup; the verification results remain as the historical record.

## Limits

Browser checks used the local in-app Chromium browser, not physical devices, Safari, or Firefox. Reduced-motion behavior is source-reviewed; the browser harness does not expose that media preference. Gatsby still reports its existing WMIC and deprecation messages while exiting successfully. No deployment or commit was performed. The local production preview runs at http://127.0.0.1:8000/.
