'use client'

import { useEffect, useState, useCallback } from 'react'
import { Percent, Plus, Trash2, Copy, RefreshCw, X, Tag, AlertCircle, MessageCircle, Users, Send, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Discount = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order?: number | null
  max_uses?: number | null
  uses: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

type DiscountForm = {
  code: string; type: 'percentage' | 'fixed'; value: string
  min_order: string; max_uses: string; expires_at: string; is_active: boolean; assigned_emails: string
}
const EMPTY: DiscountForm = {
  code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: '', is_active: true, assigned_emails: '',
}

export default function DiscountsPage() {
  const { t } = useLanguage()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [dbError, setDbError] = useState(false)

  // WhatsApp send state
  const [sendModal, setSendModal] = useState<Discount | null>(null)
  const [sendTarget, setSendTarget] = useState<'all' | 'custom'>('all')
  const [customPhones, setCustomPhones] = useState('')
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/discounts', { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        setDiscounts(json.data || [])
        setDbError(false)
      } else {
        setDbError(true)
      }
    } catch {
      setDbError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!form.code.trim() || !form.value) {
      toast.error(t('Code and value are required', 'الكود والقيمة مطلوبان'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          type: form.type,
          value: Number(form.value),
          min_order: form.min_order ? Number(form.min_order) : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expires_at: form.expires_at || null,
          is_active: form.is_active,
          assigned_emails: form.assigned_emails
            ? form.assigned_emails.split(/[\n,،]+/).map((e: string) => e.trim().toLowerCase()).filter(Boolean)
            : null,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(t('Discount created', 'تم إنشاء الخصم'))
      setShowModal(false)
      load()
    } catch (e: unknown) {
      toast.error((e as Error).message || t('Failed to save', 'فشل الحفظ'))
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDiscounts(p => p.filter(d => d.id !== id))
      toast.success(t('Discount deleted', 'تم حذف الخصم'))
    } catch {
      toast.error(t('Failed to delete', 'فشل الحذف'))
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(t('Code copied!', 'تم نسخ الكود!'))
  }

  const sendWhatsApp = async () => {
    if (!sendModal) return
    setSending(true)
    try {
      let phones: string[] = []

      if (sendTarget === 'all') {
        const res = await fetch('/api/admin/customers', { cache: 'no-store' })
        const json = await res.json()
        phones = (json.data || [])
          .map((c: { phone: string | null }) => c.phone)
          .filter(Boolean) as string[]
        if (phones.length === 0) {
          toast.error(t('No customer phone numbers found', 'لا توجد أرقام هاتف للعملاء'))
          setSending(false)
          return
        }
      } else {
        phones = customPhones.split(/[\n,،]+/).map(p => p.trim()).filter(Boolean)
        if (phones.length === 0) {
          toast.error(t('Enter at least one phone number', 'أدخل رقم هاتف واحد على الأقل'))
          setSending(false)
          return
        }
      }

      const disc = sendModal
      const discValue = disc.type === 'percentage' ? `${disc.value}%` : `${disc.value} EGP`
      const message = t(
        `🎉 Exclusive offer from LINE COFFEE!\nUse code *${disc.code}* to get ${discValue} off your next order.\nShop now: linecoffee.com`,
        `🎉 عرض حصري من LINE COFFEE!\nاستخدم الكود *${disc.code}* للحصول على خصم ${discValue} على طلبك القادم.\nتسوق الآن: linecoffee.com`
      )

      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, message }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(t(`Sent to ${json.sent}/${json.total} numbers`, `تم الإرسال لـ ${json.sent}/${json.total} رقم`))
        setSendModal(null)
        setCustomPhones('')
      } else {
        toast.error(json.error || t('Failed to send', 'فشل الإرسال'))
      }
    } catch {
      toast.error(t('Failed to send', 'فشل الإرسال'))
    } finally {
      setSending(false)
    }
  }

  const activeCount = discounts.filter(d => d.is_active).length

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Discounts', 'الخصومات')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{discounts.length} {t('codes', 'كود')} · {activeCount} {t('active', 'نشط')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} aria-label={t('Refresh', 'تحديث')}
            className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setForm({ ...EMPTY }); setShowModal(true) }}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all">
            <Plus className="h-4 w-4" />
            {t('New Code', 'كود جديد')}
          </button>
        </div>
      </div>

      {/* DB error notice */}
      {dbError && !loading && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-5">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">{t('Database table not found', 'جدول قاعدة البيانات غير موجود')}</p>
            <p className="text-amber-400/70 text-xs mt-1">
              {t('Create a "discounts" table in Supabase to enable this feature.', 'أنشئ جدول "discounts" في Supabase لتفعيل هذه الميزة.')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t('Total Codes', 'إجمالي الأكواد'), value: discounts.length },
          { label: t('Active', 'نشطة'), value: activeCount },
          { label: t('Total Uses', 'إجمالي الاستخدامات'), value: discounts.reduce((s, d) => s + d.uses, 0) },
        ].map(c => (
          <div key={c.label} className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-4">
            <p className="text-white font-bold text-2xl">{loading ? '—' : c.value}</p>
            <p className="text-white/35 text-xs mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-[#180d04] rounded-2xl h-20 border border-[#c8941a]/5" />)}</div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Percent className="h-12 w-12 mb-3 text-[#c8941a]/20" />
          <p className="text-white/30 text-sm">{t('No discount codes yet', 'لا توجد أكواد خصم بعد')}</p>
          <button type="button" onClick={() => setShowModal(true)} className="mt-4 text-[#c8941a] text-sm hover:opacity-70 transition-opacity">
            + {t('Create your first code', 'أنشئ أول كود')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {discounts.map(d => (
            <div key={d.id} className={`bg-[#180d04] border rounded-2xl px-5 py-4 flex items-center gap-4 ${d.is_active ? 'border-[#c8941a]/10' : 'border-white/[0.04] opacity-60'}`}>
              <div className="h-10 w-10 rounded-xl bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center shrink-0">
                <Tag className="h-4 w-4 text-[#c8941a]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm font-mono">{d.code}</p>
                  <button type="button" onClick={() => copyCode(d.code)} aria-label={t('Copy code', 'نسخ الكود')}
                    className="h-5 w-5 rounded flex items-center justify-center text-white/25 hover:text-[#c8941a] transition-colors">
                    <Copy className="h-3 w-3" />
                  </button>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${d.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/25'}`}>
                    {d.is_active ? t('Active', 'نشط') : t('Inactive', 'غير نشط')}
                  </span>
                </div>
                <p className="text-white/35 text-xs mt-0.5">
                  {d.type === 'percentage' ? `${d.value}%` : `${d.value} EGP`} {t('off', 'خصم')}
                  {d.min_order ? ` · ${t('min order', 'حد أدنى')} ${d.min_order} EGP` : ''}
                  {d.max_uses ? ` · ${d.uses}/${d.max_uses} ${t('uses', 'استخدام')}` : ` · ${d.uses} ${t('uses', 'استخدام')}`}
                  {d.expires_at ? ` · ${t('expires', 'ينتهي')} ${new Date(d.expires_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button"
                  onClick={() => { setSendModal(d); setSendTarget('all'); setCustomPhones('') }}
                  aria-label={t('Send via WhatsApp', 'إرسال عبر الواتساب')}
                  className="h-8 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-emerald-400/70 hover:text-emerald-400 transition-all text-xs font-medium">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t('Send', 'إرسال')}
                </button>
                <button type="button" onClick={() => del(d.id)} aria-label={t('Delete', 'حذف')}
                  className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <h3 className="text-white font-bold text-sm">{t('New Discount Code', 'كود خصم جديد')}</h3>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setShowModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Code', 'الكود')} *</label>
                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE20" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 uppercase font-mono placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="disc-type" className="block text-white/40 text-xs mb-1.5">{t('Type', 'النوع')}</label>
                  <select id="disc-type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all">
                    <option value="percentage">{t('Percentage %', 'نسبة مئوية %')}</option>
                    <option value="fixed">{t('Fixed EGP', 'مبلغ ثابت EGP')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Value', 'القيمة')} *</label>
                  <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder={form.type === 'percentage' ? '20' : '50'}
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Min Order (EGP)', 'حد أدنى للطلب')}</label>
                  <input type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: e.target.value }))}
                    placeholder="0" className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" min={0} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Max Uses', 'أقصى استخدام')}</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))}
                    placeholder={t('Unlimited', 'غير محدود')} className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all" min={1} />
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-1.5">{t('Assign to specific emails (optional)', 'تخصيص لإيميلات محددة (اختياري)')}</label>
                <textarea
                  value={form.assigned_emails}
                  onChange={e => setForm(p => ({ ...p, assigned_emails: e.target.value }))}
                  rows={2}
                  placeholder={t('user@example.com\nanother@example.com', 'user@example.com\nanother@example.com')}
                  dir="ltr"
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-xs text-white/70 font-mono placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
                />
                <p className="text-white/20 text-[10px] mt-1">{t('These users will see a discount banner when they log in', 'هؤلاء المستخدمين سيشوفوا بانر الخصم لما يسجلوا دخول')}</p>
              </div>
              <div>
                <label htmlFor="disc-expires" className="block text-white/40 text-xs mb-1.5">{t('Expiry Date', 'تاريخ الانتهاء')}</label>
                <input id="disc-expires" type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                  title={t('Expiry Date', 'تاريخ الانتهاء')}
                  className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-[#c8941a]/30 transition-all" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={save} disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#c8941a] hover:bg-[#b8840f] text-black font-semibold text-sm transition-all disabled:opacity-50">
                {saving ? t('Creating...', 'جارٍ الإنشاء...') : t('Create Code', 'إنشاء الكود')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Send Modal */}
      {sendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSendModal(null)} />
          <div className="relative w-full max-w-md bg-[#0f0900] border border-[#c8941a]/20 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="text-white font-bold text-sm">{t('Send via WhatsApp', 'إرسال عبر الواتساب')}</h3>
              </div>
              <button type="button" aria-label={t('Close', 'إغلاق')} onClick={() => setSendModal(null)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Code preview */}
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <Tag className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-400 font-bold font-mono text-sm">{sendModal.code}</p>
                  <p className="text-emerald-400/60 text-xs">
                    {sendModal.type === 'percentage' ? `${sendModal.value}%` : `${sendModal.value} EGP`} {t('discount', 'خصم')}
                  </p>
                </div>
              </div>

              {/* Target selector */}
              <div>
                <p className="text-white/40 text-xs mb-2">{t('Send to:', 'إرسال إلى:')}</p>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setSendTarget('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${sendTarget === 'all' ? 'bg-[#c8941a]/20 text-[#c8941a] border-[#c8941a]/30' : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60'}`}>
                    <Users className="h-3.5 w-3.5" />
                    {t('All Customers', 'كل العملاء')}
                  </button>
                  <button type="button"
                    onClick={() => setSendTarget('custom')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${sendTarget === 'custom' ? 'bg-[#c8941a]/20 text-[#c8941a] border-[#c8941a]/30' : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white/60'}`}>
                    <Phone className="h-3.5 w-3.5" />
                    {t('Custom Numbers', 'أرقام محددة')}
                  </button>
                </div>
              </div>

              {sendTarget === 'custom' && (
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">{t('Phone numbers (one per line or comma separated)', 'أرقام الهاتف (رقم في كل سطر أو مفصولة بفاصلة)')}</label>
                  <textarea
                    value={customPhones}
                    onChange={e => setCustomPhones(e.target.value)}
                    rows={4}
                    placeholder={"+201001234567\n+201009876543"}
                    dir="ltr"
                    className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl px-4 py-2.5 text-sm text-white/70 font-mono placeholder-white/15 focus:outline-none focus:border-[#c8941a]/30 transition-all resize-none"
                  />
                </div>
              )}

              {sendTarget === 'all' && (
                <p className="text-white/30 text-xs">
                  {t('Will send to all customers who have a phone number registered.', 'سيتم الإرسال لكل العملاء الذين عندهم رقم هاتف مسجل.')}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
              <button type="button" onClick={() => setSendModal(null)} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
                {t('Cancel', 'إلغاء')}
              </button>
              <button type="button" onClick={sendWhatsApp} disabled={sending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all disabled:opacity-50">
                <Send className="h-4 w-4" />
                {sending ? t('Sending...', 'جارٍ الإرسال...') : t('Send Now', 'إرسال الآن')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
