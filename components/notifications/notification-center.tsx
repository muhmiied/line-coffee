'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context/auth'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

type NotificationItem = {
  id: string
  title: string
  message: string
  type: string | null
  is_read: boolean
  related_order_id: string | null
  promo_code: string | null
  created_at: string
}

export function NotificationCenter() {
  const { user } = useAuth()
  const { t, dir } = useLanguage()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' })
      const json = await response.json()
      setItems(json?.data || [])
      setUnread(json?.unread || 0)
    } catch {
      setItems([])
      setUnread(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setItems([])
      setUnread(0)
      setOpen(false)
      return
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 60_000)
    return () => clearInterval(interval)
  }, [loadNotifications, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    if (!user || unread === 0) return
    setUnread(0)
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
    } catch {
      loadNotifications()
    }
  }

  const toggleOpen = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) void markAllRead()
  }

  if (!user) return null

  return (
    <div ref={panelRef} className="relative z-[80]">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleOpen}
        className="relative text-[#D6B79A]/75 hover:bg-[#B6885E]/10 hover:text-[#F5E6D8] hover:shadow-[0_0_24px_rgba(182,136,94,0.14)]"
        aria-label={t('Notifications', 'الإشعارات')}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #B6885E, #D6A373)', color: '#0B0806' }}
          >
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'absolute top-[calc(100%+0.75rem)] z-[90] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl shadow-2xl',
              dir === 'rtl' ? 'left-0' : 'right-0',
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(18,13,9,0.99), rgba(11,8,6,0.99))',
              border: '1px solid rgba(214,163,115,0.28)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,230,216,0.03) inset',
            }}
          >
            <div className="flex items-center justify-between border-b border-[#B6885E]/15 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#F5E6D8]">{t('Notifications', 'الإشعارات')}</p>
                <p className="text-xs text-[#B79B85]">{t('Your account updates', 'تحديثات حسابك')}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[#B6885E]" />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-[#D6B79A]/20" />
                  <p className="text-sm text-[#D6B79A]/70">{t('No notifications yet', 'لا توجد إشعارات حتى الآن')}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const content = (
                      <div className="rounded-xl border border-[#B6885E]/10 bg-white/[0.025] px-3 py-3 transition-colors hover:bg-[#B6885E]/10">
                        <div className="mb-1 flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-[#F5E6D8]">{item.title}</p>
                          {!item.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D6A373]" />}
                        </div>
                        <p className="text-xs leading-5 text-[#D6B79A]/75">{item.message}</p>
                        {item.promo_code && (
                          <p className="mt-2 inline-flex rounded-full border border-[#B6885E]/25 px-2 py-0.5 text-[10px] font-semibold text-[#D6A373]">
                            {item.promo_code}
                          </p>
                        )}
                        <p className="mt-2 text-[10px] text-[#B79B85]/55">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    )

                    return item.related_order_id ? (
                      <Link key={item.id} href="/dashboard/orders" onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={item.id}>{content}</div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
