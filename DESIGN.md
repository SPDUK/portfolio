---
name: SPDEV OS Eclipse
description: A charcoal personal desktop with restrained crimson interaction and original-color artwork.
colors:
  background: '#080809'
  chrome: '#0e1015'
  surface: '#14161c'
  raised: '#20232b'
  divider: '#ffffff18'
  text: '#f3f3f5'
  muted: '#a3a5b0'
  primary: '#b91f2e'
  focus: '#ff5261'
  control: '#202025'
  control-border: '#36363e'
  app-text: '#f5f5f7'
  primary-hover: '#ca2938'
typography:
  headline:
    fontFamily: 'IBM Plex Sans, sans-serif'
    fontSize: 'clamp(28px, 7cqw, 42px)'
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: '-0.03em'
  title:
    fontFamily: 'IBM Plex Sans, sans-serif'
    fontSize: '17px'
    fontWeight: 500
    letterSpacing: '-0.25px'
  body:
    fontFamily: 'IBM Plex Sans, sans-serif'
    fontSize: '14px'
    lineHeight: 1.6
  label:
    fontFamily: 'IBM Plex Mono, Consolas, monospace'
    fontSize: '12px'
  terminal:
    fontFamily: 'IBM Plex Mono, monospace'
    fontSize: '12px'
    lineHeight: 1.65
rounded:
  control: '4px'
  field: '5px'
  card: '6px'
  shell: '10px'
  window: '11px'
spacing:
  edge: '8px'
  gap: '12px'
  card: '18px'
  section: '24px'
  page: '32px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.app-text}'
    rounded: '{rounded.control}'
    padding: '10px 14px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '{colors.control}'
    rounded: '{rounded.control}'
    padding: '10px 14px'
  search:
    backgroundColor: '#101013'
    textColor: '{colors.app-text}'
    rounded: '{rounded.field}'
    padding: '11px 13px'
  card:
    backgroundColor: '#1b1b20'
    rounded: '{rounded.card}'
    padding: '{spacing.card}'
---

# Design System: SPDEV OS Eclipse

## Overview

**Creative North Star: "Eclipse"**

Eclipse is a personal desktop informed by Unix desktop customization and dark fantasy. Charcoal windows sit over static artwork, with compact shell controls and readable app content.

IBM Plex Sans carries reading content. IBM Plex Mono identifies shell chrome and terminal output. Crimson marks interaction and selection while photographs, diagrams, and project screenshots retain their original colors.

**Key Characteristics:**

- Dark chrome and fine borders separate windows from artwork.
- Compact controls leave room for content.
- Motion respects both the interface setting and reduced-motion preferences.

## Colors

### Primary

Crimson (`primary`) fills primary actions. The brighter red (`focus`) marks keyboard focus and small interaction accents. Hover variants belong to controls, rather than a separate brand palette.

**The Restrained Crimson Rule.** Bright red occupies a small part of the interface and identifies interaction or selection.

### Neutral

`background`, `chrome`, `surface`, and `raised` describe the dark shell layers. `divider` supplies subtle separation. `text` and `muted` carry shell content. App controls use the closely related `control`, `control-border`, and `app-text` values.

**The Original Color Rule.** Artwork, photographs, diagrams, and project screenshots retain their original colors.

## Typography

The frontmatter records the shared app hierarchy. Content headings scale with their window width through container units. Library headings use a lighter variation (`400`, `clamp(28px, 4cqw, 40px)`, line height `1.12`). Card titles use `21px`, weight `500`, and line height `1.25`.

Body text uses IBM Plex Sans with a sans-serif fallback. Shell labels use IBM Plex Mono with Consolas and monospace fallbacks. Terminal text uses the mono family at `12px` with line height `1.65`. These are observed roles, not a fixed-ratio type scale.

## Layout

The desktop fills the viewport. On large screens, a top panel (`42px` high) and left app rail surround a window stage. The stage begins `72px` from the left and `58px` from the top, with an `8px` right inset and `32px` bottom inset. Windows support tiles, tabs, and floating placement.

