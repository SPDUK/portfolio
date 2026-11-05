# Named views with retained arrangements

The portfolio needs useful destinations in the top left and dedicated Projects and Writing views. I recommend four named view sessions with preset layouts. Each session retains its window arrangement. A single entry operation handles a tab click, an app launch, and a document URL.

This is a design candidate. Production files remain unchanged.

- Ground is complete through source inspection.
- Sketch is complete in this document.
- Agree belongs to the coordinator's comparison with the independent candidate.
- Implement is skipped because this assignment is a design pass.
- Scrap remains available if the chosen design fails the route and restore checks below.

Throughput checkpoint is not applicable to this read-only investigation.

## Current route and state flow

Both Gatsby wrappers install `Desktop`, so page navigation supplies new `children`, `location`, and document metadata to the shell. The current app is inferred from an exact app path or the Markdown document's `kind`. An unmatched route without project metadata currently falls back to Writing. See [Desktop.tsx](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:105), [gatsby-browser.js](C:/Users/slush/Projects/portfolio/gatsby-browser.js:5), and [gatsby-ssr.js](C:/Users/slush/Projects/portfolio/gatsby-ssr.js:1).

`DesktopState` owns globally unique app windows, a numeric active workspace, one global focused app, one global maximized app, and three layout trees. A layout tree contains leaves, splits, or window tab groups. Fresh `/` creates Terminal and Arcade beside About. Other entry routes create their app alone. Work and Play start empty. See [model.ts](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:26) and [initialDesktop](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:125).

An app launch dispatches `open`, then pushes its remembered URL. `open` finds an existing app anywhere and switches to its workspace. A new app joins the current workspace. The location effect dispatches another `open` when the URL changes. A workspace button dispatches only `workspace`, then replaces the URL with the selected window's URL or `/`. The button does not apply a preset. See [navigation callbacks](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:150), [route effect](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:330), and [reducer](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:391).

Rendering filters windows by workspace and minimization. `tileGeometry` computes boxes from that workspace's tree and converts undersized splits into selectable tab groups. Maximization hides sibling windows. Compact mode shows the focused app. Hidden windows remain mounted, which preserves app state. See [rendering](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:476) and [tileGeometry](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:303).

The shell restores desktop state and remembered app URLs from separate session-storage keys. Preferences use local storage. Projects and Writing own separate library sessions for document tabs, search, filters, and scroll. Those library sessions must remain independent of desktop layouts. See [shell restore](C:/Users/slush/Projects/portfolio/src/components/Desktop/Desktop.tsx:231), [readDesktop](C:/Users/slush/Projects/portfolio/src/components/Desktop/model.ts:549), and [Library](C:/Users/slush/Projects/portfolio/src/components/Desktop/Apps.tsx:338).

Two details matter to the change. `open` clears maximization, so adding a maximize dispatch only inside `openApp` would be undone by route arrival. `focusWindow` replaces the URL without the suppression used by `structuralAction`, so a focus change can also re-enter `open`. Restoring `/` currently keeps the saved workspace without reconciling it to the About route. These are source findings, not browser observations.

## Alternatives

| Shape | What the caller does | What the model owns | Tradeoff |
| --- | --- | --- | --- |
| Named view sessions, recommended | Enter a named view or app. | Preset initialization, per-view layout, primary-app ownership, route entry, and restored arrangements. | More state than one desktop, but changing views preserves the visitor's arrangement. |
| Stateless preset commands over one desktop | Apply Desktop, Projects, Writing, or Play to the live window set. | One mutable arrangement and deterministic preset replacement. | Small state model, but every view change discards arrangement edits or requires a second snapshot mechanism. The active tab becomes ambiguous after manual edits. |
| Seed the existing three workspaces once | Switch to a number and create defaults if empty. | Mostly the current reducer. | Small diff, but Writing still needs a separate mode. Workspace numbers, route ownership, and the Writing exception remain distributed across the shell. |

Choose named view sessions. This applies **Model the Domain** by representing a useful view as state with a stable identity. It applies **Experience First** by giving Writing a predictable reading destination and preserving layouts when visitors leave and return. Those are the two principle leaf skills read for this candidate.

## Usage before types

The shell uses one `send` function for user actions. Only that function requests Gatsby navigation. The location effect reports arrivals to the same controller. The controller acknowledges its own navigation without replaying the entry operation.

