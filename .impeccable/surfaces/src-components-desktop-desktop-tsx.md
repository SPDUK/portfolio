---
version: 1
slug: "src-components-desktop-desktop-tsx"
primary_target: "src/components/Desktop/Desktop.tsx"
related_targets: ["src/components/Desktop/BootLogo.tsx","src/components/Desktop/BootSequence.tsx","src/components/Desktop/boot-sequence.css","src/components/Desktop/desktop.css","src/components/Desktop/useWindowMotion.ts","src/html.tsx"]
---

# Desktop arrival

Scope: restore scanlines to the startup sequence only. Visitor mode: Experience. The user explicitly undoes the persistent screen overlay: scanlines should appear during boot and disappear before the usable desktop. The desktop, app launcher, and apps must have no scanlines. Preserve the approved red CRT opening, typed pending-to-complete sequence, original crimson raster, finite power-on, three-second timing, fixed positions, and previous no-skip repair. Existing content and saved workspaces remain intact.

## Direction contract

THESIS: A phosphor terminal powers on around the fixed interlocking SP mark, types the real portfolio startup, and fades into the actual workspace within three seconds.

OWN-WORLD: Original crimson SP raster and dark overlap seams, IBM Plex Mono identity and output, Eclipse charcoal `#080809`, crimson output `#ff9da6`, bright `#ffc1c7`, secondary `#e6a0a7`, and the existing `#ff5261` / `#b91f2e` crimson illumination. Static scanlines, central light pool, deeper edge vignette, and red phosphor glow preserve the approved terminal feeling. The broader Eclipse palette, typography, and original-color static wallpaper remain in place.

STORY: The visitor watches the original logo illuminate in place, then commands type into an aligned 90s console transcript naming the real workspace and destination. Each step types, holds pending, completes, and yields to the next. The final completed transcript has a readable hold before automatic arrival. No Skip control, Escape shortcut, or bottom-left tagline appears. Restored sessions and deep links land exactly where expected; no invented hardware or security diagnostics appear.

FIRST VIEWPORT: A centered logo is the focal point. Masked pieces of the existing raster illuminate at their final coordinates, then become the untouched canonical mark. Identity, complete text, wrapped words, and terminal slots are reserved from the first frame. Characters reveal sequentially with one active block cursor; pending and complete marks share a fixed column. Logo, identity, glyphs, terminal rows, panel, rail, and stage never translate or scale during startup. The complete sequence takes about three seconds, including its desktop fade, for both short and long destinations and under both motion preferences. The text adapts its character interval to fixed slots. Static scanlines and a soft vignette give the boot a clear CRT surface while output stays legible. Scanlines, vignette, and illumination fade with the boot cover. The desktop, app launcher, and apps remain clear of CRT overlays. One CSS clock and animation completion own the sequence so cold loading cannot race it. A 20-second emergency release remains for a stalled or background-paused sequence; no preference shortcut or missing-marker assumption may skip a healthy boot.

FORM: Code-led refinement of the existing Astra logo plan, directed by the user's explicit no-shift correction. This local extension preserves Eclipse; the new-work instruction says never to run the concept roll for a local extension, so no roll or new quality-bar card applies. DESIGN.md and the incumbent surface carry the visual authority.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Motion budget: one dim power-on surface glow during the first 320ms, staggered opacity for four small masked logo layers, finite character reveals and pending-to-complete transitions, one active typing cursor, and an opacity-only desktop transition. No content position/scale animation, animated wallpaper, sound, particle effects, strobe, or continuous loop. The canonical raster and desktop geometry remain unchanged.

Proof: verify scanlines appear during boot, fade with its cover, and are absent from the completed desktop, app launcher, and Terminal at desktop and narrow mobile sizes. Preserve three-second timing, fixed geometry, real typing/status progress, red palette, and native app/input controls. This restores the previously approved crimson boot-only design; the persistent overlay is explicitly withdrawn by the user.

## Restoration — boot-only scanlines

Restored the previously reviewed crimson boot-only design at the user's explicit request. The global overlay is removed and scanlines again fade with the boot cover. The clean production build and updated geometry/CRT browser case pass at desktop and narrow mobile widths, including absence of scanlines on the desktop, app launcher and working Terminal. Fresh screenshots and computed styles confirm the restoration. Evidence is in `proof/boot-only-scanlines/`; the prior crimson review remains in `proof/boot-crimson/`.

## Finish review — withdrawn persistent screen scanlines

Disposition: ship. A fresh Astra reviewer inspected eight final desktop/mobile boot, content, launcher, and Terminal captures, source, and runtime evidence. No material fixes remain. The single fixed screen layer keeps the approved scanline texture at full opacity through startup, arrival, and app use. There is no duplicate boot texture, ongoing animation, or pointer interception. The boot vignette and illumination still fade; print excludes the screen texture.

The clean production build, TypeScript, scoped lint, content/route audit, formatting, and whitespace checks pass. Two affected browser cases pass, including frame-sampled persistent opacity, fixed geometry, and native launcher navigation and Terminal input at both widths. Final interaction proof uses the supported help command. The detector ran once and returned no primary findings; its 100 advisories cover documented console values and incumbent desktop styles. Detailed proof, captures, validation and review are in `proof/persistent-scanlines/`.

## Finish review — previous crimson palette correction

Disposition: ship. The independent review confirmed the restored crimson raster, readable red console tints, consistent charcoal field and illumination, and unchanged terminal composition. Four final ready/arrived captures were valid; two affected browser cases, build, TypeScript, scoped lint, content/route audit, and whitespace checks passed. Proof and the recorded review are in `proof/boot-crimson/`.

