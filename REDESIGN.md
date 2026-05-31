# SPDEVUK Redesign Specification

**File:** `REDESIGN.md`
**Site:** `spdevuk.com`
**Design direction:** cutting-edge, bold, dark, glassy, neon, practical to build
**Stack assumption:** Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, Magic UI, MDX or Markdown-driven blog content

---

## 1. Design Summary

The redesign should feel like a premium developer portfolio with a dark futuristic glassmorphism identity. The UI should be bold and memorable, but still implementable without making every page require bespoke artwork.

### Core visual principles

1. **Dark-first interface**
   Deep navy and near-black backgrounds with controlled neon highlights.

2. **Glassy surfaces**
   Cards, navigation, post blocks, audio players, and filters use translucent surfaces, soft blur, subtle borders, and layered highlights.

3. **Neon restraint**
   Cyan, electric blue, violet, purple, and magenta are used for active states, gradients, borders, CTA emphasis, and decorative glows.

4. **Reusable structure over one-off art**
   Home, Blog, Projects, and Article pages should be visually rich through reusable cards, typography, background patterns, and interaction states. Blog posts should not require custom hero images.

5. **Readable developer content**
   Code blocks, metadata, links, and article typography must be highly legible. Decorative effects must never fight the text.

6. **shadcn owns the system**
   shadcn/ui primitives are the accessible base. Magic UI supplies visual effects. Custom components define the SPDEVUK product language.

---

## 2. Pages Covered

This spec covers the full redesign for:

- Home page
- Blog index page
- Projects index page
- Generic article/blog post page
- Shared navigation, cards, filters, footer, and visual system
- shadcn theme tokens
- Magic UI usage
- Custom component architecture
- Markdown/MDX article rendering
- Generic audio player skin
- Code block styling

---

## 3. Main Site Content Model

### Home page content

Use the existing SPDEVUK identity and content:

- Name: Steve
- Location: Cambridge, UK
- Role: Full-Stack Developer
- Positioning: self-taught developer, builder, problem solver
- Focus: JavaScript and functional programming

### Technologies

#### Front End

- JavaScript
- TypeScript
- React
- Redux
- GraphQL
- Gatsby
- CSS
- Sass

#### Back End

- Node.js
- Ruby
- Rails
- Elixir
- Phoenix
- Crystal
- MongoDB
- PostgreSQL

#### DevOps & Tools

- Heroku
- Docker
- Webpack
- AWS
- DigitalOcean
- Git
- Ubuntu
- VS Code

### Blog index example posts

- How to add AI text to speech to a blog
- How to manage personal finances and investing
- How to scrape a youtube channel with puppeteer
- How to be a better developer without any code
- JavaScript 101 - Variables & Primitives
- How to ask a question as a developer
- How to use DigitalOcean Spaces as a CMS
- Point-free code in JavaScript
- How well do I really know the tools on my CV?
- Which type of web hosting should you use?
- My Developer Roadmap
- What I’ve learned in my first 6 months working as a developer
- How to add a copy button to markdown code blocks using JavaScript
- Writing a one line React onChange function using destructuring

### Projects index example projects

Featured:

- Youtube Subscription Downloader
- PoE Wishlist

Grid:

- Slushy.gg
- My Guitar Site
- The Offering
- Portfolio
- Linux Screen Recorder
- Pokebattles
- Fylo
- Giphy Finder
- Old Portfolio
- Elixir Snake Game
- Ruby Wallpaper Scraper
- Crypto Tracker
- Startpage
- Dance Gavin Dance
- Trading Post

---

## 4. shadcn Theme Goals

The theme should be semantic first. Avoid hard-coding colors directly into page components unless it is for a very specific decorative effect.

Use shadcn-style variables:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--border`
- `--input`
- `--ring`
- `--chart-*`
- `--sidebar-*`

Add custom SPDEVUK variables for:

- Glass surfaces
- Neon colors
- Terminal/code colors
- Glow shadows
- Syntax highlighting
- Article/category theming

---

## 5. Color Palette

| Token           |       Hex |                      OKLCH | Purpose                  |
| --------------- | --------: | -------------------------: | ------------------------ |
| Space Black     | `#050816` | `oklch(0.140 0.032 270.3)` | Main background          |
| Deep Navy       | `#0B1024` | `oklch(0.180 0.042 271.1)` | Elevated dark base       |
| Glass Navy      | `#101735` | `oklch(0.217 0.059 270.9)` | Card surfaces            |
| Midnight Blue   | `#111B3E` | `oklch(0.236 0.071 270.4)` | Strong glass panels      |
| Electric Blue   | `#4C8DFF` | `oklch(0.658 0.182 260.7)` | Primary actions          |
| Neon Cyan       | `#22E6FF` | `oklch(0.848 0.142 209.1)` | Active states and glow   |
| Ion Violet      | `#8B5CFF` | `oklch(0.612 0.229 291.4)` | Gradients and focus      |
| Plasma Purple   | `#B45CFF` | `oklch(0.654 0.235 305.7)` | Secondary glow           |
| Hot Magenta     | `#FF4FD8` | `oklch(0.716 0.251 338.1)` | Hero gradient accent     |
| Aqua Green      | `#31F7B4` | `oklch(0.868 0.176 163.9)` | Success/status accents   |
| JS Yellow       | `#F7DF1E` |  `oklch(0.886 0.173 98.7)` | JavaScript category/icon |
| Ruby Red        | `#E63946` |  `oklch(0.632 0.205 25.1)` | Ruby/Rails tags          |
| Orange Spark    | `#FF8A3D` |  `oklch(0.746 0.178 55.0)` | Warning/code accents     |
| Ice White       | `#F4F8FF` | `oklch(0.978 0.010 261.8)` | Main text                |
| Muted Blue Grey | `#8996B8` | `oklch(0.675 0.053 268.6)` | Body copy/meta           |
| Faint Border    | `#263457` | `oklch(0.319 0.069 268.7)` | Subtle borders           |

---

## 6. `components.json`

Use a modern shadcn setup with TypeScript, React Server Components, CSS variables, and Lucide icons.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## 7. Global CSS Theme

