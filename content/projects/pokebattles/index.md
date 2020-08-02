---
title: Pokebattles
date: "2019-10-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
action: copy
---

#### A pokemon battle game created in Vue.js

[View Site](https://pokebattles.netlify.com/) | [Code on Github](https://github.com/SPDUK/pokebattles)

---

Tools Used: [Vue.js](https://vuejs.org/), [PokeAPI](https://pokeapi.co/)

---

#### What I learned

- All the Vue basics (data, computed, props, router, etc).

- VueX (store, actions, getters etc).

- How to use Vue libraries and set up plugins.

#### What it does

A small game where you can pick a pokemon card, then you can fight against random pokemon enemies.

I created this after following some basic Vue tutorials and I just wanted to get my hands dirty with Vue as I accepted a Vue job with no Vue experience 😱!

I didn't get much time using Vue at work early on, so I had to do some side projects to figure it out, this is one of them.

#### Picking a Pokemon

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1586716767/Portfolio/pokebattles-picker.jpg)

All the pokemon are loaded into the VueX store, from there we restructure the data in a way that's preferable to use, making it easy to loop over each pokemon and have their images, skills, and stats available for us to create a "Pokemon card" style display that I created in CSS.

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1586716684/Portfolio/pokebattles.jpg)

From there the game begins, it's a simple turn-based game, you pick a move and attack, the enemy then randomly selects whether to attack or heal (based on their current HP), and you pretty much repeat until someone wins.

All the actions and output is logged to a combat log beneath the combat options.

The HP bar is created with a simple `computed` property based on the current HP of you or the enemy, returning the correct color based on the state.

The skills you can select are simply pulled from the API and the first 3 skills they use are selected.

It's simply an infinite loop when you win or lose it selects another random Pokemon and you battle again.

#### Dark Mode and the UI

There's a sidebar menu that contains a theme switcher, this is simply a toggle between the Vuetify theme of light and dark, storing the selected theme in `localStorage` so repeat visits remember the theme that was set.
