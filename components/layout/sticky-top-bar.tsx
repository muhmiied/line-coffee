'use client'

import { useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '@/lib/context/language'
import { Header } from './header'

const DEFAULT_TEXT = '🚀 توصيل مجاني على الطلبات فوق 200 ج'
const DEFAULT_SPEED = 4000

type AnnouncementAnimation = 'fade' | 'marquee'

interface AnnouncementData {
  text?: string
  active?: boolean
  messages?: string[]
  messages_ar?: string[]
  messages_en?: string[]
  items?: AnnouncementDisplayItem[]
  animation?: AnnouncementAnimation
  speed?: number
}

interface AnnouncementDisplayItem {
  text_ar?: string
  text_en?: string
  link_url?: string
  button_text_ar?: string
  button_text_en?: string
}

interface DisplayMessage {
  text: string
  linkUrl?: string
  buttonText?: string
}

function normalizeMessages(data: AnnouncementData, language: 'ar' | 'en'): DisplayMessage[] {
  if (Array.isArray(data.items) && data.items.length > 0) {
    const items = data.items
      .map((item) => {
        const text = language === 'ar'
          ? item.text_ar || item.text_en
          : item.text_en || item.text_ar
        const buttonText = language === 'ar'
          ? item.button_text_ar || item.button_text_en
          : item.button_text_en || item.button_text_ar

        return {
          text: text?.trim() || '',
          linkUrl: item.link_url?.trim() || undefined,
          buttonText: buttonText?.trim() || undefined,
        }
      })
      .filter((item) => item.text)

    if (items.length > 0) return items
  }

  const localizedMessages = language === 'ar' ? data.messages_ar : data.messages_en
  const localized = Array.isArray(localizedMessages)
    ? localizedMessages.map((message) => message.trim()).filter(Boolean)
    : []

  if (localized.length > 0) return localized.map((text) => ({ text }))

  const messages = Array.isArray(data.messages)
    ? data.messages.map((message) => message.trim()).filter(Boolean)
    : []

  if (messages.length > 0) return messages.map((text) => ({ text }))
  return typeof data.text === 'string' && data.text.trim() ? [{ text: data.text.trim() }] : []
}

function normalizeSpeed(speed: unknown): number {
  if (speed === null || speed === undefined || speed === '') return DEFAULT_SPEED
  const value = typeof speed === 'number' ? speed : Number(speed)
  if (!Number.isFinite(value)) return DEFAULT_SPEED
  return Math.min(Math.max(Math.round(value), 1500), 30000)
}

export function StickyTopBar() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const [annLoading, setAnnLoading] = useState(true)
  const [annActive, setAnnActive] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [announcement, setAnnouncement] = useState<Required<AnnouncementData>>({
    text: '',
    active: false,
    messages: [],
    messages_ar: [],
    messages_en: [],
    items: [],
    animation: 'fade',
    speed: DEFAULT_SPEED,
  })
  const [messageIndex, setMessageIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setAnnLoading(false)
      return
    }
    setAnnLoading(true)
    fetch('/api/settings/announcement')
      .then((r) => r.json())
      .then((d: AnnouncementData) => {
        const messages = normalizeMessages(d, language)
        const displayMessages = messages.length > 0 ? messages : [{ text: DEFAULT_TEXT }]

        setAnnouncement({
          text: displayMessages[0]?.text ?? DEFAULT_TEXT,
          active: d?.active !== false,
          messages: displayMessages.map((message) => message.text),
          messages_ar: Array.isArray(d.messages_ar) ? d.messages_ar : [],
          messages_en: Array.isArray(d.messages_en) ? d.messages_en : [],
          items: messages.length > 0 ? d.items ?? [] : [],
          animation: d?.animation === 'marquee' ? 'marquee' : 'fade',
          speed: normalizeSpeed(d?.speed),
        })
        setMessageIndex(0)

        // Only hide if the admin explicitly deactivated (strict false, not null/undefined/error).
        setAnnActive(d?.active !== false)
      })
      .catch(() => {
        setAnnouncement({
          text: DEFAULT_TEXT,
          active: true,
          messages: [DEFAULT_TEXT],
          messages_ar: [DEFAULT_TEXT],
          messages_en: [DEFAULT_TEXT],
          items: [],
          animation: 'fade',
          speed: DEFAULT_SPEED,
        })
        setMessageIndex(0)
        setAnnActive(true)
      })
      .finally(() => setAnnLoading(false))
  }, [language, pathname])

  const messages = useMemo(() => normalizeMessages(announcement, language), [announcement, language])
  const currentMessage = messages[messageIndex] ?? { text: announcement.text }
  const useMarquee = announcement.animation === 'marquee' && !reduceMotion

  useEffect(() => {
    if (reduceMotion || useMarquee || messages.length < 2) return

    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length)
    }, announcement.speed)

    return () => window.clearInterval(timer)
  }, [announcement.speed, messages.length, reduceMotion, useMarquee])

  if (pathname.startsWith('/dashboard/admin')) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {annLoading && !dismissed ? (
        <div className="min-h-[38px] border-b border-[#B6885E]/15 bg-[#120D09]/95" />
      ) : annActive && !dismissed && (
        <div className="relative flex min-h-[38px] items-center justify-center border-b border-[#B6885E]/15 bg-[#120D09]/95 px-10 py-2.5 text-center text-sm text-[#F5E6D8] shadow-[0_10px_34px_rgba(0,0,0,0.28)]">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFDCC2]/12 to-transparent"
            animate={reduceMotion ? undefined : { x: ['-120%', '240%'] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {useMarquee ? (
            <div className="relative z-10 w-full overflow-hidden">
              <motion.div
                className="flex w-max items-center gap-10 whitespace-nowrap"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: Math.max(announcement.speed / 650, 8), repeat: Infinity, ease: 'linear' }}
              >
                {[...messages, ...messages].map((message, index) => (
                  <span key={`${message.text}-${index}`} className="inline-flex items-center gap-10">
                    {message.linkUrl ? (
                      <a href={message.linkUrl} className="transition-colors hover:text-white">
                        {message.text}
                      </a>
                    ) : (
                      <span>{message.text}</span>
                    )}
                    <span className="text-[#B6885E]" aria-hidden>•</span>
                  </span>
                ))}
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.span
                key={`${currentMessage.text}-${messageIndex}`}
                className="relative z-10 block leading-5"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {currentMessage.linkUrl && currentMessage.buttonText ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span>{currentMessage.text}</span>
                    <a
                      href={currentMessage.linkUrl}
                      className="rounded-full border border-[#B6885E]/35 px-2.5 py-0.5 text-xs text-[#FFDCC2] transition-colors hover:border-[#FFDCC2]/50 hover:text-white"
                    >
                      {currentMessage.buttonText}
                    </a>
                  </span>
                ) : currentMessage.linkUrl ? (
                  <a href={currentMessage.linkUrl} className="transition-colors hover:text-white">
                    {currentMessage.text}
                  </a>
                ) : (
                  currentMessage.text
                )}
              </motion.span>
            </AnimatePresence>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="إغلاق الإعلان"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D6B79A] transition-opacity hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Header />
    </div>
  )
}
