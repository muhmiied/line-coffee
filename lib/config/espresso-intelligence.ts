import type { CoffeeBeanOption } from '@/lib/config/customization'

export type EspressoProfileId = 'balanced' | 'crema' | 'chocolate-nutty' | 'bright' | 'strong'
export type EspressoBodyPreference = 'medium' | 'full'

export type EspressoPreferences = {
  profileId: EspressoProfileId
  body: EspressoBodyPreference
  arabicaOnly: boolean
  budgetAware: boolean
}

export type EspressoSuggestedBean = {
  bean: CoffeeBeanOption
  percent: number
}

export type EspressoRecommendation = {
  beans: EspressoSuggestedBean[]
  reasonEn: string
  reasonAr: string
}

type MetricKey = 'crema' | 'body' | 'acidity' | 'bitterness' | 'strength'
export type EspressoBlendMetrics = Record<MetricKey, number> & {
  chocolate: number
  nutty: number
}

export type EspressoBlendInputBean = CoffeeBeanOption & {
  finalPercent?: number
  percent?: string | number
}

export type EspressoBlendAdvice = {
  messageEn: string
  messageAr: string
  tone: 'neutral' | 'warning'
}

type ProfileConfig = {
  id: EspressoProfileId
  labelEn: string
  labelAr: string
  target: EspressoBlendMetrics
  weights: Partial<Record<keyof EspressoBlendMetrics, number>>
  reasonEn: string
  reasonAr: string
}

export const ESPRESSO_PROFILE_OPTIONS: ProfileConfig[] = [
  {
    id: 'balanced',
    labelEn: 'Balanced',
    labelAr: 'متوازن',
    target: { crema: 3.4, body: 3.5, acidity: 2.8, bitterness: 2.7, strength: 3.1, chocolate: 3, nutty: 3 },
    weights: { crema: 1, body: 1.2, acidity: 0.8, bitterness: 0.8, strength: 1, chocolate: 0.7, nutty: 0.7 },
    reasonEn: 'A rounded espresso with steady body, soft crema, and a clean finish.',
    reasonAr: 'إسبريسو متوازن بقوام ثابت وكريما ناعمة ونهاية نظيفة.',
  },
  {
    id: 'crema',
    labelEn: 'Crema',
    labelAr: 'كريما',
    target: { crema: 4.7, body: 4.2, acidity: 2, bitterness: 3.5, strength: 4.1, chocolate: 3, nutty: 2.6 },
    weights: { crema: 1.8, body: 1.2, strength: 1.1, bitterness: 0.7 },
    reasonEn: 'Built for thicker crema, fuller body, and a bolder espresso pull.',
    reasonAr: 'مصممة لكريما أكثف وقوام ممتلئ واستخلاص إسبريسو أقوى.',
  },
  {
    id: 'chocolate-nutty',
    labelEn: 'Chocolate-Nutty',
    labelAr: 'شوكولاتة ومكسرات',
    target: { crema: 3.4, body: 4, acidity: 2.2, bitterness: 2.6, strength: 3.2, chocolate: 4.8, nutty: 4.2 },
    weights: { chocolate: 1.7, nutty: 1.4, body: 1.1, acidity: 0.7, bitterness: 0.6 },
    reasonEn: 'Focused on warm chocolate, soft nuts, and a smooth premium body.',
    reasonAr: 'تركز على دفء الشوكولاتة ولمسة المكسرات وقوام فاخر ناعم.',
  },
  {
    id: 'bright',
    labelEn: 'Bright',
    labelAr: 'مشرق',
    target: { crema: 2.8, body: 3, acidity: 4.4, bitterness: 2, strength: 2.8, chocolate: 2.3, nutty: 2.3 },
    weights: { acidity: 1.8, bitterness: 1, body: 0.8, strength: 0.7 },
    reasonEn: 'Highlights brighter arabica character, aroma, and a cleaner cup.',
    reasonAr: 'تبرز طابع الأرابيكا المشرق والعطرية وكوب أنظف.',
  },
  {
    id: 'strong',
    labelEn: 'Strong',
    labelAr: 'قوي',
    target: { crema: 4, body: 4.6, acidity: 1.8, bitterness: 4.2, strength: 4.8, chocolate: 3, nutty: 2.5 },
    weights: { strength: 1.8, body: 1.4, crema: 1.2, bitterness: 1 },
    reasonEn: 'A stronger espresso direction with high body, caffeine, and presence.',
    reasonAr: 'اتجاه إسبريسو أقوى بقوام عال وكافيين وحضور واضح.',
  },
]

