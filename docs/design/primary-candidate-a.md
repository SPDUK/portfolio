# Candidate A. One canonical primary root

## Usage

Initial Desktop shows About left and Terminal right at 60/40. Projects and Writing launch fullscreen within the stage. Explicit About launch expands About. Navigation stays visible.
Tile restores primary content on the left. Existing companions occupy the right. If none are visible, Tile opens or moves the existing Terminal there. Closing the final companion lets the primary fill the stage; explicit Tile fills the right pane again.
Opening a secondary keeps the active view and primary, clears fullscreen, and tiles that app on the right. Selecting Play explicitly enters Play and brings the existing Arcade there.

```ts
const reading = desktopReducer(state, { type: 'open', id: 'writing' })
const tiled = desktopReducer(reading, { type: 'arrange' })
const playing = desktopReducer(tiled, { type: 'open', id: 'arcade' })
const geometry = desktopGeometry(playing, stageSize)
```

## Shape

```ts
type PrimaryId = 'about' | 'projects' | 'writing'
type AppRole = { role: 'primary'; home: ViewId } | { role: 'secondary' }
function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState
function desktopGeometry(state: DesktopState, size: StageSize): TileGeometry
// Private. Every reducer result and storage read passes through this boundary.
function normalizeDesktop(state: DesktopState): DesktopState
```

Retain `DesktopWindow`, `LayoutNode`, `ViewState`, the unique mounted window pool, and version 2 storage. Add role metadata to `apps`. Only primary apps have home views. View presets seed layouts once and never establish secondary ownership. Derive a view's primary from this registry, with no additional primary slot state.
For a visible primary with companions, canonical layout is a horizontal root whose first child is the primary leaf and whose second child is the secondary tree. Default ratio is 0.60. An already canonical root preserves its ratio and subtree. Without companions, retain the primary leaf. Without a visible primary, use the existing free tree.
`normalizeDesktop` filters duplicate, hidden, foreign-view, and absent leaves, adds missing visible tiled apps, then extracts and anchors the primary. Every reducer return passes through it. Keep tree mutation helpers private. Model the Domain places the convention in one reducer boundary; Boundary Discipline puts storage interpretation at that same boundary.
`open(primary)` restores its named view and expands the app. Initial Desktop construction explicitly requests its tiled preset. `open(secondary)` moves the unique existing instance into the active view, tiles it, clears fullscreen, and repairs the old view's references. Route acknowledgments only record hrefs. Preserve the current acknowledgment mechanism.
`arrange` clears fullscreen, tiles visible floating companions, and supplies Terminal only if a content view has no visible companion. Preserve primary focus and existing ratios. Repeat calls converge on the same composition. Play arranges its existing free tree without adding Terminal.
Primary apps cannot float, join tabs, or become nested leaves. Reject primary-source placement. Redirect secondary drops over the primary to the right subtree. Retain secondary split/tab drag behavior. Menus hide unavailable options, while the reducer enforces them.
`desktopGeometry` derives the protected root from view metadata. Clamp the primary to at least half the actual stage width after the gap, while honoring secondary minimum width. Secondary dividers retain their limits. Narrow stages use existing compact focus navigation or tabs; larger stages restore the saved composition.
`model.ts` owns roles, transitions, normalization, geometry, and storage. `Desktop.tsx` owns input and routing adapters and its existing keyed render loop. App identity stays `win.id` across moves, resizing, and fullscreen. Only Close removes the instance. Static wallpapers and app/session internals remain unchanged.
Keep the version 2 storage shape and key. Preserve saved secondary ownership, routes, minimized flags, and floating rectangles. Primary apps retain their declared homes. Normalize legacy terminal-left Desktop to About-left at 0.60, retain valid primary-left ratios, and preserve unversioned workspace mapping for secondary apps. Stop the current `appHome` preset coercion in both opening and restoration.

## Recommendation and tradeoff

Recommend this candidate for the bounded portfolio. It fixes ownership and composition in the existing model without replacing state, storage, or mounted apps. Candidate B's explicit primary slot gives stronger types and simpler secondary operations, but requires coordinated state and geometry migration. A accepts a runtime invariant instead. Its risk is future code bypassing normalization; private mutation helpers and reducer invariant tests contain that risk.
Implement roles and canonicalization first. Verify launch, Tile alone, secondary transfer, drag rejection, resize limits, and restoration. Then verify real game progress, reader scroll, and Terminal history survive tiling and view changes. This document is an independent candidate; the coordinator owns synthesis.
