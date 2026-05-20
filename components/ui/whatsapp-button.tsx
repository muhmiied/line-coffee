'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP_ORDER_PHONE_E164 } from '@/lib/config/site'

export function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent('مرحباً، أريد الاستفسار عن منتجاتكم')
    window.open(`https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${message}`, '_blank')
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl group sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110 sm:h-7 sm:w-7" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 sm:block">
        تواصل معنا
      </span>
    </motion.button>
  )
}
