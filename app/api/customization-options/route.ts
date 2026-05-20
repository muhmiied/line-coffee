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

  const { data: flavorBaseRows } = await admin
    .from('flavor_bases')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

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

  const { data: flavorOptionRows } = await admin
    .from('flavor_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const flavorAdditions = Array.isArray(flavorOptionRows)
    ? flavorOptionRows
      .map((flavor): FlavorAdditionOption => {
        const type = normalizeAdditionType(flavor.option_type)
        return {
          id: slugifyOptionId(String(flavor.name_en || flavor.id)),
          nameEn: String(flavor.name_en || ''),
          nameAr: String(flavor.name_ar || ''),
          type,
          price: Number(flavor.price_delta || (type === 'chunks' ? 70 : 50)),
        }
      })
      .filter((flavor) => flavor.nameEn && flavor.nameAr)
    : []

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