Place this in `app/globals.css` and adjust if your project already has shadcn base styles.

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 1rem;

  --background: oklch(0.98 0.01 273.4);
  --foreground: oklch(0.18 0.042 271.1);

  --card: oklch(1 0 0 / 0.78);
  --card-foreground: oklch(0.18 0.042 271.1);

  --popover: oklch(0.988 0.006 264.5 / 0.96);
  --popover-foreground: oklch(0.18 0.042 271.1);

  --primary: oklch(0.658 0.182 260.7);
  --primary-foreground: oklch(0.978 0.01 261.8);

  --secondary: oklch(0.934 0.034 289.4);
  --secondary-foreground: oklch(0.18 0.042 271.1);

  --muted: oklch(0.955 0.021 268.4);
  --muted-foreground: oklch(0.49 0.053 265.6);

  --accent: oklch(0.962 0.03 215.1);
  --accent-foreground: oklch(0.18 0.042 271.1);

  --destructive: oklch(0.679 0.213 14.7);

  --border: oklch(0.874 0.048 269.6 / 0.65);
  --input: oklch(0.874 0.048 269.6 / 0.72);
  --ring: oklch(0.848 0.142 209.1);

  --chart-1: oklch(0.658 0.182 260.7);
  --chart-2: oklch(0.848 0.142 209.1);
  --chart-3: oklch(0.612 0.229 291.4);
  --chart-4: oklch(0.716 0.251 338.1);
  --chart-5: oklch(0.868 0.176 163.9);

  --sidebar: oklch(1 0 0 / 0.72);
  --sidebar-foreground: oklch(0.18 0.042 271.1);
  --sidebar-primary: oklch(0.658 0.182 260.7);
  --sidebar-primary-foreground: oklch(0.978 0.01 261.8);
  --sidebar-accent: oklch(0.955 0.021 268.4);
  --sidebar-accent-foreground: oklch(0.18 0.042 271.1);
  --sidebar-border: oklch(0.874 0.048 269.6 / 0.65);
  --sidebar-ring: oklch(0.848 0.142 209.1);

  /* SPDEVUK custom tokens */
  --glass: oklch(1 0 0 / 0.46);
  --glass-strong: oklch(1 0 0 / 0.68);
  --glass-soft: oklch(1 0 0 / 0.3);
  --glass-border: oklch(0.658 0.182 260.7 / 0.22);
  --glass-highlight: oklch(1 0 0 / 0.52);

  --neon-blue: oklch(0.658 0.182 260.7);
  --neon-cyan: oklch(0.848 0.142 209.1);
  --neon-violet: oklch(0.612 0.229 291.4);
  --neon-purple: oklch(0.654 0.235 305.7);
  --neon-magenta: oklch(0.716 0.251 338.1);
  --neon-green: oklch(0.868 0.176 163.9);
  --neon-yellow: oklch(0.886 0.173 98.7);
  --neon-orange: oklch(0.746 0.178 55);

  --terminal: oklch(0.18 0.042 271.1 / 0.78);
  --terminal-foreground: oklch(0.848 0.142 209.1);
  --code-bg: oklch(0.115 0.03 270 / 0.92);
  --code-border: oklch(0.848 0.142 209.1 / 0.18);
  --code-line: oklch(0.675 0.053 268.6 / 0.55);
  --code-comment: oklch(0.675 0.053 268.6 / 0.75);
  --code-keyword: oklch(0.716 0.251 338.1);
  --code-function: oklch(0.848 0.142 209.1);
  --code-string: oklch(0.868 0.176 163.9);
  --code-variable: oklch(0.978 0.01 261.8);
  --code-number: oklch(0.886 0.173 98.7);
  --code-operator: oklch(0.612 0.229 291.4);

  --shadow-glass:
    0 1px 0 oklch(1 0 0 / 0.12) inset,
    0 24px 80px -32px oklch(0.658 0.182 260.7 / 0.42);

  --shadow-neon:
    0 0 0 1px oklch(0.848 0.142 209.1 / 0.18),
    0 0 42px oklch(0.658 0.182 260.7 / 0.38),
    0 0 90px oklch(0.654 0.235 305.7 / 0.18);
}

.dark {
  --background: oklch(0.14 0.032 270.3);
  --foreground: oklch(0.978 0.01 261.8);

  --card: oklch(0.18 0.042 271.1 / 0.58);
  --card-foreground: oklch(0.978 0.01 261.8);

  --popover: oklch(0.157 0.036 273.6 / 0.94);
  --popover-foreground: oklch(0.978 0.01 261.8);

  --primary: oklch(0.658 0.182 260.7);
  --primary-foreground: oklch(0.978 0.01 261.8);

  --secondary: oklch(0.217 0.059 270.9 / 0.78);
  --secondary-foreground: oklch(0.978 0.01 261.8);

  --muted: oklch(0.217 0.059 270.9 / 0.68);
  --muted-foreground: oklch(0.675 0.053 268.6);

  --accent: oklch(0.848 0.142 209.1);
  --accent-foreground: oklch(0.14 0.032 270.3);

  --destructive: oklch(0.679 0.213 14.7);

  --border: oklch(0.848 0.142 209.1 / 0.16);
  --input: oklch(0.848 0.142 209.1 / 0.18);
  --ring: oklch(0.848 0.142 209.1);

  --chart-1: oklch(0.658 0.182 260.7);
  --chart-2: oklch(0.848 0.142 209.1);
  --chart-3: oklch(0.612 0.229 291.4);
  --chart-4: oklch(0.716 0.251 338.1);
  --chart-5: oklch(0.868 0.176 163.9);

  --sidebar: oklch(0.157 0.036 273.6 / 0.86);
  --sidebar-foreground: oklch(0.978 0.01 261.8);
  --sidebar-primary: oklch(0.658 0.182 260.7);
  --sidebar-primary-foreground: oklch(0.978 0.01 261.8);
  --sidebar-accent: oklch(0.217 0.059 270.9 / 0.82);
  --sidebar-accent-foreground: oklch(0.978 0.01 261.8);
  --sidebar-border: oklch(0.848 0.142 209.1 / 0.16);
  --sidebar-ring: oklch(0.848 0.142 209.1);

  --glass: oklch(0.18 0.042 271.1 / 0.44);
  --glass-strong: oklch(0.217 0.059 270.9 / 0.68);
  --glass-soft: oklch(0.18 0.042 271.1 / 0.28);
  --glass-border: oklch(0.848 0.142 209.1 / 0.18);
  --glass-highlight: oklch(1 0 0 / 0.08);

  --terminal: oklch(0.115 0.03 270 / 0.76);
  --terminal-foreground: oklch(0.848 0.142 209.1);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);

  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-glass: var(--glass);
  --color-glass-strong: var(--glass-strong);
  --color-glass-soft: var(--glass-soft);
  --color-glass-border: var(--glass-border);
  --color-glass-highlight: var(--glass-highlight);

  --color-neon-blue: var(--neon-blue);
  --color-neon-cyan: var(--neon-cyan);
  --color-neon-violet: var(--neon-violet);
  --color-neon-purple: var(--neon-purple);
  --color-neon-magenta: var(--neon-magenta);
  --color-neon-green: var(--neon-green);
  --color-neon-yellow: var(--neon-yellow);
  --color-neon-orange: var(--neon-orange);

  --color-terminal: var(--terminal);
  --color-terminal-foreground: var(--terminal-foreground);
  --color-code-bg: var(--code-bg);
  --color-code-border: var(--code-border);

  --shadow-glass: var(--shadow-glass);
  --shadow-neon: var(--shadow-neon);

  --radius-sm: calc(var(--radius) * 0.55);
  --radius-md: calc(var(--radius) * 0.75);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.35);
  --radius-2xl: calc(var(--radius) * 1.75);
  --radius-3xl: calc(var(--radius) * 2.25);
  --radius-4xl: calc(var(--radius) * 2.75);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  html {
    color-scheme: dark;
    scroll-behavior: smooth;
  }

  body {
    @apply bg-background text-foreground antialiased;
    background:
      radial-gradient(
        circle at 12% 10%,
        oklch(0.658 0.182 260.7 / 0.2),
        transparent 30rem
      ),
      radial-gradient(
        circle at 88% 25%,
        oklch(0.654 0.235 305.7 / 0.16),
        transparent 34rem
      ),
      radial-gradient(
        circle at 70% 90%,
        oklch(0.848 0.142 209.1 / 0.12),
        transparent 30rem
      ),
      var(--background);
  }

  ::selection {
    color: var(--foreground);
    background: oklch(0.848 0.142 209.1 / 0.3);
  }
}

