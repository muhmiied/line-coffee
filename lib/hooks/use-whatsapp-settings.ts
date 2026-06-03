'use client'

import { useEffect, useState } from 'react'
import { WHATSAPP_DISPLAY, WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

type WhatsAppSettings = {
  phone: string
  displayPhone: string
}

function normalizePhone(value: unknown) {
  return typeof value === 'string' ? value.replace(/[^\d]/g, '') : ''
}

function normalizeDisplayPhone(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export function useWhatsAppSettings(): WhatsAppSettings {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    phone: WHATSAPP_ORDER_PHONE_E164,
    displayPhone: WHATSAPP_DISPLAY,
  })

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/whatsapp', { cache: 'no-store' })
      .then((response) => response.json())
      .then((json: { data?: { phone?: unknown; display_phone?: unknown } }) => {
        if (cancelled) return

        setSettings({
          phone: normalizePhone(json?.data?.phone) || WHATSAPP_ORDER_PHONE_E164,
          displayPhone: normalizeDisplayPhone(json?.data?.display_phone) || WHATSAPP_DISPLAY,
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return settings
}