Fresh visits open About alone, with the current role and primary actions before selected work. Kishu and the interactive portfolio lead; experiments follow. Terminal is available on demand, and saved workspaces still restore. Every full document visit opens with a logo assembly and terminal-style boot, then reveals the actual workspace or linked document. In-app navigation moves between overlapping pages, with connected titles and imagery when opening work. Settings can replay the startup sequence.

The empty desktop is a quiet pause over the wallpaper: “Curiosity, left running.” Larger, closely set type carries the personality, with a direct project action. When windows are hidden, Restore windows brings back the workspace and moves keyboard focus into its active content. The view adds no animation or decorative panel over the artwork.

At viewport widths up to `1099px`, a single bottom navigation presents About, Projects, Contact, and Apps. It replaces the workspace strip and running-app management bar. The stage starts at `58px`; a compact `36px` title bar identifies the current app without window-management controls. Apps retain their own scroll areas. App content uses container queries because window width can change independently of viewport width. Shared app layouts tighten at `480px`; library grids and selected-work rows gain a second column at `700px`.

Spacing follows the existing compact controls and wider reading areas. Cards use `18px` internal padding. Library pages cap their width at `1240px` and use `clamp(22px, 5cqw, 64px)` horizontal padding, reduced to `20px` in narrow windows. Coarse-pointer controls expand to at least `44px` high.

## Elevation & Depth

Tonal layers, fine borders, and soft black shadows establish depth. Windows use a diffuse shadow plus a faint inset highlight. A focused window gains a crimson border and stronger shadow. The top panel uses backdrop blur (`24px`); the launcher and menus use deeper shadows. Exact shadow and motion values live in `.impeccable/design.json`.

Window border and shadow transitions take `140ms`. Workspace states take `160ms`, menus `180ms`, and launcher entry `320ms`. Window placement transitions use transforms and continue from their current visible position when interrupted. Wallpapers remain static.

Page navigation uses native same-document View Transitions and CSS keyframes. Global views move as opaque overlapping sheets: the incoming page slides across a subtly receding predecessor, and Back uncovers the previous page. The panel, app rail, wallpaper, and window chrome stay anchored and remain interactive. Within Projects and Writing, the reading viewport owns the movement. A card opens an empty reading surface while one crisp title moves into its heading position. Metadata, project context, previews, and article blocks then settle gently downward in reading order. Previews stay inside their article section instead of becoming separate shared images. Back clears those sections from bottom to top, returns the title, then reveals the collection. Browser Back between articles clears the previous content before introducing the new title and sections. Returning restores the collection's search and scroll position; offscreen elements do not become detached shared layers.

Desktop page motion takes `480ms` with `cubic-bezier(0.3, 0, 0.2, 1)`; compact layouts take `420ms`. The easing accelerates gently and settles without a sharp launch. In article sequences, the title uses 85% of that time and surrounding sections wait until the surface finishes opening. Each visible section enters over `280ms`, with `50ms` between starts and at most five stagger intervals. Reverse exits take `160ms` with capped `40ms` intervals; the title waits for those exits, and the collection follows its return with a `140ms` reveal. Only the initial visible reading content participates; scrolling does not trigger repeated reveals. Saved reading positions below the heading bypass title-first entry. Heading anchors and the contents control finish their layout work before capture so they share the sequence. Document data warms on pointer entry and keyboard focus, and a short preparation budget preserves responsive navigation on slow connections. Content state changes inside the snapshot update; Gatsby's animation-frame route commit runs alongside the animation. Rapid choices replace pending preparation and interrupt the current motion, while late route responses cannot override the latest destination. The system motion preference and the desktop animation setting bypass spatial navigation effects, and unsupported browsers navigate normally. Game Start and Back retain their local activity behavior.

