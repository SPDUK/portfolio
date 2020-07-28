---
title: Giphy Finder
date: "2019-06-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
action: copy
---

#### A gif searcher created with react and redux

[View Site](https://gifs.spdevuk.com) | [Code on Github](https://github.com/SPDUK/giphy-finder)

---

Tools Used: [React](https://reactjs.org/), [Redux](https://github.com/reduxjs/redux), [Redux Saga](https://github.com/redux-saga/redux-saga) [Connected React Router](https://github.com/supasate/connected-react-router), [Giphy API](https://developers.giphy.com/)

---

#### What I learned

- I brushed up on my redux skills, using sagas instead of thunks this time.
- Improved code reuse with redux state stores, sagas and containers.
- How to create an infinite scrolling component using redux.

#### What it does

This project is one I created to aid myself in sharpening up my redux knowledge, so it heavily features redux for almost all of the actions you make on the website. From searching to changing pages, or even opening the full-size view of a gif, it's using the redux state to manage it.

![preview](https://raw.githubusercontent.com/SPDUK/giphy-finder/master/preview.jpg)

Most of the components are reusable, even the search being made just changes some booleans in a redux-saga, for example on the search page you can type a query, but on the trending page it sends the request to an entirely different API route, but they're both handled by the same saga, lots of code reuse.

![copy-preview](https://raw.githubusercontent.com/SPDUK/giphy-finder/master/copy-preview.jpg)

The site achieves lighthouse scores of 100, with accessibility taking a minor hit as some elements are off the screen or invisible, such as the "scroll top" button.

![lighthouse](https://raw.githubusercontent.com/SPDUK/giphy-finder/master/giphy-lighthouse.jpg)
