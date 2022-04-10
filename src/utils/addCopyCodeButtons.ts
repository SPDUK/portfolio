import { toast } from 'react-toastify'
import copyToClipboard from './copyToClipboard'
import { isDark } from './theme'

const emojis = ['😍', '😎', '😱', '👌', '🙌', '🥳', '👻']

function handleCopyClick(this: HTMLButtonElement, evt: globalThis.MouseEvent) {
  // get the children of the parent element
  const { children } = (evt.target as HTMLElement).parentElement
  // grab the first element (we append the copy button on afterwards, so the first will be the code element)
  // destructure the innerText from the code block
  const { innerText } = Array.from(children)[0] as HTMLTextAreaElement

  // copy all of the code to the clipboard
  copyToClipboard(innerText)

  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
  const toastMessage = `${randomEmoji} Code copied to clipboard`

  // notification to show it worked
  if (isDark()) {
    toast.dark(toastMessage)
  } else {
    toast(toastMessage)
  }
}

function copyCodeListener() {
  // get all blocks of code
  const codeBlocks = document.querySelectorAll('.gatsby-highlight')

  // add the copy button to each code block
  codeBlocks.forEach(codeBlock => {
    // create the copy button
    const copy = document.createElement('button')
    copy.innerHTML = 'Copy'
    // add the event listener to each click
    copy.addEventListener('click', handleCopyClick)
    // append the copy button to each code block
    codeBlock.append(copy)
  })
}

export default copyCodeListener
