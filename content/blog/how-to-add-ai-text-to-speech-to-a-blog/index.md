---
title: How to add AI text to speech to a blog
date: 2023-12-26T07:42:16.710Z
type: javascript
action: copy
---


#### Listen to this post!
<audio controls="controls">
  <source type="audio/mp3" src="./how-to-add-ai-text-to-speech-to-a-blog.mp3"></source>
</audio>
<hr />

This is a guide on how to add AI text to speech to a blog, the goal is to have a high quality audio file that can read the text in the blog for us that we generate using an API to automate out all the boring copy/pasting and generating audio files. Once we've set it up, it should "just work" and we can add the generation as part of the build process for our blog. 

In this example I'll be using:
-  [elevenlabs.io](https://elevenlabs.io/?from=partnerjohnson9314) to generate text to speech audio files, but alternatives are available.
- Node.js to reach out to the API and generate the audio files.
- Markdown as a text source for the blog, but any text source will do as long as you can strip out the links and code blocks in some way.
- [elevenlabs-node](https://www.npmjs.com/package/elevenlabs-node) to interact with the elevenlabs API.



To get started you'll need to sign up on [elevenlabs.io](https://elevenlabs.io/?from=partnerjohnson9314) and get an API key, you can do this for free and get 10000 characters of text to speech generated per month which should be enough to generate a bunch of blog posts, but if you're in need of more you can subscribe at a discount for your first monthly subscription. Once you get up and running the free tier should suffice after the initial generation of previously created blog posts.

**If you have huge blog posts you may need to subscribe as the free tier is only for 10,000 characters, some extra effort will be needed to make it work with large posts e.g splitting them out into multiple files and joining them together afterwards, which I haven't done as of this post**

Once you have your API key put it into your project in a .env file and add that .env file to your .gitignore so you don't accidentally commit it to your repository. 


We'll need to start by trimming out anything from our markdown file that doesn't make sense in audio format such as links and code blocks, luckily most other markdown elements are ignored by the text to speech e.g tables, they get read out as you might expect. With pauses included too!


I've created a `removeMarkdown` function which can be found on this blog's [github repository](https://github.com/SPDUK/portfolio/tree/master/generateBlogAudio.js), your personal needs may be slightly different for your markdown; I forked my version from [markdown-to-text](https://www.npmjs.com/package/markdown-to-text) on NPM.

Then I'll read each of my markdown files, again your personal setup may be different. I have a folder called `content/blog` which contains all my blog posts, each blog post is inside a folder with an `index.md` file inside, I'll read each of those files and generate an audio file for each one using the elevenlabs API and save that file into the same folder as the markdown file, that way later on we can reference the audio file from the markdown file.

I recommend when you start testing this that you create a temporary fake post that has a few words instead of a whole blog post, that way you won't use too much of your free tier while you're testing.

```javascript

const ElevenLabs = require("elevenlabs-node")

const voice = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY, // Your API key from Elevenlabs
  voiceId: "P4g0NDvpvGsUdtZSshp1", // A Voice ID from Elevenlabs
})

const blogFoldersPath = path.join(__dirname, "content/blog")

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const generateBlogAudio = async () => {
  fs.readdir(blogFoldersPath, (err, folderSlugs) => {
    if (err) throw err


    folderSlugs.forEach((slug) => {
      const blogPostPath = path.join(blogFoldersPath, slug)

      fs.readdir(blogPostPath, async (err, files) => {

        if (files.includes(`${slug}.mp3`)) {
          // skip any repeats
          return;
        }

        for (const file of files) {
          if (path.extname(file) === ".md") {
            fs.readFile(path.join(blogPostPath, file), "utf8", (err, data) => {
              if (err) throw err

              const plainText = removeMarkdown(data)

              voice
                .textToSpeech({
                  // Required Parameters
                  fileName: `${blogPostPath}/${slug}.mp3`, // The name of your audio file
                  textInput: plainText.slice(0, 5000), // The text you wish to convert to speech, limit of 5000 characters
                  // Optional Parameters
                  stability: 0.5, // The stability for the converted speech
                  similarityBoost: 0.5, // The similarity boost for the converted speech
                })
                .then(res => {
                  console.log(`building mp3 file for ${slug}`)
                })
                .catch(err => {
                  console.error(err)
                })
            })
          }

          // let's try to avoid any "too many requests" errors
          await sleep(20000)
        }
      })
    })
  })
}

generateBlogAudio()
```

Now once this script runs it will call out to the elevenlabs API and generate an audio file for each of your blog posts, you can then reference these audio files in your markdown file, for example in markdown:

```markdown
#### Listen to this post!
<audio controls="controls">
  <source type="audio/mp3" src="./how-to-add-ai-text-to-speech-to-a-blog.mp3"></source>
</audio>
<hr />
```


And there you have it, text to speech on your blog!