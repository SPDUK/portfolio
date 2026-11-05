---
name: SPDEV OS Eclipse
description: A charcoal personal desktop with restrained crimson interaction and original-color artwork.
colors:
  background: "#080809"
  chrome: "#0e1015"
  surface: "#14161c"
  raised: "#20232b"
  divider: "#ffffff18"
  text: "#f3f3f5"
  muted: "#a3a5b0"
  primary: "#b91f2e"
  focus: "#ff5261"
  control: "#202025"
  control-border: "#36363e"
  app-text: "#f5f5f7"
  primary-hover: "#ca2938"
typography:
  headline:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "clamp(28px, 7cqw, 42px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    letterSpacing: "-0.25px"
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, Consolas, monospace"
    fontSize: "12px"
  terminal:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "12px"
    lineHeight: 1.65
rounded:
  control: "4px"
  field: "5px"
  card: "6px"
  shell: "10px"
  window: "11px"
spacing:
  edge: "8px"
  gap: "12px"
  card: "18px"
  section: "24px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.app-text}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  search:
    backgroundColor: "#101013"
    textColor: "{colors.app-text}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  card:
    backgroundColor: "#1b1b20"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
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

Fresh visits open About alone, with the current role and primary actions before selected work. Kishu and the interactive portfolio lead; experiments follow. Terminal is available on demand, and saved workspaces still restore. The startup sequence is an optional replay.

At viewport widths up to `1099px`, a single bottom navigation presents About, Projects, Contact, and Apps. It replaces the workspace strip and running-app management bar. The stage starts at `58px`; a compact `36px` title bar identifies the current app without window-management controls. Apps retain their own scroll areas. App content uses container queries because window width can change independently of viewport width. Shared app layouts tighten at `480px`; library grids and selected-work rows gain a second column at `700px`.

Spacing follows the existing compact controls and wider reading areas. Cards use `18px` internal padding. Library pages cap their width at `1240px` and use `clamp(22px, 5cqw, 64px)` horizontal padding, reduced to `20px` in narrow windows. Coarse-pointer controls expand to at least `44px` high.

## Elevation & Depth

Tonal layers, fine borders, and soft black shadows establish depth. Windows use a diffuse shadow plus a faint inset highlight. A focused window gains a crimson border and stronger shadow. The top panel uses backdrop blur (`24px`); the launcher and menus use deeper shadows. Exact shadow and motion values live in `.impeccable/design.json`.

Window border and shadow transitions take `140ms`. Workspace states take `160ms`, menus `180ms`, and launcher entry `320ms`. The interface setting and reduced-motion preference remove animation and transitions. Wallpapers remain static.

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

### Navigation

Desktop workspace tabs use mono labels, muted default text, and crimson selected fills. App rail controls retain compact silhouettes, tooltips, and explicit active states. A labeled Contact action remains in the desktop panel. Compact layouts use the bottom primary navigation and expose the full app collection without relying on gestures. Project navigation opens the collection; document tabs resume individual articles. Navigating to an app moves keyboard focus into its content.

### Tags

Stack tags are small mono text (`11px`) in a wrapping row. They have no pill background or enclosing border.

## Do's and Don'ts

- Do use IBM Plex Sans for reading and IBM Plex Mono for shell chrome and terminal output.
- Do preserve the original colors of artwork and content media.
- Do keep keyboard focus visible and honor both motion controls.
- Don't introduce a light theme or a theme selector.
- Don't animate the wallpapers.
- Don't make essential controls depend on gestures alone.
