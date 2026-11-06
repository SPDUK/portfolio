---
version: 1
slug: "src-components-desktop-arcade-tsx"
primary_target: "src/components/Desktop/Arcade.tsx"
related_targets: ["src/components/Desktop/play-toys.css","src/components/Desktop/LightsOut.tsx","src/components/Desktop/PixelStudio.tsx","src/components/Desktop/BeatLab.tsx","src/components/Desktop/GravitySling.tsx","src/components/Desktop/PrismRelay.tsx"]
---

# Arcade and play toys

Mode: Experience. Eight existing activities inside the Eclipse desktop. The user selected CRT launcher mockup B on 2026-11-05 and requested its implementation with image-generated assets. Its approved reference is `.impeccable/mocks/decision/arcade-crt.png`; the adjacent JSON records the prompt and approval.

## Direction contract

THESIS: Opening Arcade is like switching on a small multi-game console. Select one of eight activities in a vertical menu, see its artwork, then explicitly launch it. This supersedes the previous direct-to-toy entry and eight-tab navigation.

OWN-WORLD: Preserve the surrounding Eclipse desktop. Inside the launcher, use warm ivory `#f3ead4`, crimson `#b80b22`, black `#080809`, self-hosted Press Start 2P lettering, and an image-generated graphite CRT bezel with native transparent opening. Static scanlines belong only to this launcher, never the playable games or desktop.

STORY: Browse without mounting a game, creating audio, or changing the URL. Start opens the selected activity. Its Back control or Escape restores the menu with the same selection; Escape from the launcher minimizes Arcade. Explicit game links and terminal play commands still open games directly.

FIRST VIEWPORT: A shallow SPDEV ARCADE heading and crimson double rules above a left-hand vertical game list and a larger right-hand preview. Selected title, short description, and Start game sit below the artwork. A key guide and selection index close the screen. A size container and reserved grid rows keep heading, Start, and footer inside the CRT at all supported sizes; the preview flexes with available height. Tall phones stack the list and preview; short panels use a compact split. Only the game list scrolls, and its selected radio stays visible during resizing. Very short panels omit duplicate descriptive text while keeping artwork and controls.

FORM: User-pinned concept B, no new concept round; seed: none (unavailable). Semantic radio buttons use roving focus, Up/Down wrap, Home/End, and Enter to launch. Mouse wheel selection has a threshold and cooldown; touch uses the same native controls. The signature interaction is the simultaneous movement of the crimson selector and update of authored pixel preview artwork. No continuous motion or sound while browsing.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Verification

Verify all 16 viewport/pixel-density configurations in the launcher regression, including reported 2554×1324, DPR 1.25, wide/short desktops, laptops, tablets, small phones and phone landscape. Four game selections per configuration cover long titles/copy. Assert no screen overflow, visible heading/Start/footer with 8px clearance, 44px controls, and a visible selection after resize. Preserve keyboard/pointer selection, silent browsing, decoded previews, Start/back, deep links, and minimize/reopen. Existing nine rasters keep their provenance; gameplay is unchanged.

The new pass verifies all authored gravity and optical solutions through the shipped pure engines, bounded collision/exit/loop outcomes, explicit launch and pause, keyboard/touch alternatives, instantaneous reduced-motion flight, mirror hints/reset, and compatibility with the every-visit startup. Capture both toys at 1440×1000, 390×844, and 320×740, including result and mobile-control states.

## Finish review — responsive fit

Disposition: ship from the independent responsive-fit review. The user-supplied clipping example is resolved. The reviewer inspected all 12 production captures with `css: null` and a live Prism Relay session resized across desktop, small portrait, landscape, and back. Start and footer remained visible, selection stayed in view without reselecting, and keyboard focus stayed visible. The full launcher suite passed all 25 checks: nine top-level cases and 16 responsive subcases (64 selected-game combinations). The game list alone scrolls where space is limited. TypeScript, production build, route/content audit, and formatting pass; lint retains the pre-existing Apps.tsx document-rendering warning.

## Finish review — CRT launcher B

The independent reviewer returned ship at the scope of both material fixes: F1 (complete desktop footer/keycaps within the screen) and F2 (decoded artwork matching each selected game). Fresh hero and desktop captures show closed keycap outlines and the full guide/index, with 8px clearance. Both phone footer captures remain fully reachable and changed-art captures show the correct Beat Lab and Prism Relay artwork.

The affected verification passed 56 engine/catalog checks and 20 browser cases across focused runs. The new desktop geometry regression passed at 1440×1000 and 1666×1082 with no screen or list scrolling; all eight options, Start, and four keycaps fit. The launcher suite verifies all eight decoded preview files and 320px/390px touch paths. TypeScript, production build, route/content audit, and formatting pass; lint retains the existing document-rendering warning. Nine native-generated raster assets have embedded provenance, and the scoped CRT exception is recorded in DESIGN.md. The surrounding Eclipse system was preserved.

## Finish review — eight-activity revision

The independent review found the two new playable surfaces faithful to Eclipse and the contract. Its one material fix was the shared 320px shell's obsolete top offset. After correction, the reviewer scored that fix resolved across nine recaptures and returned ship for the scored fix, with no visible regressions. Both games' desktop controls fit without scrolling; phone controls remain reachable, and all inspected widths have no horizontal overflow.

All 103 integrated logic/browser checks passed with no skips; five affected narrow-layout checks passed again after the shell correction. TypeScript, clean production build, and route/content audit pass. Lint retains only the existing document-rendering warning. No new raster assets or token-system replacement shipped; the detector's findings were advisory color, font-size, and radius differences across changed and incumbent styles.

## Finish review — previous six-activity revision

Disposition: ship for this Arcade extension. The independent finish review inspected all 15 captures at 1440×1000, 390×844, and 320×740, including phone scroll positions. It found no material fixes. Every activity fits without horizontal overflow; phone controls remain reachable through normal scrolling.

The implemented typography, charcoal surfaces, crimson actions, and desktop chrome were compared with DESIGN.md. Instrument colors and the drawing palette are functional content. The detector reported only advisory differences. The established design-system files remain unchanged, and no shipping raster assets were added.

The final integrated run passed all 70 logic and browser checks with no skips. It covered actual Web Audio output and shutdown, transparent PNG pixels, keyboard and emulated touch input, stored drafts, and the existing Asteroids regression. Type-check, production build, and route/content audit passed; lint has no errors and retains the existing document-rendering warning in Apps.tsx.
