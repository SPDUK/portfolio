import React from 'react'
import { MotionPage } from './MotionPage'

interface WrapPageElementArgs {
  element: React.ReactNode
  props?: {
    location?: {
      pathname?: string
    }
  }
}

export const wrapPageElement = ({ element, props }: WrapPageElementArgs) => (
  <MotionPage path={props?.location?.pathname}>{element}</MotionPage>
)
