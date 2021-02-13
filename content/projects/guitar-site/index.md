---
title: My Guitar Site
date: "2021-02-13T11:45:17.007Z"
featured: false
image: "./preview.png"
action: copy
---

#### A personal website to track my guitar learning and share my audio clips

[View Site](https://guitar-site.netlify.app) | [Code on Github](https://github.com/SPDUK/guitar-site)

---

Tools Used: **[React](https://www.reactjs.org)**, **[DigitalOcean](https://www.digitalocean.com)**

---

#### How I made it

I made this using a DigitalOcean space which is blob storage, a wrapper around an AWS S3 Bucket, to store my audio clips, from that storage I then used the DigitalOcean API as a "CMS" to list out all the audio files on the screen inside the React app. You can read the [How to use DigitalOcean Spaces as a CMS](/how-to-use-digitalocean-spaces-as-cms/) blog post to find out more about that 😃.

I used the [antd](https://ant.design/docs/react/introduce) react library to rapidly create the UI components, emulating a spotify layout with custom CSS on top of the library.

#### How it works

There's a single GuitarContext that handles the current song playing, loading in the audio files and whether things are loading or errored. That allows the app to have multiple pages (chords, songs etc) and a singular player at the bottom that is controlled by any of these pages, keeping it all in sync.
