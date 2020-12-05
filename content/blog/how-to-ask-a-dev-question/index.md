---
title: How to ask a question as a developer
date: 2020-12-05T13:44:38.621Z
type: html
action: copy
---

### Introduction

If you're a junior (or even creeping into mid-level) you can make a good or bad impression simply based on how you ask questions and what questions you ask. There's no problem in asking questions, it's a great thing to do and you should be doing it as much as you can to learn as much as possible...But there's a limit, you don't want to be wasting people's time and end up coming off as clueless or lazy.

This also applies to online chats where I see most of the questions I answer, some people come across as being hard to work with simply based on their repeated questions and I think to myself *"I don't even want to help this person"* even though I **could**. 

It's doubly true for online chats, people aren't your coworkers so they have absolutely no reason to teach you anything, they're doing it for free, on their own time for nothing in return.

It's very much a "help me help you" situation. If you don't put the effort in, people won't put the effort in to help you.

<center>

![](https://media.giphy.com/media/uRb2p09vY8lEs/giphy.gif)

</center>

### Do you even need to ask a question in the first place?
If your question is something that has an absolute answer (yes/no, what is X?) then do you even need to ask the question? A simple google search will likely give you the answer, save yourself and everyone else time by just going to google *first* before asking other people.

Examples:

>What is an ID in CSS? 

https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors

>Can I use flexbox in firefox?

https://caniuse.com/flexbox


#### Asking the question

So the question isn't easily googleable, now we have to figure out how to word our question in a way that won't make the senior developer go crazy copy/pasting MDN links to you.

#### Do NOT do this
>Hey guys can anyone help me? any python experts online?

>Help pleaaaseee? 

>does anyone know PHP?

>anyone know how to solve a quick JS question?

All of these questions are open-ended and nobody will ever want to take on the responsibility of being the person to begin answering it. You'll likely be ignored because the effort is so low that nobody wants to spend 30 minutes of back and forth to get to a question that could be googled in 10 seconds.

It comes off as "I am too lazy to write a real question, maybe I'll write it out if someone agrees to personally be my helper and answer everything I ask".  If you're not going to put the effort into a question then why should someone else put the effort in to answer it?

#### Bad

>John has 5 apples, Cindy has 4, write a function to ....

If you do need help with homework then consider asking for help in a way that shows you're trying to learn, not just looking for the answer.


>A picture of ~150 lines of code followed by "Why isn't my carousel working"?

It's way harder to figure out the error when people trying to help you can't copy/paste the code to try it out or edit it. Pictures are a terrible way of showing code to other developers.


>Huge code snippet followed by "why doesn't my code work"

This is information overload, you're asking people to understand an entire screen's worth of code when the error could be something as simple as a typo in a single variable. The only part that's needed is the code relating to the error you're getting, and if no error occurs the question should be narrowed down to why the output isn't working as expected for that single function.

>Should I learn PHP or Python or C#? What about Vue vs React vs Angular?

This can't end well at best, the question requires followups related to career goals, tech used in their area and previous knowledge to even begin to figure out the answer...And often will result in a "language war" where people start arguing about why PHP is bad or why Python is slow.



>This function errors when I run it? what's wrong?

What's the error? The console will likely tell you everything, error message, line number & character position of the exact problem.

>How do I host my server? 

It's a bad question because there's no context provided for *what* type of server, it requires followup questions to get the actual question before it can be answered.


#### Better

>Should I start breaking out my function into smaller functions? It's at 150 lines now.

>When should I use `.map` instead of `.reduce`? Can I do the same thing with both?

>What does `{...obj}` mean?

>So when pushing to a new branch do I branch from your branch first, then merge mine into yours? Then yours goes into master?

These are all questions that are good to ask because you might be looking for clarification and it's hard to find answers to things that are more opinion-based. They're the kind of questions that show you're understanding 90% of the problem but need the extra 10% to really "get it" and you've already done some figuring out by yourself.

#### Best

>Hey guys, I'm trying to convert `[1,2,3,4,5]` into `[2,3,4,5,6]` does anyone know a way to do this? I've tried using `.map` but it's not working! `[1,2,3,4,5].map((x) => {x + 1})`

It's a simple misunderstanding of a method. All the context is provided, what they're trying to do, what they've tried and a code example of the data and expected output. Someone can copy the code snippet, fix it and paste it back into the chat and explain the problem.

>Should I use GCP or AWS for my server? I heard GCP has better networking available and I want to keep the latency down, but I won't have many users so I'm not sure if it's worth paying the extra money?

This is a question that's good because it shows you've looked at the alternatives already but you're wanting opinions from others before you go ahead with it, it also shows the reasoning behind why you're considering some options already.



#### TL;DR

Just ask the question, provide as much info as you can. Don't ask to ask and don't post pictures of code.

Give context to your questions and make it easy for everyone to understand what the problem actually is, what lines of code are needing clarification or correcting and try to not be open-ended or ask questions that can only be answered with another question.

___


This may come across as mean, but this is just how it works, so if you can put in effort and start some cool conversations you're far more likely to make friends (or mentors) and have a much better experience as a developer overall. 