```ts
send({ type: 'enter-view', view: 'writing' })
send({ type: 'launch', app: 'writing' })
send({ type: 'focus', app: 'terminal' })

receiveRoute({ href: currentHref, app: routeApp, origin: 'external' })
```

`enter-view` restores that view's arrangement, brings its primary app forward, and applies its entry presentation. `launch` enters a primary app's view. Utility apps open in the active view or reveal their existing window. A repeated entry is safe and creates no duplicate app window.

## State and ownership

Keep the current `LayoutNode`, `WindowRect`, split geometry, and placement algorithms. Replace the parallel numeric workspace fields with named sessions.

```ts
type ViewId = 'desktop' | 'projects' | 'writing' | 'play'
type PrimaryAppId = 'about' | 'projects' | 'writing' | 'arcade'

type ViewDefinition = {
	id: ViewId
	label: string
	primary: PrimaryAppId
	initialLayout: LayoutNode
	entryPresentation: 'arranged' | 'solo'
}

type ViewWindow = Omit<DesktopWindow, 'workspace'>
type Presentation =
	| { kind: 'arranged' }
	| { kind: 'solo'; app: AppId }

type ViewSession = {
	windows: ViewWindow[]
	layout: LayoutNode | null
	focused: AppId | null
	presentation: Presentation
}

type DesktopState = {
	activeView: ViewId
	views: Partial<Record<ViewId, ViewSession>>
	routes: Partial<Record<AppId, string>>
	showDesktop: boolean
}

type Navigation = { href: string; mode: 'push' | 'replace' }
type DesktopTransition = {
	state: DesktopState
	navigation: Navigation | null
}

function transitionDesktop(
	state: DesktopState,
	intent: DesktopIntent,
	currentHref: string,
): DesktopTransition

function readDesktopSession(raw: string | null): DesktopState | null
```

`DesktopIntent` contains `enter-view`, `launch`, `route-arrived`, `focus`, and the existing close, minimize, maximize, float, rect, split, place, show-desktop, and reset operations. Add `reset-view`. Layout operations target the active view internally. The UI does not coordinate window creation, preset selection, maximization, and route updates separately.

An absent session means that its preset has never been initialized. An initialized empty session means the visitor closed its windows. Entering a view always restores its primary window if necessary. It does not reopen every optional window or discard custom ratios. `reset-view` alone reapplies the full preset.

Keep one mounted instance per `AppId` across all sessions. Primary apps have a fixed home view from the registry. Utility apps can live in whichever view first opens them. Finding a utility searches the four sessions before creating it. Validate uniqueness across sessions at the storage boundary.

Replace the current cross-workspace Move menu with named view navigation. Expose a visible Arrange control for split placement, grouping into window tabs, floating, dragging, and resizing. Keep minimization and maximization in the window chrome. Fixed primary ownership avoids moving Writing into Desktop and making the Writing view empty. Cross-view window movement is an accepted removal from this candidate.

The registry is the only list of view IDs, labels, primary apps, and defaults. Derive navigation buttons, default app ownership, and restore choices from it. Derive initial windows from `layoutIds(initialLayout)`. `model.ts` owns these rules, reducers, and storage parsing. `Desktop.tsx` owns Gatsby calls, session-storage I/O, mounted app rendering, and pointer events. `Apps.tsx` continues to own document tabs and document scroll. No new controller framework or generic workspace package is needed.

## Default views

| Tab | Primary app | First entry | Later entry |
| --- | --- | --- | --- |
| Desktop | About | About takes 60% of the stage on the right. Terminal takes 40% on the left. | Restore the arrangement and focus About. |
| Projects | Projects | One Projects window fills the stage. | Reveal Projects alone and restore the last project URL. |
| Writing | Writing | One Writing window fills the stage. | Reveal Writing alone and restore the last writing URL. |
| Play | Arcade | One Arcade window fills the stage. | Restore the arrangement and selected game. |

Projects and Writing have `entryPresentation: 'solo'`. Writing entry therefore sets `presentation` to `{ kind: 'solo', app: 'writing' }`. Entry does not close the other sessions or destroy a temporarily opened utility. Arrange or Restore returns to that session's retained arrangement. A deliberate utility launch can leave solo presentation so its window becomes visible. Entering the view again restores its solo presentation.

