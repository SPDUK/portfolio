# Candidate B. Preset views over one desktop

The goal is a polished OS portfolio whose top navigation opens useful arrangements immediately. Writing opens by itself and fills the available stage. Window management remains available after a visitor chooses a view.

This candidate replaces the three empty workspace partitions with commands that apply named layouts to one desktop. App instances and their document state survive view changes. A view chooses which open apps are presented together.

## Current system

`gatsby-browser.js` and `gatsby-ssr.js` wrap every Gatsby page in `Desktop`. The wrapper passes the page's location, Markdown metadata, and rendered content. `routeApp()` maps a known app path directly. For a document slug, it uses `markdownRemark.fields.kind` to choose Projects or Writing. See [Desktop.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:99).

The state has one global window per `AppId`, a numeric workspace on each window, and three layout trees. The tree holds leaves, splits, and grouped tabs. `initialDesktop('about')` creates Terminal, Arcade, and About on workspace zero. The other two trees are null. A direct app entry initially creates only that app. See [model.ts](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:125).

The current flow has two writers for related information. The reducer owns window placement and focus. `Desktop` separately remembers the latest URL for each app in `routes`. A route change dispatches `open` and updates that map. Opening an existing app returns to the workspace that owns the app. Opening a new app inserts it beside the current focus. Writing therefore joins the current layout when opened from the dock. See [model.ts](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:390) and [Desktop.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:330).

The top buttons dispatch `workspace`, which changes the selected number and picks its first nonminimized window. They never populate the destination. `structuralAction()` then replaces the URL with the focused app's remembered route, or `/` for an empty workspace. The `previousPath` ref prevents that replacement from immediately reopening About. Consequently `/` can mean either the welcome desk or an empty Work or Play workspace. See [Desktop.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:149) and [Desktop.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:575).

`tileGeometry()` already turns a single leaf into a stage-filling window. It collapses splits into grouped tabs when the available size cannot fit their minimum dimensions. Below 1100 pixels, the shell presents only the focused window. Neither behavior requires a separate reader window manager. See [model.ts](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:303).

The stage currently caps ordinary layouts at 1280 by 720 pixels. Maximizing removes that cap. A Writing leaf alone would still look too small on a large display unless the stage cap is removed. See [desktop.css](C:/Users/slush/Projects/portfolio/src/components/Desktop/desktop.css:313).

Document tabs, selected documents, and scroll positions already belong to `Library`, which stores separate Projects and Writing sessions. Keeping an app section mounted while parking its window preserves those sessions. See [Apps.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Apps.tsx:349).

## Usage first

The shell has one entry point for user intent. These examples show the proposed API, not implementation.

```ts
send({ type: 'view', id: 'work' })
send({ type: 'open', id: 'writing' })
send({ type: 'route', id: 'writing', href: '/an-existing-post-slug' })
```

The first call opens the Work arrangement. The second parks the other windows and opens Writing alone at its remembered URL. The third changes the document without rebuilding an already visible Writing layout.

The title bar still sends `close`, `minimize`, `maximize`, `float`, `place`, `rect`, and `split`. The menu loses “Move to workspace” because windows no longer have a workspace owner. It can offer the same four named view commands as the top navigation.

## Shape

Use one app registry, one window pool, and one active layout tree. Preset definitions reuse `LayoutNode` and the existing geometry and placement functions.

