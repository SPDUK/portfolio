function handleRunClick(this: HTMLButtonElement, evt: globalThis.MouseEvent) {
  const target = evt.target as HTMLElement
  const { children } = target.parentElement
  const { innerText } = Array.from(children)[0] as HTMLDivElement

  // run the code
  try {
    // eslint-disable-next-line no-eval
    const result = JSON.stringify(eval(innerText))

    if (!result) return

    const evalClass =
      typeof result === 'number' ? 'token number' : 'token keyword'

    const outputDiv = `
  <div class="code-output">
    <span class="token operator">Output: </span><span class="${evalClass}">${result}</span>
  </div>`

    target.parentElement.innerHTML += outputDiv
  } catch (err) {
    alert(err)
  }
}

function runCodeListener() {
  // get all blocks of code
  const codeBlocks = document.querySelectorAll('.gatsby-highlight')

  // add the copy button to each code block
  codeBlocks.forEach(codeBlock => {
    // create the copy button
    const runCodeButton = document.createElement('button')
    runCodeButton.innerHTML = 'Run Code'
    // add the event listener to each click
    runCodeButton.addEventListener('click', handleRunClick)
    // append the runCodeButton button to each code block
    codeBlock.append(runCodeButton)
  })
}

export default runCodeListener
