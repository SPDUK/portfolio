---
title: How to be a better developer without any code
date: 2021-03-03T18:44:17.168Z
type: javascript
action: copy
---

### Introduction

This is a blog post for junior-mid level developers that are looking for ways to "up their game" without having to sit there grinding leetcode or learn a new framework, these are things you can use on a daily basis to speed up your dev time or just improve your workflow in general and are just some tricks I've picked up so far that aren't very easy to figure out on your own.



### Git stash / Git stash pop

Recently my favourite git commands are `git stash` and `git stash pop`, if you've never used them, it takes your current code changes and places them into a stash where you can then `pop` them out later. This is super useful if you're working on one branch but need to do something on another branch, you won't need to commit the changes yet or let the change interrupt your current un-committed/un-staged changes. 

Previously I'd just say "Uhh, I'm in the middle of something", but these days I just `git stash` -> swap branch -> do some stuff -> change branch back, `git stash pop` and I'm back right where I was before with minimal confusion. 



### Improved console.log debugging

I used to just throw console.logs in and then surround them with random lines like `-------------` to figure out which log is which, but now I've figured out a simple way to label each log.

```js
const something = "hi!"
console.log({something})
```

If you run the above code in the console you'll see `something` is labelled in the console as `hi!"` so you can easily see the variable name of `something` is `"hi!"`. 

Not as in-depth as using the debugger but it's way better than sprinkling random log messages to separate what value is what.


### Informative commit messages

When committing code you should try to be as descriptive as possible without going overboard, at work I usually do `Ticket Name - what this commit does` e.g `FIX-1001 - fix homepage title responsiveness on mobile`.

If I don't have a ticket name I'll do a message like: `feat: add banner to homepage` or `fix: correct homepage title responsiveness on mobile`.

I feel this is one major way you can show you're good at what you do without actually being any better at code, it just takes an extra 10 seconds to think about our responsibility as part of a team, are you gonna be *that guy* committing `"fix"` or ` "HAAAAAAAAAAAAAAAANDS"` *(yes that was a real commit message at work once)*, or will you commit a nice message that tells you what the commit actually does?



### Making notes


When I'm working on things I'll often make notes of what I'm working on, this varies massively from a basic TODO list of `fix thing, fix thing 2, fix thing 3` to a full markdown file that has links to the ticket(s), what test data is being used and maybe even line numbers & files to look at later. This also goes hand in hand with leaving `TODO:` comments. Ideally most of this can be on JIRA or Github Issues so it can be shared with other people.

So my note may look like this:
```
  TICKET-1000

  link to ticket

  some test data e.g product id(s) `1111 2222 3333`

  some code blocks related
```

It makes it really easy to just copy/paste the same info every time if a ticket lasts for longer than a day. You can then also provide that info to other people if they ask how/what you did to get it working.



I am currently using [Notion](https://www.notion.so/) for all my notes, it even works on mobile so I can do everything from my shopping list to markdown files. 

I've also written down things like `setting up X with Y` and shared the notion links with people. Very useful for doing those weird company-specific dev env setups.


### Screenshots and screen recording

Instead of just saying "I've fixed it" I'll typically post screenshots showing the expected flow, so I'll just take a few screenshots of my local dev env showing it working for me. That makes it easy to figure out in future if it's a problem with the data in QA/Test/Production and give myself an easy way to replicate what I've done in the past to compare against if I come back to it later. 

If it's something that is hard to show in a screenshot I'll record my screen instead and do a wavey-mouse-thing over the parts people should look at. It only takes ~20 seconds to make a video in most cases, very useful for anything UX related as it actually shows the mouse movements and how things are really working rather than just the static before/after.

Bonus points: bind `screenshot to clipboard` on a key on your keyboard (I use printscreen) and it'll be easy to just snap a screenshot and paste it into the ticket in 5 seconds. I also bound screen record to command + print screen to record faster.


### Password manager

A password manager is super useful for passwords in general, but you can also save different user accounts on it, e.g maybe you have 5 different test accounts, you can store them in a password manager and quickly toggle between accounts without needing to remember all the details. Even better if you're part of a bigger team and there are many different environments that all have different test info.


### Using chrome dev tools

Whenever you're confused by something you can start out by just opening the dev tools and inspecting everything yourself, if it's something to do with an API you can check the network tab and check everything is actually what you're expecting, you can also use the console as a REPL to test mini code blocks to sanity check yourself quickly, or you could access global variables and inspect them.

Some cool things I do these days:

- Find an object in the dev tools -> rightclick, select `store as global variable` -> change it however you like, then type `copy(temp1)` (or whatever the variable was named) to copy it to clipboard.
- Set the network speed to slow/3G to test if any errors occur when on a slow connection
- Drag and drop HTML in the `Elements` tab, or rightclick and use `Edit as HTML` to inject code into other places to see how it looks
- Use [chrome overrides](https://developers.google.com/web/updates/2018/01/devtools#overrides) to "hijack" a web page with local scripts
- Using the `Lighthouse` tab to find performance & SEO issues to improve websites



### Basic linux commands, aliases and zsh

Some basic commands you should know are:
- `cd` - change directory (the best way to open a folder on your computer repeatedly)
- `ls` - list files and directories (easy to figure out where you are when using `cd` to get around folders!)
- `mkdir` - create a folder (can also be used as `mkdir -p` to make folders within folders all at once)
- `rm -rf` - delete a file/folder recursively

[Aliases](https://thorsten-hans.com/5-types-of-zsh-aliases) are useful too, if you often find yourself doing the same thing over and over you could instead just alias that command and simply type a much shortened version.



Because my current work is using a huge monolithic monorepo I have to often be changing folders, if I would do this manually I'd have to be remembering the exact folders over and over, that would take forever, however with aliases I can just remember a few simple aliases.

Some aliases I use are:

```bash
alias mamp="/Applications/MAMP/htdocs"
alias i="brew install"
alias c="code-insiders"
alias dev_react="~/Projects/work_name_here/html/dev-imports/resources/react-module"
alias dev_build="~/Projects/work_name_here/src/main/webapp/WEB-INF/prod-resources-config/"
alias mvn_build="~/Projects/work_name_here/ && mvn clean install && mvn eclipse:clean && mvn eclipse:eclipse -Dwtpversion=2.0"

alias fix_all="mvn_build && dev_build && npm i && grunt build-dev"
```


`c` is my most used alias, I often do `dev_react` `c .` `yarn storybook` in the morning to open my storybook dev server and my code editor in ~2 seconds, you can also do things like `c ~/.zshrc` to edit a file without any real effort.

The `fix_all` alias is a huge time saver, instead of running all the maven builds 1 by 1 I just run `fix_all` in the terminal and let it chug along for 3 minutes while I do something else.


I highly recommend using [oh-my-zsh](https://ohmyz.sh/) with [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) plugin, it will mean you won't have to remember all these aliases and commands, you'll only need to type `m` to see `mvn_build` appear as a suggestion. There are plenty of other useful plugins to check out too.
