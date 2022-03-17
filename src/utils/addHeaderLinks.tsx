// finds all h1,h2,h3 headers in the markdown and adds a clickable anchor link
function addHeaderLinks() {
  const allHeaders = [...document.querySelectorAll('h1, h2, h3')].slice(1)

  for (const header of allHeaders) {
    header.id = header.innerText
    // add link to href here
    const link = document.createElement('a')
    link.href = `#${header.innerText}`
    link.innerHTML = '#'
    header.prepend(link)
  }
}
export default addHeaderLinks