Navigation chooses motion from the visible windows before and after the action. Full-sheet movement belongs to changing desktops or replacing the sole visible app. Focusing, reopening, revealing, or arranging windows within the same desktop uses ordinary window motion. Reselecting the current desktop, document, or collection introduces no page transition. When a visible Projects or Writing window changes documents, its own reading pane owns the snapshot, including when another app was focused. Return-title matching follows that pane's document rather than the focused app's URL.

Photography uses the same motion family for its thumbnail-to-fullscreen expansion and shrink-back. The decoded thumbnail appears immediately at the full photograph's aspect ratio while the larger file loads, preserving the existing single-image request and progressive gallery admission. The image moves independently above a quiet viewer backdrop; the desktop stays still. Close and Escape return to the current photograph's visible tile and restore keyboard focus. Offscreen destinations and disabled motion use a direct close; fullscreen Next/Previous retain their existing decoded-image dissolve.

Startup opens as a crimson phosphor terminal: the user-approved Fallout-style terminal feeling uses the portfolio's own Eclipse color scheme. A dim horizontal power-on glow expands into the screen's illumination and settles within the first `320ms`, while four masked pieces of the actual SP raster illuminate in place. The spine, heel, bowl, and sweep become visible in sequence, then switch to the untouched canonical raster at `480ms`. The mark retains its original crimson color, dark seams, transparency, and exact silhouette; no color-matrix filter is applied. Logo, SPDEV OS identity, and reserved terminal rows keep the same coordinates throughout the opening. IBM Plex Mono, fixed status columns, and real portfolio commands carry the terminal character. Static horizontal scanlines, a central crimson light pool, deeper CRT edge shading, and restrained red phosphor glow continue after power-on. There is no flicker, white flash, jitter, content transform, or continuous loop.

The complete animation takes `3000ms`, including the desktop reveal, for both short and long destinations. The command types from `600–900ms`; startup resolves at `1240ms`, workspace at `1640ms`, destination at `2160ms`, and Ready at `2490ms`. Each step types its actual text within a fixed time slot, visibly holds `[ .. ]`, then changes the same status slot to `[ ok ]` before the next step begins. Character intervals adapt to text length without truncating titles or extending the sequence. A `210ms` completed-transcript hold leads to a `300ms` opacity-only reveal from `2700–3000ms`; all boot CRT layers, including scanlines, fade away with the cover. One finite block cursor follows the active character. Every character and complete word occupies its final position from the start, including wrapped titles; only opacity changes. Animation completion owns phase changes, with all character, status, and handoff timing sharing the same CSS clock. Startup never translates or scales the identity, console, panel, rail, or stage. No Skip control, Escape shortcut, footer tagline, or invented hardware diagnostics appears.

This startup-only console uses Eclipse charcoal `#080809`, light crimson output `#ff9da6`, bright marks/cursor `#ffc1c7`, and muted crimson text `#e6a0a7`. These lighter red tints preserve small-text contrast through the scanlines. The power-on illumination and phosphor halo use the existing focus crimson `#ff5261` and primary `#b91f2e`. The critical prepaint background and cover fade use the same charcoal so arrival has no color flash. Three-pixel-pitch scanlines, crimson illumination, and the vignette belong only to the startup sequence. They disappear with its cover; the usable desktop, system app launcher, and ordinary apps have no scanline overlay. Arcade's user-approved Game select screen has its own static CRT treatment, described below. Boot texture never intercepts input or changes underlying assets. Output is `13px/22px` on desktop and `12px/20px` on narrow or short screens; the OS suffix stays `13px`. These local values give the console its hierarchy without replacing Eclipse's app palette or type ramp. Every row exists from the first frame; destination text wraps naturally and Ready follows the same compact row gap.

The finite, stationary boot sequence runs in full even when desktop animations are disabled or the operating system requests reduced motion. These preferences still control ambient desktop and game motion; they do not fast-forward terminal progress, suppress its clock, or complete startup when changed mid-run. Without JavaScript, content is available immediately; an absolute `20000ms` prepaint watchdog releases the covering if application startup stalls. Only an explicitly completed document prevents re-entry; missing initialization metadata is not interpreted as completion. The startup status receives focus while desktop controls are inert, then focus moves into the active content or returns to the invoking control after a replay.

