# SEO Audit

## Landing Page Messaging

The homepage presents Steve P as a Cambridge-based Senior Software Engineer & Forward Deployed Engineer at Zuora, focused on AI products and customer engineering. Supporting search topics include:

- senior frontend engineer Cambridge
- React TypeScript frontend lead
- AI product engineer
- agentic developer workflows
- enterprise UI systems
- Codex Claude Code Cursor workflows

The homepage now reinforces those terms in the title, description, hero copy, terminal card, current-role section, and structured data.

## Keyword Targets

- Primary: Senior Frontend Engineer, React Engineer, TypeScript Engineer, Frontend Lead, AI Product Engineer.
- Location: Cambridge UK, Cambridge software engineer, Cambridge frontend engineer.
- Differentiators: AI-native product workflows, agentic coding workflows, Codex, Claude Code, Cursor, enterprise UI systems.
- Supporting content: blog posts should keep targeting practical developer searches around JavaScript, React, AI tooling, and engineering workflow problems.

## Share Cards

- Homepage and app cards use the generated `social-preview.png`, with the SP monogram, current role, and black and crimson colors.
- Blog and project pages use individual cards with the document title and the same design.
- The page template owns Open Graph and Twitter metadata so the desktop shell cannot replace document-specific previews.
- Image URLs are absolute and use content hashes to change when their assets change.
- Keep the preview image legible at Slack, Discord, LinkedIn, and X card sizes.

## Agentic Lookup Support

- `/llms.txt` provides a concise LLM-readable overview.
- `/llms-full.txt` provides a larger context version.
- `/robots.txt` references the sitemap and allows common search/AI crawlers.
- JSON-LD Person and WebSite schema identify Steve, location, current company, skills, and GitHub profile.
- Sitemap generation is enabled through `gatsby-plugin-sitemap`.

## Analytics Plan

Track a minimal set of events:

- `cta_view_projects_click` from homepage hero.
- `cta_blog_click` from homepage hero.
- `project_card_click` with project title.
- `blog_post_click` with post title and category.
- `external_github_click` from nav, project cards, and GitHub CTA.
- `made_with_click` from footer and stack links.
- `search_filter_used` on blog/projects with query and selected category.

Use these to learn which intent is working: hiring/profile discovery, technical writing, project evaluation, or tooling interest.

## Remaining Recommendations

- Add a short About/Now page if personal search visibility becomes important.
- Add explicit contact or availability copy if the site should convert recruiter or consulting traffic.
- Add markdown summaries for the highest-value project pages so agentic tools can quote stronger context.
- Consider moving from `gatsby-plugin-react-helmet` to Gatsby Head API later; current implementation works but Gatsby warns it is deprecated.
