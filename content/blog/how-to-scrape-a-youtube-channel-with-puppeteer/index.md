---
title: How to scrape a youtube channel with puppeteer
date: "2021-04-14T18:26:40.230Z"
type: "javascript"
action: "copy"
---

<audio controls="controls">
  <source type="audio/mp3" src="./how-to-scrape-a-youtube-channel-with-puppeteer.mp3"></source>
</audio>

[Example on GitHub](https://github.com/SPDUK/random-workout/blob/main/scraper/index.js)

#### Introduction

I recently wanted to grab all data on a youtube channel, I was planning on using the YouTube API but I've made a project before using the YouTube API and when scraping a channel with thousands of videos it quicky hits the API limit on the free tier when you're doing it often or have a lot of channels to look up.

That's why I decided to use [Puppeteer](https://github.com/puppeteer/puppeteer) to scrape the channel instead, but it's not as simple as it would seem.

---

#### Starting puppeteer and opening a youtube channel

In this example we'll be scraping workout channels. We'll start off with a function `scrapeWorkouts` that will be our "main" function to run that runs a few other functions.

```js

const puppeteer = require('puppeteer');

// just a single channel for brevity
const workoutChannels = ['https://www.youtube.com/c/athleanx/search?query=workout'];

async function scrapeWorkouts() {
    // open puppeteer and visit the page
  const browser = await puppeteer.launch({ headless: false })

  try {
    const viewport = { width: 800, height: 800 }

    const page = await browser.newPage()
    await page.setViewport(viewport)

    for (const channel of workoutChannels) {
      // load in videos on the page so it's scrapable
      await goToPageAndLoadAllVideoData(page, channel)

      await page.evaluate(() => {
      // you can now add your code here and the page
      //will be filled properly, every DOM element should be loaded in
      }
    }

    await browser.close()
  } catch (err) {
    // would be unlikely but could happen :(
    console.error(err)
  }
}
```

We don't currently have `goToPageAndLoadAllVideoData`, but you currently have the ability to open a youtube channel with puppeteer. If you run this code you'll notice the first problem is that you're faced immmediately with a popup asking you to accept, so we'll take care of that within `goToPageAndLoadAllVideoData` as our first task, then we'll start working on actually loading in the videos.

```js
async function goToPageAndLoadAllVideoData(page, channel) {
  // wait for page to load everything so we can click
  await page.goto(channel, { waitUntil: "load" })

  // click annoying I agree button to consent to cookies and actually go to real page
  await page.evaluate(() => {
    document.querySelector("form button").click()
  })

  // page has 5 video titles and some sort of content for one
  // -> assume page has rendered properly in DOM
  // waits for this function to return true
  await page.waitForFunction(() => {
    const vts = document.querySelectorAll("#dismissible #video-title")
    return vts.length > 5 && vts[0].innerText.length > 5
  })

  // recursively scroll to bottom on repeat until all videos should be loaded
  await page.evaluate(async () => {
    const wait = (amount = 0) =>
      new Promise(resolve => setTimeout(resolve, amount))

    let lastElement = null

    // don't want to have infinite loops if the user's channel
    //is way too big - 20 scrolls should be enough for any big channel
    //e.g athleanx with ~1,200 videos
    async function scrollDown(retries = 20) {
      if (retries <= 0) return

      const videos = document.querySelectorAll("#dismissible")
      const lastVideo = videos[videos.length - 1]
      lastVideo.scrollIntoView()

      if (lastVideo === lastElement) return
      await wait(3500)

      lastElement = lastVideo

      // keep scrolling down
      await scrollDown(retries - 1)
    }

    await scrollDown()

    // if we have any unloaded images we missed
    //-> find them and scroll to them so they load in the image
    const unloadedImages = document.querySelectorAll(".yt-img-shadow")
    for (const img of unloadedImages) {
      if (!img.height) {
        img.scrollIntoView()
        await wait(300)
      }
    }
  })
}
```

In this function you'll notice a few things, firstly we're faced with the problem that when you try to scrape simply scrolling to the bottom won't be enough, you'll need to scroll until you can't scroll any more as the videos are paginated, that's what `scrollDown` will handle by recursively scrolling to the bottom and waiting for `3500`ms but just to make sure the video loads. YouTube doesn't load in the video information unless the browser has it in view for long enough.

The second thing you'll notice is `unloadedImages` and the loop beneath, this is because even though we try to load in all the images some are still missed by scrolling too much or too little, YouTube won't even load in the image element unless it's in view for a short while, so we'll need to find all the images with no height and use `scrollintoView()` to make the browser scroll onto that image.

### After `goToPageAndLoadAllVideoData` finishes

Once `goToPageAndLoadAllVideoData` finishes we'll have all the channel info loaded on the page and we will be able to do whatever we want with the fully loaded channel in the DOM, we've got around the lazy loading of images and pagination issues 😁.

Add your code here to scrape the page:

```js
     await page.evaluate(() => {
      // you can now add your code here and the page will be filled properly
      // every DOM element should be loaded in
      }
```

If you're looking for an example you can check my random-workout scraper to see how I scrape actual values and return them here: https://github.com/SPDUK/random-workout/blob/main/scraper/index.js
