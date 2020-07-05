---
title: How well do I really know the tools on my CV?
date: "2020-07-05T14:37:57.289Z"
type: "html"
---

I've seen a few CVs where I've looked at it and thought "There's no way they know all of **that** stuff", but I realized my CV is slowly turning into one of those, so maybe I can explain why I list so much stuff that I feel I'm half-decent enough at.

Here's what I currently have listed:

### Skills

- **Programming Languages**: JavaScript (advanced), Ruby (intermediate), Elixir (intermediate)
- **Front-End Technologies**: HTML5, CSS/SCSS, JavaScript (ES6, Vue & Vuex, React & Redux, jQuery), Bootstrap, Responsive Design
- **Back-End Technologies**: Node.js (Express / Koa), Ruby on Rails, Phoenix, RESTful & GraphQL APIs
- **Database Systems**: SQL (PostgreSQL, SQLite), NoSQL (MongoDB), ODMs (Mongoose), ORMs (ActiveRecord, Ecto)
- **Web Services & Deployment**: Docker, Heroku, DigitalOcean, Netlify, Linux (Ubuntu), CI/CD, Git, Webpack, NPM, NGINX, AWS S3
- **Testing Technologies**: Jest, ExUnit, Unit Tests, Integration Tests, Test-Driven Development

The main reason why I know so many technologies is because I like exploring new things.

I learned things in roughly this order:

`HTML/CSS -> JS (React ..etc) -> Node & MongoDB -> Ruby & SQL -> Elixir`

Elixir was created by a Ruby Developer, Phoenix (elixir framework) is a clone of rails with a few new features to make it FP friendly.

By knowing Ruby I could transfer so much knowledge directly to Elixir just by assuming things. The same also applies to Crystal which is a language based on Ruby syntax that I sometimes use Crystal if I need something to be _really_ fast.

---

### Programming languages

Programming languages wise I know JavaScript way more than I know Ruby or Elixir, I know enough Ruby & Elixir to get by and make something if I need to, but I don't have super in-depth knowledge. This makes sense as so far all of my jobs have been strictly JS related. Pretty much all my focus goes into JS related things, I wish I could use the others more, but I don't.

JavaScript wise I know quite a lot, I probably think I know more than I do because it can get crazy in-depth and JS can be _very_ confusing. When using JavaScript (either in the browser or within Node.js) I feel very comfortable and I can understand all of the code I'm writing in-depth and feel what's happening "under the hood", sometimes I still google stuff, though this is mostly because I'm 95% sure what I'm doing is right but I want to confirm what I'm doing is right.

When using Ruby/Elixir I pretty much always have the docs open and I'll be needing refreshers on how things work, this isn't the case with JS.

---

### Front-End Technologies

**HTML**

I probably don't know enough about HTML, I know more than enough to never need to look anything up, but when it comes to accessibility I typically let Google Lighthouse audits complain at me for doing something wrong and then I fix it.

**CSS**

I'm pretty good at CSS... When I have to make something from scratch. When working on existing code CSS is seemingly always a mess and the hardest part is not breaking other code, especially when the other code is oddly specific..It becomes really hard to do basic things. I end up writing a mess to combat previous code and then the cycle continues. The next person will now suffer the same. Usually, that's me again. Why didn't I just fix it? Because I'd break everything.

Tech-wise I typically use flex for everything alignment wise, it works on IE whereas grid doesn't, so I never need to worry about how IE looks.

I never struggle with CSS itself, mostly just not breaking existing code.

**Vue & VueX**

I picked Vue up because my first job used Vue, almost everything I know about Vue is just converting React knowledge over, then a few bits on top that are specific to Vue.
I learned enough to not struggle, but I sometimes would come across features and have to look up things in the docs even after using it for ~8 months on the job I was still looking up how things worked every so often.

VueX wise I never really dived too much into it, everything was set up for me at the job so I'd rarely have to make any changes related to the VueX store. I used it within side projects just to learn it, but I would certainly need to google stuff when using VueX if creating something for myself.

**React & Redux**

I started using React early on (about 3 months into learning Web Dev). I know quite a lot about React, more than enough to get the job done correctly, the only problem is when a new tool such as hooks comes out, all of a sudden the whole React community shifts the way they think and I have to re-learn what's going on, not a problem, but as I haven't fully caught up I might be missing knowledge of some of the more modern React ways of doing things.

With Redux I'm okay, I generally prefer using MobX or some other "easier" state management just for the ease of use. I found that Redux is one of those things where I learn it...Don't use it...Learn it...Repeat. I've made a few side projects using it but never used it long term, so I end up needing a refresher every time I use it.

**jQuery**

