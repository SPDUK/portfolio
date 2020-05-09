import 'hiq/dist/hiq.min.css'
import 'normalize.css'
import 'focus-visible'

import React from 'react'
import LogRocket from 'logrocket'
import LoadingWrapper from './src/components/loading-wrapper'

export const wrapPageElement = ({ element, props }) => (
  <LoadingWrapper {...props}>{element}</LoadingWrapper>
)

// force reload page if new version available
export function onServiceWorkerUpdateReady() {
  window.location.reload(true)
}

// LogRocket for non-dev
if (process.env.NODE_ENV !== 'development') {
  LogRocket.init('25m9vw/portfolio')
}
