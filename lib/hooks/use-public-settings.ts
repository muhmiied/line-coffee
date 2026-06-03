'use client'

import { useEffect, useState } from 'react'
import {
  PUBLIC_SETTINGS_FALLBACK,
  type PublicSiteSettings,
  withPublicSettingsFallback,
} from '@/lib/config/public-settings'

export function usePublicSettings(): PublicSiteSettings {
  const [settings, setSettings] = useState<PublicSiteSettings>(PUBLIC_SETTINGS_FALLBACK)

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/public', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json: unknown) => {
        if (!cancelled) setSettings(withPublicSettingsFallback(json))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