const DEFAULT_PREFERENCES: EspressoPreferences = {
  profileId: 'balanced',
  body: 'medium',
  arabicaOnly: false,
  budgetAware: false,
}

function clampScale(value: number) {
  return Math.max(1, Math.min(5, value))
}

function roundMetric(value: number) {
  return Math.round(clampScale(value) * 10) / 10
}

function textIncludes(bean: CoffeeBeanOption, pattern: RegExp) {
  return pattern.test(`${bean.id} ${bean.nameEn} ${bean.origin ?? ''} ${bean.descEn} ${bean.descAr}`.toLowerCase())
}

function explicitOrFallback(bean: CoffeeBeanOption, key: MetricKey, fallback: number) {
  const explicit = bean[key]
  return typeof explicit === 'number' ? clampScale(explicit) : fallback
}

export function getEspressoBeanMetrics(bean: CoffeeBeanOption): EspressoBlendMetrics {
  const isRobusta = bean.family === 'robusta'
  const chocolate = textIncludes(bean, /brazil|colombia|india|guatemala|santos|chocolate|cocoa|nut|caramel/)
  const nutty = textIncludes(bean, /india|brazil|santos|nut|almond|hazelnut/)
  const bright = textIncludes(bean, /ethiopia|kenya|tanzania|costa|peru|nicaragua|floral|fruit|bright/)
  const boldRobusta = textIncludes(bean, /vietnam|indonesia|uganda|robusta|xl|aa/)

  return {
    crema: explicitOrFallback(bean, 'crema', isRobusta ? (boldRobusta ? 4.8 : 4.4) : 3),
    body: explicitOrFallback(bean, 'body', isRobusta ? 4.5 : chocolate ? 4 : 3.4),
    acidity: explicitOrFallback(bean, 'acidity', isRobusta ? 1.8 : bright ? 4.3 : 3.1),
    bitterness: explicitOrFallback(bean, 'bitterness', isRobusta ? 4 : chocolate ? 2.5 : 2.2),
    strength: explicitOrFallback(bean, 'strength', isRobusta ? (boldRobusta ? 4.8 : 4.4) : 3),
    chocolate: chocolate ? 4.5 : isRobusta ? 3 : 2.4,
    nutty: nutty ? 4.4 : chocolate ? 3.3 : 2.3,
  }
}

function isUnavailable(bean: CoffeeBeanOption) {
  return bean.isVisible === false ||
    bean.isManuallyOutOfStock === true ||
    (typeof bean.stockQuantity === 'number' && bean.stockQuantity <= 0)
}

function getProfile(id: EspressoProfileId) {
  return ESPRESSO_PROFILE_OPTIONS.find((profile) => profile.id === id) ?? ESPRESSO_PROFILE_OPTIONS[0]
}

function scoreBean(bean: CoffeeBeanOption, profile: ProfileConfig, preferences: EspressoPreferences, minPrice: number, maxPrice: number) {
  const metrics = getEspressoBeanMetrics(bean)
  const target = {
    ...profile.target,
    body: preferences.body === 'full' ? Math.max(profile.target.body, 4.4) : Math.min(profile.target.body, 3.5),
  }
  const distance = Object.entries(profile.weights).reduce((sum, [key, weight]) => {
    const metric = key as keyof EspressoBlendMetrics
    return sum + Math.abs(metrics[metric] - target[metric]) * (weight ?? 1)
  }, 0)
  const arabicaBonus = bean.family === 'arabica' && (profile.id === 'bright' || profile.id === 'balanced') ? 0.35 : 0
  const robustaBonus = bean.family === 'robusta' && (profile.id === 'crema' || profile.id === 'strong') ? 0.55 : 0
  const priceRange = Math.max(1, maxPrice - minPrice)
  const budgetPenalty = preferences.budgetAware ? ((bean.salePrice ?? bean.price) - minPrice) / priceRange * 0.8 : 0

  return 10 - distance + arabicaBonus + robustaBonus - budgetPenalty
}

function normalizeRatios(count: number, robustaCount: number, profileId: EspressoProfileId) {
  if (count <= 0) return []
  if (count === 1) return [100]

  const robustaAllowed = profileId === 'crema' || profileId === 'strong'
  const robustaShare = robustaCount === 0 ? 0 : robustaAllowed ? 40 : 20
  const arabicaCount = count - robustaCount
  const base = Array.from({ length: count }, () => 0)

  if (robustaCount > 0 && arabicaCount > 0) {
    const arabicaShare = 100 - robustaShare
    return base.map((_, index) => index < arabicaCount
      ? Math.floor(arabicaShare / arabicaCount)
      : Math.floor(robustaShare / robustaCount)
    )
  }

  const equal = Math.floor(100 / count)
  return base.map(() => equal)
}

