# Current role and sharing refresh

## Intent

Present Steve's current role as Senior Software Engineer & Forward Deployed Engineer at Zuora, focused on AI. Link the company name to its website. Match shared links to the black and crimson portfolio identity and current SP monogram.

## Throughput checkpoint

- Blocking first steps. Inspect current role copy, metadata ownership, and asset generation.
- Independent workstreams. The coordinator owns visible role copy and desktop metadata cleanup. One implementation owner handles sharing-card generation, page metadata, and build verification.
- Shared mutable state. UI and sharing files have separate owners. The existing desktop state model is unchanged.
- Smallest safe decomposition. Keep generation and metadata wiring with one owner because emitted image paths and page metadata must agree.

## Decisions

The role paragraph uses the supplied job titles and AI focus, with existing frontend and customer work as supporting context. Remove the old technology list from this section.

Each document uses its existing title and content kind for its sharing card. The homepage and app pages share a portfolio card focused on Steve's role and AI work, with no employer name in the card, description, or image alt text. Keep project screenshots and article illustrations in their original colors.

Page templates own metadata. Removing the desktop shell's duplicate SEO output prevents it from replacing article-specific previews.

Build the Lever guides reusable asset generation and verification of emitted image references. Model the Domain keeps share metadata attached to each document's existing page context.

## Verification

- Production build and TypeScript pass. ESLint reports zero errors and the existing repository Markdown HTML warning.
- `npm run verify:build` verifies 32 server-rendered documents, 33 distinct 1200 × 630 sharing images, and sharing metadata on the homepage and eight app routes.
- The verifier checks unique Open Graph type/image tags, matching Twitter images, absolute URLs, image files and dimensions, current role copy, and the Zuora link. It caught duplicate type tags and missing utility-page metadata before completion.
- Reviewed the homepage card and a long article title at full resolution. Both fit the black and crimson composition and use the real SP monogram and bundled Plex fonts.
- Browser inspection confirms the role paragraph and company link. Article metadata retains its own title, hashed card, and article type after loading. Arcade loads and starts normally.
- A brand README was moved into `docs/sp-monogram.md` because the asset-source directory is processed as Markdown content by Gatsby.

The desktop now mounts app-page metadata alongside the shell, and document metadata with its document. Arcade waits for client readiness before loading the game component so server rendering retains the route metadata.

Changes remain local. Existing social platforms may keep cached previews after deployment until they fetch the updated page metadata.
