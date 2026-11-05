# Eclipse implementation

This records the initial MVP. The current view behavior, visual refinement, and static wallpaper decision are recorded in [Eclipse refinement](os-refinement.md).

## Objective

Replace the portfolio layout with a black and crimson desktop. Preserve Markdown content, public URLs, and readable server-rendered documents. Deliver startup, window management, workspaces, eight apps, three wallpapers, and Snake and Breakout.

## Workflow

- [x] Read the Principles section of poteto-mode.
- [x] Frame the work and inspect the existing Gatsby content pipeline.
- [x] Design the workflow around independent desktop, content, and game modules.
- [x] Implement and verify each module.
- [x] Integrate assets and verify the complete production build.
- [x] Exercise desktop and phone journeys in the browser.
- [x] Record results and remaining limits.

## Throughput checkpoint

The existing route/content coupling is the main integration risk. The desktop worker owns the shell, reducer, route adapters, and global styling. The content worker owns app views and content payloads. The game worker owns game simulation and controls. Each writes separate files. The coordinator owns assets, dependencies, documentation, and final verification.

The approved design already fixes the product architecture. Compare persistent route adapters against mounting old pages before implementing the integration. Retain shared content views with stable app identities. Avoid embedding the old site in iframes.

## Acceptance

The user relaxed the original asset and JavaScript size budgets during implementation. Visual richness takes precedence over byte limits. Responsive controls and motion accessibility remain requirements.

Type checking, lint, production build, reducer/game behavior tests, direct content links, browser history, desktop window actions, mobile app navigation, and reduced-motion behavior must pass. Record browser evidence and any checks that cannot run. A compile result alone does not establish visual or behavioral completion.

## Review availability

Configured Codex models are available. All available models belong to the GPT family. A cross-family judge is unavailable. Coordinator review and browser verification remain required.

## Delivered specification

[Eclipse desktop](design/eclipse-spec.md) is authoritative. The old UI spec and Unixporn sheets are archived inspiration. The implementation retains nine app identities, including the System information view, and all original Markdown documents.

Model the Domain shaped the split/tab tree and desktop reducer. Prove It Works required inspection of the production browser after the build passed. The browser pass found and fixed query-dependent Breakout hydration, clipped Terminal startup content, and narrow-screen game controls.

## Verification results

Verified locally on 2026-10-31 UTC with Node 24.19.0 and the Chromium-based in-app browser.

| Check | Result |
| --- | --- |
| Unit tests | 23 passed, covering desktop transitions and Snake/Breakout rules. |
| TypeScript | Passed with no errors. |
| ESLint | Passed with no errors. One intentional `react/no-danger` warning for repository-authored Markdown HTML. |
| Production build | Passed, 43 generated pages. Existing Gatsby/Node deprecation and missing-WMIC diagnostics remain non-blocking. |
| Generated route audit | Passed for 32 server-rendered documents, eight app routes, and three wallpaper poster/video pairs. |
| Desktop interaction | Launcher search, Terminal help, floating drag and resize, keyboard split resizing, tab grouping, workspace movement, minimize/restore, maximize, and reset exercised. |
| Content | Slushy.gg route opens the project reader. Filter and tabs survive reload. Reading offset survived app switching and reload. Browser Back returned to the document. Unknown URLs showed recovery content. |
| Games | Breakout starts, scores, and preserves its selected game and score through minimize/reopen. Hidden games pause. Direct Breakout URL now hydrates without new console errors. |
| Wallpaper and boot | Cinder selection, still mode, Eclipse animation, and startup replay exercised. Video playback observed with advancing time and `paused=false`. |
| Responsive layout | Desktop at 1440×900, phone at 390×844, and narrow phone at 320×568 inspected. No horizontal document overflow at either phone size. Touch controls remain reachable by scrolling at the smallest height. |

Screenshots are saved in [desktop evidence](verification/eclipse-desktop.jpg) and [phone evidence](verification/eclipse-mobile.jpg). The local production preview runs at http://127.0.0.1:9000/.

## Verification limits

Phone checks used viewport resizing, not physical devices. Firefox, Safari/WebKit, assistive-technology testing, live operating-system reduced-motion changes, and audible game/narration playback were not exercised. Reduced-motion handling was reviewed in code; the app's ambient-motion toggle was exercised. The wallpapers use original still art with seamless camera movement and CSS atmosphere, not independently animated scene objects. No deployment was performed.