## Finish review — previous green phosphor terminal

Disposition: ship. Astra max planned the terminal-entry treatment and Sol implemented it. A fresh Astra reviewer inspected all eleven final desktop/mobile captures and actual-video storyboards, source, and runtime evidence. No material fixes remain. The original SP silhouette and dark seams survive the intro-only green tint. Finite power-on illumination, static scanlines, phosphor text, and edge shading deliver the requested terminal feel without moving content. The complete boot, including the clean desktop fade, measured 3082.5ms on desktop and 3046.5ms on the narrow long-article route.

All twelve affected startup browser cases pass on the final green production build with no failures or skips. TypeScript, scoped lint, clean build, content/route audit, and whitespace checks pass. The one detector pass produced no primary findings and nine advisories for documented local console values. The normal desktop palette, shared crimson raster, previous no-skip fixes, and emergency recovery remain intact. Proof, actual recording, validation, and the full review are in `proof/boot-crt/`.

## Finish review — previous full boot with motion preferences disabled

Disposition: ship. A fresh Astra reviewer inspected all twelve final captures, including actual-video storyboards, source, and regression evidence. No material fixes remain. The full sequence now runs with saved desktop motion off, system reduced motion, and a preference change during boot. The 480ms completion shortcut and preference-triggered completion are removed. Explicit finite-clock ownership survives production PostCSS and prevents global reduced-motion rules from suppressing boot progress. Missing initialization metadata no longer implies completion. The 20-second emergency release remains disclosed.

The final production suite passes all 107 cases together, with zero failures and skips, including twelve startup cases. TypeScript, lint without errors, clean build, route/content audit, and whitespace checks pass. The coordinator verified the actual user's existing Chrome tab without changing its motion setting. Desktop and mobile captures show full partial typing, status changes, and fixed coordinates. The one detector pass across the boot and affected global stylesheets returned no primary findings; its advisories cover documented console values and incumbent stylesheet values. The original raster and Eclipse design system remain intact. Detailed before/after evidence, captures, recording, and review are in `proof/boot-no-skip/`.

## Finish review — previous typed boot with preference shortcut

Disposition: ship. A fresh Astra reviewer inspected all 18 required captures, actual-video storyboards, motion source, and runtime evidence. No material fixes remain. Commands visibly type in sequence, pending statuses resolve in place before subsequent steps begin, wrapped text stays anchored, and the completed transcript holds before the stationary handoff. The reviewer did not play the MP4; its motion judgment used actual-video frames, source, and checks.

The final clean production run passes all 105 cases together, with no failures or skips. Ten startup cases cover real partial typing, pending and completion order, a single cursor, glyph/marker/row geometry, final hold, automatic replay and focus, both motion preferences, no-JS, and the 20-second fallback with delayed hydration. TypeScript, lint without errors, build, route/content audit, and whitespace checks pass. One detector run reported six advisory occurrences for documented local console values. Proof is in `proof/boot-typing/`; the original raster and broader Eclipse token system remain unchanged.

## Finish review — previous stationary instant-line boot

Disposition: ship. A fresh Astra reviewer inspected all 14 required captures, both storyboards from the actual recording, source, and validation. No material fixes remain. Logo, identity, and transcript stay anchored; the compact console and original raster retain their character; long destinations fit at 320px and in landscape; and the workspace handoff uses opacity only. The reviewer did not play the MP4, judging motion through the real-video storyboards, source, and passing browser checks.

All ten startup cases pass on the final clean production build, including rendered geometry invariance at 1440px and 320px. Together with the 95 unaffected cases from the integrated run, all 105 distinct cases pass with no skips. TypeScript, lint without errors, build, and route/content audit pass. The one detector pass returned six advisory occurrences covering intentional local console colors and size, now documented in DESIGN.md. The original raster and broader Eclipse token system are preserved. Detailed proof and review are in `proof/boot-console/`.

## Finish review — previous moving-logo boot

Disposition: ship. A fresh Astra reviewer inspected all 15 required captures, the original logo, the arrival storyboard, the motion source, and the behavioral evidence. It found no material fixes: the raster reunion preserves the mark, the boot order and final hold remain readable, all inspected widths fit, and the desktop handoff stays continuous. It did not play the MP4; its motion judgment used actual video frames, assembly captures, source, and browser checks.

All 104 integrated logic/browser checks pass with no skips, including nine startup cases. TypeScript, lint without errors, the clean production build, and route/content audit pass. The detector ran once and returned five advisories with no primary findings. DESIGN.md, README.md, and the monogram documentation describe the new user-requested behavior. No raster or Eclipse token system was replaced.

## Finish review — previous skippable revision

The independent reviewer inspected all 19 required desktop/phone captures and sampled the animation source and behavioral evidence. The initial disposition was fix for one obsolete 320px stage offset. The offset now starts the workspace at 58px beneath the panel. The reviewer scored that fix resolved across nine recaptures, with no visible regressions; final disposition: ship for the scored fix.

The integrated run passed 103 logic/browser checks with no skips, including an actual cold-load transcript-visibility regression. After the narrow CSS correction, all five affected phone checks passed again. TypeScript, lint without errors, the clean production build, and route/content audit passed. DESIGN.md records the user-requested startup semantics and animation lifecycle; Eclipse tokens, typography, and existing raster assets remain in place. The one detector pass reported only advisory token differences, including incumbent shell styles.
