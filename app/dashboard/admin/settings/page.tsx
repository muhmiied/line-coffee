'use client'

import { useEffect, useState } from 'react'
import { Settings, Bell, Save, ToggleLeft, ToggleRight, MessageCircle, Key, Phone, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

export default function AdminSettingsPage() {
  const { t } = useLanguage()

  // Announcement bar
  const [annText, setAnnText] = useState('')
  const [annActive, setAnnActive] = useState(false)
  const [annSaving, setAnnSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // WhatsApp / CallMeBot
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

        setAnnText(announcement?.text ?? '')
        setAnnActive(announcement?.active !== false)
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

  const saveAnnouncement = async () => {
    setAnnSaving(true)
    try {
      const res = await fetch('/api/settings/announcement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: annText, active: annActive }),
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
          message: t('✅ LINE COFFEE WhatsApp test message — working!', '✅ رسالة اختبار من LINE COFFEE — الواتساب يعمل!'),
        }),
      })
      const json = await res.json()
      if (json.success) toast.success(t('Test message sent!', 'تم إرسال رسالة الاختبار!'))
      else toast.error(json.error || t('Failed to send', 'فشل الإرسال'))
    } catch {
      toast.error(t('Failed to send', 'فشل الإرسال'))
    }
  }

  const cardClass = 'bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden'
  const headClass = 'flex items-center gap-3 px-6 py-4 border-b border-[#c8941a]/10 bg-[#0a0500]'
  const inputClass = 'w-full bg-[#0f0900] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all'
  const btnClass = 'flex items-center gap-2 bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50'

  return (
    <div className="min-h-screen bg-[#0f0900] p-6 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-white font-bold text-lg">{t('Settings', 'الإعدادات')}</h2>
        <p className="text-white/30 text-xs mt-0.5">{t('Manage your store settings', 'إدارة إعدادات المتجر')}</p>
      </div>

      {/* ── Announcement Bar ── */}
      <div className={cardClass}>
        <div className={headClass}>
          <Bell className="h-4 w-4 text-[#c8941a]" />
          <div>
            <h3 className="text-white/90 font-semibold text-sm">{t('Announcement Bar', 'شريط الإعلانات')}</h3>
            <p className="text-white/30 text-xs">{t('The bar that appears at the top of the site', 'الشريط الذي يظهر أعلى الموقع')}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 border-2 border-[#c8941a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{t('Enable Announcement', 'تفعيل الإعلان')}</p>
                <p className="text-white/25 text-xs mt-0.5">{t('Show or hide the bar', 'إظهار أو إخفاء الشريط')}</p>
              </div>
              <button
                type="button"
                onClick={() => setAnnActive(v => !v)}
                className="text-[#c8941a] hover:opacity-80 transition-opacity"
              >
                {annActive
                  ? <ToggleRight className="h-8 w-8" />
                  : <ToggleLeft className="h-8 w-8 text-white/20" />}
              </button>
            </div>

            {annActive && annText && (
              <div className="rounded-xl overflow-hidden border border-[#c8941a]/20">
                <p className="text-white/25 text-[10px] px-3 pt-2 pb-1">{t('Preview:', 'معاينة:')}</p>
                <div className="bg-[#3d1a00] text-[#FFDCC2] text-sm text-center px-6 py-2.5">{annText}</div>
              </div>
            )}

            <div>
              <label className="block text-white/40 text-xs mb-1.5">{t('Announcement Text', 'نص الإعلان')}</label>
              <textarea
                value={annText}
                onChange={e => setAnnText(e.target.value)}
                rows={3}
                placeholder={t('e.g. 🚀 Free shipping on orders above 200 EGP', 'مثال: 🚀 توصيل مجاني على الطلبات فوق 200 ج')}
                className={`${inputClass} resize-none`}
              />
              <p className="text-white/20 text-[10px] mt-1">{annText.length} {t('characters', 'حرف')}</p>
            </div>

            <button type="button" onClick={saveAnnouncement} disabled={annSaving} className={btnClass}>
              <Save className="h-4 w-4" />
              {annSaving ? t('Saving...', 'جارٍ الحفظ...') : t('Save', 'حفظ')}
            </button>
          </div>
        )}
      </div>

      {/* ── WhatsApp / CallMeBot ── */}
      <div className={cardClass}>
        <div className={headClass}>
          <MessageCircle className="h-4 w-4 text-[#c8941a]" />
          <div>
            <h3 className="text-white/90 font-semibold text-sm">{t('WhatsApp Notifications (CallMeBot)', 'إشعارات الواتساب (CallMeBot)')}</h3>
            <p className="text-white/30 text-xs">{t('Send discount codes & alerts via WhatsApp', 'إرسال أكواد الخصم والتنبيهات عبر الواتساب')}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Setup guide */}
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
                {t('Your WhatsApp Number', 'رقم الواتساب (الدولي)')}
              </label>
              <input
                value={waPhone}
                onChange={e => setWaPhone(e.target.value)}
                placeholder="+201004761171"
                className={inputClass}
                dir="ltr"
              />
              <p className="text-white/20 text-[10px] mt-1">{t('Include country code e.g. +20...', 'ضمّن كود الدولة مثلاً +20...')}</p>
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
              {waSaving ? t('Saving...', 'جارٍ الحفظ...') : t('Save', 'حفظ')}
            </button>
            <button
              type="button"
              onClick={testWhatsApp}
              className="flex items-center gap-2 bg-white/[0.05] border border-[#c8941a]/15 hover:border-[#c8941a]/30 text-white/60 hover:text-white/80 px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              {t('Send Test Message', 'إرسال رسالة اختبار')}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
