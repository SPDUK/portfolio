const fs = require("fs")
const path = require("path")
require("dotenv").config()

const ElevenLabs = require("elevenlabs-node")

const voice = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY, // Your API key from Elevenlabs
  voiceId: "A5HvcJH2HhrMSpvmLtsD", // A Voice ID from Elevenlabs
})

/**
 * @function removeMarkdown
 *
 * @description
 * Parse the markdown and returns a string
 *
 * @param markdown - The markdown string to parse
 * @param options - The options for the function
 *
 * @returns The parsed plain text
 */
const removeMarkdown = (
  markdown,
  options = {
    listUnicodeChar: "",
    removeMetadata: true,
  }
) => {
  options.listUnicodeChar = options.hasOwnProperty("listUnicodeChar")
    ? options.listUnicodeChar
    : false
  options.stripListLeaders = options.hasOwnProperty("stripListLeaders")
    ? options.stripListLeaders
    : true
  options.gfm = options.hasOwnProperty("gfm") ? options.gfm : true
  options.useImgAltText = options.hasOwnProperty("useImgAltText")
    ? options.useImgAltText
    : true
  options.preserveLinks = options.hasOwnProperty("preserveLinks")
    ? options.preserveLinks
    : false

  let output = markdown || ""

  if (options.removeMetadata) {
    output = output.split("\n").slice(6).join("\n")
  }

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, "")

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(
          /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
          `${options.listUnicodeChar} $1`
        )
      else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, "$1")
    }
    if (options.gfm) {
      output = output
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, "")
        .replace(/(```.+?```)/gms, "")
        // Strikethrough
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, "")
    }
    if (options.preserveLinks) {
      // Remove inline links while preserving the links
      output = output.replace(/\[(.*?)\][\[\(](.*?)[\]\)]/g, "$1 ($2)")
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, "")
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, "")
      .replace(/\s{0,2}\[.*?\]: .*?$/g, "")
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? "$1" : "")
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, "$1")
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, "")
      .replace(/(^|\n)\s{0,3}>\s?/g, "\n\n")
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, "")
      // Remove atx-style headers
      .replace(
        /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
        "$1$2$3"
      )
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
      .replace(/([\\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, "$2")
      // Remove inline code
      .replace(/`(.+?)`/g, "$1")
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, "\n\n")
  } catch (e) {
    console.error(e)

    return markdown
  }
  return output
}


const blogFoldersPath = path.join(__dirname, "content/blog")

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const generateBlogAudio = async () => {
  fs.readdir(blogFoldersPath, async (err, folderSlugs) => {
    if (err) throw err

    for (const slug of folderSlugs) {
      const blogPostPath = path.join(blogFoldersPath, slug)

      fs.readdir(blogPostPath, async (err, files) => {
        if (files.includes(`${slug}.mp3`)) {
          // skip any repeats
          return
        }

        for (const file of files) {
          console.log(path.extname(file))
          if (path.extname(file) === ".md") {
            fs.readFile(path.join(blogPostPath, file), "utf8", (err, data) => {
              if (err) throw err

              const plainText = removeMarkdown(data)

              voice
                .textToSpeech({
                  fileName: `${blogPostPath}/${slug}.mp3`, // The name of your audio file
                  textInput: plainText.slice(0, 5000), // The text you wish to convert to speech, limit of 5000 characters
                  // Optional Parameters
                  stability: 0.5, // The stability for the converted speech
                  similarityBoost: 0.5, // The similarity boost for the converted speech
                })
                .then(res => {
                  console.log(`Building audio file for ${slug}...`)
                })
                .catch(err => {
                  console.error(err)
                })
            })
            // let's try to avoid any "too many requests" errors
            await sleep(20000)
          }
        }
      })
    }
  })
}

generateBlogAudio()