function cleanRatios(ratios: number[]) {
  const next = ratios.map((ratio) => Math.max(0, Math.round(ratio / 5) * 5))
  const total = next.reduce((sum, ratio) => sum + ratio, 0)
  if (next.length > 0) next[0] += 100 - total
  return next
}

function getProfileId(preferences: Partial<EspressoPreferences>) {
  return preferences.profileId ?? DEFAULT_PREFERENCES.profileId
}

function isBrightAccent(bean: CoffeeBeanOption) {
  const metrics = getEspressoBeanMetrics(bean)
  return metrics.acidity >= 4 || textIncludes(bean, /ethiopia|kenya|tanzania|yemen|yemeni|guatemala|floral|fruit|bright/)
}

function getManualBeanWeight(
  bean: CoffeeBeanOption,
  preferences: Partial<EspressoPreferences>,
  minPrice: number,
  maxPrice: number,
) {
  const profileId = getProfileId(preferences)
  const metrics = getEspressoBeanMetrics(bean)
  const robusta = bean.family === 'robusta'
  const priceRange = Math.max(1, maxPrice - minPrice)
  const budgetPenalty = preferences.budgetAware
    ? ((bean.salePrice ?? bean.price) - minPrice) / priceRange * 0.45
    : 0

  let weight = metrics.body * 1.2 + metrics.chocolate * 0.8 + metrics.nutty * 0.45 + metrics.crema * 0.35 + metrics.strength * 0.25
  weight -= metrics.acidity * 0.35

  if (isBrightAccent(bean)) weight *= 0.78
  if (robusta) weight *= profileId === 'strong' || profileId === 'crema' ? 1.05 : 0.62
  if (preferences.body === 'full' && metrics.body >= 4) weight += 0.8
  if (profileId === 'bright' && metrics.acidity >= 4) weight += 1.1
  if (profileId === 'chocolate-nutty') weight += metrics.chocolate * 0.25 + metrics.nutty * 0.2
  if (profileId === 'crema') weight += metrics.crema * 0.35
  if (profileId === 'strong') weight += metrics.strength * 0.4

  return Math.max(1, weight - budgetPenalty)
}

function normalizeWeightedRatios(beans: CoffeeBeanOption[], weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  if (total <= 0) return cleanRatios(normalizeRatios(beans.length, beans.filter((bean) => bean.family === 'robusta').length, 'balanced'))

  const rounded = cleanRatios(weights.map((weight) => (weight / total) * 100))
  const minimum = beans.length >= 4 ? 10 : 15
  const adjusted = rounded.map((ratio) => Math.max(minimum, ratio))
  return cleanRatios(adjusted)
}

function capRobustaShare(beans: CoffeeBeanOption[], ratios: number[], preferences: Partial<EspressoPreferences>) {
  const robustaIndexes = beans
    .map((bean, index) => bean.family === 'robusta' ? index : -1)
    .filter((index) => index >= 0)
  if (robustaIndexes.length === 0) return ratios

  const profileId = getProfileId(preferences)
  const cap = profileId === 'strong' || profileId === 'crema' ? 40 : beans.length === 2 ? 30 : 25
  const robustaTotal = robustaIndexes.reduce((sum, index) => sum + (ratios[index] ?? 0), 0)
  if (robustaTotal <= cap) return ratios

  const next = [...ratios]
  const excess = robustaTotal - cap
  robustaIndexes.forEach((index) => {
    next[index] = Math.max(10, Math.round(((next[index] ?? 0) / robustaTotal * cap) / 5) * 5)
  })

  const arabicaIndexes = beans
    .map((bean, index) => bean.family !== 'robusta' ? index : -1)
    .filter((index) => index >= 0)
  const arabicaTotal = arabicaIndexes.reduce((sum, index) => sum + (next[index] ?? 0), 0)
  arabicaIndexes.forEach((index) => {
    next[index] = (next[index] ?? 0) + Math.round(((next[index] ?? 0) / Math.max(1, arabicaTotal) * excess) / 5) * 5
  })

  return cleanRatios(next)
}

