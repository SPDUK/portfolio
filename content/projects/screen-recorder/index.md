---
title: Linux Screen Recorder
date: "2020-04-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
action: copy
---

[Code on Github](https://github.com/SPDUK/screen-recorder-script)

---

Tools Used: [FFmpeg](https://www.ffmpeg.org/)

---

This screen recording script is a simple solution I created because none of the typical GUI based screen recorders would work properly for me when using Linux, I wanted something similar to how I record my screen on a mac. I hit a button, select an area, it saves the file. That's it.

The main problem is that a lot of the GUI recorders record based on the area you select on the screen...Not actually the pixels, it's crazy! When using resolution scaling of any kind they record the wrong part of the screen 😭!

OBS is the only alternative that worked, but it's _huge_ and doesn't allow me to do it in the way I wanted exactly.

This was what I came up with after trying to create a [crazy electron project to record the screen](https://github.com/SPDUK/screen-recorder), I attempted to create a whole UI and record the screen using electron APIs, it "worked", but not very well, certainly not as lightweight as just having a script.

#### Recording the screen

I used a tool called [slop](https://github.com/naelstrof/slop) to select the part of the screen I want, all it does is let you drag to create an area and outputs the information to `stdout`, That's all I needed, some way to know what part of the screen to record.

That data is then passed into `FFmpeg`, simply giving it the coordinates where to record and what the offset is from the top left of the screen `(0, 0)` 🤠!

There was a minor bit of fiddling I did to get the right settings I liked, as well as wrapping the script in an if/else so I could use it as a toggle on/off, but that's.. It...The whole thing is just grabbing part of the screen and passing the info as args to FFmpeg.

It also uses `libnotify` to send a notification saying when it starts/stops recording, just to give a bit of user feedback. Ideally, it would not include this in the recording somehow, but that's only possible by recording a window capture, this captures an area on the screen.
