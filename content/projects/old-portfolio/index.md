---
title: Old Portfolio
date: "2019-05-01T00:00:00.000Z"
featured: false
image: "./preview.jpg"
action: copy
---

#### My _old_ markdown oriented portfolio website

[Code on Github](https://github.com/SPDUK/old-portfolio)

---

Tools Used: [Ruby on Rails](https://rubyonrails.org/), [Docker](https://www.docker.com/), [DigitalOcean](https://www.digitalocean.com/), [jQuery](https://jquery.com/)

---

#### I learned how to...

- Use multiple layouts with Rails.

- Upload files using [Carrierwave](https://github.com/carrierwaveuploader/carrierwave) and [Cloudinary](https://cloudinary.com/).

- [ActionCable](https://edgeguides.rubyonrails.org/action_cable_overview.html), [Redis](https://redis.io/) and Rails infinite scrolling.

- Set up admin authorization and a role management system.

- Parse markdown with Rails and add custom syntax themes.

- Create a site-wide day/night mode theme toggle.

- Create smooth animations using anime.js.

- Use jQuery to make DOM manipulation code shorter.

#### What it does

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559232062/Portfolio/md-portfolio-blog.jpg)

Using admin authorization, it allows me to write drafts for blog posts (outlined in orange) and separate a draft post from a public post, because of this, only topics that are attached to a public post are visible to anyone visiting.

As you can see, there is a docker post, but it is outlined in orange (a draft) and therefore the only topics visible are JavaScript and Linux. A non-admin user would only see the two posts that are set to public.

Previously there was a full comment system for the blog posts, featuring live updates using Redis, but I removed it as I didn't want to have to worry about potentially moderating it.

---

#### The carousel

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559232584/Portfolio/md-portfolio-carousel.jpg)

The carousel is a typical bootstrap carousel but modified using Anime.js to fade in and out, hooking into the events the carousel sends out. It also fades in the direction you scroll, for example, if you scroll left it will fade out and back in from the left.

The carousel is just a group of typical project posts, except that they are _featured_ posts, which I can edit at any time to add or remove that project from the carousel.

Because of the navbar blur effect, I had to be a little creative and use a radial gradient effect on top of a background image. The images can't stretch wider, but they also can't grow or shrink to fit the full width as the blur is a strict 60px of height to match the navbar height.

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559235036/Portfolio/md-portfolio-carousel-wide.jpg)

When expanding the page-wide enough you'll notice the gradient come into play, meaning anything over that width just looks like it's fading into black.

By doing this I can have a full-width banner carousel, and also have the blurred navbar, so even on a very, very wide screen, it doesn't look like a floating box.

---

#### Project & blog admin options

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559233134/Portfolio/md-portfolio-adminproject.jpg)

As you can see, the admin options are quite simple. All I do is upload 2 images and add a body, which is any text that is parsed using markdown, I create a markdown file wherever I want, then simply copy it over. Once uploaded, I can edit it on the site whenever without needing to worry about syncing actual files and pushing them to git.

#### Topics

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559233765/Portfolio/md-portfolio-topics.jpg)

Creating a blog is very similar to a project, except instead of uploading images, a _topic_ is selected, all of the topics are seeded into the database and have an icon, these topics can also be updated, edited, deleted as you would expect.

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1559234066/Portfolio/md-portfolio-tools.jpg)

Topics are also used on the home page to draw the grid of icons, so by editing topics, I can keep everything I use up to date with minimal effort if I learn a new tool, I can just create a topic, and multiple parts of the site will benefit from it.
