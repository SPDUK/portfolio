# Eclipse UI cleanup

## Intent

Keep the dark Unix desktop identity while making the portfolio easier to scan. The four numbered desktop views identify destinations. Project ordinals, repeated headings, invented status messages, and slogans do not help visitors choose or read the work.

## Guidance

Installed [Impeccable](https://github.com/pbakaus/impeccable) 4.8.0 into the user's Codex skills directory. Applied its Distill, Polish, and Craft Floor references, alongside pstack Unslop. The [anti-slop catalog](https://impeccable.style/slop/) informed the initial audit.

The desktop is an Experience surface. Its launcher and settings are Operate surfaces, and articles are Read surfaces. Preserve the existing palette, fonts, static wallpapers, full-color artwork, routing, and Focus/Tile behavior.

## Editing checklist

- Keep numbers that express navigation, dates, scores, or actual results. Remove arbitrary item and section ordinals.
- Give a section one clear heading. Remove labels that repeat it.
- Use factual, specific copy. Remove slogans and fake system status.
- Keep search labels, focus indicators, keyboard hints, and meaningful metadata.
- Let images and titles lead. Reduce decorative containers around supporting text.
- Group related information and leave clear space between groups.
- Check narrow and wide layouts for clipping, readability, and usable controls.
- Delete unused styles when removing UI elements.

## Throughput checkpoint

- Blocking first steps. Read the current UI, research the requested patterns, install and read Impeccable, and inspect the rendered incumbent.
- Independent workstreams. One implementation owner handles the coupled JSX and CSS. The coordinator owns installation, design review, documentation, and browser verification.
- Shared mutable state. No app-state changes. UI files stay with one writer until handoff.
- Smallest safe decomposition. One cosmetic implementation pass followed by a visual correction pass avoids conflicting spacing and typography edits.

## Scope

The existing JSX and app registry remain the organizing structure. No new data model, function boundary, or window-management behavior is required. Architecture alternatives and a PR are outside this local refinement.

## Verification

- All 32 existing model and game tests pass. No tests were added for cosmetic markup.
- TypeScript passes. ESLint reports no errors and the existing warning for repository Markdown HTML rendering.
- Production builds pass. The build verifier checks 32 server-rendered documents, eight app routes, and three static wallpapers.
- The single requested Impeccable source scan returned an empty finding list. Later visual corrections reduced header spacing and removed remaining launcher copy; the scan is not a claim of complete visual coverage.
- Rendered checks at 390 × 844, 768 × 900, and the default 1280 × 720 covered project and writing composition. Phone and intermediate widths have no document-level horizontal overflow.
- Project search reports zero matches and Clear filters restores the collection. Useful headings, labels, and metadata remain exposed to accessibility tools.
- A source review found one obsolete mobile selector, which was removed. No new comments required removal.

Subtract Before You Add guided deletion of repeated labels and decorative wrappers. Experience First preserved navigation and controls while giving project imagery and article titles more space.
