const path = require('path')
const fs = require('fs')

const blogName = process.argv[2]
const blogPath = path.resolve(__dirname, 'content/blog')

const MARKDOWN_FILE_NAME = 'index.md'

const date = new Date().toISOString()

const header = `---
title: ${blogName.replace(/-/g, ' ')}
date: ${date}
type: html
action: copy
---


`

const body = `
### Introduction

Some cool text here!
`

const output = header.concat(body)

const outputPath = `${blogPath}/${blogName}`

// make folder
fs.mkdirSync(outputPath)

// make index.md file with content
const outputFilePath = `${outputPath}/${MARKDOWN_FILE_NAME}`

// write file
fs.writeFileSync(outputFilePath, output)
