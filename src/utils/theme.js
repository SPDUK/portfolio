// not a very "react" way of handling this, but it allows us to use CSS vars based on the theme
function detectPrefersColorScheme() {
  // if browser doesn't support prefers-color-color scheme -> default to dark
  if (!window.matchMedia) return 'dark'

  // use light if they prefer light
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  // default to dark theme
  return 'dark'
}

// set the theme on page load based on localStorage or prefers-color-scheme
export function setTheme() {
  // make it safe for SSR -> don't do anything when building pages
  if (typeof window === 'undefined') return

  // if we have a localStorage theme stored -> use that
  const lsTheme = localStorage.getItem('theme')
  if (lsTheme) {
    return document.documentElement.setAttribute('data-theme', lsTheme)
  }

  const preferred = detectPrefersColorScheme()
  return document.documentElement.setAttribute('data-theme', preferred)
}

export function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme')

  // opposite of current theme or dark by
  const newTheme = theme === 'dark' ? 'light' : 'dark'

  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}
