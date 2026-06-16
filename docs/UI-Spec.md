# Screens List

- Home: introduce Steve, primary calls to Projects and Blog, work history, and technology groups. Key actions are opening project/blog routes and scanning current engineering focus.
- Blog: browse, search, and filter writing. Key actions are opening the featured article, searching posts, filtering categories, and following GitHub links.
- Projects: browse, search, sort, and filter shipped work. Key actions are opening featured projects, changing category filters, searching, and toggling sort order.
- Article/Project template: read generated markdown content with metadata, audio narration when available, useful links, and previous/next navigation.
- Made With: explain tools and inspirations behind the site. Key action is opening external reference links.
- 404: recover from invalid routes with clear feedback and a calm visual treatment.

# Component Inventory (shadcn-friendly)

- Page shell: `Layout`, `Navbar`, `Footer`, `PageBackdrop`, and `MotionPage`; maps to app shell, navigation, and page transition primitives.
- Motion primitives: `useRevealTimeline` for scoped reveal timelines and GSAP constants for shared timing, easing, and reduced-motion behavior.
- Hero and section blocks: reusable heading, copy, CTA row, stats strip, and visual panel patterns.
- Cards: featured project, project card, featured post, post card, article link card, pager card, work case card, and technology group.
- Controls: filter chips, search fields, sort button, mobile nav toggle, and CTA buttons.
- Feedback states: empty result panels, article audio unavailable panel text, 404 state, and visible active navigation state.

# UX States

- Page loading: page content fades/slides in quickly via `MotionPage`; content remains server-rendered and visible if JavaScript is unavailable.
- Filtered empty results: Blog and Projects show a centered glass empty state with concise recovery copy and a subtle reveal.
- Search/filter updates: result cards lightly crossfade and stagger without animating layout dimensions.
- Mobile menu open: page scroll locks, menu opens under 250ms, and links close the menu after navigation.
- Article audio unavailable: the audio panel stays in place and explains that narration is not available yet.
- Animation-disabled mode: `prefers-reduced-motion: reduce` keeps all content visible and disables meaningful movement and ambient animation.
- Error or invalid route: 404 shows a direct message without decorative distraction.

# Copy Suggestions

- Projects empty: "No projects found" and "Try a different search term or filter."
- Blog empty: "No posts found" and "Try a different search term or filter."
- Article audio fallback: "Audio narration is not available for this post yet."
- 404: "Not Found" and "You just hit a route that doesn't exist."
- Primary CTAs: "View Projects", "Read Blog Posts", "Check it out", "Follow on GitHub".

# Accessibility Notes

- Preserve semantic headings, landmarks, article structure, and nav labels; animations must never change reading order.
- Keep focus-visible outlines intact on nav links, filter chips, search inputs, buttons, cards, and pager links.
- Maintain icon `aria-hidden` usage when text labels already describe the action.
- Respect keyboard navigation for mobile menu links, filter buttons, search inputs, and article controls.
- Ensure reduced-motion users get immediate content visibility and no ambient movement.
- Keep contrast high on glass surfaces; neon effects should support state, not replace readable labels.

# Mobile Considerations

- Use shorter durations and smaller offsets on compact screens; avoid deep stagger chains that delay content access.
- Keep the mobile nav animation under 250ms and preserve scroll locking only while the menu is open.
- Stack cards and toolbar controls without animated width or height changes.
- Avoid continuous motion near article prose, code blocks, audio controls, and search inputs.
- Preserve tap target size for nav links, CTAs, filter chips, sort button, and pager cards.