```ts
type ViewId = 'desk' | 'work' | 'writing' | 'play'

type WindowPresentation =
	| { kind: 'parked' }
	| { kind: 'minimized' }
	| { kind: 'tiled' }
	| { kind: 'floating'; rect: WindowRect }

interface DesktopWindowV2 {
	id: AppId
	presentation: WindowPresentation
}

interface DesktopStateV2 {
	version: 2
	windows: DesktopWindowV2[]
	layout: LayoutNode | null
	focused: AppId | null
	maximized: AppId | null
	showDesktop: boolean
	routes: Partial<Record<AppId, string>>
}

interface ViewPreset {
	id: ViewId
	label: string
	focus: AppId
	layout: LayoutNode
}

type ViewAction =
	| { type: 'view'; id: ViewId }
	| { type: 'open'; id: AppId }
	| { type: 'route'; id: AppId; href: string }
	| { type: 'focus'; id: AppId }

interface NavigationIntent {
	href: string
	mode: 'push' | 'replace'
}

interface DesktopTransition {
	state: DesktopStateV2
	navigation: NavigationIntent | null
}

function transitionDesktop(
	state: DesktopStateV2,
	action: ViewAction | WindowAction,
): DesktopTransition {
	throw new Error('not implemented')
}

function applyPreset(state: DesktopStateV2, id: ViewId): DesktopStateV2 {
	throw new Error('not implemented')
}

function activePreset(state: DesktopStateV2): ViewId | null {
	throw new Error('not implemented')
}
```

`WindowAction` contains the existing window commands, with `workspace`, `move`, `restore`, and the workspace argument removed. Restore belongs to the storage boundary. Reset applies the Desk preset and clears remembered app routes.

The presentation union replaces the overlapping `floating` and `minimized` booleans. A parked app is open but excluded from the current view. A minimized app is a window the visitor explicitly hid. The distinction lets the dock report both without claiming that a view switch closed an app. This choice follows Model the Domain.

Each tiled app occurs exactly once in `layout`. Floating, parked, and minimized apps do not occur in that tree. A nonnull focus points to a visible app. `applyPreset()` enforces these invariants in one transition. It ensures the preset apps exist, parks the other apps, sets the preset members to tiled, installs the tree, and clears maximize and show-desktop. Calling it twice has the same result.

`activePreset()` compares the current arrangement with the preset definitions, ignoring focus and transient maximize state. Manual arrangement changes produce no selected preset and a small “Custom layout” status. This derives the selected state rather than storing another label that can disagree with the layout. This choice follows Foundational Thinking.

## Defaults

The proposed top navigation reads **Desk**, **Work**, **Writing**, and **Play**. The label Writing makes the reader view explicit.

| View | Arrangement | Focus | Entry route |
| --- | --- | --- | --- |
| Desk | About at 64 percent, Terminal at 36 percent | About | `/` |
| Work | Projects at 72 percent, Contact at 28 percent | Projects | Remembered Projects route, otherwise `/projects` |
| Writing | One Writing leaf | Writing | Remembered Writing route, otherwise `/blog` |
| Play | One Arcade leaf | Arcade | Remembered Arcade route, otherwise `/arcade` |

The percentages are proposed defaults, not measured optima. Contact can collapse into a grouped tab with Projects on narrow desktop widths through the existing geometry function. The compact layout uses the preset focus without mutating the saved tree.

App registry entries declare their launch behavior. About and Terminal open Desk. Projects and Contact open Work. Writing opens Writing. Arcade opens Play. Settings, Wallpapers, and System are utility windows that open floating over the current arrangement and produce a custom layout. The registry is the only place that declares this policy.

Opening Writing always reapplies its exclusive preset, including when its route is already current. Visiting another Writing document while Writing is already visible updates its route and preserves the one-window layout. If a visitor later explicitly opens a utility or changes the arrangement, that customization is allowed.

Remove the stage's maximum width and height. Use the shell's shared small edge inset for the stage and its gaps. A single Writing leaf then fills nearly the whole usable display while retaining the panel and app rail. Maximize remains a reversible window action.

## State and browser history

`transitionDesktop()` owns the route decision alongside the state decision. `Desktop` consumes the result and invokes Gatsby navigation once. A `route` event updates state and returns no navigation, so browser-driven navigation cannot loop back through `open`.

| Trigger | State behavior | History behavior |
| --- | --- | --- |
| Select a top view | Apply its exact default arrangement and focus | Push its focused app's remembered route if the URL changes |
| Open a primary app | Apply its registry view and focus the requested app | Push the requested app's remembered route if different |
| Open a utility | Add or reveal its floating window | Push its route if different |
| Focus a visible window or grouped tab | Select that app without reapplying a preset | Replace with its remembered route |
| Close or minimize the focus | Pick the next visible app, or null | Replace with the next focus route, or `/` |
| Resize, group, float, maximize, or show desktop | Update presentation only | No new history entry |
| Follow a document link | Keep or open its owning app and update remembered route | Gatsby pushes the document URL |
| Back or Forward | Apply the route's app view if that app is parked or absent, otherwise reveal and focus it | No navigation from the route handler |

