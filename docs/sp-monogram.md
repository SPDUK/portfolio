# SP monogram

An original crimson SP monogram with overlapping letterforms, informed by the interlocking construction of the San Diego Padres SD reference. The generated raster master is `sp-monogram-source.png`. It has a transparent background.

Run `node scripts/prepare-sp-brand.cjs` from the repository root to export the transparent 512px UI mark, black-backed PNG icons at 16, 32, 48, 180, 192, and 512px, and a 32px ICO. The same script refreshes the Gatsby manifest and SEO favicon source. The wallpaper asset generator also calls it so older logo artwork cannot return on regeneration.

The top bar, About panel, startup screen, and Terminal neofetch share `/brand/sp-monogram.png`. The terminal displays the transparent mark at 112px on desktop and 72px on phones, replacing the previous Arch-style ASCII emblem. These are PNG assets, not vector files.

The implementation checkpoint kept asset generation with the coordinator and the four coupled UI files with one implementation owner. No app-state changes were required. Build the Lever produced the repeatable export script. Experience First led to checking the mark at favicon and actual interface sizes.

Production build, TypeScript, and the existing build verifier pass. ESLint retains its existing Markdown rendering warning. Browser inspection confirmed the transparent mark loaded at 28px and 54px, and generated favicon links point to the refreshed asset hash.
