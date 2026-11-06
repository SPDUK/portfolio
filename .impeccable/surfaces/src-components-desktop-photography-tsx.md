---
version: 1
slug: 'src-components-desktop-photography-tsx'
primary_target: 'src/components/Desktop/Photography.tsx'
related_targets: ['src/components/Desktop/photography.css']
---

# Photography

Mode: Experience. A secondary desktop app at /photography for a flat travel-photo collection. The user confirmed an image-led cinematic opening and fullscreen exploration. Preserve the existing desktop system and all terminal edits. The user requested one demo photograph repeated for now and will add real photos to the folder. Use one labeled Unsplash demo frame repeated in the sheet until real images are present.

## Direction contract

THESIS: A luminous photographic contact sheet inside the existing charcoal desktop. One expansive image leads immediately, with the remaining frames below. The images carry the color.

OWN-WORLD: Inherit IBM Plex, near-black surfaces, fine charcoal borders, restrained crimson selection and window chrome. Preserve original image colors. Controls recede until needed and remain available to keyboard and touch users.

STORY: Open Photography from the rail or launcher, see the featured frame, browse a single ordered sheet, select any image, and move through full uncropped photographs in an immersive viewer.

FIRST VIEWPORT: Compact Photography title and collection count. A large landscape frame occupies most of the app body with an understated expand affordance. The beginning of the varied contact sheet is visible below it. In fullscreen, an uncropped photograph dominates, with quiet edge controls and a bottom thumbnail strip.

FORM: A cinematic contact sheet in the established visual world, pinned by the user's confirmed preference. No new visual-world selection. The signature moment is a soft decoded-image reveal and an unhurried opacity dissolve between fullscreen frames. Photographs have no visible titles or filenames.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation decision

Use candidate A's flat-folder derivative pipeline, with content/photography as private originals and generated static/photography WebP outputs. This avoids coupling image authoring to the existing Markdown GraphQL model. Graft candidate B's single component boundary and no extra public photo store. One generated list owns feature, order, count and navigation. Native dialog owns the fullscreen top layer and focus. Cross-family judging is unavailable because every configured runner/judge is in the GPT family; parent compared both sketches.

## Loading, paging, and motion

The catalog initially reveals 12 total frames, including the feature. More photographs is an explicit action. A reducer admits one batch per action and holds the next action until the new tail has intersected the app viewport and settled. Focus moves to the first appended frame. Scroll events never append frames. The single demo source repeats across 36 entries for three-batch verification.

IntersectionObserver uses the Photography scroll container, zero root margin, and a tiny positive threshold. One ordered queue admits at most two unsettled gallery image decodes. Unseen tiles have no image resource URLs. Leaving the viewport removes unstarted work from admission. Started work finishes and releases its slot, including errors. New gallery requests pause while fullscreen is open or the app is inactive.

ResizeObserver records tile widths. The same queue selects the smallest derivative that covers the visible tile at the current device pixel ratio and admits wider derivatives after enlargement. A previously decoded image remains visible during its upgrade. Failed upgrades keep that image without retrying the same derivative in a loop. Quality upgrades do not replay the entrance fade. The initial fullscreen skeleton uses both stage dimensions to match the selected photograph's contained aspect ratio.

Static skeletons preserve the existing geometry across the eager app fallback, manifest request, tiles, and initial fullscreen decode. No visible loading labels appear. Gallery images fade in for 900 ms after decode. Opening a decoded thumbnail expands that photograph into the fullscreen viewer, with a separate backdrop reveal and a stationary desktop. The thumbnail supplies the first viewer image at the photograph's full aspect ratio while its larger derivative decodes. Native movement takes 480 ms on desktop and 420 ms on compact layouts, with cubic-bezier(0.3, 0, 0.2, 1). Close and Escape shrink the current image back to its visible collection tile and restore focus. Offscreen or unavailable destinations close directly; system and interface motion preferences retain the direct fallback. Rapid close/reopen, switching photos, leaving the app, and changing motion preference release the temporary shared layers. The fullscreen state machine still admits one full-resolution decode at a time and keeps the last photograph fully visible during its successor's request. A 1100 ms ease-in-out opacity dissolve follows decoding when switching photographs. Navigation locks through both request and dissolve. Close stays available. The outgoing layer ignores pointer input and is removed after the dissolve.

The fullscreen filmstrip mounts only while open, contains at most seven nearby frames with clamped ends, and defers each thumbnail until its visible portion intersects the strip viewport. Full-resolution neighbors are never prefetched. A positional counter and accessible photograph numbers replace titles. System reduced motion and the app motion preference settle transitions immediately without depending on animation events.