@layer utilities {
  .glass-panel {
    @apply border border-glass-border bg-glass shadow-glass backdrop-blur-2xl;
  }

  .glass-panel-strong {
    @apply border border-glass-border bg-glass-strong shadow-neon backdrop-blur-2xl;
  }

  .glass-panel-soft {
    @apply border border-glass-border bg-glass-soft backdrop-blur-xl;
  }

  .text-gradient-aurora {
    background: linear-gradient(
      110deg,
      var(--neon-cyan),
      var(--neon-blue),
      var(--neon-violet),
      var(--neon-magenta)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .border-gradient-neon {
    position: relative;
  }

  .border-gradient-neon::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      oklch(0.848 0.142 209.1 / 0.65),
      oklch(0.612 0.229 291.4 / 0.45),
      oklch(0.716 0.251 338.1 / 0.45)
    );
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  .spotlight-card {
    background:
      radial-gradient(
        circle at top left,
        oklch(0.848 0.142 209.1 / 0.16),
        transparent 18rem
      ),
      radial-gradient(
        circle at bottom right,
        oklch(0.654 0.235 305.7 / 0.14),
        transparent 20rem
      ),
      var(--glass);
  }

  .content-grid-accent {
    background-image:
      linear-gradient(oklch(0.848 0.142 209.1 / 0.1) 1px, transparent 1px),
      linear-gradient(
        90deg,
        oklch(0.654 0.235 305.7 / 0.1) 1px,
        transparent 1px
      );
    background-size: 32px 32px;
    mask-image: radial-gradient(circle, black, transparent 70%);
  }
}
```

---

## 8. shadcn Components to Install

Install shadcn components used by the redesign:

```bash
pnpm dlx shadcn@latest add \
  accordion \
  alert \
  aspect-ratio \
  badge \
  breadcrumb \
  button \
  button-group \
  card \
  carousel \
  command \
  dialog \
  drawer \
  dropdown-menu \
  empty \
  hover-card \
  input \
  input-group \
  item \
  kbd \
  navigation-menu \
  pagination \
  popover \
  scroll-area \
  select \
  separator \
  sheet \
  skeleton \
  slider \
  sonner \
  switch \
  table \
  tabs \
  toggle \
  toggle-group \
  tooltip \
  typography
```

### shadcn component responsibilities

| Component         | Required? | Used for                                                             |
| ----------------- | --------: | -------------------------------------------------------------------- |
| `accordion`       |  Optional | Expandable article sections or future FAQ-style content.             |
| `alert`           |       Yes | Article callouts such as `Key idea`, `Warning`, `Note`, `Takeaways`. |
| `aspect-ratio`    |       Yes | Project thumbnails, featured cards, optional media.                  |
| `badge`           |       Yes | Type labels, tech tags, featured labels, metadata chips.             |
| `breadcrumb`      |       Yes | Article breadcrumbs: `Blog / JavaScript / Tutorial`.                 |
| `button`          |       Yes | CTAs, copy buttons, external links, filter reset actions.            |
| `button-group`    |       Yes | Hero CTA groups and footer CTA clusters.                             |
| `card`            |       Yes | Glass panels, post cards, project cards, tech cards.                 |
| `carousel`        |  Optional | Mobile featured project carousel.                                    |
| `command`         |  Optional | Global search palette or blog/project quick search.                  |
| `dialog`          |  Optional | Desktop project detail modal.                                        |
| `drawer`          |  Optional | Mobile project/article info drawer.                                  |
| `dropdown-menu`   |       Yes | Header actions, theme menu, compact GitHub menu.                     |
| `empty`           |       Yes | Empty state for search/filter results.                               |
| `hover-card`      |  Optional | Rich previews for tech tags or project links.                        |
| `input`           |       Yes | Blog search, project search.                                         |
| `input-group`     |       Yes | Search fields with icons and shortcut hints.                         |
| `item`            |       Yes | Blog list rows and compact content rows.                             |
| `kbd`             |  Optional | Search shortcut hints like `/` or `⌘K`.                              |
| `navigation-menu` |       Yes | Desktop navigation.                                                  |
| `pagination`      |  Optional | Blog/project pagination as content grows.                            |
| `popover`         |       Yes | Audio speed menu, small filters, article metadata popovers.          |
| `scroll-area`     |       Yes | Long mobile menu and horizontally scrolling code.                    |
| `select`          |       Yes | Project sort and audio speed fallback.                               |
| `separator`       |       Yes | Section dividers and metadata row separators.                        |
| `sheet`           |       Yes | Mobile navigation.                                                   |
| `skeleton`        |       Yes | Loading states for posts/projects.                                   |
| `slider`          |       Yes | Minimal audio player progress line and volume control.               |
| `sonner`          |       Yes | Toasts for copy actions and link actions.                            |
| `switch`          |  Optional | Simple theme toggle fallback.                                        |
| `table`           |       Yes | Markdown table styling inside articles.                              |
| `tabs`            |       Yes | Blog and project category tabs.                                      |
| `toggle`          |  Optional | Icon-only toggles.                                                   |
| `toggle-group`    |       Yes | Filter chip groups.                                                  |
| `tooltip`         |       Yes | Icon-only buttons and metadata help.                                 |
| `typography`      |       Yes | Article prose rules, headings, lists, inline code.                   |

---

## 9. shadcn Variant Extensions

### Button variants

Add these variants to `components/ui/button.tsx`.

| Variant        | Use                                    |
| -------------- | -------------------------------------- |
| `neon`         | Primary actions, high-emphasis CTAs.   |
| `glass`        | Secondary actions inside glass panels. |
| `glassOutline` | Low-emphasis links/buttons.            |
| `ghostGlow`    | Header/nav hover actions.              |
| `copy`         | Code block copy buttons.               |

Example variant classes:

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        glass:
          'border border-glass-border bg-glass text-foreground shadow-glass backdrop-blur-xl hover:bg-glass-strong',
        glassOutline:
          'border border-glass-border bg-transparent text-foreground hover:bg-glass',
        neon: 'bg-[linear-gradient(135deg,var(--neon-cyan),var(--neon-blue),var(--neon-violet))] text-white shadow-neon hover:scale-[1.02]',
        ghostGlow: 'text-foreground hover:bg-glass hover:text-neon-cyan',
        copy: 'border border-glass-border bg-glass-soft text-muted-foreground hover:bg-glass hover:text-foreground',
      },
    },
  },
)
```

### Card variants

Add these variants to your wrapper components rather than changing shadcn `Card` too heavily.

| Variant       | Use                                    |
| ------------- | -------------------------------------- |
| `glass`       | Most cards.                            |
| `glassStrong` | Featured content.                      |
| `spotlight`   | Cards with radial highlights.          |
| `neon`        | Hero visual, featured project/article. |
| `interactive` | Hoverable cards.                       |

### Badge variants

| Variant    | Use                              |
| ---------- | -------------------------------- |
| `glass`    | Generic labels.                  |
| `neon`     | Active labels.                   |
| `tech`     | Technology tags.                 |
| `meta`     | Dates/read time.                 |
| `featured` | Featured project/article labels. |
| `type`     | Blog category/type labels.       |

### Input variants

| Variant  | Use                                            |
| -------- | ---------------------------------------------- |
| `glass`  | Default search inputs.                         |
| `search` | Search with icon, shortcut, and larger height. |

---

## 10. Magic UI Components to Install

Magic UI should be used as an effects layer, not as the page architecture.

```bash
pnpm dlx shadcn@latest add \
  @magicui/animated-gradient-text \
  @magicui/aurora-text \
  @magicui/shimmer-button \
  @magicui/rainbow-button \
  @magicui/neon-gradient-card \
  @magicui/magic-card \
  @magicui/border-beam \
  @magicui/shine-border \
  @magicui/glare-hover \
  @magicui/blur-fade \
  @magicui/number-ticker \
  @magicui/terminal \
  @magicui/dot-pattern \
  @magicui/grid-pattern \
  @magicui/flickering-grid \
  @magicui/animated-grid-pattern \
  @magicui/particles \
  @magicui/noise-texture \
  @magicui/progressive-blur \
  @magicui/animated-theme-toggler \
  @magicui/hyper-text \
  @magicui/typing-animation \
  @magicui/scroll-progress \
  @magicui/light-rays
```

### Magic UI responsibilities

| Magic UI component     | Used for                                           |
| ---------------------- | -------------------------------------------------- |
| `AnimatedGradientText` | Hero headline accents and highlighted words.       |
| `AuroraText`           | Premium heading treatments.                        |
| `ShimmerButton`        | Primary CTAs.                                      |
| `RainbowButton`        | Alternative high-emphasis CTA.                     |
| `NeonGradientCard`     | Featured cards.                                    |
| `MagicCard`            | Hover-reactive cards.                              |
| `BorderBeam`           | Animated borders on featured content.              |
| `ShineBorder`          | Subtle animated card borders.                      |
| `GlareHover`           | Project/article card hover sheen.                  |
| `BlurFade`             | Page/card reveal animation.                        |
| `NumberTicker`         | Project stats.                                     |
| `Terminal`             | Home hero terminal snippet.                        |
| `DotPattern`           | Background texture.                                |
| `GridPattern`          | Background structure.                              |
| `FlickeringGrid`       | Controlled ambient motion.                         |
| `AnimatedGridPattern`  | Optional animated hero backdrop.                   |
| `Particles`            | Sparse ambient particles.                          |
| `NoiseTexture`         | Premium grain over glass panels.                   |
| `ProgressiveBlur`      | Sticky header fade and scroll edge masks.          |
| `AnimatedThemeToggler` | Theme toggle.                                      |
| `HyperText`            | Animated microcopy or terminal-like labels.        |
| `TypingAnimation`      | Optional terminal snippet animation.               |
| `ScrollProgress`       | Article reading progress.                          |
| `LightRays`            | Optional global background accent, used sparingly. |

---

## 11. Icons

Use `lucide-react` for generic UI icons and `react-icons/si` or custom SVGs for brand/technology icons.

### Lucide icons

Use these for core UI:

```ts
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Github,
  Headphones,
  Home,
  Lightbulb,
  ListFilter,
  MapPin,
  Menu,
  Pause,
  Play,
  Rocket,
  Search,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
```

### Technology icons

Use simple colored icon tiles. Do not let technology logos dominate the composition.

Recommended sources:

- `react-icons/si`
- Inline custom SVGs for the SP logo
- Fallback `Code2` icon for unknown tech

---

## 12. Shared Custom Components

These are the custom components to build on top of shadcn and Magic UI.

### Layout components

| Component       | Built from                       | Purpose                                         |
| --------------- | -------------------------------- | ----------------------------------------------- |
| `SiteShell`     | Custom                           | Global page wrapper.                            |
| `PageBackdrop`  | Magic UI + CSS                   | Shared background orbs, particles, grid, noise. |
| `SiteHeader`    | shadcn `NavigationMenu`, `Sheet` | Desktop/mobile site header.                     |
| `DesktopNav`    | `NavigationMenu`                 | Home, Blog, Projects, GitHub.                   |
| `MobileNav`     | `Sheet`, `Button`                | Mobile navigation.                              |
| `FooterTagline` | Custom                           | “Always learning. Always building.”             |
| `SectionShell`  | Custom                           | Width, padding, responsive spacing.             |
| `SectionHeader` | Custom + `Separator`             | Eyebrow/title/subtitle.                         |

### Brand components

| Component           | Built from                   | Purpose                                 |
| ------------------- | ---------------------------- | --------------------------------------- |
| `SPLogo`            | Custom SVG/text              | Gradient SP logo.                       |
| `GradientHeading`   | Magic/UI CSS                 | Large gradient heading.                 |
| `EyebrowPill`       | `Badge`                      | “Developer • Builder • Problem Solver”. |
| `ThemeToggleButton` | Magic `AnimatedThemeToggler` | Header theme control.                   |

### Glass components

| Component     | Built from                             | Purpose                     |
| ------------- | -------------------------------------- | --------------------------- |
| `GlassPanel`  | shadcn `Card` + CSS                    | Reusable frosted panel.     |
| `GlassCard`   | shadcn `Card` + Magic `MagicCard`      | Interactive glass card.     |
| `NeonCard`    | Magic `NeonGradientCard`, `BorderBeam` | Featured card shell.        |
| `GradientOrb` | CSS                                    | Decorative background orb.  |
| `GridAccent`  | Magic `GridPattern` or CSS             | Generic decorative pattern. |

### Shared UI components

| Component            | Built from                   | Purpose                             |
| -------------------- | ---------------------------- | ----------------------------------- |
| `IconTile`           | Custom                       | Square icon holder.                 |
| `MetaPill`           | `Badge`                      | Date, read time, location.          |
| `TechBadge`          | `Badge`                      | Technology pill with optional icon. |
| `TechStack`          | `TechBadge[]`                | Group of tech tags.                 |
| `SearchField`        | `InputGroup`, `Input`, `Kbd` | Generic search.                     |
| `FilterChips`        | `ToggleGroup` or `Tabs`      | Filters/categories.                 |
| `SortSelect`         | `Select`                     | Sorting.                            |
| `ExternalLinkButton` | `Button`, `Tooltip`          | External link action.               |
| `GitHubCTA`          | `Card`, `Button`             | GitHub promo/discussion card.       |
| `EmptyResults`       | `Empty`                      | No results state.                   |
| `LoadingCardGrid`    | `Skeleton`                   | Loading state.                      |

---

## 13. Home Page Specification

### Purpose

Present Steve as a full-stack developer from Cambridge with a bold, premium hero and a clear stack overview.

### Layout

1. Header/navigation
2. Hero section
3. Technology section
4. Footer tagline

### Components

| Component                | Type   | Built from                                                  |
| ------------------------ | ------ | ----------------------------------------------------------- |
| `HomePage`               | Route  | `SiteShell`, `HomeHero`, `TechnologiesSection`              |
| `HomeHero`               | Custom | `SectionShell`, `HeroIntro`, `HeroVisualPanel`              |
| `HeroIntro`              | Custom | `EyebrowPill`, `GradientHeading`, body copy                 |
| `HeroActionGroup`        | Custom | shadcn `Button`, Magic `ShimmerButton`                      |
| `HeroVisualPanel`        | Custom | `NeonCard`, `Terminal`, subtle Cambridge/location reference |
| `LocationBadge`          | Custom | `Badge`, `MapPin`                                           |
| `PrinciplesFloatingCard` | Custom | `GlassPanel`, `Code2`                                       |
| `TechnologiesSection`    | Custom | `SectionHeader`, `TechnologyGroupCard[]`                    |
| `TechnologyGroupCard`    | Custom | `GlassCard`, `TechBadge`                                    |

### Notes

- The Home hero can have a richer visual than article pages because it is a single reusable landing composition.
- Use the terminal/code snippet as the hero visual rather than a heavy bespoke illustration.
- The technology cards should have subtle decoration only.

---

## 14. Blog Index Specification

### Purpose

Show the posts as a polished editorial index with search and filters.

### Layout

1. Header/navigation
2. Blog title and description
3. Search and category filters
4. Featured article
5. Post grid/list
6. GitHub CTA
7. Footer tagline

### Components

| Component             | Type   | Built from                           |
| --------------------- | ------ | ------------------------------------ |
| `BlogPage`            | Route  | `SiteShell`, `BlogHero`, `BlogIndex` |
| `BlogHero`            | Custom | `GradientHeading`, body copy         |
| `BlogToolbar`         | Custom | `SearchField`, `FilterChips`         |
| `BlogCategoryTabs`    | Custom | `Tabs` or `ToggleGroup`              |
| `FeaturedArticleCard` | Custom | `NeonCard`, `Badge`, `Button`        |
| `PostGrid`            | Custom | CSS grid                             |
| `BlogPostCard`        | Custom | shadcn `Card` or `Item`              |
| `PostMeta`            | Custom | `Calendar`, `Clock`, `Badge`         |
| `BlogCTASection`      | Custom | `GitHubCTA`                          |
| `BlogPagination`      | Custom | `Pagination`                         |
| `BlogEmptyResults`    | Custom | `Empty`                              |
| `BlogSkeletonGrid`    | Custom | `Skeleton`                           |

### Filter categories

Use a compact generic set:

- All
- JavaScript
- Web Dev
- AI
- Career
- DevOps
- Tools
- Finance
- React

---

## 15. Projects Page Specification

### Purpose

Showcase shipped work, featured projects, search, filters, and a compact project grid.

### Layout

1. Header/navigation
2. Projects hero with stats
3. Featured projects
4. Filters/search/sort
5. Project grid
6. Footer tagline

### Components

| Component                  | Type            | Built from                                     |
| -------------------------- | --------------- | ---------------------------------------------- |
| `ProjectsPage`             | Route           | `SiteShell`, `ProjectsHero`, `ProjectsIndex`   |
| `ProjectsHero`             | Custom          | `GradientHeading`, `StatsGlassStrip`           |
| `StatsGlassStrip`          | Custom          | `GlassPanel`, Magic `NumberTicker`             |
| `FeaturedProjectsGrid`     | Custom          | `FeaturedProjectCard[]`                        |
| `FeaturedProjectCard`      | Custom          | `NeonCard`, `AspectRatio`, `Button`            |
| `ProjectThumbnail`         | Custom          | `AspectRatio`, gradient overlay                |
| `ProjectToolbar`           | Custom          | `FilterChips`, `SearchField`, `SortSelect`     |
| `ProjectGrid`              | Custom          | Responsive CSS grid                            |
| `ProjectCard`              | Custom          | `GlassCard`, `TechStack`, `ExternalLinkButton` |
| `ProjectDetailDialog`      | Optional        | `Dialog`                                       |
| `ProjectDetailDrawer`      | Optional        | `Drawer`                                       |
| `FeaturedProjectsCarousel` | Mobile optional | `Carousel`                                     |

### Project card structure

Each project card should include:

- Icon tile
- Project title
- Category
- External link icon
- 2–3 technology badges
- Subtle hover glow

Do not require every project to have a screenshot.

---

## 16. Generic Article Page Specification

### Purpose

Create a reusable blog post layout that works for every article type and follows the existing markdown structure.

The uploaded example markdown shows a reliable pattern:

- Frontmatter with `title`, `date`, `type`, and `action`
- Optional audio block near the top
- Useful links
- Markdown headings
- Paragraphs
- Code blocks
- Horizontal separators

The design should support this structure without requiring per-post art.

### Non-negotiable article rules

1. **No navbar inside the article design mockup or article content area**
   The global site header can exist in the actual app shell, but the article layout component itself should not include one.

2. **No mandatory hero image**
   Articles should work with only title, date, type, read time, audio, links, and body content.

3. **Generic right-side decoration only**
   If the header needs balance, use a reusable abstract grid/capsule accent. Do not create a custom illustration for each article.

4. **Audio player must be simple CSS**
   Use a basic progress line, play/pause button, speed control, and duration. No waveform.

5. **Code blocks must be a primary design feature**
   Code needs a custom theme matching the neon-glass design.

### Article layout order

1. Breadcrumbs
2. Type/category chip
3. Article title
4. Metadata row
5. Summary/excerpt
6. Audio player, if audio exists
7. Useful links, if links exist
8. Article body
9. Supporting summary cards
10. Previous/next article navigation
11. Discussion/GitHub CTA

### Article components

| Component              | Type           | Built from                                 |
| ---------------------- | -------------- | ------------------------------------------ |
| `ArticlePage`          | Route          | `ArticleShell`, MDX renderer               |
| `ArticleShell`         | Custom         | `SectionShell`, max-width content wrapper  |
| `ArticleHeader`        | Custom         | `Breadcrumb`, `Badge`, `GradientHeading`   |
| `ArticleBreadcrumbs`   | shadcn wrapper | `Breadcrumb`                               |
| `ArticleTypeBadge`     | Custom         | `Badge`, type icon                         |
| `ArticleMetaRow`       | Custom         | `Calendar`, `Clock`, `Github`, `Separator` |
| `ArticleSummary`       | Custom         | styled paragraph                           |
| `ArticleHeaderAccent`  | Custom         | CSS grid/capsule; generic only             |
| `ArticleAudioPlayer`   | Custom         | `Slider`, `Button`, `Popover`/`Select`     |
| `UsefulLinks`          | Custom         | `UsefulLinkCard[]`                         |
| `UsefulLinkCard`       | Custom         | `GlassCard`, `ExternalLink`                |
| `ArticleProse`         | Custom         | `typography` classes + MDX components      |
| `CodeBlock`            | Custom         | `ScrollArea`, `Button`, syntax highlighter |
| `InlineCode`           | Custom         | styled `code`                              |
| `ArticleCallout`       | Custom         | shadcn `Alert`                             |
| `ArticleTakeaways`     | Custom         | `GlassPanel`, checklist                    |
| `ArticlePager`         | Custom         | previous/next cards                        |
| `ArticleDiscussionCTA` | Custom         | `GitHubCTA`                                |
| `ReadingProgress`      | Magic UI       | `ScrollProgress`                           |

---

## 17. Article Data Model

### Frontmatter

```ts
export type BlogPostFrontmatter = {
  title: string
  date: string
  type: BlogPostType
  action?: 'copy' | 'none'
  excerpt?: string
  audio?: string
  links?: BlogPostLink[]
  tags?: string[]
  featured?: boolean
  draft?: boolean
}

export type BlogPostType =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'web-dev'
  | 'ai'
  | 'career'
  | 'devops'
  | 'tools'
  | 'finance'
  | 'personal'
  | 'tutorial'
  | 'default'

export type BlogPostLink = {
  label: string
  href: string
  description?: string
  icon?: 'github' | 'docs' | 'external' | 'source' | 'demo'
}
```

### Example post frontmatter upgrade

Current markdown-like structure:

```md
---
title: How to scrape a youtube channel with puppeteer
date: '2021-04-14T18:26:40.230Z'
type: 'javascript'
action: 'copy'
---
```

Recommended richer version:

```md
---
title: How to scrape a youtube channel with puppeteer
date: '2021-04-14T18:26:40.230Z'
type: 'javascript'
action: 'copy'
excerpt: 'A practical guide to scraping YouTube channels with Puppeteer when the YouTube Data API limits are too restrictive.'
audio: './how-to-scrape-a-youtube-channel-with-puppeteer.mp3'
links:
  - label: Example on GitHub
    href: https://github.com/SPDUK/random-workout/blob/main/scraper/index.js
    description: See the full example project
    icon: github
  - label: Puppeteer
    href: https://github.com/puppeteer/puppeteer
    description: Headless Chrome Node API
    icon: docs
---
```

### Type theme map

```ts
export const blogTypeTheme = {
  javascript: {
    label: 'JavaScript',
    icon: 'SiJavascript',
    accent: 'var(--neon-yellow)',
    className: 'border-yellow-300/30 bg-yellow-300/10 text-yellow-100',
  },
  typescript: {
    label: 'TypeScript',
    icon: 'SiTypescript',
    accent: 'var(--neon-blue)',
    className: 'border-blue-300/30 bg-blue-300/10 text-blue-100',
  },
  react: {
    label: 'React',
    icon: 'SiReact',
    accent: 'var(--neon-cyan)',
    className: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  },
  ai: {
    label: 'AI',
    icon: 'Sparkles',
    accent: 'var(--neon-magenta)',
    className: 'border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100',
  },
  career: {
    label: 'Career',
    icon: 'UserRound',
    accent: 'var(--neon-violet)',
    className: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
  },
  devops: {
    label: 'DevOps',
    icon: 'Cloud',
    accent: 'var(--neon-cyan)',
    className: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
  },
  finance: {
    label: 'Finance',
    icon: 'TrendingUp',
    accent: 'var(--neon-green)',
    className: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
  },
  default: {
    label: 'Article',
    icon: 'BookOpen',
    accent: 'var(--neon-blue)',
    className: 'border-blue-300/30 bg-blue-300/10 text-blue-100',
  },
} as const
```

---

## 18. Article Header Design

### Desktop layout

```txt
ArticleShell
└── ArticleHeader
    ├── Breadcrumbs
    ├── TypeBadge
    ├── h1
    ├── MetadataRow
    ├── Summary
    └── GenericHeaderAccent
```

### Header visual notes

- Use a max-width article container, for example `max-w-5xl`.
- Title should be large but not poster-like.
- Avoid a custom image/illustration block.
- Use a reusable subtle grid accent on the right side for visual balance.
- The header accent can be hidden on small screens.

### Example header JSX

```tsx
export function ArticleHeader({ post }: { post: BlogPost }) {
  const type = blogTypeTheme[post.type] ?? blogTypeTheme.default

  return (
    <header className="relative mx-auto max-w-5xl pt-20 pb-10">
      <div className="absolute right-0 top-12 hidden h-48 w-64 content-grid-accent opacity-60 lg:block" />

      <ArticleBreadcrumbs
        items={[
          { label: 'Blog', href: '/blog' },
          { label: type.label, href: `/blog?type=${post.type}` },
          { label: 'Tutorial' },
        ]}
      />

      <ArticleTypeBadge type={post.type} className="mt-8" />

      <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
        {post.title}
      </h1>

      <ArticleMetaRow post={post} className="mt-6" />

      {post.excerpt ? (
        <p className="mt-8 max-w-3xl text-xl leading-8 text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}
    </header>
  )
}
```

---

## 19. Minimal Article Audio Player

### Requirements

The audio player should replace the default browser audio element with a themed but achievable control.

Do:

- Use a circular play/pause button.
- Use a single thin progress line.
- Show current time and duration.
- Include speed control.
- Include volume icon and optional volume slider.
- Use standard CSS and React state.

Do not:

- Use waveform rendering.
- Require canvas.
- Require per-post audio art.
- Overdesign the player.

### Component structure

```txt
ArticleAudioPlayer
├── Header row
│   ├── Headphones icon
│   ├── “Listen to this post”
│   └── “AI narration” badge
└── Controls row
    ├── Play/Pause button
    ├── Current time
    ├── Slider progress
    ├── Duration
    ├── Speed select/popover
    └── Volume icon
```

### JSX skeleton

```tsx
'use client'

import { useRef, useState } from 'react'
import { Headphones, Pause, Play, Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ArticleAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  return (
    <section className="glass-panel-strong rounded-2xl p-5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
        onTimeUpdate={event => {
          const audio = event.currentTarget
          setProgress((audio.currentTime / audio.duration) * 100 || 0)
        }}
      />

      <div className="mb-5 flex items-center gap-3">
        <Headphones className="size-5 text-neon-cyan" />
        <h2 className="text-lg font-semibold">Listen to this post</h2>
        <Badge
          variant="outline"
          className="border-neon-violet/30 bg-neon-violet/10 text-neon-violet"
        >
          AI narration
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="neon"
          size="icon"
          className="size-12 rounded-full"
          onClick={toggle}
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
        </Button>

        <span className="w-12 text-sm tabular-nums text-muted-foreground">
          00:00
        </span>

        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          className="flex-1"
          onValueChange={([value]) => {
            const audio = audioRef.current
            if (!audio || !duration) return
            audio.currentTime = (value / 100) * duration
            setProgress(value)
          }}
        />

        <span className="w-12 text-sm tabular-nums text-muted-foreground">
          07:28
        </span>

        <Select
          defaultValue="1"
          onValueChange={value => {
            if (audioRef.current) audioRef.current.playbackRate = Number(value)
          }}
        >
          <SelectTrigger className="w-20 border-glass-border bg-glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.75">0.75x</SelectItem>
            <SelectItem value="1">1.0x</SelectItem>
            <SelectItem value="1.25">1.25x</SelectItem>
            <SelectItem value="1.5">1.5x</SelectItem>
            <SelectItem value="2">2.0x</SelectItem>
          </SelectContent>
        </Select>

        <Volume2 className="size-5 text-muted-foreground" />
      </div>
    </section>
  )
}
```

---

## 20. Useful Links Module

### Purpose

Many posts include one or more links near the top. Render them as compact glass link cards.

### Component structure

```txt
UsefulLinks
├── Heading
└── Link grid
    ├── UsefulLinkCard
    ├── UsefulLinkCard
    └── UsefulLinkCard
```

### Card contents

- Icon
- Label
- Description
- External arrow

### Example

```tsx
export function UsefulLinkCard({ link }: { link: BlogPostLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="glass-panel group flex items-center gap-4 rounded-2xl p-4 transition hover:border-neon-cyan/40 hover:bg-glass-strong"
    >
      <IconTile icon={link.icon ?? 'external'} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-foreground">
          {link.label}
        </span>
        {link.description ? (
          <span className="mt-1 block text-sm text-muted-foreground">
            {link.description}
          </span>
        ) : null}
      </span>
      <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-neon-cyan" />
    </a>
  )
}
```

---

## 21. Article Typography

### Content width

Use:

```txt
max-w-3xl for prose
max-w-5xl for header, links, audio, and nav cards
```

### Type scale

| Element       | Class direction                                                  |
| ------------- | ---------------------------------------------------------------- |
| Article title | `text-5xl md:text-7xl font-semibold tracking-tight text-balance` |
| H2            | `text-3xl md:text-4xl font-semibold tracking-tight`              |
| H3            | `text-2xl font-semibold`                                         |
| Body          | `text-lg leading-8 text-muted-foreground`                        |
| Metadata      | `text-sm text-muted-foreground`                                  |
| Inline code   | glass pill style with neon text                                  |

### Article prose wrapper

```tsx
<article className="prose prose-invert prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-p:text-muted-foreground prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:text-neon-blue prose-strong:text-foreground prose-code:text-neon-cyan">
  {children}
</article>
```

If not using Tailwind Typography, create your own `.article-prose` class instead.

---

## 22. Article Callouts

Use shadcn `Alert` as the base and customize visually.

### Callout variants

| Variant   | Use                         | Accent      |
| --------- | --------------------------- | ----------- |
| `idea`    | Key idea/explanation        | Cyan/blue   |
| `warning` | Caveats or breaking changes | Orange      |
| `note`    | Helpful context             | Violet      |
| `success` | Final result                | Green       |
| `danger`  | Risky action                | Red/magenta |

### Example

```tsx
export function ArticleCallout({
  variant = 'idea',
  title,
  children,
}: ArticleCalloutProps) {
  return (
    <Alert className="glass-panel my-8 rounded-2xl border-neon-cyan/25 p-5">
      <Lightbulb className="size-5 text-neon-cyan" />
      <AlertTitle className="text-neon-cyan">{title}</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        {children}
      </AlertDescription>
    </Alert>
  )
}
```

---

## 23. Code Block Color Scheme

Code blocks should visually match the neon-glass theme and be beautiful enough to feel like a signature part of the site.

### Code block requirements

- Dark terminal-like surface
- Rounded corners
- Subtle cyan/violet border
- Top bar with language tag and filename
- Copy button
- Line numbers
- Horizontally scrollable content
- Syntax colors that match the palette

### Syntax palette

| Syntax role  | CSS variable      | Color direction       |
| ------------ | ----------------- | --------------------- |
| Background   | `--code-bg`       | Deep transparent navy |
| Border       | `--code-border`   | Cyan glass border     |
| Line numbers | `--code-line`     | Muted blue-grey       |
| Comments     | `--code-comment`  | Muted blue-grey       |
| Keywords     | `--code-keyword`  | Magenta/pink          |
| Functions    | `--code-function` | Cyan                  |
| Strings      | `--code-string`   | Aqua green            |
| Variables    | `--code-variable` | Ice white             |
| Numbers      | `--code-number`   | JS yellow             |
| Operators    | `--code-operator` | Violet                |

### Code block component structure

```txt
CodeBlock
├── TopBar
│   ├── Language badge
│   ├── Filename
│   └── Copy button
└── ScrollArea
    └── pre > code
```

### Example JSX

```tsx
export function CodeBlock({ code, language = 'js', filename }: CodeBlockProps) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-code-border bg-code-bg shadow-glass">
      <figcaption className="flex items-center justify-between border-b border-code-border bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-neon-yellow px-2 py-1 text-xs font-bold text-black">
            {language.toUpperCase()}
          </span>
          {filename ? (
            <span className="text-sm text-muted-foreground">{filename}</span>
          ) : null}
        </div>

        <Button variant="copy" size="sm">
          <Copy className="size-4" />
          Copy
        </Button>
      </figcaption>

      <ScrollArea className="w-full">
        <pre className="overflow-x-auto p-5 text-sm leading-7">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </figure>
  )
}
```

### Recommended highlighter

Use one of:

- Shiki
- `rehype-pretty-code`
- `react-syntax-highlighter`, if simpler

Preferred: `rehype-pretty-code` with Shiki, because it integrates well with MDX and supports theme customization.

---

## 24. Generic Article Layout Example

This is the target visual structure for the example article without requiring custom top-right artwork.

```txt
Blog / JavaScript / Tutorial

[JS] JavaScript

How to scrape a youtube channel with puppeteer

Over 4 years ago • 7 min read • Suggest edit on GitHub

A practical guide to scraping YouTube channels with Puppeteer when the YouTube Data API limits are too restrictive.

┌────────────────────────────────────────────────────────────┐
│ 🎧 Listen to this post                 [AI narration]       │
│ ▶ 00:00 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 07:28 [1.0x] 🔊       │
└────────────────────────────────────────────────────────────┘

Useful links
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ GitHub example │ │ Puppeteer docs │ │ Article source │
└────────────────┘ └────────────────┘ └────────────────┘

1. Introduction
Paragraph text...

┌────────────────────────────────────────────────────────────┐
│ 💡 Key idea                                                │
│ YouTube lazily loads video data as you scroll...           │
└────────────────────────────────────────────────────────────┘

2. Starting puppeteer and opening a youtube channel
Paragraph text...

┌────────────────────────────────────────────────────────────┐
│ JS scrape-workouts.js                              [Copy]   │
│ 1 const puppeteer = require('puppeteer');                  │
│ 2 ...                                                      │
└────────────────────────────────────────────────────────────┘

3. After goToPageAndLoadAllVideoData finishes
Paragraph text...

┌────────────────────────────────────────────────────────────┐
│ JS go-to-page.js                                  [Copy]    │
│ 1 async function goToPageAndLoadAllVideoData(...) {        │
│ 2 ...                                                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────┐ ┌────────────────────────────┐
│ Why this works             │ │ Takeaways                  │
└────────────────────────────┘ └────────────────────────────┘

┌ Previous article ┐ ┌ Discuss on GitHub ┐ ┌ Next article ┐
```

---

## 25. Home, Blog, Projects, Article Routes

```txt
app/
  layout.tsx
  page.tsx
  blog/
    page.tsx
    [slug]/
      page.tsx
  projects/
    page.tsx
```

---

## 26. Recommended Folder Structure

```txt
app/
  layout.tsx
  page.tsx
  blog/
    page.tsx
    [slug]/
      page.tsx
  projects/
    page.tsx

components/
  layout/
    site-shell.tsx
    site-header.tsx
    desktop-nav.tsx
    mobile-nav.tsx
    page-backdrop.tsx
    footer-tagline.tsx

  brand/
    sp-logo.tsx
    gradient-heading.tsx
    eyebrow-pill.tsx

  glass/
    glass-panel.tsx
    glass-card.tsx
    neon-card.tsx
    gradient-orb.tsx
    grid-accent.tsx

  shared/
    icon-tile.tsx
    meta-pill.tsx
    tech-badge.tsx
    tech-stack.tsx
    search-field.tsx
    filter-chips.tsx
    sort-select.tsx
    external-link-button.tsx
    github-cta.tsx
    empty-results.tsx
    loading-card-grid.tsx

  home/
    home-hero.tsx
    hero-intro.tsx
    hero-action-group.tsx
    hero-visual-panel.tsx
    hero-terminal-snippet.tsx
    principles-floating-card.tsx
    technologies-section.tsx
    technology-group-card.tsx

  blog/
    blog-hero.tsx
    blog-toolbar.tsx
    featured-article-card.tsx
    post-grid.tsx
    blog-post-card.tsx
    post-meta.tsx
    blog-cta-section.tsx

  article/
    article-shell.tsx
    article-header.tsx
    article-breadcrumbs.tsx
    article-type-badge.tsx
    article-meta-row.tsx
    article-header-accent.tsx
    article-audio-player.tsx
    useful-links.tsx
    useful-link-card.tsx
    article-prose.tsx
    article-callout.tsx
    article-takeaways.tsx
    article-pager.tsx
    code-block.tsx
    inline-code.tsx
    reading-progress.tsx

  projects/
    projects-hero.tsx
    stats-glass-strip.tsx
    featured-projects-grid.tsx
    featured-project-card.tsx
    project-toolbar.tsx
    project-grid.tsx
    project-card.tsx
    project-detail-dialog.tsx
    project-detail-drawer.tsx

  ui/
    shadcn components...
    magicui components...

data/
  navigation.ts
  technologies.ts
  posts.ts
  projects.ts

lib/
  utils.ts
  filters.ts
  icons.ts
  mdx.ts
  reading-time.ts
  format-date.ts
  copy.ts

content/
  blog/
    how-to-scrape-a-youtube-channel-with-puppeteer.md
```

---

## 27. Navigation System

### Desktop nav

Use shadcn `NavigationMenu`.

Items:

- Home
- Blog
- Projects
- GitHub

### Mobile nav

Use shadcn `Sheet`.

Include:

- Logo
- Main nav links
- GitHub link
- Theme toggle

### Active state

Use:

- Text color: `text-neon-cyan`
- Underline glow: cyan/blue gradient
- Background: subtle glass

---

## 28. Page Background System

`PageBackdrop` should be shared across pages.

### Layers

1. Base background from `body`
2. Large blurred `GradientOrb` components
3. Magic UI `DotPattern` or `GridPattern`
4. Optional `Particles`
5. Optional `NoiseTexture`

### Rules

- Motion should be subtle.
- Disable or reduce heavy animations on mobile.
- Respect `prefers-reduced-motion`.
- Keep text areas clear.

### Example

```tsx
export function PageBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[-12rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-neon-blue/20 blur-3xl" />
      <div className="absolute right-[-10rem] top-1/4 h-[34rem] w-[34rem] rounded-full bg-neon-purple/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.55))]" />
    </div>
  )
}
```

---

## 29. Responsive Rules

### Breakpoints

| Breakpoint   | Behavior                                                  |
| ------------ | --------------------------------------------------------- |
| `< 640px`    | Single column, reduced glow, no large decorative accents. |
| `640–1024px` | Two-column cards where appropriate.                       |
| `> 1024px`   | Full hero layouts, featured grids, decorative accents.    |

### Mobile article rules

- Header title: `text-4xl` instead of `text-7xl`.
- Audio player controls wrap naturally.
- Useful links become single column.
- Code blocks scroll horizontally.
- Bottom article pager stacks vertically.

---

## 30. Accessibility Rules

1. All decorative background components must have `aria-hidden="true"`.
2. Buttons must have accessible labels when icon-only.
3. Audio player must be keyboard operable.
4. Slider must expose accessible label/value.
5. Copy buttons must announce success through Sonner toast.
6. Color should not be the only indicator of active state.
7. Article body should keep strong contrast.
8. Respect `prefers-reduced-motion`.
9. External links should indicate they open a new page when needed.
10. Heading hierarchy must be valid: one `h1`, then `h2`, `h3`, etc.

---

## 31. Animation Rules

Use animation to create polish, not distraction.

### Recommended

- `BlurFade` for page sections
- `BorderBeam` only on featured cards
- `MagicCard` hover glow for project cards
- `NumberTicker` for project stats
- `ScrollProgress` on article pages
- Subtle particles in the background

### Avoid

- Animating every card continuously
- Heavy cursor effects on article pages
- Large motion near code or body text
- Waveform animation for audio
- Bespoke hero art per article

---

## 32. Content Data Examples

### Technologies

```ts
export const technologies = [
  {
    title: 'Front End',
    icon: 'LayoutTemplate',
    items: [
      'JavaScript',
      'TypeScript',
      'React',
      'Redux',
      'GraphQL',
      'Gatsby',
      'CSS',
      'Sass',
    ],
  },
  {
    title: 'Back End',
    icon: 'ServerCog',
    items: [
      'Node.js',
      'Ruby',
      'Rails',
      'Elixir',
      'Phoenix',
      'Crystal',
      'MongoDB',
      'PostgreSQL',
    ],
  },
  {
    title: 'DevOps & Tools',
    icon: 'Cloud',
    items: [
      'Heroku',
      'Docker',
      'Webpack',
      'AWS',
      'DigitalOcean',
      'Git',
      'Ubuntu',
      'VS Code',
    ],
  },
]
```

### Projects

```ts
export const projects = [
  {
    title: 'Youtube Subscription Downloader',
    featured: true,
    category: 'Tool',
    technologies: ['Electron', 'JavaScript', 'YouTube API'],
    href: '#',
  },
  {
    title: 'PoE Wishlist',
    featured: true,
    category: 'Web App',
    technologies: ['Ruby', 'Rails', 'PostgreSQL'],
    href: '#',
  },
  {
    title: 'Slushy.gg',
    category: 'Web App',
    technologies: ['Next.js', 'Tailwind', 'PostgreSQL'],
    href: '#',
  },
]
```

### Blog posts

```ts
export const posts = [
  {
    title: 'How to scrape a youtube channel with puppeteer',
    slug: 'how-to-scrape-a-youtube-channel-with-puppeteer',
    date: '2021-04-14T18:26:40.230Z',
    type: 'javascript',
    readTime: '7 min read',
    excerpt:
      'A practical guide to scraping YouTube channels with Puppeteer when the YouTube Data API limits are too restrictive.',
  },
]
```

---

## 33. Implementation Priority

### Phase 1: Foundation

1. Install shadcn.
2. Add the shadcn components listed above.
3. Add the global CSS theme tokens.
4. Create `SiteShell`, `PageBackdrop`, `GlassPanel`, `GradientHeading`.
5. Add icons and type maps.

### Phase 2: Main pages

1. Build Home page.
2. Build Blog index.
3. Build Projects page.
4. Add responsive behavior.

### Phase 3: Article system

1. Build Markdown/MDX pipeline.
2. Build `ArticleHeader`.
3. Build `ArticleAudioPlayer`.
4. Build `UsefulLinks`.
5. Build `CodeBlock`.
6. Build `ArticleCallout`.
7. Build previous/next article navigation.

### Phase 4: Polish

1. Add Magic UI background accents.
2. Add Magic UI card effects.
3. Add scroll progress.
4. Add Sonner copy toasts.
5. Add loading and empty states.
6. Run accessibility checks.

---

## 34. Final Component Inventory

### shadcn components

```txt
accordion
alert
aspect-ratio
badge
breadcrumb
button
button-group
card
carousel
command
dialog
drawer
dropdown-menu
empty
hover-card
input
input-group
item
kbd
navigation-menu
pagination
popover
scroll-area
select
separator
sheet
skeleton
slider
sonner
switch
table
tabs
toggle
toggle-group
tooltip
typography
```

### Magic UI components

```txt
animated-gradient-text
aurora-text
shimmer-button
rainbow-button
neon-gradient-card
magic-card
border-beam
shine-border
glare-hover
blur-fade
number-ticker
terminal
dot-pattern
grid-pattern
flickering-grid
animated-grid-pattern
particles
noise-texture
progressive-blur
animated-theme-toggler
hyper-text
typing-animation
scroll-progress
light-rays
```

### Custom components

```txt
SiteShell
PageBackdrop
SiteHeader
DesktopNav
MobileNav
FooterTagline
SectionShell
SectionHeader
SPLogo
GradientHeading
EyebrowPill
ThemeToggleButton
GlassPanel
GlassCard
NeonCard
GradientOrb
GridAccent
IconTile
MetaPill
TechBadge
TechStack
SearchField
FilterChips
SortSelect
ExternalLinkButton
GitHubCTA
EmptyResults
LoadingCardGrid
HomePage
HomeHero
HeroIntro
HeroActionGroup
HeroVisualPanel
HeroTerminalSnippet
PrinciplesFloatingCard
TechnologiesSection
TechnologyGroupCard
BlogPage
BlogHero
BlogToolbar
FeaturedArticleCard
PostGrid
BlogPostCard
PostMeta
BlogCTASection
ProjectsPage
ProjectsHero
StatsGlassStrip
FeaturedProjectsGrid
FeaturedProjectCard
ProjectToolbar
ProjectGrid
ProjectCard
ProjectDetailDialog
ProjectDetailDrawer
ArticlePage
ArticleShell
ArticleHeader
ArticleBreadcrumbs
ArticleTypeBadge
ArticleMetaRow
ArticleSummary
ArticleHeaderAccent
ArticleAudioPlayer
UsefulLinks
UsefulLinkCard
ArticleProse
ArticleCallout
ArticleTakeaways
ArticlePager
ArticleDiscussionCTA
ReadingProgress
CodeBlock
InlineCode
```

---

## 35. Design QA Checklist

Use this checklist before shipping.

### Visual

- [ ] Dark-first background looks premium, not flat black.
- [ ] Glass panels are translucent but readable.
- [ ] Neon glows are controlled and not muddy.
- [ ] Page hierarchy is clear.
- [ ] Article layout does not depend on a custom hero image.
- [ ] Audio player is minimal and CSS-achievable.
- [ ] Code blocks match the theme.

### UX

- [ ] Navigation active state is clear.
- [ ] Search/filter controls work on mobile and desktop.
- [ ] Project cards have clear external actions.
- [ ] Blog cards show title, type, and date clearly.
- [ ] Article pages show title, date, type, read time, links, and content clearly.
- [ ] Copy buttons work and show toast feedback.

### Accessibility

- [ ] Keyboard navigation works.
- [ ] Focus rings are visible.
- [ ] Audio player controls are labelled.
- [ ] Contrast passes for body text and metadata.
- [ ] Decorative elements are `aria-hidden`.
- [ ] Motion is reduced when requested.

### Performance

- [ ] Background animations are lightweight.
- [ ] Heavy Magic UI effects are not used everywhere.
- [ ] Images are optimized.
- [ ] Code highlighting is rendered efficiently.
- [ ] Article pages do not load unnecessary project/blog index scripts.

---

## 36. External Documentation References

These docs are useful when implementing the spec:

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [shadcn CLI changelog / docs command](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- [shadcn Slider](https://ui.shadcn.com/docs/components/radix/slider)
- [shadcn Alert](https://ui.shadcn.com/docs/components/radix/alert)
- [shadcn Typography](https://ui.shadcn.com/docs/components/radix/typography)
- [Magic UI Installation](https://magicui.design/docs/installation)
- [Magic UI Components](https://magicui.design/docs/components)
- [Magic UI Border Beam](https://magicui.design/docs/components/border-beam)
- [Magic UI Scroll Progress](https://magicui.design/docs/components/scroll-progress)
- [Magic UI Theme Toggler](https://magicui.design/docs/components/animated-theme-toggler)

---

## 37. Closing Direction

This redesign should feel bold and unique at the system level, not through one-off art. The winning implementation will come from a strong token system, beautifully styled reusable cards, highly polished code blocks, a restrained audio player, and consistent glass/neon interaction states across Home, Blog, Projects, and Article pages.
