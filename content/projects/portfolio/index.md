---
title: Portfolio
date: "2020-06-21T16:19:56.046Z"
featured: false
image: "./preview.jpg"
action: copy
---

#### My _old_ markdown oriented portfolio website

[Code on Github](https://github.com/SPDUK/portfolio)

---

Tools Used: [Gatsby](https://gatsbyjs.org/), [PostCSS](https://postcss.org/)

---

#### What I learned

- Brushed up on React, Hooks & Gatsby after having not used it for a while due to having a Vue job

- How to use CSS vars to create a dynamic light/dark theme

- Some niche gatsby tricks

- Re-learned some GraphQL

---

#### The homepage

![](./homepage.png)

The homepage uses [Anime.js](https://animejs.com/) for animations, the squares are simply `<div>`s styled in a few different ways, overlayed on top of each other and with varying skews and rotations. The animation itself is also random, so every time you get a slighttly different experience. The background uses SVGs which change depending on the theme being used.

---

#### Light/Dark theme

The light/dark theme switcher is quite simple, most of the code can be found [here on github](https://github.com/SPDUK/portfolio/blob/master/src/utils/theme.js). It simply checks if the user has a preferred theme set on the OS level and uses that. When changing theme it stores the preference to localStorage and that will then take priority.

One interesting issue with Gatsby is that it didn't want to play nicely with having a theme load in, I had an issue where no matter what I tried the page would always begin with the light theme, then toggle over to the dark (because the `data-theme` was set by default to light, same issue would happen but backwards otherwise.)

Apparently Dan Abramov used [this method](https://github.com/SPDUK/portfolio/blob/c5098af4eb74e4d00849fe24272bd7f042edc93b/src/html.js) by editing the default Gatsby [html.js file](https://www.gatsbyjs.org/docs/custom-html/). It fixes the issue by running the function before anything else happens, causing the initial render to show the correct theme.

---

#### Markdown files

The markdown files turn into blog/project posts. They are styled using a lightly customized version of [HiQ](https://jonathanharrell.github.io/hiq/).

HiQ is a pretty barebones "No class" type CSS framework, so it's perfect for markdown where I don't want to manually style all the different HTML elements.

I'm using CSS variables to change the colours depending on the chosen light or dark theme, together with the syntax theme of any code used using [Prism.js](https://prismjs.com/).

You can see how little effort I have to make to create the custom themes in a [single file](https://github.com/SPDUK/portfolio/blob/c5098af4eb74e4d00849fe24272bd7f042edc93b/src/styles/theme/hiq.css), thankfully HiQ even has a [theme builder](https://hiq-theme-builder.netlify.app/theme/colors) so all I need to do is provide the colours.
