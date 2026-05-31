// finds all h1,h2,h3 headers in the markdown and adds a clickable anchor link
function addHeaderLinks() {
  const allHeaders = [
    ...document.querySelectorAll(
      '.article-prose h1, .article-prose h2, .article-prose h3',
    ),
  ] as HTMLHeadElement[]

  for (const header of allHeaders.filter(
    item => !item.querySelector('a[href^="#"]'),
  )) {
    header.id = header.innerText
    // add link to href here
    const link = document.createElement('a')
    link.href = `#${header.innerText}`
    link.innerHTML = '#'
    header.prepend(link)
  }
}
export default addHeaderLinks
