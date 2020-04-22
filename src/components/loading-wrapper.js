import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { setTheme } from '../utils/theme'

// lets us load the theme on page load so it only loads once when the initial page is loaded, but repeated page navigation doesn't need to set the theme again
const LoadingWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTheme()

    // stops flash of unstyled css, fake a cool loading thing here
    setTimeout(() => {
      setLoading(false)
    }, 400)
  }, [])

  console.log(loading)

  return loading ? <div>Loading...</div> : <>{children}</>
}

LoadingWrapper.propTypes = {
  children: PropTypes.element,
}

export default LoadingWrapper
