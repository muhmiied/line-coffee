export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type StandardOrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<StandardOrderStatus, { en: string; ar: string }> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  confirmed: { en: 'Confirmed', ar: 'تم التأكيد' },
  preparing: { en: 'Preparing', ar: 'قيد التجهيز' },
  shipped: { en: 'Shipped', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', ar: 'تم التسليم' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
}

export const ORDER_TIMELINE_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
] as const

export function normalizeOrderStatus(status: unknown): StandardOrderStatus | null {
  if (status === 'processing') return 'preparing'
  return ORDER_STATUSES.includes(status as StandardOrderStatus)
    ? (status as StandardOrderStatus)
    : null
}

export function getOrderStatusLabel(status: unknown) {
  const normalized = normalizeOrderStatus(status)
  return normalized ? ORDER_STATUS_LABELS[normalized] : { en: String(status || ''), ar: String(status || '') }
}

export function canAdminTransition(from: unknown, to: unknown) {
  const current = normalizeOrderStatus(from)
  const next = normalizeOrderStatus(to)

  if (!current || !next) return false
  if (current === next) return true
  if (current === 'cancelled' || current === 'delivered') return false
  if (next === 'cancelled') return true

  const currentIndex = (ORDER_TIMELINE_STATUSES as readonly string[]).indexOf(current)
  const nextIndex = (ORDER_TIMELINE_STATUSES as readonly string[]).indexOf(next)
  return currentIndex >= 0 && nextIndex >= currentIndex
}

export function canCustomerCancel(status: unknown, createdAt: string) {
  const normalized = normalizeOrderStatus(status)
  if (!normalized || normalized === 'cancelled' || normalized === 'shipped' || normalized === 'delivered') {
    return false
  }

  const hoursSinceOrder = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  return hoursSinceOrder <= 24
}
