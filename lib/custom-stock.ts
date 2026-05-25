export type CustomStockCartItem = {
  id: string
  size?: string
  quantity: number
  customizations?: Record<string, unknown>
}

export type CustomStockIssue = {
  messageEn: string
  messageAr: string
}

type CustomSelection = {
  key: string
  nameEn: string
  nameAr: string
  requiredKg: number
  stockKg: number
  manuallyOut: boolean
}

const EPSILON = 0.0001

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function packageSizeToKg(size: unknown) {
  if (size === '250g') return 0.25
  if (size === '500g') return 0.5
  if (size === '1kg') return 1
  return 0
}

function readFiniteNumber(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return null
}

function readStockKg(row: Record<string, unknown>) {
  const stock = readFiniteNumber(row.stock_quantity, row.stockQuantity)
  return stock === null ? Infinity : Math.max(0, stock)
}

function isManuallyOut(row: Record<string, unknown>) {
  return row.is_manually_out_of_stock === true || row.isManuallyOutOfStock === true
}

function readName(row: Record<string, unknown>, fallback: string) {
  const nameEn = typeof row.name_en === 'string'
    ? row.name_en
    : typeof row.nameEn === 'string'
      ? row.nameEn
      : fallback
  const nameAr = typeof row.name_ar === 'string'
    ? row.name_ar
    : typeof row.nameAr === 'string'
      ? row.nameAr
      : nameEn

  return { nameEn, nameAr }
}

function formatKg(value: number) {
  if (!Number.isFinite(value)) return ''
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

export function getCustomSelections(item: CustomStockCartItem, quantity = item.quantity): CustomSelection[] {
  const customizations = item.customizations
  if (!customizations) return []

  const weightKg = packageSizeToKg(item.size)
  if (weightKg <= 0 || quantity <= 0) return []

  if (customizations.type === 'espresso-blend' && Array.isArray(customizations.beans)) {
    const rows = customizations.beans.filter(isRecord)
    const fallbackPercent = rows.length > 0 ? 100 / rows.length : 0

    return rows.map((row, index) => {
      const id = String(row.id || `bean-${index + 1}`)
      const percent = readFiniteNumber(row.percent) ?? fallbackPercent
      const { nameEn, nameAr } = readName(row, 'Selected bean')

      return {
        key: `bean:${id}`,
        nameEn,
        nameAr,
        requiredKg: weightKg * quantity * Math.max(0, percent) / 100,
        stockKg: readStockKg(row),
        manuallyOut: isManuallyOut(row),
      }
    })
  }

  if (customizations.type === 'flavor' && Array.isArray(customizations.flavors)) {
    return customizations.flavors.filter(isRecord).map((row, index) => {
      const id = String(row.id || `flavor-${index + 1}`)
      const { nameEn, nameAr } = readName(row, 'Selected flavor')

      return {
        key: `flavor:${id}`,
        nameEn,
        nameAr,
        requiredKg: weightKg * quantity,
        stockKg: readStockKg(row),
        manuallyOut: isManuallyOut(row),
      }
    })
  }

  return []
}

export function getCustomStockIssue(
  items: CustomStockCartItem[],
  targetItem: CustomStockCartItem,
  targetQuantity: number,
): CustomStockIssue | null {
  const aggregate = new Map<string, CustomSelection>()
  const nextItems = [
    ...items.filter((item) => item.id !== targetItem.id),
    ...(targetQuantity > 0 ? [{ ...targetItem, quantity: targetQuantity }] : []),
  ]

  for (const item of nextItems) {
    for (const selection of getCustomSelections(item)) {
      const existing = aggregate.get(selection.key)
      if (existing) {
        existing.requiredKg += selection.requiredKg
        existing.stockKg = Math.min(existing.stockKg, selection.stockKg)
        existing.manuallyOut = existing.manuallyOut || selection.manuallyOut
      } else {
        aggregate.set(selection.key, { ...selection })
      }
    }
  }

  for (const selection of aggregate.values()) {
    const nameEn = selection.nameEn
    const nameAr = selection.nameAr

    if (selection.manuallyOut || selection.stockKg <= 0) {
      return {
        messageEn: `${nameEn} is out of stock.`,
        messageAr: `${nameAr} غير متاح حالياً.`,
      }
    }

    if (Number.isFinite(selection.stockKg) && selection.requiredKg - selection.stockKg > EPSILON) {
      return {
        messageEn: `Only ${formatKg(selection.stockKg)}kg available for ${nameEn}.`,
        messageAr: `المتاح من ${nameAr} هو ${formatKg(selection.stockKg)} كجم فقط.`,
      }
    }
  }

  return null
}

export function getCustomItemMaxQuantity(
  items: CustomStockCartItem[],
  targetItem: CustomStockCartItem,
  maxQuantity = 99,
) {
  let max = 0

  for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
    if (getCustomStockIssue(items, targetItem, quantity)) break
    max = quantity
  }

  return max
}
