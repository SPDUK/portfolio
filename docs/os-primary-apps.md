# Primary app behavior

## Workflow

- [x] Ground.
- [x] Sketch.
- [x] Agree.
- [x] Implement.
- [x] Scrap if the chosen shape fails integration. Not needed; the selected shape passed integration.
- [x] Verify the production UI and record results.

Arena stages are Frame, Fan out, Cross-judge, Pick, Graft, Verify. All available configured models are GPT-family, so a cross-family judge is unavailable. The coordinator compares both candidates.

## Intended behavior

Primary content opens across the workspace. Tile returns it to a dominant left pane, normally 60% and never below half on a wide desktop. Opening a secondary app reveals a useful tiled composition. Fullscreen here means the available desktop stage, keeping navigation visible. Minimize still hides a window. Static wallpapers remain unchanged.

## Throughput checkpoint

- Blocking first steps. Ground current route, view, and geometry ownership, then compare two designs.
- Independent workstreams. Design candidates write separate files. Implementation has one owner; the coordinator owns verification and documentation.
- Shared mutable state. Reducer and shell edits stay with one owner because their transitions must agree. No concurrent edits to those files.
- Smallest safe decomposition. One implementation worker handles the coupled model and controls. Existing content apps and games stay mounted and retain their state.

## References

Hyprland master layout uses a dominant left pane with other windows tiled on the right. Its fullscreen dispatchers distinguish maximizing within a workspace from consuming the entire display.

- https://wiki.hypr.land/configuring/layouts/master-layout/
- https://wiki.hypr.land/configuring/core/dispatchers/

## Grounding

The reducer owns one global mounted window per app, per-view layout trees, focus, solo/maximized presentation, and remembered routes. The shell renders windows by stable app ID and hides inactive ones. Content apps independently retain tabs and reading positions. Keep those lifetimes.

Two existing policies cause the reported friction. appHome infers fixed ownership from preset membership, so launching Terminal or Arcade changes views. The arrange action only clears expanded presentation; a lone Writing leaf remains full width. Browser reproduction confirmed Restore Writing left a single 1200-pixel-wide window.

The behavior belongs in the model, with explicit primary/secondary classification, deterministic launch and tile transitions, and protected primary-left geometry. The shell should request these actions rather than assemble multiple transitions itself. Storage validation and placement controls must enforce the same policy.

## Verification contract

1. Fresh Desktop places About on the left and Terminal on the right.
2. Projects/Writing launch fills the stage and shows a visible Tile action.
3. Tile creates a 60% left primary and Terminal companion if needed; repeat does not duplicate or reset apps.
4. Opening Arcade or another secondary keeps the same primary and current view, clears stage presentation, and tiles on the right.
5. Opening a primary again focuses it fullscreen. Returning to tiles retains its article, scroll, and secondary sessions.
6. Root resizing cannot make the primary narrower than half the stage. Secondary arrangement cannot move it to the right.
7. Closing/minimizing a companion does not reopen it automatically. Closing the main leaves remaining tools usable.
8. Direct URLs and browser Back/Forward remain authoritative without replaying entry policy for acknowledged in-app navigation.
9. Stored v2 sessions migrate without duplicate instances or routes moving Terminal/Arcade back to obsolete homes.
10. Phone screens remain single-app, retain accessible navigation, and have no horizontal page overflow.

## Design selection

Candidate A is selected. Both candidates preserve one mounted instance per app and centralize primary/secondary policy. A retains the existing layout tree and storage format, with one private normalization boundary enforcing the protected primary root. B replaces view layout state with dedicated main and companion regions. That gives stronger structural constraints but adds a storage and geometry migration that this bounded change does not need.

| Criterion                              | A                             | B                                      |
| -------------------------------------- | ----------------------------- | -------------------------------------- |
| Primary focus then left-side tiles     | Pass                          | Pass                                   |
| Secondary launch stays in current view | Pass                          | Pass                                   |
| App session continuity                 | Existing pool retained        | Existing pool retained                 |
| Protected placement and minimum share  | Reducer boundary and geometry | Dedicated region types and geometry    |
| Integration scope                      | Retains v2 and tree helpers   | Replaces view state and migrates to v3 |

Keep B's distinction between explicit Play navigation and opening Arcade as a companion. The designs agree on this behavior and on supplying Terminal only for an explicit Tile with no companion. Reject B's persistent empty right region after closing the final companion. Let a remaining window use the space, while Tile always reconstructs a useful composition. No cross-family judge is available; the coordinator compared both complete designs.

Implementation has one owner for the coupled model, shell, CSS, and behavioral tests. The coordinator owns documentation and production/browser verification. No code-writing fan-out shares these files.

## Results

The implementation changes model.ts, model.test.mjs, Desktop.tsx, and desktop.css. Apps remain keyed by their existing IDs. The app registry owns primary roles and home views, while a private normalization boundary anchors the primary-left layout after reducer transitions and storage reads. The current v2 format is retained.

Primary titlebars expose Focus and Tile. Secondary launches tile in the current view. Tile supplies Terminal only when needed. Primary arrangement menus omit unsupported floating, grouping, and placement operations. Resize controls expose the protected root's 50% minimum. Navigation acknowledgment compares equivalent trailing-slash paths without dropping query state.

Browser verification also found that ordinary window focus triggered Gatsby navigation, moving keyboard focus from the Terminal input to the page wrapper. Window focus now changes only window state. Explicit launches, content navigation, and structural actions retain route ownership. The final production browser leaves os-terminal-command focused after the first click.

- All 32 unit tests pass, including 21 model and 11 game tests.
- TypeScript passes. Full lint found only the existing repository-Markdown rendering warning after the final Desktop catch-comment correction was checked with targeted ESLint.
- Production build and build audit pass. The audit verifies 32 server-rendered documents, eight app routes, and three static wallpapers.
- Production browser checks confirm full-stage Writing, Tile to a dominant left pane, vertically stacked Terminal and Arcade companions, first-click Terminal focus, retained terminal history and game selection, article Back/Forward and direct reload, and no captured console errors.
- A root-divider Home key check measured a 600-pixel primary in a 1200-pixel stage. Primary resizing cannot reduce it below half.
- Responsive checks at 390 x 844 and 320 x 568 confirm no page-level horizontal overflow, visible primary controls and Close, and companion switching through the mobile app selector.
- Independent read-only review found no additional correctness issue. Its suggested removal of three catch comments triggered the configured no-empty lint rule. Those catches retain a short explanation of browser storage denial; zero comments were removed overall. Two existing style-only nested-ternary suppressions remain. No constraints or correctness suppressions are unresolved.

Experience First changed window focus so typing works on the first click. Model the Domain put primary/secondary launch policy in the registry and reducer boundary. Prove It Works required real production interaction checks as well as reducer tests.

The saved focus and tiled screenshots were removed during repository image cleanup; the verification results remain as the historical record. The local production preview is http://127.0.0.1:8000/. No commit, PR, or deployment was performed. Browser checks used local Chromium, not physical phones, Safari, or Firefox. The existing Gatsby WMIC and deprecation notices remain nonblocking.
