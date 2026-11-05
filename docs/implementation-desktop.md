# Desktop implementation record

## Ownership and architecture

The desktop replaces the previous navigation layout through Gatsby's persistent `wrapPageElement` hook. Gatsby still owns public URLs, page data, and server rendering. App windows own their retained view state.

Two approaches were considered. Caching complete Gatsby page elements would preserve old rendering code but couple window state to route lifecycle and metadata. A stable app registry with route adapters lets each app retain its state and load independent documents. The registry approach is implemented. The current server-rendered document enters its matching app through `routeContent`.

The Model the Domain principle changed window management into a reducer and a `LayoutNode` union. Split nodes retain axis and ratio. Tab groups retain their selected app. Window leaves identify single-instance apps. Rendering derives pixel geometry from this tree and the measured workspace bounds.

The Prove It Works principle requires browser checks in addition to reducer tests. The parent run owns production build and browser verification.

## Behavior

- Startup uses a three-second console sequence. Its final 360 milliseconds animate the console into the measured Terminal window bounds. Skip and Escape finish immediately.
- The default layout places Terminal above Arcade, with About on the right.
- Window titlebars support dragging tiled windows into edge splits or central tab groups. Window menus provide equivalent placement operations.
- Split handles support pointer movement, keyboard range adjustments, and explicit menu controls.
- Floating windows resize through a corner handle or menu actions. Rendered bounds clamp them to the current work area.
- Minimized and hidden-workspace apps remain mounted. Their active state pauses games and hidden audio.
- App failures have local retry boundaries. Launcher and boot overlays make background controls inert.
- Session persistence includes validated window state, layout trees, split ratios, and per-app routes. Local preferences are validated through Zod.
- Direct Markdown routes classify the owner from `fields.kind`. Unknown routes without Markdown render Gatsby's recovery content.
- Below 1100 pixels, one focused app fills the workspace. Desktop geometry remains in the state model.

## Verification

`node --test src/components/Desktop/model.test.mjs` passes 12 tests. Tests exercise startup placement, app uniqueness, close cleanup, minimize and restore, floating restoration, workspace movement, compact tab fallback, edge and center placement, resizing bounds, storage round trips, corrupt storage, and launching while a floating app has focus.

`npm run type-check` passed after shell integration. ESLint and production/browser results are recorded by the parent run after final integration.

The configured design models belong to the same GPT family. A separate-family architecture judge was unavailable. This limitation does not count as independent cross-family verification.
