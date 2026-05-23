export const DEFAULT_FREE_SHIPPING_THRESHOLD = 200
export const STANDARD_SHIPPING_COST = 25

function unwrapJsonString(value: string): string {
  const trimmed = value.trim()

  if (trimmed.length >= 2 && trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"') {
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === 'string') return parsed
    } catch {}
  }

  return trimmed
}

export function parseFreeShippingThreshold(value: unknown): number {
  const raw = typeof value === 'string' ? unwrapJsonString(value) : value
  const threshold = Number(raw)

  if (!Number.isFinite(threshold) || threshold <= 0) return DEFAULT_FREE_SHIPPING_THRESHOLD
  return Math.round(threshold * 100) / 100
}

export function parseFreeShippingActive(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return true

  const normalized = unwrapJsonString(value).toLowerCase()
  return normalized !== 'false'
}

export function isDateWindowActive(startsAt?: unknown, endsAt?: unknown, now = new Date()): boolean {
  const start = typeof startsAt === 'string' && startsAt.trim() ? new Date(startsAt) : null
  const end = typeof endsAt === 'string' && endsAt.trim() ? new Date(endsAt) : null

  if (start && !Number.isNaN(start.getTime()) && start > now) return false
  if (end && !Number.isNaN(end.getTime()) && end < now) return false
  return true
}

export function calculateShippingCost(
  subtotal: number,
  freeShippingThreshold: number,
  standardShippingCost = STANDARD_SHIPPING_COST,
  freeShippingActive = true
): number {
  return freeShippingActive && subtotal >= freeShippingThreshold ? 0 : standardShippingCost
}

export function getFreeShippingRemaining(
  subtotal: number,
  freeShippingThreshold: number,
  freeShippingActive = true
): number {
  if (!freeShippingActive) return 0
  return Math.max(0, Math.round((freeShippingThreshold - subtotal) * 100) / 100)
}
