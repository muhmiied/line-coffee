'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Mail, RefreshCw, Search, CheckCircle2, Clock3, Reply, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

type ContactMessageStatus = 'unread' | 'read' | 'replied'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactMessageStatus
  created_at: string
}

const statusStyles: Record<ContactMessageStatus, string> = {
  unread: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  read: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  replied: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
}

export default function AdminContactMessagesPage() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/contact-messages', { cache: 'no-store' })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || 'Failed to load messages')
      setMessages(json.data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to load contact messages', 'فشل تحميل رسائل التواصل'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const filteredMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return messages.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      if (!matchesStatus) return false
      if (!normalized) return true

      return (
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        item.subject.toLowerCase().includes(normalized) ||
        item.message.toLowerCase().includes(normalized)
      )
    })
  }, [messages, query, statusFilter])

  const unreadCount = messages.filter((item) => item.status === 'unread').length

  const updateStatus = async (id: string, status: ContactMessageStatus) => {
    setUpdatingId(id)
    try {
      const response = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || 'Failed to update message')
      setMessages((prev) => prev.map((item) => (item.id === id ? json.data : item)))
      toast.success(t('Message updated', 'تم تحديث الرسالة'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to update message', 'فشل تحديث الرسالة'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#c8941a]/12 bg-[#120c06]/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c8941a]/80">
              {t('Customer Inbox', 'صندوق رسائل العملاء')}
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold text-white/90">
              {t('Contact Messages', 'رسائل التواصل')}
            </h1>
            <p className="mt-1 text-sm text-white/35">
              {unreadCount > 0
                ? t(`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`, `${unreadCount} رسالة غير مقروءة`)
                : t('No unread messages', 'لا توجد رسائل غير مقروءة')}
            </p>
          </div>

          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#c8941a]/18 bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition hover:border-[#c8941a]/35 hover:text-[#c8941a] disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            {t('Refresh', 'تحديث')}
          </button>
        </div>

        <div className="grid gap-3 rounded-2xl border border-[#c8941a]/10 bg-[#0a0500]/65 p-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Search messages...', 'ابحث في الرسائل...')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white/75 placeholder:text-white/25 outline-none transition focus:border-[#c8941a]/35"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['all', 'unread', 'read', 'replied'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'h-11 rounded-xl border px-3 text-xs font-semibold capitalize transition',
                  statusFilter === status
                    ? 'border-[#c8941a]/40 bg-[#c8941a]/15 text-[#c8941a]'
                    : 'border-white/[0.07] bg-white/[0.03] text-white/45 hover:text-white/75',
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0a0500]/60 py-16 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-white/15" />
            <p className="font-serif text-xl text-white/75">{t('No contact messages found', 'لا توجد رسائل تواصل')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-[#c8941a]/10 bg-[#120c06]/75 p-5 shadow-[0_16px_44px_rgba(0,0,0,0.24)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize', statusStyles[item.status])}>
                        {item.status}
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-white/90">{item.subject}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/45">
                      <span>{item.name}</span>
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 text-[#c8941a]/80 hover:text-[#c8941a]">
                        <Mail className="h-3.5 w-3.5" />
                        {item.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, 'read')}
                      disabled={updatingId === item.id || item.status === 'read'}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold text-white/60 transition hover:border-blue-400/30 hover:text-blue-300 disabled:opacity-40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('Read', 'مقروءة')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, 'replied')}
                      disabled={updatingId === item.id || item.status === 'replied'}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold text-white/60 transition hover:border-emerald-400/30 hover:text-emerald-300 disabled:opacity-40"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      {t('Replied', 'تم الرد')}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, 'unread')}
                      disabled={updatingId === item.id || item.status === 'unread'}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-semibold text-white/60 transition hover:border-amber-400/30 hover:text-amber-300 disabled:opacity-40"
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      {t('Unread', 'غير مقروءة')}
                    </button>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/[0.05] bg-black/20 p-4 text-sm leading-6 text-white/62">
                  {item.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
