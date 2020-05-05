---
title: Youtube Subscription Downloader
date: "2019-04-01T00:00:00.000Z"
featured: true
image: "./preview.jpg"
---

##### An automation script to download youtube subscriptions as they are released

[**Code on Github**](https://github.com/SPDUK/youtube-subscription-dl)

---

Tools Used: **[Node.js](https://nodejs.org/en/), [YouTube API](https://developers.google.com/youtube/v3/)**

---

#### What it does

The idea is to download a back up of all your YouTube subscriptions, without having to keep track of who you're subscribed to, all the current solutions at the time did this, so I used the YouTube API instead.

#### How it works

This is a script I wrote over a weekend, where you can use OAuth to authenticate yourself with YouTube's API, and from there it will send out requests to find out what channels you're subscribed to, then the subsequent requests will check each channel's list of videos, paginating through them as it checks.
If it finds a video that has been released since the last time the script has run, it will try to download it, using the popular command-line tool [youtube-dl](https://github.com/ytdl-org/youtube-dl).

It also keeps track of any videos that fail to download, and comes with a configuration that saves files in the best quality, properly formatting filenames and handling the boring stuff.

The script also works on every OS and is easily portable, showing notifications when it completes or errors to provide some simple feedback.
