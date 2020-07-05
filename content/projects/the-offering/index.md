---
title: The Offering
date: "2020-07-04T18:32:06.613Z"
featured: false
image: "./preview.jpg"
---

#### A visualizer for the song The Offering by Sleep Token

---

Tools Used: **[P5.js](https://p5js.org/)**

---

#### How I made it

I made this in a day, just as a fun side-project. Including lyrics that attempt to be on time (with pause/play included) because I finished too quick.

I watched a few videos from [The Coding Train](https://www.youtube.com/watch?v=2O3nm0Nvbi4) to learn some P5 basics, from there I ended up making a rather poor visualizer that looked very basic, I couldn't quite figure out how to make it exactly as I wanted it to look, eventually I found a [link](https://www.openprocessing.org/sketch/406994/) that had something similar to what I wanted. So pretty much I took "inspiration" from their code and ended up using that as a starting point, adding in a few features such as resizing and play/pause, also removing a few that weren't needed.

### Lyrics

The lyrics are in a loop, this loop goes over the entire lyrics array each time to figure out what lyric to add on the screen at any given second, it's not a perfect solution, but it was the easiest one I came up with to make it work quickly.

For example lyrics are like this:

```javascript
const lyrics = [
  { lyric: "And you are a garden", time: 62 },
  { lyric: "entwined with all", time: 66 }
  // rest of the song
]
```

I had to manually guess song timings which was quite annoying, then tweak them a few times until they were decently accurate, I ended up listening to the song about 20 times in one night, thankfully I like the song. There's also no way to skip doing this as I need to know the seconds..So I listened through to where I needed to amend changes every time... Not fun, but it worked out.

This is all of the lyric handling code:

```javascript
function addLyrics() {
  const interval = 250
  setInterval(step, interval)

  function step() {
    if (playing) {
      secondsPassed += Number(`0.${interval}`)
      updateSecondsDisplay()

      for (const { time, lyric } of lyrics) {
        if (time > secondsPassed) {
          break
        }

        if (time === secondsPassed) {
          setLyric(lyric)
          // if we're at the end - stop lyrics loop
          if (time === lyrics[lyrics.length - 1].time) clearInterval(step)

          break
        }
      }
    }
  }
}

function setLyric(lyric) {
  lyricsContainer.innerText = lyric
}
```

As I'm using an interval of `250` ms, I'm able to then change a `secondsPassed` state variable that also controls the timer in the bottom left. `secondsPassed` has to add up to an integer at some point so we can use `time: 62`, meaning 62 seconds have passed.
The interval is set at `250` because there's often drift and things can get out of sync when people tab out, so we need to get back into sync ASAP.

The code will then check each lyric and find if the time of that lyric is the same, if so, simply display it on the screen.
