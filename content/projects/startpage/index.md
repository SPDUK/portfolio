---
title: Startpage
date: "2018-06-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
---

##### A web browser startpage featuring todos, bookmarks and timers

_June 2018_

[View Site](https://startpage-spduk.herokuapp.com/) | [Code on Github](https://github.com/SPDUK/startpage)

---

Tools Used: [React](https://reactjs.org/), [MobX](https://github.com/mobxjs/mobx), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/)

---

#### What I learned

- How to implement weather APIs to gather real-time data based on user database information.
- How to create a Material-UI based app design.
- How to utilize the full MERN stack.

#### What it does

Uses [OpenWeatherMap](https://openweathermap.org/) to calculate the temperature based on the user's input, saving that input to their user account inside MongoDB.

Once the user has set up their settings, the user can then edit their todo list, add bookmarks and customize the search bar.

![preview](https://camo.githubusercontent.com/ec276cdad702074ceac015ec3ae8852ae40bd8e5/68747470733a2f2f692e696d6775722e636f6d2f3178384b386d752e6a7067)

When adding a bookmark the user can add any font-awesome icon they choose, then delete the bookmark if they wish.

The search bar can be changed from just googling things to searching Wikipedia or Reddit, then the search term will only look on that site.

![clock](https://res.cloudinary.com/dmjolhdaq/image/upload/v1561997673/startpage/startpage-clock.jpg)

The timer can be customized to your liking, setting it up to display in any of the typical time or date formats.

All of the settings are saved and synced using MongoDB, so it works across all browsers you sign into the app on.