Full-stage sizing belongs to shell geometry. The coordinator's current desktop constraints are left 72, right 8, top 58, and bottom 32 pixels with no maximum stage size. Do not store viewport-sized rectangles for these defaults. The existing geometry function already scales a single leaf to its supplied stage size. Compact mode keeps the same view semantics and exposes window selection separately from the four view buttons.

## Route and browser-history rules

1. Explicit view selection, app launch, and document selection push a new history entry when the target URL changes. Re-selecting the same destination still applies its entry policy without adding an entry.
2. Clicking a view uses its primary app's remembered URL. Clicking Projects after reading a project resumes that project. Document-library tabs remain inside Projects or Writing.
3. Direct loads and browser Back or Forward resolve the URL to an app, enter that app's home view, and make its content visible. A Writing document always enters the solo reading presentation. The URL wins over restored active-view state, including `/`.
4. Focus changes, minimization, and closing replace the URL when another visible app becomes the current destination. Floating, resizing, grouping, maximization, and show-desktop change no history. If a view becomes empty, keep its primary app's URL until the visitor enters another destination.
5. Internal navigation has one pending acknowledgement in the shell, keyed by its exact target href. Its arrival records the app URL but does not apply `enter-view` or clear presentation again. Consume the acknowledgement once. Clear it for a browser history event. External arrivals always apply the route entry policy.
6. Every navigation source, including Arcade's game selection, uses the same controller. Remove the current separate `previousPath` exception after migrating all callers. An app's own query change replaces history and keeps its current presentation.
7. A fallback or missing page must render its Gatsby content without being silently classified as a Writing document. Preserve an explicit unknown-route result when route metadata cannot establish an app.

The controller computes and installs the next state before requesting navigation. Keep the latest installed state in a ref so a second action before React renders uses the first action's result. Gatsby navigation stays outside reducer execution. This avoids performing navigation inside a React state updater.

## Persistence migration

Write a versioned `spdev-desktop-v2` envelope containing `views`, `activeView`, and remembered app routes. Keep preferences and `spdev-library-projects` and `spdev-library-writing` unchanged. Aggregate desktop routes and layouts into one write so they restore together.

When v2 is missing, read the old desktop and route keys through their existing validation. Map workspace 0 to Desktop, workspace 1 to Projects, and workspace 2 to Play for utility ownership. Move each primary app to its registry home view. Writing therefore receives a dedicated Writing session regardless of its old workspace. Deduplicate app IDs across sessions.

Preserve a legacy layout only when its leaves exactly match that destination's visible tiled apps after reassignment. Otherwise rebuild that destination from its primary app and remaining utilities. Preserve valid floating rectangles and remembered document URLs. Leave unvisited destinations absent so first entry uses the new preset. Do not eagerly mount every app merely to seed defaults.

Validate finite rectangles, known app IDs, valid split ratios, unique layout leaves, and focused or solo apps that actually exist. Restore view presentation as arranged, then apply the current URL's entry policy. Treat an invalid version or unparseable payload as a fresh desktop. Validate remembered URLs against the app that owns them rather than accepting any slash-prefixed string.

Save v2 after successful initialization. Keep old keys as a migration fallback without writing them again. A failed storage write leaves the current session usable. Do not delete document-library state or preferences during a layout reset.

## Review checks and implementation boundary

The main risk is route acknowledgement, because both a user action and Gatsby arrival observe the same navigation. Check Writing from Desktop, a direct writing slug, refresh, Back, Forward, focus replacement, closing the focused app, and repeated same-URL launch. Each must leave one Writing instance and preserve the intended presentation. Apply the same entry checks to Projects.

Check that view switching retains a resized split and document scroll. Check that minimizing and reopening a floating utility retains its rectangle. Check a migrated session that contains Writing beside About and an invalid remembered route. Check small screens, reduced motion, and keyboard access to view navigation and window tab selection.

For motion, key the stage transition to `activeView` and window entry to app visibility. Do not unmount the entire desktop to animate a view change. Reduced motion must skip positional transitions. Artwork color is a content-style concern and requires no state change.

This candidate accepts four view buttons and fixed primary-app ownership in exchange for predictable destinations. It preserves the current window manager inside each view. The coordinator's synthesis must decide whether removing cross-view Move is acceptable. The next implementation step is the registry, state migration, and route-entry reducer tests before changing shell markup.
