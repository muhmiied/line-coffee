'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  Info,
  Key,
  Link as LinkIcon,
  MessageCircle,
  Megaphone,
  Package,
  Percent,
  Phone,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  buildDefaultFreeShippingText,
  type AnnouncementAnimation,
  type AnnouncementRule,
  type AnnouncementRuleType,
} from '@/lib/config/announcement-rules'
import { useLanguage } from '@/lib/context/language'

type AnnouncementRuleForm = AnnouncementRule

const DEFAULT_DURATION = 4000
const DEFAULT_FREE_SHIPPING_THRESHOLD = 200

function createRule(type: AnnouncementRuleType = 'text', minimumOrder = DEFAULT_FREE_SHIPPING_THRESHOLD): AnnouncementRuleForm {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  if (type === 'free_shipping') {
    return {
      id,
      type,
      active: true,
      text_ar: '',
      text_en: '',
      animation: 'fade',
      duration: DEFAULT_DURATION,
      starts_at: null,
      ends_at: null,
      minimum_order: minimumOrder,
      applies_to: 'all',
      shipping_discount_percent: 100,
      auto_apply: true,
    }
  }

  return {
    id,
    type,
    active: true,
    text_ar: '',
    text_en: '',
    animation: 'fade',
    duration: DEFAULT_DURATION,
    starts_at: null,
    ends_at: null,
  }
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null
}

function normalizeLoadedRules(data: {
  rules?: AnnouncementRule[]
  messages_ar?: string[]
  messages?: string[]
  animation?: AnnouncementAnimation
  speed?: number
  free_shipping_threshold?: number
  free_shipping_active?: boolean
}): AnnouncementRuleForm[] {
  if (Array.isArray(data.rules) && data.rules.length > 0) {
    return data.rules.map((rule) => ({
      ...rule,
      animation: rule.animation === 'marquee' ? 'marquee' : 'fade',
      duration: Number(rule.duration || data.speed || DEFAULT_DURATION),
      starts_at: rule.starts_at || null,
      ends_at: rule.ends_at || null,
    }))
  }

  const messages = Array.isArray(data.messages_ar) && data.messages_ar.length > 0
    ? data.messages_ar
    : Array.isArray(data.messages)
      ? data.messages
      : []

  const legacyRules = messages.length > 0
    ? messages
      .filter((message) => typeof message === 'string' && message.trim())
      .map((message) => ({
        ...createRule('text'),
        text_ar: message.trim(),
        animation: data.animation === 'marquee' ? 'marquee' as const : 'fade' as const,
        duration: Number(data.speed || DEFAULT_DURATION),
      }))
    : []

  if (data.free_shipping_active !== false) {
    legacyRules.push(createRule('free_shipping', Number(data.free_shipping_threshold || DEFAULT_FREE_SHIPPING_THRESHOLD)))
  }

  return legacyRules.length > 0
    ? legacyRules
    : [createRule('text')]
}

