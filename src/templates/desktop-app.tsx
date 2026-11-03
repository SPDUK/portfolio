import React from 'react'
import { SEO } from '../components/Seo'
import { apps } from '../components/Desktop/model'
import type { AppId } from '../components/Desktop/model'

export default function DesktopAppPage({
  pageContext,
}: {
  pageContext: { appId: AppId }
}) {
  const app = apps.find(item => item.id === pageContext.appId)
  if (!app) return null
  return (
    <SEO
      title={app.label}
      pathname={app.path}
      description={`${app.label} in Steve's interactive portfolio. ${app.subtitle}.`}
    />
  )
}