This is mostly a "CV filler" type of thing. I know for sure it's more or less useless with modern ES6 available, but I also know a lot of companies still use jQuery or have parts of their site using jQuery and need people that are capable enough to work with that.

I can read it which is enough, _sometimes_ I use it if it is available and makes sense to do so, otherwise I'll use regular JS. Thankfully it's quite easy to just google what's happening with jQuery.

The only real benefit to knowing jQuery is how to convert StackOverflow snippets from jQuery to JS when I google how to do something.

**Bootstrap**

Not much to say about this, I don't know all the classes off the top of my head, but I remember enough to get the job done if needed and fill in the blanks with the docs.

**Responsive Design**

Another CV filler, mostly meaning that I can use media queries and make mobile-first websites. Recruiters wish to see "responsive design" as a keyword, so they'll find it there.

---

### Back-end Technologies

**Node.js (Express / Koa)**

Keeping in line with the JS focus this is also what I've focused on when it comes to the back-end. Not too much to say apart from that I heavily prefer using MongoDB together with Node.js.

**Ruby on Rails & Phoenix**

These are very similar so I'll group them. I'm not as good with these as I am with node, but you can also do a lot more out of the box so I don't need to be as good with them. I know enough to get the job done and I can pick up any missing pieces, but I couldn't talk too in-depth similarly to how I could with Node.

**RESTful & GraphQL APIs**

I've used GraphQL a small amount, but I feel I know enough to get by when using it. I primarily use GraphQL when using Gatsby, so I understand all the fundamentals, but not enough to consider myself "good" with GraphQL.

I also understand there is time and a place where GraphQL makes sense, and places where it doesn't. I'd only ever want to use GraphQL when doing some type of searching through data, or if I need _really_ flexible input from the front-end.

REST APIs I'm decent with, I feel like as long as you follow whatever standard has been set for the project it's just a matter of adding in the logic in the middle, so you can't go wrong.

---

### Database Systems

**NoSQL (MongoDB), ODMs (Mongoose)**

I would think I've used MongoDB a bit more than I have SQL, I can somewhat write MongoDB queries, but not too well if they get complex. I primarily lean on Mongoose to do the heavy lifting.

I did use it at my first job, so that's where most of my real experience comes from. I'm not too great when it comes to deciding exactly where all the relationships go within MongoDB as you can sort of just put things anywhere and it will work nicely anyway...I have found that I end up using MongoDB as a "relational" database anyway, most things relate to _something_.

**SQL (PostgreSQL, SQLite) & ORMs (ActiveRecord, Ecto)**

I can't write SQL very well. Outside of `SELECT * FROM something` I'll have to google to write it just to make sure it's correct, It's one of those things where I learn it and forget by the time I actually have to write it. I've pretty much always used ActiveRecord / Ecto to do the job for me.

I'm a bit better at organising tables when within SQL because it's intentionally relational, but if things get complex I'll end up on google confused for sure.

---

### Web Services & Deployment

**Docker, Heroku, DigitalOcean, Netlify, Linux (Ubuntu), CI/CD, Git, Webpack, NPM, NGINX**

I'll sort of group these all together as they kind of come under "sshing into a server and doing some stuff", Docker I really like using but I find it a bit of a pain to initially set up, but once that initial set up is over it's a dream. Most of what I do is just looking at other people's setups and taking what they have done and making it slightly different for myself.

When it comes to deployment I heavily prefer not doing it myself anymore, when I was first learning I found it enjoyable, but I was never very good at it. I just like to deploy straight to Heroku or GCP and not have to worry about all the configs and all the time spent doing DevOps.

I use Linux on my personal machine for dev, so I can pretty much figure anything else out when it comes to Linux or hosting a server if needed.

I could be better when using Git honestly, I keep things simple and don't try to do anything smart. If I try to be smart I end up in a mess. Taking a second look at what I'm doing before doing it saves a lot of time in the long term.

---

### Testing Technologies

**Jest, ExUnit, Unit Tests, Integration Tests, Test-Driven Development**

I haven't done a huge amount of TDD or testing in general, neither of my jobs had it as a requirement.

At my first job I wrote tests for things simply because I needed to know I wouldn't be spamming users with emails by accident, or breaking the database, So tests came in handy massively there, but for general day to day things like changing how the UI looks, that doesn't need a test IMO as it will just change again soon. If your code is good and you separate concerns it shouldn't ever cause problems outside of what you can see on a specific area of the page.

I've probably written the most tests while using Elixir because there's a feature that allows you to write documentation, tests and code examples all in one go.

My preferred way of writing tests is to just write functions and test those functions always return a specific output when given a specific input. Typical functional programming stuff.

I've never done any proper UI testing, It has always been a "looks like it works, didn't break anything, awesome" situation.