## Shapes

Windows have gently rounded corners (`11px`), shell panels use `10px`, and content cards use `6px`. Controls use tighter corners (`4px`), with `5px` on search fields. One-pixel borders separate neighboring dark tones. Media can use tighter clipping without changing the shell geometry.

## Components

### Buttons

Primary actions use crimson with light text. Secondary actions use charcoal and a fine border. Both use compact padding (`10px 14px`), a minimum height of `40px`, and a control radius. Primary hover brightens the red. Keyboard focus uses a red outline (`2px`) with an offset (`3px`). Disabled controls reduce opacity to `0.5`.

### Inputs

Search fields use a near-black fill, a fine charcoal border, and rounded corners. Their border shifts toward crimson on focus within. Text inputs use `15px` type and `11px` vertical padding. Category selects use the same border and corner treatment.

### Cards

Project cards use a charcoal fill, a fine border, and clipped original-color media. Hover lightens the border and fill and lifts the card (`2px`). Reduced motion and the interface setting remove the lift. Text metadata and stack tags remain subordinate to the title.

Selected project cards lead with the title and complete contribution summary. Historical cards retain supporting imagery below the copy. The project overview places its problem and demo/repository actions before a definition list for contribution, decision, and evidence. Project endings offer contact and a return to the collection. Both featured and archived entries share the searchable catalog, including the current portfolio at `/made-with`.

The Interactive portfolio case study leads with visitor outcomes and explains how the experience works in plain language: flexible windows, connected page and photo movement, saved reading positions, shareable articles, games, and visual experiments. Individual source-file references and developer commands stay out of its narrative.

### Navigation

Desktop workspace tabs use mono labels, muted default text, and crimson selected fills. App rail controls retain compact silhouettes, tooltips, and explicit active states. A labeled Contact action remains in the desktop panel. Compact layouts use the bottom primary navigation and expose the full app collection without relying on gestures. Project navigation opens the collection; document tabs resume individual articles. Navigating to an app moves keyboard focus into its content.

### Arcade launcher

The approved CRT Game select screen is a local exception inside the Eclipse window. A native-alpha graphite bezel surrounds warm ivory (`#f3ead4`) lettering on black (`#080809`), with crimson (`#b80b22`) identifying the selected game and Start action. Self-hosted Press Start 2P supplies the pixel display voice; IBM Plex Mono carries the short descriptions. The vertical menu sits beside original pixel artwork, followed by the selected title, description, and Start. The launcher fits its app window in both dimensions: heading, Start, keyboard guide, and index retain space while the preview takes the remaining height. Type and spacing respond to both container width and height. Tall portrait phones stack the menu and preview; shorter panels use a compact two-column view. Only the game list scrolls when needed. Very short landscape views omit the duplicate title/description to preserve artwork and controls. Selection stays visible when the window resizes, and controls retain at least 44px height.

Static, faint scanlines belong only to this launcher. They never cover the desktop or running activities, animate, or intercept input. Browsing is silent and mounts no game. The selected radio, preview, and game index change together; Start explicitly enters the activity, and Back or Escape returns to the remembered choice. The generated bezel and all eight artwork files retain their exact prompts and origins in embedded PNG metadata and `static/arcade/SOURCES.json`. Other app typography and controls retain the shared system.

### Tags

Stack tags are small mono text (`11px`) in a wrapping row. They have no pill background or enclosing border.

## Do's and Don'ts

- Do use IBM Plex Sans for reading and IBM Plex Mono for shell chrome and terminal output.
- Do preserve the original colors of artwork and content media.
- Do keep keyboard focus visible and honor both motion controls.
- Don't introduce a light theme or a theme selector.
- Don't animate the wallpapers.
- Don't make essential controls depend on gestures alone.