export function suggestSmartEspressoRatios(
  selectedBeans: CoffeeBeanOption[],
  preferences: Partial<EspressoPreferences> = {},
): EspressoSuggestedBean[] {
  if (selectedBeans.length === 0) return []
  if (selectedBeans.length === 1) return [{ bean: selectedBeans[0], percent: 100 }]

  const prices = selectedBeans.map((bean) => bean.salePrice ?? bean.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const weighted = selectedBeans
    .map((bean, index) => ({
      bean,
      index,
      weight: getManualBeanWeight(bean, preferences, minPrice, maxPrice),
    }))
    .sort((a, b) => b.weight - a.weight)

  const orderedRatios = capRobustaShare(
    weighted.map((item) => item.bean),
    normalizeWeightedRatios(weighted.map((item) => item.bean), weighted.map((item) => item.weight)),
    preferences,
  )
  const byOriginalIndex = weighted.map((item, index) => ({ ...item, percent: orderedRatios[index] ?? 0 }))
    .sort((a, b) => a.index - b.index)

  return byOriginalIndex.map(({ bean, percent }) => ({ bean, percent }))
}

function getRawPercent(bean: EspressoBlendInputBean) {
  const value = bean.finalPercent ?? Number(bean.percent ?? 0)
  return Number.isFinite(value) ? value : 0
}

function getWorkingPercents(beans: EspressoBlendInputBean[]) {
  const raw = beans.map(getRawPercent)
  const total = raw.reduce((sum, percent) => sum + percent, 0)
  if (beans.length === 0) return []
  if (total <= 0) return suggestSmartEspressoRatios(beans).map((item) => item.percent)
  return raw.map((percent) => (percent / total) * 100)
}

export function calculateEspressoBlendMetrics(beans: EspressoBlendInputBean[]): EspressoBlendMetrics | null {
  if (beans.length === 0) return null

  const percents = getWorkingPercents(beans)
  const emptyMetrics: EspressoBlendMetrics = {
    crema: 0,
    body: 0,
    acidity: 0,
    bitterness: 0,
    strength: 0,
    chocolate: 0,
    nutty: 0,
  }

  const metrics = beans.reduce((totals, bean, index) => {
    const beanMetrics = getEspressoBeanMetrics(bean)
    const weight = (percents[index] ?? 0) / 100
    return {
      crema: totals.crema + beanMetrics.crema * weight,
      body: totals.body + beanMetrics.body * weight,
      acidity: totals.acidity + beanMetrics.acidity * weight,
      bitterness: totals.bitterness + beanMetrics.bitterness * weight,
      strength: totals.strength + beanMetrics.strength * weight,
      chocolate: totals.chocolate + beanMetrics.chocolate * weight,
      nutty: totals.nutty + beanMetrics.nutty * weight,
    }
  }, emptyMetrics)

  return {
    crema: roundMetric(metrics.crema),
    body: roundMetric(metrics.body),
    acidity: roundMetric(metrics.acidity),
    bitterness: roundMetric(metrics.bitterness),
    strength: roundMetric(metrics.strength),
    chocolate: roundMetric(metrics.chocolate),
    nutty: roundMetric(metrics.nutty),
  }
}

function formatSuggestedBlend(beans: EspressoSuggestedBean[]) {
  const en = beans.map(({ bean, percent }) => `${bean.nameEn} ${percent}%`).join(', ')
  const ar = beans.map(({ bean, percent }) => `${bean.nameAr} ${percent}%`).join('، ')
  return { en, ar }
}

export function analyzeEspressoBlend(
  selectedBeans: EspressoBlendInputBean[],
  preferences: Partial<EspressoPreferences> = {},
): EspressoBlendAdvice | null {
  const selectedSuggestion = suggestSmartEspressoRatios(selectedBeans, preferences)
  const suggestionText = formatSuggestedBlend(selectedSuggestion)

  if (selectedBeans.length === 0) {
    return {
      tone: 'neutral',
      messageEn: 'Select beans to preview a smart ratio for your blend.',
      messageAr: 'اختر الحبوب لعرض نسبة ذكية للتوليفة.',
    }
  }

  const profileId = preferences.profileId ?? DEFAULT_PREFERENCES.profileId
  const rawTotal = selectedBeans.reduce((sum, bean) => sum + getRawPercent(bean), 0)
  const metrics = calculateEspressoBlendMetrics(selectedBeans)
  const robustaShare = selectedBeans.reduce((sum, bean) => bean.family === 'robusta' ? sum + getRawPercent(bean) : sum, 0)
  const dominantBean = selectedBeans.find((bean) => getRawPercent(bean) >= 70)
  const brightCount = selectedBeans.filter((bean) => getEspressoBeanMetrics(bean).acidity >= 4).length
  if (selectedBeans.length > 4) {
    return {
      tone: 'warning',
      messageEn: 'This blend is crowded. Reduce it to 2-4 beans, then use a smart ratio from the selected beans.',
      messageAr: 'التوليفة مزدحمة. قللها إلى 2-4 أنواع، ثم استخدم نسبة ذكية من الحبوب المختارة.',
    }
  }

  if (selectedBeans.length === 1) {
    return {
      tone: 'neutral',
      messageEn: 'A single origin works, but add 1-2 supporting beans for more balance.',
      messageAr: 'منشأ واحد مناسب، لكن أضف نوعا أو نوعين داعمين لتوازن أفضل.',
    }
  }

  if (rawTotal > 0 && Math.round(rawTotal * 10) / 10 !== 100) {
    return {
      tone: 'warning',
      messageEn: `Set the total to 100%. Suggested adjustment: ${suggestionText.en}.`,
      messageAr: `اجعل المجموع 100%. اقتراح النسب: ${suggestionText.ar}.`,
    }
  }

  if (robustaShare > 35 && profileId !== 'strong' && profileId !== 'crema') {
    return {
      tone: 'warning',
      messageEn: `Reduce Robusta slightly and keep it as crema support. Suggested smart ratio: ${suggestionText.en}.`,
      messageAr: `قلل الروبوستا قليلا واجعلها داعمة للكريما. النسبة الذكية المقترحة: ${suggestionText.ar}.`,
    }
  }

  if (metrics && metrics.acidity >= 4 && metrics.body < 3.4) {
    return {
      tone: 'warning',
      messageEn: `The selected beans lean bright. Use the fuller bean as the base: ${suggestionText.en}.`,
      messageAr: `الحبوب المختارة تميل للحموضة. اجعل النوع الأعلى قواما هو الأساس: ${suggestionText.ar}.`,
    }
  }

  if (brightCount >= 3) {
    return {
      tone: 'warning',
      messageEn: `Too many bright origins together can feel sharp. Try ${suggestionText.en}.`,
      messageAr: `كثرة المناشئ المشرقة معا قد تجعل الطعم حادا. جرب ${suggestionText.ar}.`,
    }
  }

  if (dominantBean && selectedBeans.length > 1 && profileId !== 'strong') {
    return {
      tone: 'neutral',
      messageEn: `One bean is dominating the cup. A smoother split could be ${suggestionText.en}.`,
      messageAr: `نوع واحد يسيطر على الكوب. تقسيمة أنعم قد تكون ${suggestionText.ar}.`,
    }
  }

  return {
    tone: 'neutral',
      messageEn: `Suggested smart ratio: ${suggestionText.en}.`,
      messageAr: `النسبة الذكية المقترحة: ${suggestionText.ar}.`,
  }
}

export function recommendEspressoBlend(
  beans: CoffeeBeanOption[],
  rawPreferences: Partial<EspressoPreferences> = {},
): EspressoRecommendation {
  const preferences = { ...DEFAULT_PREFERENCES, ...rawPreferences }
  const profile = getProfile(preferences.profileId)
  const validBeans = beans.filter((bean) => !isUnavailable(bean))
  const familyFiltered = preferences.arabicaOnly
    ? validBeans.filter((bean) => bean.family === 'arabica')
    : validBeans
  const candidates = familyFiltered.length > 0 ? familyFiltered : validBeans

  if (candidates.length === 0) {
    return { beans: [], reasonEn: profile.reasonEn, reasonAr: profile.reasonAr }
  }

  const prices = candidates.map((bean) => bean.salePrice ?? bean.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const ranked = candidates
    .map((bean) => ({ bean, score: scoreBean(bean, profile, preferences, minPrice, maxPrice) }))
    .sort((a, b) => b.score - a.score)

  const targetCount = Math.min(4, Math.max(2, ranked.length >= 3 ? 3 : ranked.length))
  const selected = ranked.reduce<CoffeeBeanOption[]>((items, item) => {
    if (items.length >= targetCount) return items
    const robustaCount = items.filter((bean) => bean.family === 'robusta').length
    const nextIsRobusta = item.bean.family === 'robusta'
    const canUseRobusta = !preferences.arabicaOnly &&
      (!nextIsRobusta || profile.id === 'crema' || profile.id === 'strong' || robustaCount === 0)
    if (canUseRobusta) items.push(item.bean)
    return items
  }, [])

  const fallbackSelected = selected.length > 0 ? selected : ranked.slice(0, targetCount).map((item) => item.bean)
  const arabica = fallbackSelected.filter((bean) => bean.family !== 'robusta')
  const robusta = fallbackSelected.filter((bean) => bean.family === 'robusta')
  const ordered = [...arabica, ...robusta]
  const ratios = cleanRatios(normalizeRatios(ordered.length, robusta.length, profile.id))

  return {
    beans: ordered.map((bean, index) => ({
      bean,
      percent: ratios[index] ?? 0,
    })),
    reasonEn: profile.reasonEn,
    reasonAr: profile.reasonAr,
  }
}
