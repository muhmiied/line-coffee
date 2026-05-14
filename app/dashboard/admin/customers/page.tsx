'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Search, RefreshCw, ShoppingBag, TrendingUp, Mail, Phone, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'

type Customer = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  created_at: string
  orderCount: number
  totalSpent: number
}

export default function CustomersPage() {
  const { t, language } = useLanguage()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [notificationDrafts, setNotificationDrafts] = useState<Record<string, {
    title: string
    message: string
    promoCode: string
  }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers', { cache: 'no-store' })
      const json = await res.json()
      setCustomers(json.data || [])
    } catch {
      toast.error(t('Failed to load customers', 'فشل تحميل العملاء'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q
      ? customers.filter(c =>
          (c.first_name || '').toLowerCase().includes(q) ||
          (c.last_name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q)
        )
      : customers
    )
  }, [search, customers])

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const activeCustomers = customers.filter(c => c.orderCount > 0).length

  const getDraft = (customerId: string) =>
    notificationDrafts[customerId] || { title: '', message: '', promoCode: '' }

  const updateDraft = (customerId: string, field: 'title' | 'message' | 'promoCode', value: string) => {
    setNotificationDrafts((prev) => ({
      ...prev,
      [customerId]: {
        ...(prev[customerId] || { title: '', message: '', promoCode: '' }),
        [field]: value,
      },
    }))
  }

  const sendNotification = async (customer: Customer) => {
    const draft = getDraft(customer.id)
    if (!draft.title.trim() || !draft.message.trim()) {
      toast.error(t('Title and message are required', 'العنوان والرسالة مطلوبان'))
      return
    }

    setSendingId(customer.id)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: customer.id,
          title: draft.title,
          message: draft.message,
          type: draft.promoCode ? 'promo' : 'admin_message',
          promo_code: draft.promoCode || null,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || t('Failed to send notification', 'فشل إرسال الإشعار'))
        return
      }

      toast.success(t('Notification sent', 'تم إرسال الإشعار'))
      setNotificationDrafts((prev) => ({
        ...prev,
        [customer.id]: { title: '', message: '', promoCode: '' },
      }))
    } catch {
      toast.error(t('Failed to send notification', 'فشل إرسال الإشعار'))
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0900] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{t('Customers', 'العملاء')}</h2>
          <p className="text-white/30 text-xs mt-0.5">{customers.length} {t('registered customers', 'عميل مسجل')}</p>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label={t('Refresh', 'تحديث')}
          className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t('Total Customers', 'إجمالي العملاء'), value: String(customers.length), icon: Users },
          { label: t('Active Buyers', 'مشترون نشطون'), value: String(activeCustomers), icon: ShoppingBag },
          { label: t('Total Revenue', 'إجمالي الإيرادات'), value: `${totalRevenue.toLocaleString()} EGP`, icon: TrendingUp },
        ].map(card => (
          <div key={card.label} className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl p-4">
            <div className="h-9 w-9 rounded-xl bg-[#c8941a]/10 border border-[#c8941a]/15 flex items-center justify-center mb-3">
              <card.icon className="h-4 w-4 text-[#c8941a]" />
            </div>
            <p className="text-white font-bold text-xl">{loading ? '—' : card.value}</p>
            <p className="text-white/35 text-xs mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Search by name, email or phone...', 'بحث بالاسم أو الإيميل أو الهاتف...')}
          className="w-full bg-[#180d04] border border-[#c8941a]/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#c8941a]/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-[#180d04] border border-[#c8941a]/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.04] text-[11px] text-white/25 uppercase tracking-wide">
          <div className="col-span-4">{t('Customer', 'العميل')}</div>
          <div className="col-span-3">{t('Phone', 'الهاتف')}</div>
          <div className="col-span-2 text-center">{t('Orders', 'الطلبات')}</div>
          <div className="col-span-2 text-center">{t('Spent', 'الإنفاق')}</div>
          <div className="col-span-1 text-center">{t('Since', 'منذ')}</div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/[0.03] rounded-xl h-14" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm">{t('No customers found', 'لا يوجد عملاء')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filtered.map(c => {
              const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || t('Unknown', 'غير معروف')
              const initial = name.charAt(0).toUpperCase()
              const isOpen = expanded === c.id
              return (
                <div key={c.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="w-full grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#c8941a]/30 to-[#c8941a]/10 border border-[#c8941a]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#c8941a] font-bold text-xs">{initial}</span>
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-white/80 text-sm font-medium truncate">{name}</p>
                        <p className="text-white/25 text-[10px] truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <p className="text-white/35 text-xs truncate">{c.phone || '—'}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className={`text-sm font-bold ${c.orderCount > 0 ? 'text-[#c8941a]' : 'text-white/20'}`}>
                        {c.orderCount}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className={`text-sm font-bold ${c.totalSpent > 0 ? 'text-emerald-400' : 'text-white/20'}`}>
                        {c.totalSpent > 0 ? c.totalSpent.toLocaleString() : '—'}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="text-white/25 text-[10px]">
                        {new Date(c.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 bg-white/[0.01] border-t border-white/[0.03]">
                      <div className="flex flex-wrap items-center gap-6 pt-3">
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{c.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{c.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          <span>{c.orderCount} {t('orders', 'طلب')} · {c.totalSpent.toLocaleString()} EGP</span>
                        </div>
                        <div className="ml-auto text-white/20 text-[10px]">
                          {t('Joined', 'انضم')} {new Date(c.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#c8941a]/12 bg-[#0f0900] p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <Send className="h-4 w-4 text-[#c8941a]" />
                          <p className="text-sm font-semibold text-white/80">{t('Send Notification', 'إرسال إشعار')}</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={getDraft(c.id).title}
                            onChange={e => updateDraft(c.id, 'title', e.target.value)}
                            placeholder={t('Notification title', 'عنوان الإشعار')}
                            className="rounded-xl border border-[#c8941a]/20 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#c8941a]/45"
                          />
                          <input
                            value={getDraft(c.id).promoCode}
                            onChange={e => updateDraft(c.id, 'promoCode', e.target.value.toUpperCase())}
                            placeholder={t('Promo code (optional)', 'كود خصم (اختياري)')}
                            className="rounded-xl border border-[#c8941a]/20 bg-[#180d04] px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#c8941a]/45"
                          />
                        </div>
                        <textarea
                          value={getDraft(c.id).message}
                          onChange={e => updateDraft(c.id, 'message', e.target.value)}
                          placeholder={t('Write a short message for this customer...', 'اكتب رسالة قصيرة لهذا العميل...')}
                          rows={3}
                          className="mt-3 w-full resize-none rounded-xl border border-[#c8941a]/20 bg-[#180d04] px-4 py-3 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#c8941a]/45"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => sendNotification(c)}
                            disabled={sendingId === c.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#c8941a] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#d6a373] disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                            {sendingId === c.id ? t('Sending...', 'جارٍ الإرسال...') : t('Send Notification', 'إرسال الإشعار')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
