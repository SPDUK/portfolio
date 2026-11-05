# Candidate B. Give each view a main slot and a companion region

## Usage first

The visitor opens Projects or Writing into the full desktop stage. Desktop entry retains tiled About and Terminal.
Tile restores the main app to the left 60% and shows companions on the right.
If there is no visible companion, Tile opens or restores Terminal in the current view.
Opening Arcade, Contact, Settings, or another tool also exits stage mode and tiles that tool beside the main app.
Explicitly choosing Play still enters Play. Opening Arcade from Projects stays in Projects.

```ts
dispatch({ type: 'open', id: 'projects' }) // Enter Projects, stage its main app.
dispatch({ type: 'arrange' }) // Projects left, existing companions or Terminal right.
dispatch({ type: 'open', id: 'arcade' }) // Keep Projects and move Arcade here without remounting it.
const presentation = projectDesktop(state, stageSize, compact)
```

Repeated Tile calls retain the same companion and placement. They never spawn another Terminal.
If the visitor closes or minimizes the last companion, keep the main at 60% and expose the wallpaper on the right.
Do not immediately reopen an intentionally dismissed app. A later Tile call restores Terminal.
When the main is minimized, companions may occupy the stage. Tile respects minimization.

## Problem and grounding

`model.ts` already owns transitions and geometry. Its flat app pool gives each app one live instance.
`appHome` derives ownership from preset membership, so Terminal returns to Desktop and Arcade returns to Play.
`readDesktop` also rewrites saved ownership through that rule. `arrange` only clears stage flags, so one leaf stays full width.
`Desktop.tsx` renders the complete pool with stable app keys and hides inactive windows. Keep this lifetime behavior.
Routes have a separate acknowledgment path so a shell navigation does not replay an app launch.
Evidence is in `src/components/Desktop/model.ts` at `appHome`, `openWindow`, `readDesktop`, and `desktopReducer`, and `src/components/Desktop/Desktop.tsx` at `rendered.map` and `pendingHref`.

## Shape

Replace the arbitrary whole-view tree with an explicit main slot and a companion-only tree.
The model owns app roles and default view definitions. Presets cease to imply app ownership.
Only About, Projects, and Writing have implicit destination views. Play is an explicit named-view command.
These are signatures and domain sketches, not an implementation.

```ts
type PrimaryId = 'about' | 'projects' | 'writing'
type ToolId = Exclude<AppId, PrimaryId>
type CompanionNode = Leaf<ToolId> | Tabs<ToolId> | Split<CompanionNode>
type Display = { kind: 'tiles' } | { kind: 'stage'; app: AppId }
type MainShare = number & { readonly mainShare: unique symbol }
interface ViewComposition {
	companions: CompanionNode | null
	share: MainShare
	display: Display
	focused: AppId | null
	showDesktop: boolean
}
interface DesktopState {
	version: 3
	windows: DesktopWindow[] // Retain the existing unique app pool and window flags.
	activeView: ViewId
	views: Partial<Record<ViewId, ViewComposition>>
	routes: Partial<Record<AppId, string>>
}
function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState
function projectDesktop(state: DesktopState, size: StageSize, compact: boolean): Presentation
function readDesktop(value: string | null, documents: DocumentRoutes): DesktopState | null
```

The main app derives from the view definition and the existing window pool. Play uses Arcade only while Arcade resides there.
Opening Arcade elsewhere leaves Play without a visible main. Reentering Play moves the same Arcade instance back.
`DesktopWindow.view` remains the sole owner of app location. Existing minimized, floating, and rect fields retain their meanings.
Each visible nonfloating tool appears once in its owner's companion tree, except Arcade occupying Play's main slot.
The reducer alone updates location and tree membership atomically. Close keeps its existing instance-removal semantics.
`MainShare` is constructed internally in the 0.5 to 0.8 range. The usual value is 0.6.
Validate stored data once in `readDesktop`, then use typed pure transitions and geometry.
This follows Model the Domain for the dedicated regions and Boundary Discipline for storage parsing.

## Interaction invariants

The main cannot float, join a companion tab, or move to the right through drag or Arrange commands.
Drop targets and menu actions come from `Presentation.capabilities`; the shell never repeats role rules.
Companion drag, tab, and split behavior stays inside the right region. Floating companions remain available through an explicit Float command.
Opening a tool always docks it, clears stage mode, and preserves the current view and main content route.
The root divider clamps the main to at least half. Child dividers resize only companions.
If minimum pane sizes cannot fit, the projection uses tabs without mutating saved placements or share.
Compact screens retain their focused-app presentation. The dominant-left rule applies to a wide desktop stage.
Stage transitions change visibility and geometry only. Reader scroll, selected game, and game state survive.
Route acknowledgment updates the saved route without rerunning launch policy. Browser history remains a genuine navigation command.
`model.ts` owns transitions, projection, capabilities, and storage. `Desktop.tsx` owns events, navigation acknowledgment, and mounted rendering.
Keeping those two owners follows Minimize Reader Load and avoids a new controller layer.

## Compatibility and tradeoffs

Read v2 and legacy storage into v3 once. Retain app IDs, routes, minimization, tool floating rects, and explicit saved views.
Extract each definition's main from the old tree, prune it, and retain the remaining companion subtree where possible.
Assign primary content to its defined view. Preserve tool locations instead of applying `appHome`, including Terminal and Arcade.
Remove duplicate memberships, clamp shares, repair focus and stage references, and reject unknown versions at the boundary.
Write a new v3 key after successful hydration. Keep the old key as a migration fallback, not a parallel writer.
We accept a view-layout migration in exchange for representing the product layout directly. The existing app pool and route acknowledgment stay intact.
We accept losing arbitrary main-app rearrangement in exchange for keeping the content dominant after every transition.
An enforced main-root wrapper around the existing tree costs less to migrate, but every generic place, float, parse, and resize path must preserve that special root.
The dedicated regions hide that policy behind one reducer and projection, so this is my product and architecture recommendation.
No product answer blocks implementation. The remaining risk is complete coverage of legacy placement repairs, especially Arcade moving out of Play.
Start by implementing the v3 parser and pure launch, Tile, and placement transitions, then connect the existing shell to the projection.
