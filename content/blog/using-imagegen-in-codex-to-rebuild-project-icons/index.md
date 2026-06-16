---
title: Using Codex imagegen to rebuild project icons without leaving the agent
date: '2026-06-03T18:45:00.000Z'
type: 'ai'
action: 'copy'
---

I recently wanted to clean up some project icons on this site.

The nice part is that I didn't open a design tool at all.

I just used the `$imageGen` skill inside Codex and had the agent generate the icons, remove the backgrounds, save them in the correct place, update the imports, and check the projects page afterwards.

---

## The prompt was basically the workflow

The useful thing here wasn't just "AI made an image", it was that the prompt could describe the whole asset pipeline.

I wanted each icon to:

- match the same glossy neon style as the existing `fylo.png` icon
- be `256x256`
- have a real transparent background
- fit the existing dark/cyan/purple UI
- replace the old project icon automatically

So instead of generating random images and dragging them around manually, I could ask Codex for the final outcome:

```text
For each project, create a Fylo-style glossy neon icon.
Use a removable chroma-key background, remove it locally,
export the final asset as a 256x256 transparent PNG,
place it in content/assets,
then update the project metadata so the cards use the new icons.
```

That is the part that feels different to me.

Normally when I use image generation, it stops at the image. I still need to download it, rename it, resize it, remove the background, drop it into the repo, import it, check the page, realize the background isn't really transparent, go back, and repeat.

This time the agent handled the boring middle bit.

---

### Transparent backgrounds are the annoying bit

For web assets, "transparent background" is one of those things that sounds simple but is always slightly annoying.

You ask for transparency and sometimes you get:

- a checkerboard baked into the image
- a dark square behind the icon
- a soft shadow that looks bad on your actual UI
- a PNG that technically has alpha but still has a weird fringe

In this case the imagegen workflow used a flat chroma-key background first, then removed that background locally.

So the generated source image was something like:

```text
Create the icon on a perfectly flat #00ff00 background.
No shadows, no gradients, no texture, no green in the subject.
```

Then Codex ran the background removal step, cropped the visible icon, resized it to `256x256`, and wrote out a real `RGBA` PNG.

It also checked the corners of the image afterwards to make sure the alpha was actually `0`.

That sounds small, but it is exactly the type of thing I don't want to do by hand five times.

---

### It updated the code too

The images alone weren't enough, they had to be wired into the project cards.

This site imports assets through a helper file, then each project gets its display metadata from `getProjectMeta`.

So Codex added the new assets:

```tsx
import cryptoTracker from '../../content/assets/crypto-tracker.png'
import pokebattles from '../../content/assets/pokebattles.png'
import startpage from '../../content/assets/startpage.png'
import tradingPost from '../../content/assets/trading-post.png'
```

Then it swapped out the old mappings:

```tsx
Pokebattles: {
  image: pokebattles,
}

'Crypto Tracker': {
  image: cryptoTracker,
}

Startpage: {
  image: startpage,
}

'Trading Post': {
  image: tradingPost,
}
```

The snake icon already had its own asset, so that one was replaced directly.

I still think of these as my "SVG/icon" layer because they all come through the same icon helper, but in this case the final assets are transparent PNGs. That makes more sense for the glossy generated style than trying to force it into SVG paths.

---

### The important part is verification

I don't think generated assets should just be trusted blindly.

One of the first snake icons looked mostly right, but the tail had a dull grey section that didn't match the rest of the neon set. It would have been easy to miss if I just accepted the first output.

So Codex made a contact sheet, inspected the results, regenerated only the weak icon, then checked the final files:

- each one was `256x256`
- each one was `RGBA`
- each corner was transparent
- each project card loaded the expected new image
- the projects page still built correctly

That last part is what makes this workflow feel useful instead of just fun.

It didn't only make the assets. It put them into the site and proved they were being used.

---

## Why this is actually useful

This is the kind of task I normally put off.

It is not hard work, but it has lots of tiny steps:

1. decide what each icon should be
2. make or find the image
3. remove the background
4. resize it
5. compress it
6. save it with a sensible name
7. import it
8. update the mapping
9. run the build
10. check the page

None of those steps are individually difficult, but together they are enough friction that I would normally just leave the placeholder icon there for weeks.

With Codex and `$imageGen`, I could describe the end state and let the agent do the whole pass in the repo.

That's the bit I care about most with AI tooling at the moment. Not "write all my code", but remove the friction from the jobs that sit between design, assets, code, and QA.

Small polish tasks suddenly become worth doing because they don't cost an evening.

And now the project cards actually look like the projects they link to.
