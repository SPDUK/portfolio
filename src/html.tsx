/* eslint-disable */
// @ts-nocheck - this is a boilerplate file from gatsby

import React from 'react'
import PropTypes from 'prop-types'

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes} lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {

                function detectPrefersColorScheme() {
                  if (!window.matchMedia) return 'light'
            
                  // use light if they prefer light
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark'
                  }
                  // default to dark theme
                  return 'light'
                }
            
                var lsTheme = localStorage.getItem('theme')
                if (lsTheme) {
                  return document.documentElement.setAttribute('data-theme', lsTheme)
                }
            
                var preferred = detectPrefersColorScheme()
                document.documentElement.setAttribute('data-theme', preferred);
            })()
            `,
          }}
        />

        {props.preBodyComponents}
        <div
          key="body"
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}

/* eslint-enable */