An empty custom layout can still use `/` after the visitor closes its last window. That state must come from a shell action, not an incoming `/` route. On a genuine incoming `/` route, apply Desk. Keep a pending shell-navigation marker in the navigation adapter so the corresponding Gatsby location update acknowledges the transition instead of treating it as a new incoming route. The marker contains the expected URL and transition identifier and is cleared after acknowledgment. This replaces the current `previousPath` responsibility with an explicit adapter rule.

The URL represents content. Back does not recover an earlier splitter position or float rectangle. Browser history remains useful for document navigation without storing the whole desktop in every history entry.

## Persistence migration

Write one versioned `spdev-desktop-v2` session envelope containing the window pool, active layout, focused app, and app routes. Validate URLs and layout membership at this boundary. Keep preferences in their existing local-storage key and keep the two library-session keys unchanged.

Restore a valid v2 envelope first. For an incoming nonroot deep link, its app and URL take priority over saved focus. A saved Writing arrangement must not be replaced by a generic tiled insertion.

When only the legacy keys exist, read them with the existing parser. Convert the selected workspace's tree into the active layout. Convert its visible floating windows to floating presentations and its minimized windows to minimized presentations. Convert all windows in other workspaces to parked presentations. Copy valid remembered routes from `spdev-routes`. Do not merge inactive legacy trees into the visible layout.

If the selected legacy workspace is empty, apply its useful replacement. Workspace zero maps to Desk, one to Work, and two to Play. If the focused app or incoming URL is Writing, apply the Writing preset. Write the v2 key only after successful conversion. Keep the legacy keys until an explicit reset so a failed migration cannot erase the old session.

## Alternatives considered

| Shape | What it hides | What it exposes | Decision |
| --- | --- | --- | --- |
| Seed the three existing workspaces once | First-visit defaults and initial focus | Apps still belong to one bucket, so opening an existing app can jump to a different tab. Writing needs a separate special case. | Rejected for this candidate. It preserves empty-workspace semantics after windows close. |
| Keep independent saved layouts for four views over a shared app registry | Per-view customization and app reuse | Per-view membership, per-view minimize state, shared route identity, and rules for which occurrence receives browser focus. | Rejected. Its broader persistence model buys behavior the request does not require. |
| Apply deterministic presets to one active desktop | Arrangement transactions, app parking, launch policy, and route decisions | One layout, one window pool, and explicit window commands | Chosen. It makes every top button useful on every click. |

The chosen interface is deeper than “select workspace” because one command completes arrangement, visibility, focus, and route selection. The shell does not coordinate those stages or know the preset members. `model.ts` owns the registry, transitions, and storage conversion. `Desktop.tsx` owns Gatsby navigation, React mounting, controls, and motion. `Apps.tsx` retains its document-session ownership.

## Tradeoffs and checks

This design accepts that selecting a preset replaces a custom arrangement. App state and document tabs survive, but custom split ratios are not saved separately for each view. If preserving a different edited layout under every top button becomes a requirement, choose the independent-view alternative before implementation.

View motion can compare the previous and next app rectangles because the same app sections remain mounted. Parked apps become inactive before the transition starts. The shell must pause hidden game and media work, and reduced motion must apply the final presentation immediately.

Implementation needs behavior checks for Writing from the dock after a modified Work layout, direct article entry, route acknowledgment after closing the final window, Back between article and Projects, migration from an empty legacy workspace, and retained library tabs after repeated view changes. These are proposed checks. This read-only sketch did not run the app.

The next implementation step is to add the v2 state shape and `applyPreset()` in `model.ts`, then route every shell intent through the one transition entry point before changing navigation styling.
