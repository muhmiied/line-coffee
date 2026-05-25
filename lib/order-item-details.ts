export type OrderItemDetailLine = {
  en: string
  ar: string
}

function readText(row: Record<string, unknown>, enKey: string, arKey: string) {
  const en = typeof row[enKey] === 'string' ? row[enKey] as string : ''
  const ar = typeof row[arKey] === 'string' ? row[arKey] as string : en
  return { en, ar }
}

export function getOrderItemDetailLines(customizations: unknown): OrderItemDetailLine[] {
  if (!customizations || typeof customizations !== 'object') return []

  const data = customizations as Record<string, unknown>
  const type = data.type

  if ((type === 'espresso-blend' || type === 'blend') && Array.isArray(data.beans)) {
    return data.beans
      .map((bean) => {
        if (!bean || typeof bean !== 'object') return null
        const row = bean as Record<string, unknown>
        const name = readText(row, 'name_en', 'name_ar')
        const percent = Number(row.percent)
        const suffix = Number.isFinite(percent) ? ` - ${percent}%` : ''
        return name.en || name.ar ? { en: `${name.en}${suffix}`, ar: `${name.ar}${suffix}` } : null
      })
      .filter((line): line is OrderItemDetailLine => Boolean(line))
  }

  if (type === 'flavor') {
    const lines: OrderItemDetailLine[] = []

    if (data.base && typeof data.base === 'object') {
      const base = readText(data.base as Record<string, unknown>, 'name_en', 'name_ar')
      if (base.en || base.ar) {
        lines.push({ en: `Base: ${base.en}`, ar: `القاعدة: ${base.ar}` })
      }
    }

    if (Array.isArray(data.flavors)) {
      const flavors = data.flavors
        .map((flavor) => {
          if (!flavor || typeof flavor !== 'object') return null
          return readText(flavor as Record<string, unknown>, 'name_en', 'name_ar')
        })
        .filter((flavor): flavor is { en: string; ar: string } => Boolean(flavor?.en || flavor?.ar))

      if (flavors.length > 0) {
        lines.push({
          en: `Flavors: ${flavors.map((flavor) => flavor.en).join(' + ')}`,
          ar: `النكهات: ${flavors.map((flavor) => flavor.ar).join(' + ')}`,
        })
      }
    }

    return lines
  }

  return []
}
