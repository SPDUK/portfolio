/* eslint-disable */
// @ts-nocheck - this is a boilerplate file from gatsby

import React from 'react'
import PropTypes from 'prop-types'

export default function HTML(props) {
  return (
    <html
      {...props.htmlAttributes}
      lang="en"
      data-theme="dark"
      className="dark"
    >
      <head>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
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
