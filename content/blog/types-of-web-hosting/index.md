---
title: Which type of web hosting should you use?
date: "2020-05-11T14:50:48.754Z"
type: "digitalocean"
action: "copy"
---

#### Listen to this post!
<audio controls="controls">
  <source type="audio/mp3" src="./types-of-web-hosting.mp3"></source>
</audio>
<hr />


I see this question asked almost daily: "I want to make a website, but how much does hosting cost and where do I host it?" and the answer is "_it depends_", and that makes it tough to quickly give someone an answer without having to explain all the potential types of hosting and what's the right choice for them.

In this article, I'll explain the basics of hosting your website, pros and cons of certain types of hosting and explain a few things that should make it easy for you to figure out what you need.

### TL;DR! Just tell me what I need to use for my use-case 😠

I'm only using HTML/CSS/JS (including frameworks): [**Static website hosting**](#Static%20website%20hosting)

I just want to put my server live ASAP: [**PaaS**](<#PaaS%20(Platform%20as%20a%20service)>)

I want to host my server for cheap and I'm happy to set things up myself: [**VPS**](<#VPS%20(Virtual%20Private%20Server)>)

I don't want to do everything myself, but I do want to pick and choose what I pay for: [**IaaS**](<#IaaS%20(Infrastructure%20as%20a%20service)>)

---

## Static website hosting

> This is what you'll want if you're hosting a website that is HTML/CSS/JS only.

This can generally be done for **free**, using services such as [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/). You mostly have to pay for build minutes and bandwidth, but they come with a generous free tier.

You may also consider [GitHub Pages](https://pages.github.com/), but it should only be used for low traffic websites not professional use as there's no way to upgrade the [usage limits](https://help.github.com/en/github/working-with-github-pages/about-github-pages#usage-limits).

#### Why should you use these services?

They offer an all-in-one solution that provides:

- CI/CD, You can connect the service to your repository, when you push a new update to the master branch the service will rebuild the website and your website will automatically go live with the new version.
- A CDN, which is very important, this means _content delivery network_, people can visit your website from anywhere in the world and it will respond quickly to the requests in a server local to them. If you host your website on a single server all the requests would have to go to that server, anyone connecting from the other side of the world would have huge delays for every request.
- SSL (HTTPS).

#### What are the alternatives?

- You could host the website on your own server, but without a CDN in place, it would be very slow for worldwide visitors and re-creating a CDN setup like that would cost a **lot** of money.
- You could host the files on AWS S3 and pair it with other AWS services, but you'd miss out on the CI/CD and have to manually place files into S3.

## PaaS (Platform as a service)

> For when you want to save time hosting your server, at a cost.

PaaS is a service that, pretty much, takes care of almost everything for you when it comes to deployment. The trade-off is that you have to pay a lot more for what you get performance-wise.

For example, a $50/m [Heroku](https://www.heroku.com/) server is about the same performance as a $10-15/m [DigitalOcean](https://m.do.co/c/ef05d9ae58b2) server. Although you have to build everything manually on [DigitalOcean](https://m.do.co/c/ef05d9ae58b2), so the primary selling point is the vastly reduced dev-time needed for deployment, in most cases, a PaaS is as simple as running a few commands and setting up a few variables, or installing some plugins.

If you're just wanting to get your website up and running with the least effort, PaaS is what you want.

---

**Pros**

- The service handles almost everything for you, saving huge amounts of time to get your server live.
- Easy to use plugin/addon systems.
- Also includes other services such as hosted databases.
- The best "throw money at it" solution.

**Cons**

- They're typically ephemeral and don't keep a filesystem, so you can't store files on the server long term.
- They sometimes restart randomly, so you can't store things in memory reliably.
- Other random limitations e.g [Heroku](https://www.heroku.com/) has a max limit of 50 socket connections per server.
- Not much configuration available to you.

---

## VPS (Virtual Private Server)

> For when you want to do things manually, but get the most bang for your buck.

A VPS is pretty much just raw access to a server, typically you'll be assigned a VM that is specced to whatever configuration you select when creating it, or you can go bare metal and rent a full server, dedicated to just you.

My personal choice of VPS hosting is [DigitalOcean](https://m.do.co/c/ef05d9ae58b2), where they provide _droplets_, setting one up is quite easy and their service offers many helpful UI tools in case you make a mistake, such as direct access to the server and automatic backups.

Typically a VPS is the best way to get full access to a machine, allowing you to build and configure absolutely everything about it. That can be a positive thing or a negative thing, depends on how you look at it.

Because you have full access to the machine there are no limits to what you do with it, you can host 100 websites on the same server if you wish, as long as the server can handle the traffic it will work perfectly fine. Doing the same on other hosting services will need every website hosted individually, paying for the usage of each one separately.

A VPS generally has very easy to understand pricing wise, you pay $X/month and that's it, there are no hidden fees or extras to worry about. If you need to scale up or down you can just pay more. The only thing you might need to consider is bandwidth, but the limits are quite generous, typically at 1tb/month for a $5 VPS and scaling up as you pay more.

---

**Pros**

- You can host many projects on a single server.
- Cheap way to host a powerful server on a budget.
- Predictable pricing.
- You can configure anything you want, exactly as you want it.

**Cons**

- You have to worry about security and avoid getting hacked or leaking private information.
- No services will work by default with your server, you'll need to set everything up manually.
- You'll have to manage backups, crashes, reliability etc.

---

## IaaS (Infrastructure as a service)

> For when you want to use many small services to create exactly what you want.

IaaS is a collection of many, many services. It can become so complex it's an entire job field to be an [AWS](https://aws.amazon.com/) engineer.

These are generally "pay as you scale" services, meaning that they're used for large businesses to scale as much as possible, on-demand.

For example, if you get a spike in requests it will scale up and handle those requests for you, then scale back down. You'll only pay for what you use.

---

**Pros**

- Pay as you go autoscaling.
- Many APIs and tools are available to use to solve pretty much any problem you can think of.
- You can pick and choose what you want or pair IaaS services with your current server setup.

**Cons**

- Typically you'll be "locked-in" to these services, using that service for everything, your codebase will then rely entirely on that vendor.
- Pricing can be confusing, especially when using multiple services and how they interact with each other or how bandwidth is billed.
- A lot of documentation to read to understand what's going on.

---

Now you've had a brief introduction to each type of hosting service and know what they offer in comparison to the others, hopefully making your choice will be much easier now 😎.
