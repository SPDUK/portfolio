function handleRunClick(evt) {
  const { children } = evt.target.parentElement
  const { innerText } = Array.from(children)[0]

  // run the code
  const result = eval(innerText)

  const evalClass =
    typeof result === 'number' ? 'token number' : 'token keyword'

  const outputDiv = `
  <div class="code-output">
    <span class="token operator">Output: </span><span class="${evalClass}">${result}</span>
  </div>`

  evt.target.parentElement.parentElement.innerHTML += outputDiv
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
