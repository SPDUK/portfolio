---
title: How to add a copy button to markdown code blocks using JavaScript
date: "2019-06-01T22:40:32.169Z"
type: "javascript"
action: "copy"
---

[CodePen Example](https://codepen.io/GameboyAdvanceSP/pen/rEarBv?editors=0110)

#### Introduction

I always appreciate the little things when on the internet, so having a single button to do some extra work for me is great, but not only that, it also allows easy navigation using only the keyboard, so accessibility skyrockets, there's no need to even use a mouse.

---

#### Adding the copy button

To create this copy button, we need to append a button to each code block and have that button copy the code into the clipboard when clicked.

To get started, we need to find out what our `<code>` blocks look like.

In my case, each block is wrapped in a `div class="highlight">`, so that's what I'll be adding the copy button onto, this div has only a single child, that being the code block.

_This may be different for you depending on what you're using to convert markdown into HTML._

```javascript
// get the list of all highlight code blocks
const highlights = document.querySelectorAll("div.highlight")

highlights.forEach(div => {
  // create the copy button
  const copy = document.createElement("button")
  copy.innerHTML = "Copy"
  // add the event listener to each click
  copy.addEventListener("click", handleCopyClick)
  // append the copy button to each code block
  div.append(copy)
})
```

Now we've added a button to each highlighted code block, but it doesn't do anything, we haven't created `handleCopyClick` just yet.

We'll need to also add some CSS to make the copy button a little nicer looking.

```css
div.highlight button {
  color: #adb5bd;
  box-sizing: border-box;
  transition: 0.2s ease-out;
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0);
  padding: 5px 10px;
  font-size: 0.8em;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 0.15rem;
}
```

This will position the button in the top right of the code block, and make it feel more like a button, including hover and click styles.

---

#### Copying the code to the clipboard

To do this we need a little helper function, sadly the [clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) only works modern browsers, not all of them.

```javascript
const copyToClipboard = str => {
  const el = document.createElement("textarea") // Create a <textarea> element
  el.value = str // Set its value to the string that you want copied
  el.setAttribute("readonly", "") // Make it readonly to be tamper-proof
  el.style.position = "absolute"
  el.style.left = "-9999px" // Move outside the screen to make it invisible
  document.body.appendChild(el) // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0) // Store selection if found
      : false // Mark as false to know no selection existed before
  el.select() // Select the <textarea> content
  document.execCommand("copy") // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el) // Remove the <textarea> element
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges() // Unselect everything on the HTML document
    document.getSelection().addRange(selected) // Restore the original selection
  }
}
```

The comments explain most of what's going on, but basically, it enables us to copy the code to the clipboard and it works on any browser.

We previously added `handleCopyClick` as an event listener to each button, but now we need to create it.

```javascript
function handleCopyClick(evt) {
  // get the children of the parent element
  const { children } = evt.target.parentElement
  // grab the first element (we append the copy button on afterwards, so the first will be the code element)
  // destructure the innerText from the code block
  const { innerText } = Array.from(children)[0]
  // copy all of the code to the clipboard
  copyToClipboard(innerText)
  // alert to show it worked, but you can put any kind of tooltip/popup to notify it worked
  alert(innerText)
}
```

Because we used `append` to place the copy button into the parent div earlier, we know that it will be the last child of the parent.

Here's what the structure looks like, so you can visualize it:

```html
<div class="highlight">
  <code> ... </code>
  <button>Copy</button>
</div>
```

This means the first child of the parent element must be our `<code>` block, we destructure the `innerText` from the first child and pass it as an argument to `copyToClipboard`.

After the code has been copied we use an alert to notify that it worked, just to keep the demo simple.

---

And there we have it, every code block on the page is appended with a copy button!

[You can check out a working example of this code at CodePen.](https://codepen.io/GameboyAdvanceSP/pen/rEarBv?editors=0110)
