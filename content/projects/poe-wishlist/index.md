---
title: PoE Wishlist
date: "2018-11-01T00:00:00.000Z"
featured: false
image: "./preview.png"
---

#### This project is no longer updated and the original site and servers have been taken down, it works partially, but only "Standard" and "Hardcore" leagues work correctly.

---

[Code on Github](https://github.com/SPDUK/poe-wishlist)

_The code is from 2 separate git repos, cloned from my private GitLab and hosted on GitHub just to share the code._

---

Tools Used: [React](https://reactjs.org/), [MobX](https://github.com/mobxjs/mobx), [Elixir](https://elixir-lang.org/), [Phoenix](https://phoenixframework.org/) [PostgreSQL](https://www.postgresql.org/)

---

[You can view a semi-working example here](https://poewishlist.netlify.com/dashboard)

_warning: back-end is hosted on Heroku (free tier), so it may take 10 seconds to load or need a page refresh._

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1560523029/PoeWishlist/poewishlist-main.jpg)

PoeWishlist is a web application that enabled players of the game [Path of Exile](https://www.pathofexile.com/) to create a wishlist of items, track currency and prices, see what they can afford, import lists of items from 3rd party tools and a few other things.

Overall this took me roughly 2 months to make, I had no Elixir experience when I started, by the end I understood how to make a rather complex API with Phoenix that also served as a wrapper around another API to store data in a personal database. The response times were sub 1ms, it's great!

---

#### Keeping prices up to date

To keep the info up to date the server has to repeatedly fetch the information for 8 item types, and 4 different leagues, so we have to do 32 requests, each returning thousands of items.

```elixir
item_leagues = %{
  "Standard" => Item,
  "Hardcore" => HcItem,
  "Legion" => LeagueItem,
  "Hardcore%20Legion" => HcLeagueItem
}

# ...

for {name, schema} <- item_leagues do
  get_urls(name, schema)
end
```

It's done like this, mapping a league name to a schema, looping over each of them and getting the URLs for that league, and then once the URLs are found, the script iterates each URL, fetching the data.

Once the data is found, it has to check every item to see if it exists, if the item exists we check for updates to that item using a [changeset](https://hexdocs.pm/ecto/Ecto.Changeset.html). If the item doesn't exist, we create the item in the database.

This runs as a job, updating every X minutes, giving us the always up to date information.

---

#### Item Search

![ItemSearch](https://res.cloudinary.com/dmjolhdaq/image/upload/v1560523013/PoeWishlist/poewishlist-search.jpg)

The site's main feature is an item search, it doesn't find all items, just items that exist in the currently selected league and are also currently available to purchase. After searching for an item, you can then select which _version_ of that item you wish to add, each item may have multiple different variants, and then each variant may have different links.

If this makes no sense to you, think of it as buying a car. You may want to purchase a car, but that care comes in 4 different configurations, but all of the configurations can have the same paint options, so you'll have to decide which exact one you want out of 20 options, but they are named the same.

Once you find the item you want, it's added to the list, the price will be listed, along with telling you how much additional currency you need to afford it.

There's also a search button that looks the item upon the official trade website, a query is built for each item added, even custom ones you create yourself.

I had to reverse-engineer a query builder to search the official PoE trading website, [See the code here.](https://github.com/SPDUK/poe-wishlist/blob/ea3d82cc4c0211cdf9c399d04b4483970db9eba5/client/src/views/Dashboard/Builds/queryBuilder.js)

It's a total mess of code, the hackiest thing ever... But it somewhat works, with no easy way to line up API responses from the custom PoE website search (and somehow fit in a non-conforming 3rd party API).. it was the only solution I could come up with.

There's a lot of renaming and changing things based on random conditionals because so many items can be so different. It took me a long time to figure it out, bit by bit, manually checking things by just shoving endless items, as well as a bunch [of tests](https://github.com/SPDUK/poe-wishlist/blob/master/server/test/wishlist_web/helpers/decode_test.exs)

---

#### Currency Tracking

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1560523029/PoeWishlist/poewishlist-chart.jpg)

The currency tracking calculates the value of the two currency types, "Exalted Orbs" and "Chaos Orbs". These are the most popular currencies used in trading and have varied values depending on the market, so today they may have a ratio of 30:1, but tomorrow it might be 100:1.

The server is constantly updating the prices and calculates everything in Chaos Orbs.

Using a MobX store combined with localStorage, the front end can check if you can afford any individual item, what the ratios currently are, and how much of each currency you need to afford the items listed.

The MobX store tracks pricing from the API, and localStorage keeps a list of all the items you've added, and how much currency you have on record.

Generally, you have to keep a constant tab on this day to day, re-evaluating how much an item costs and what the ratios are, so this takes all the guesswork and effort out of it, saving huge amounts of tedious effort and bookmarking of browser tabs.

#### Picking an item

![](https://res.cloudinary.com/dmjolhdaq/image/upload/v1586718818/Portfolio/poewishlist-itempicker.jpg)

This was very tricky, I tried to make the items look as close to how they would look in-game, the layout is quite similar.

Making the display look right required a lot of CSS work, the sockets (white circles) are a singular socket, the links are a singular link either vertical or horizontal, from there everything is just HTML/CSS placing the correct amount of sockets and links, with CSS positioning everything in the correct way depending on how many sockets there are.

Also, the original files I used were from a sprite sheet, which was annoying to figure out, it saved like 0.01kb!

#### Path of Building integration

The little `Import from path of building` button you see on the UI was the hardest part of this entire project. It made the scope go from just using one API (The official Path of Exile one) to also using [Path of Building](https://github.com/Openarl/PathOfBuilding), it's a cool tool, but not set up in any way to be used as an actual API. I use the word "API" loosely with this, more or less it's just the entire set of options you select dumped into an XML file... And that's it.

[You can see all the code to decode a Pastebin URL here](https://github.com/SPDUK/poe-wishlist/blob/ea3d82cc4c0211cdf9c399d04b4483970db9eba5/server/lib/wishlist_web/helpers/decode.ex), but that's just part of the story. There were days of manually editing `.json` files _(used for quickly finding types and bases as a cache to speed things up massively)_ and figuring out how to line things up with small node scripts I wrote, overall it was an insane idea to even attempt this, but eventually, for about 90% of items, it worked.

#### Why I closed the site

The main problem with this project that brought it to an end was that the APIs were simply not lining up properly. The game releases new content every ~3 months, and having to go into the code and hunt for bugs and add new features with trial and error is not very fun.

The popular tool [Path of Building](https://github.com/Openarl/PathOfBuilding) exports encoded data using Pastebin, which can then be imported into the site and decoded into XML, that XML contains a "wishlist" of things you want a character to have in the game.

Sadly, this XML does not line up with the official trade API, it is just plain text options you select on a dropdown in the application.

It's roughly correct, I eventually got it to a point where _most_ things worked, through lots of `if` statements and modifying the official JSON list of modifiers manually.

As an example, the XML data from the 3rd party site may say `4% to Maximum Life`, but the official trade API JSON would say `{4% Increased Maximum Life: armor.maximumLife}`, with`armor.maximumLife` being what you had to enter into the trade API to search with the correct modifier.

You might just think "You can just search for the closest match", but you can't, the game has many different modifiers that have very similar wording, sometimes the same wording but with another modifier joined onto it as a singular modifier.

You can take a look at _just_ life modifiers [here](https://pathofexile.gamepedia.com/Life) to get an idea for how confusing it is.

Overall it was very fun to reverse-engineer everything and hack together something that worked, but once it was finished I only had around 100 visitors/day on the site and it wasn't worth the effort to maintain it when a new update rolled around, which was very frequent, and the bugs were endless on both ends, even the official API has typos in it.