export default function AdminSettingsPage() {
  const { t } = useLanguage()

  const [annActive, setAnnActive] = useState(false)
  const [annRules, setAnnRules] = useState<AnnouncementRuleForm[]>([])
  const [annSaving, setAnnSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [waPhone, setWaPhone] = useState('')
  const [waApiKey, setWaApiKey] = useState('')
  const [waSaving, setWaSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        const [announcementRes, whatsappRes] = await Promise.all([
          fetch('/api/settings/announcement', { cache: 'no-store' }),
          fetch('/api/admin/settings/whatsapp', { cache: 'no-store' }),
        ])

        const announcement = await announcementRes.json()
        const whatsapp = whatsappRes.ok ? await whatsappRes.json() : null

        if (!mounted) return

        setAnnActive(announcement?.active !== false)
        setAnnRules(normalizeLoadedRules(announcement || {}))
        setWaPhone(whatsapp?.data?.wa_phone ?? '')
        setWaApiKey(whatsapp?.data?.wa_apikey ?? '')
      } catch {
        // Keep the settings page usable even if optional settings fail to load.
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  const updateRule = (id: string, patch: Partial<AnnouncementRuleForm>) => {
    setAnnRules((rules) =>
      rules.map((rule) => {
        if (rule.id !== id) return rule

        if (patch.type && patch.type !== rule.type) {
          return {
            ...createRule(patch.type, Number(rule.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD)),
            id: rule.id,
            active: rule.active,
            animation: rule.animation,
            duration: rule.duration,
            starts_at: rule.starts_at,
            ends_at: rule.ends_at,
          }
        }

        const next = { ...rule, ...patch }

        if (next.type === 'free_shipping') {
          const minimumOrder = Number(next.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD)
          return {
            ...next,
            minimum_order: minimumOrder,
            applies_to: 'all',
            shipping_discount_percent: 100,
            auto_apply: true,
          }
        }

        return next
      })
    )
  }

  const addRule = (type: AnnouncementRuleType = 'text') => {
    setAnnRules((rules) => [...rules, createRule(type)])
  }

  const removeRule = (id: string) => {
    setAnnRules((rules) => rules.filter((rule) => rule.id !== id))
  }

  const saveAnnouncement = async () => {
    if (annActive && annRules.length === 0) {
      toast.error(t('Add at least one announcement rule', 'أضف قاعدة إعلان واحدة على الأقل'))
      return
    }

    const invalidFreeShippingRule = annRules.find(
      (rule) => rule.type === 'free_shipping' && Number(rule.minimum_order || 0) <= 0
    )
    const invalidDurationRule = annRules.find((rule) => Number(rule.duration || 0) <= 0)

    if (invalidFreeShippingRule) {
      toast.error(t('Minimum order must be a positive number', 'الحد الأدنى للطلب يجب أن يكون رقمًا موجبًا'))
      return
    }

    if (invalidDurationRule) {
      toast.error(t('Duration must be a positive number', 'مدة العرض يجب أن تكون رقمًا موجبًا'))
      return
    }

    setAnnSaving(true)
    try {
      const res = await fetch('/api/settings/announcement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: annActive, rules: annRules }),
      })
      if (res.ok) toast.success(t('Settings saved', 'تم حفظ الإعدادات'))
      else toast.error(t('Failed to save', 'فشل الحفظ'))
    } catch {
      toast.error(t('Failed to save', 'فشل الحفظ'))
    } finally {
      setAnnSaving(false)
    }
  }

  const saveWhatsApp = async () => {
    setWaSaving(true)
    try {
      const res = await fetch('/api/admin/settings/whatsapp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wa_phone: waPhone.trim(), wa_apikey: waApiKey.trim() }),
      })
      if (res.ok) toast.success(t('WhatsApp settings saved', 'تم حفظ إعدادات الواتساب'))
      else toast.error(t('Failed to save', 'فشل الحفظ'))
    } catch {
      toast.error(t('Failed to save', 'فشل الحفظ'))
    } finally {
      setWaSaving(false)
    }
  }

  const testWhatsApp = async () => {
    if (!waPhone || !waApiKey) {
      toast.error(t('Enter phone and API key first', 'أدخل رقم الهاتف والـ API key أولاً'))
      return
    }
    try {
      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones: [waPhone],
          message: t('LINE COFFEE WhatsApp test message - working!', 'رسالة اختبار من LINE COFFEE - الواتساب يعمل!'),
        }),
      })
      const json = await res.json()
      if (json.success) toast.success(t('Test message sent!', 'تم إرسال رسالة الاختبار!'))
      else toast.error(json.error || t('Failed to send', 'فشل الإرسال'))
    } catch {
      toast.error(t('Failed to send', 'فشل الإرسال'))
    }
  }

  const activePreviewMessages = annRules
    .filter((rule) => rule.active)
    .map((rule) => {
      if (rule.type === 'free_shipping') {
        const minimumOrder = Number(rule.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD)
        return rule.text_ar || buildDefaultFreeShippingText(minimumOrder, 'ar')
      }

      return rule.text_ar || rule.text_en
    })
    .filter(Boolean)

  const typeOptions: Array<{ value: AnnouncementRuleType; label: string; icon: LucideIcon }> = [
    { value: 'text', label: t('Text only', 'نص فقط'), icon: Megaphone },
    { value: 'free_shipping', label: t('Free Shipping Rule', 'قاعدة توصيل مجاني'), icon: Truck },
    { value: 'discount', label: t('Discount Code Announcement', 'إعلان كود خصم'), icon: Percent },
    { value: 'product_promo', label: t('Product Promo', 'عرض منتج'), icon: Package },
    { value: 'custom_link', label: t('Custom Link', 'رابط مخصص'), icon: LinkIcon },
  ]

  const cardClass = 'bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden'
  const headClass = 'flex items-center gap-3 px-6 py-4 border-b border-[#c8941a]/10 bg-[#0a0500]'
  const inputClass = 'w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all'
  const selectClass = `${inputClass} appearance-none`
  const btnClass = 'flex items-center gap-2 bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50'
  const subtleBtnClass = 'flex items-center gap-2 bg-white/[0.05] border border-[#c8941a]/15 hover:border-[#c8941a]/30 text-white/60 hover:text-white/80 px-4 py-2 rounded-xl text-sm transition-all'

  return (
    <div className="min-h-screen bg-[#0f0900] p-6 space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">{t('Settings', 'الإعدادات')}</h2>
        <p className="text-white/30 text-xs mt-0.5">{t('Manage your store settings', 'إدارة إعدادات المتجر')}</p>
      </div>

      <div className={cardClass}>
        <div className={headClass}>
          <Bell className="h-4 w-4 text-[#c8941a]" />
          <div>
            <h3 className="text-white/90 font-semibold text-sm">
              {t('Announcement + Promotion Rule Manager', 'مدير الإعلانات وقواعد العروض')}
            </h3>
            <p className="text-white/30 text-xs">
              {t('Manage top bar messages and promotion behavior.', 'إدارة رسائل الشريط العلوي وسلوك العروض.')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 border-2 border-[#c8941a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  {t('Announcement Bar Visibility', 'ظهور شريط الإعلان')}
                </p>
                <p className="text-white/25 text-xs mt-0.5">
                  {t(
                    'This only controls the top bar. Promotion rules keep their own active state.',
                    'هذا يتحكم في الشريط فقط. قواعد العروض لها حالة تفعيل مستقلة.'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => addRule('text')} className={subtleBtnClass}>
                  <Plus className="h-4 w-4" />
                  {t('Add Announcement', 'إضافة إعلان')}
                </button>
                <button
                  type="button"
                  onClick={() => setAnnActive(v => !v)}
                  className="text-[#c8941a] hover:opacity-80 transition-opacity"
                  aria-label={t('Toggle announcement bar', 'تفعيل أو إيقاف شريط الإعلان')}
                >
                  {annActive
                    ? <ToggleRight className="h-8 w-8" />
                    : <ToggleLeft className="h-8 w-8 text-white/20" />}
                </button>
              </div>
            </div>

            {annActive && activePreviewMessages.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[#c8941a]/20">
                <p className="text-white/25 text-[10px] px-3 pt-2 pb-1">{t('Preview:', 'معاينة:')}</p>
                <div className="bg-[#3d1a00] text-[#FFDCC2] text-sm text-center px-6 py-2.5">
                  {activePreviewMessages.join('  •  ')}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {annRules.map((rule, index) => {
                const option = typeOptions.find((item) => item.value === rule.type)
                const TypeIcon = option?.icon || Megaphone

                return (
                  <div key={rule.id} className="rounded-2xl border border-[#c8941a]/10 bg-[#0f0900] p-4 space-y-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c8941a]/10 text-[#c8941a]">
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/80">
                            {t('Announcement', 'إعلان')} #{index + 1}
                          </p>
                          <p className="text-xs text-white/25">{option?.label}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={rule.type}
                          onChange={(event) => updateRule(rule.id, { type: event.target.value as AnnouncementRuleType })}
                          className={`${selectClass} w-auto min-w-[190px]`}
                        >
                          {typeOptions.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateRule(rule.id, { active: !rule.active })}
                          className="text-[#c8941a] hover:opacity-80 transition-opacity"
                          aria-label={t('Toggle rule', 'تفعيل أو إيقاف القاعدة')}
                        >
                          {rule.active
                            ? <ToggleRight className="h-8 w-8" />
                            : <ToggleLeft className="h-8 w-8 text-white/20" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRule(rule.id)}
                          className="rounded-xl border border-red-500/10 bg-red-500/5 p-2 text-red-300/70 transition-colors hover:border-red-500/25 hover:text-red-200"
                          aria-label={t('Remove announcement', 'حذف الإعلان')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('Arabic Text', 'النص العربي')}</label>
                        <textarea
                          value={rule.text_ar}
                          onChange={(event) => updateRule(rule.id, { text_ar: event.target.value })}
                          rows={3}
                          placeholder={rule.type === 'free_shipping'
                            ? buildDefaultFreeShippingText(Number(rule.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD), 'ar')
                            : t('Arabic announcement text', 'نص الإعلان بالعربية')}
                          className={`${inputClass} resize-none`}
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('English Text', 'النص الإنجليزي')}</label>
                        <textarea
                          value={rule.text_en}
                          onChange={(event) => updateRule(rule.id, { text_en: event.target.value })}
                          rows={3}
                          placeholder={rule.type === 'free_shipping'
                            ? buildDefaultFreeShippingText(Number(rule.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD), 'en')
                            : t('English announcement text', 'نص الإعلان بالإنجليزية')}
                          className={`${inputClass} resize-none`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('Animation', 'الحركة')}</label>
                        <select
                          value={rule.animation}
                          onChange={(event) => updateRule(rule.id, { animation: event.target.value as AnnouncementAnimation })}
                          className={selectClass}
                        >
                          <option value="fade">{t('Fade', 'تلاشي')}</option>
                          <option value="marquee">{t('Marquee', 'شريط متحرك')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('Duration / Speed', 'المدة / السرعة')}</label>
                        <input
                          type="number"
                          min={1500}
                          step={500}
                          value={rule.duration}
                          onChange={(event) => updateRule(rule.id, { duration: Number(event.target.value) })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('Start Date', 'تاريخ البداية')}</label>
                        <input
                          type="datetime-local"
                          value={toDateTimeLocal(rule.starts_at)}
                          onChange={(event) => updateRule(rule.id, { starts_at: fromDateTimeLocal(event.target.value) })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('End Date', 'تاريخ النهاية')}</label>
                        <input
                          type="datetime-local"
                          value={toDateTimeLocal(rule.ends_at)}
                          onChange={(event) => updateRule(rule.id, { ends_at: fromDateTimeLocal(event.target.value) })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {rule.type === 'free_shipping' && (
                      <div className="rounded-xl border border-[#c8941a]/10 bg-[#c8941a]/5 p-4 space-y-3">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                          <div>
                            <label className="block text-white/40 text-xs mb-1.5">{t('Minimum Order Amount', 'الحد الأدنى للطلب')}</label>
                            <input
                              type="number"
                              min={1}
                              value={rule.minimum_order || DEFAULT_FREE_SHIPPING_THRESHOLD}
                              onChange={(event) => updateRule(rule.id, { minimum_order: Number(event.target.value) })}
                              className={inputClass}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-xs text-white/45 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#c8941a]/10 p-3">
                              <p className="text-white/25">{t('Applies to', 'ينطبق على')}</p>
                              <p className="mt-1 text-white/70">{t('All customers', 'كل العملاء')}</p>
                            </div>
                            <div className="rounded-xl border border-[#c8941a]/10 p-3">
                              <p className="text-white/25">{t('Shipping discount', 'خصم التوصيل')}</p>
                              <p className="mt-1 text-white/70">100%</p>
                            </div>
                            <div className="rounded-xl border border-[#c8941a]/10 p-3">
                              <p className="text-white/25">{t('Checkout', 'الدفع')}</p>
                              <p className="mt-1 text-white/70">{t('Auto apply', 'تلقائي')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {rule.type === 'discount' && (
                      <div>
                        <label className="block text-white/40 text-xs mb-1.5">{t('Discount Code Text', 'نص كود الخصم')}</label>
                        <input
                          value={rule.discount_code || ''}
                          onChange={(event) => updateRule(rule.id, { discount_code: event.target.value.toUpperCase() })}
                          placeholder="LINE10"
                          className={inputClass}
                          dir="ltr"
                        />
                      </div>
                    )}

                    {(rule.type === 'product_promo' || rule.type === 'custom_link') && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-white/40 text-xs mb-1.5">{t('Link URL', 'رابط')}</label>
                          <input
                            value={rule.link_url || ''}
                            onChange={(event) => updateRule(rule.id, { link_url: event.target.value })}
                            placeholder="/products"
                            className={inputClass}
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 text-xs mb-1.5">{t('Button Text Arabic', 'نص الزر بالعربية')}</label>
                          <input
                            value={rule.button_text_ar || ''}
                            onChange={(event) => updateRule(rule.id, { button_text_ar: event.target.value })}
                            placeholder="تسوق الآن"
                            className={inputClass}
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 text-xs mb-1.5">{t('Button Text English', 'نص الزر بالإنجليزية')}</label>
                          <input
                            value={rule.button_text_en || ''}
                            onChange={(event) => updateRule(rule.id, { button_text_en: event.target.value })}
                            placeholder="Shop now"
                            className={inputClass}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={saveAnnouncement} disabled={annSaving} className={btnClass}>
                <Save className="h-4 w-4" />
                {annSaving ? t('Saving...', 'جاري الحفظ...') : t('Save Rules', 'حفظ القواعد')}
              </button>
              <button type="button" onClick={() => addRule('free_shipping')} className={subtleBtnClass}>
                <Truck className="h-4 w-4" />
                {t('Add Free Shipping Rule', 'إضافة قاعدة توصيل مجاني')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={cardClass}>
        <div className={headClass}>
          <MessageCircle className="h-4 w-4 text-[#c8941a]" />
          <div>
            <h3 className="text-white/90 font-semibold text-sm">{t('WhatsApp Notifications (CallMeBot)', 'إشعارات الواتساب (CallMeBot)')}</h3>
            <p className="text-white/30 text-xs">{t('Send discount codes & alerts via WhatsApp', 'إرسال أكواد الخصم والتنبيهات عبر الواتساب')}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 bg-[#c8941a]/8 border border-[#c8941a]/15 rounded-xl p-4">
            <Info className="h-4 w-4 text-[#c8941a] shrink-0 mt-0.5" />
            <div className="text-xs text-white/50 space-y-1">
              <p className="font-semibold text-white/70">{t('Setup steps:', 'خطوات الإعداد:')}</p>
              <p>1. {t('Open WhatsApp and send "I allow callmebot to send me messages" to +34 644 59 72 95', 'افتح الواتساب وابعت "I allow callmebot to send me messages" لـ +34 644 59 72 95')}</p>
              <p>2. {t('They will reply with your API key', 'هيردوا عليك بالـ API key')}</p>
              <p>3. {t('Enter your number and API key below', 'أدخل رقمك والـ API key أدناه')}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {t('Your WhatsApp Number', 'رقم الواتساب الدولي')}
              </label>
              <input
                value={waPhone}
                onChange={e => setWaPhone(e.target.value)}
                placeholder="+201004761171"
                className={inputClass}
                dir="ltr"
              />
              <p className="text-white/20 text-[10px] mt-1">{t('Include country code e.g. +20...', 'ضمّن كود الدولة مثل +20...')}</p>
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                {t('CallMeBot API Key', 'مفتاح CallMeBot API')}
              </label>
              <input
                value={waApiKey}
                onChange={e => setWaApiKey(e.target.value)}
                placeholder="1234567"
                className={inputClass}
                dir="ltr"
                type="password"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={saveWhatsApp} disabled={waSaving} className={btnClass}>
              <Save className="h-4 w-4" />
              {waSaving ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}
            </button>
            <button type="button" onClick={testWhatsApp} className={subtleBtnClass}>
              <MessageCircle className="h-4 w-4" />
              {t('Send Test Message', 'إرسال رسالة اختبار')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
