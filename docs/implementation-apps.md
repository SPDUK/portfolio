# Portfolio apps implementation

The OS apps replace the conventional portfolio navigation with an About window, searchable Projects and Writing libraries, a command terminal, wallpaper/settings controls, Contact, and system information.

## Content contract

Gatsby adds `kind`, `category`, and `technologies` to Markdown nodes. Technology labels come from each original Markdown document's Tools Used line. The app index contains summaries and links, not full article HTML. `createPages` writes each document to `public/os-content/{id}.json`. Runtime documents are validated with Zod. Direct content routes use the same DocumentView seeded from server-rendered data.

The old article template's global copy helpers, arbitrary code execution, and reveal animations are removed. Document copy and heading links are scoped to the document and cleaned up on unmount. Neighbor links stay within projects or writing. The source link points to the original Markdown document.

## Interfaces

`Apps` takes an AppId, active flag, navigation and app-open callbacks, desktop preferences, preference/reset/replay callbacks, optional routed content, and the app's retained routePath. Each library keeps its open document tabs and search state while the window remains mounted. Hidden libraries pause embedded media.

## Checks

TypeScript passed after implementation. ESLint reports no errors in Apps, content, post, or desktop-app. One react/no-danger warning remains for the intentional rendering of repository-authored Markdown HTML. Runtime and visual verification are owned by the root integration pass.

## Follow-up constraints

Generated content payloads are emitted from createPages for both development and builds. Changes to gatsby-node require a Gatsby process restart. Public utility routes are registered there. Original screenshot colors are preserved in document bodies and tinted only in browsing covers.
