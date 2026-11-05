# Eclipse desktop specification

## Product

The portfolio opens into a personal operating-system workspace. Its purpose is to make Steve's work easy to discover while rewarding exploration. The visual identity uses neutral charcoal chrome with crimson accents, informed by Unix desktop customization and dark fantasy. Artwork keeps its original colors. Reference sheets guide atmosphere, not exact composition. No theme selector or light palette ships.

## Visual system

Use the values in `eclipse-tokens.json`. Near-black surfaces, charcoal borders, neutral readable text, and red focus accents form the palette. Red marks selection, interaction, and atmosphere. Reserve bright accents for a small part of the screen. Original Eclipse, Cinder, and Red Rain scenes carry the visual weight behind quiet window surfaces.

Use self-hosted IBM Plex Sans for reading and IBM Plex Mono for shell chrome and terminal output. Preserve real colors in project screenshots, diagrams, and article media. Rebrand site icons, social previews, loading states, and navigation with the Eclipse identity.

## Desktop

A brief skippable boot sequence resolves into the Terminal. The large-screen Desktop view places About on the left and Terminal on the right. Smaller screens open a single app with a task switcher. Launching an app reveals its existing instance or creates one.

Four named views separate Desktop, Projects, Writing, and Play. Projects and Writing open alone at nearly full-screen size. The Play view opens Arcade in its own workspace. Opening Arcade from the app rail instead tiles it beside the current primary. Each view retains its arrangement. The layout is a tree of split containers and tab groups. Primary apps expose Focus and Tile controls. Tile places primary content on the left at 60% by default, with a lower bound of half the desktop stage. Secondary apps tile on the right when launched and keep the current primary visible. An explicit Tile opens Terminal if no companion is present. Minimize hides a window. Secondary windows retain floating placement, drag, grouping, and resize through Arrange controls. Insufficient space becomes a selectable tab group. Keyboard controls and menus offer alternatives to pointer gestures. Restore validated local preferences and window arrangements without blocking rendering when storage fails.

## Apps

| App        | Behavior                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| About      | Identity, current focus, selected work, contact shortcuts.                                              |
| Projects   | Search and category filters, source-derived stack metadata, document tabs, original public links.       |
| Writing    | Search and category filters, readable article view, narration where supplied.                           |
| Terminal   | Discoverable help, command history, completion, app launch, game launch, wallpaper selection, neofetch. |
| Arcade     | Snake and Breakout with keyboard and touch controls, local best scores, pause/resume, optional sound.   |
| Wallpapers | Three original static scenes with previews.                                                             |
| Settings   | Interface animations, sound, boot replay, view reset.                                                   |
| Contact    | Existing public contact channels with explicit outbound actions.                                        |
| System     | A short explanation of the site's construction at `/made-with`.                                         |

Projects and Writing preserve tabs, filters, and reading positions in the current browser session. Direct URLs take priority over saved state. Games pause when hidden and require an explicit resume. Minimize preserves a running app's state. Closing an app ends its mounted session.

## Motion and responsiveness

Use smooth window reflow, view changes, and launcher transitions. Wallpapers remain static with no particles or video. The user explicitly accepts larger JavaScript and asset sizes in exchange for visual quality. Byte budgets are guidance, not release gates. Input response, reading clarity, motion controls, and reduced-motion preferences remain requirements.

Phone layouts retain the view tabs, full app collection, and accessible controls without forcing desktop-scale windows into a narrow viewport. Avoid gesture-only functionality.

## Content and reliability

Retain Gatsby, Markdown, canonical URLs, page metadata, and server-rendered document text. Fetch document bodies on demand within persistent apps. Invalid routes show a recovery screen. App errors stay inside their window. Never execute arbitrary Terminal input as browser code or a real system command.

Verification covers layout transitions and games with unit tests, generated routes with a build audit, and user journeys in the production browser. Record limitations rather than claiming untested browser or device support.
