import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  CUSTOM_BLEND_BEANS_KEY,
  DEFAULT_CUSTOM_BLEND_BEANS,
  DEFAULT_FLAVOR_ADDITIONS,
  FLAVOR_BASES,
  parseBeanOptions,
  slugifyOptionId,
  type BeanFamily,
  type CoffeeBeanOption,
  type FlavorAdditionOption,
  type FlavorAdditionType,
  type FlavorBaseOption,
} from '@/lib/config/customization'

function normalizeFamily(value: unknown): BeanFamily {
  return value === 'arabica' || value === 'robusta' || value === 'other' ? value : 'other'
}

function normalizeAdditionType(value: unknown): FlavorAdditionType {
  return value === 'chunks' ? 'chunks' : 'standard'
}

export async function GET() {
  const admin = createAdminClient()

  if (!admin) {
    return NextResponse.json({
      success: true,
      data: {
        beans: DEFAULT_CUSTOM_BLEND_BEANS.filter((bean) => bean.isVisible),
        flavorBases: FLAVOR_BASES,
        flavorAdditions: DEFAULT_FLAVOR_ADDITIONS,
      },
    })
  }

  const { data: beanRows, error: beanError } = await admin
    .from('coffee_beans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const dbBeans = !beanError && Array.isArray(beanRows)
    ? beanRows.map((bean): CoffeeBeanOption => ({
      id: slugifyOptionId(String(bean.name_en || bean.id)),
      nameEn: String(bean.name_en || ''),
      nameAr: String(bean.name_ar || ''),
      descEn: String(bean.description_en || ''),
      descAr: String(bean.description_ar || ''),
      family: normalizeFamily(bean.family),
      origin: bean.origin ? String(bean.origin) : undefined,
      price: Number(bean.price || 0),
      isVisible: bean.is_active !== false,
    })).filter((bean) => bean.nameEn && bean.nameAr && bean.price > 0)
    : []

  const { data: settingsData, error: settingsError } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', CUSTOM_BLEND_BEANS_KEY)
    .maybeSingle()

  const settingsBeans = settingsError
    ? DEFAULT_CUSTOM_BLEND_BEANS
    : parseBeanOptions(settingsData?.value)

  // ── Flavor bases (active only) ──────────────────────────────
  const { data: flavorBaseRows } = await admin
    .from('flavor_bases')
    .select('id, name_en, name_ar, price')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Build a UUID → slug map so flavor options can reference their base by slug
  const baseUuidToSlug = new Map<string, string>(
    (flavorBaseRows ?? []).map((b) => [
      String(b.id),
      slugifyOptionId(String(b.name_en || '')),
    ])
  )

  const activeBaseUuids = [...baseUuidToSlug.keys()]

  const flavorBases = Array.isArray(flavorBaseRows)
    ? flavorBaseRows
        .map((base): FlavorBaseOption => ({
          id: slugifyOptionId(String(base.name_en || base.id)),
          nameEn: String(base.name_en || ''),
          nameAr: String(base.name_ar || ''),
          price: Number(base.price || 0),
        }))
        .filter((base) => base.nameEn && base.nameAr && base.price > 0)
    : []

  // ── Flavor options: only from active bases, deduplicated ────
  // Each flavor may appear in multiple bases (one DB row per base).
  // We group by (name_en + option_type) and collect base slugs into bases[].
  const flavorOptionMap = new Map<string, FlavorAdditionOption>()

  if (activeBaseUuids.length > 0) {
    const { data: flavorOptionRows } = await admin
      .from('flavor_options')
      .select('*')
      .eq('is_active', true)
      .in('base_id', activeBaseUuids)
      .order('sort_order', { ascending: true })

    for (const row of flavorOptionRows ?? []) {
      const baseSlug = baseUuidToSlug.get(String(row.base_id))
      if (!baseSlug) continue  // skip orphaned rows

      const type = normalizeAdditionType(row.option_type)
      const mapKey = `${String(row.name_en).toLowerCase()}|${type}`

      if (flavorOptionMap.has(mapKey)) {
        const existing = flavorOptionMap.get(mapKey)!
        if (!(existing.bases ?? []).includes(baseSlug)) {
          existing.bases = [...(existing.bases ?? []), baseSlug]
        }
      } else {
        flavorOptionMap.set(mapKey, {
          id: slugifyOptionId(String(row.name_en || row.id)),
          nameEn: String(row.name_en || ''),
          nameAr: String(row.name_ar || ''),
          type,
          price: Number(row.price_delta || (type === 'chunks' ? 70 : 50)),
          bases: [baseSlug],
        })
      }
    }
  }

  const flavorAdditions = [...flavorOptionMap.values()].filter(
    (f) => f.nameEn && f.nameAr
  )

  const beans = dbBeans.length > 0 ? dbBeans : settingsBeans

  return NextResponse.json({
    success: true,
    data: {
      beans: beans.filter((bean) => bean.isVisible),
      flavorBases: flavorBases.length > 0 ? flavorBases : FLAVOR_BASES,
      flavorAdditions: flavorAdditions.length > 0 ? flavorAdditions : DEFAULT_FLAVOR_ADDITIONS,
    },
  })
}
