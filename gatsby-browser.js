import 'hiq/dist/hiq.min.css'
import 'normalize.css'
import 'focus-visible'

import React from 'react'
import LoadingWrapper from './src/components/loading-wrapper'

export const wrapPageElement = ({ element, props }) => (
  <LoadingWrapper {...props}>{element}</LoadingWrapper>
)

// force reload page if new version available
export function onServiceWorkerUpdateReady() {
  window.location.reload(true)
}
