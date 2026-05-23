'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  parseFreeShippingActive,
  parseFreeShippingThreshold,
} from '@/lib/config/shipping'

export function useFreeShippingThreshold() {
  const [rule, setRule] = useState({
    threshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
    active: true,
  })

  useEffect(() => {
    let cancelled = false

    fetch('/api/settings/free-shipping', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: { threshold?: unknown; active?: unknown }) => {
        if (!cancelled) {
          setRule({
            threshold: parseFreeShippingThreshold(data?.threshold),
            active: parseFreeShippingActive(data?.active),
          })
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return rule
}
