'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/context/language'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const WHATSAPP_NUMBER = '201141262176'

// Pre-defined responses for common questions
const getResponse = (message: string, language: 'en' | 'ar'): string => {
  const lowerMessage = message.toLowerCase()
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('مرحبا') || lowerMessage.includes('اهلا')) {
    return language === 'ar' 
      ? 'مرحباً بك في لاين كوفي! كيف يمكنني مساعدتك اليوم؟' 
      : 'Welcome to Line Coffee! How can I help you today?'
  }
  
  // Products
  if (lowerMessage.includes('product') || lowerMessage.includes('منتج') || lowerMessage.includes('قهوة') || lowerMessage.includes('coffee')) {
    return language === 'ar'
      ? 'نقدم مجموعة متنوعة من القهوة: قهوة تركية، إسبريسو، كابتشينو، كوفي ميكس، وهوت شوكلت. يمكنك تصفح منتجاتنا من صفحة المنتجات!'
      : 'We offer a variety of coffee: Turkish coffee, Espresso, Cappuccino, Coffee Mix, and Hot Chocolate. Browse our products page!'
  }
  
  // Shipping
  if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery') || lowerMessage.includes('شحن') || lowerMessage.includes('توصيل')) {
    return language === 'ar'
      ? 'نوفر شحن مجاني للطلبات فوق 200 جنيه. التوصيل خلال 1-3 أيام في جميع أنحاء مصر.'
      : 'Free shipping on orders over 200 EGP. Delivery within 1-3 days across Egypt.'
  }
  
  // Contact
  if (lowerMessage.includes('contact') || lowerMessage.includes('تواصل') || lowerMessage.includes('رقم') || lowerMessage.includes('phone')) {
    return language === 'ar'
      ? `يمكنك التواصل معنا عبر واتساب على الرقم: ${WHATSAPP_NUMBER}`
      : `You can contact us on WhatsApp: ${WHATSAPP_NUMBER}`
  }
  
  // Prices
  if (lowerMessage.includes('price') || lowerMessage.includes('سعر') || lowerMessage.includes('كم')) {
    return language === 'ar'
      ? 'أسعارنا تبدأ من 50 جنيه. يمكنك رؤية جميع الأسعار في صفحة المنتجات.'
      : 'Our prices start from 50 EGP. You can see all prices on our products page.'
  }
  
  // Default
  return language === 'ar'
    ? `شكراً لتواصلك! للمساعدة الفورية، تواصل معنا على واتساب: ${WHATSAPP_NUMBER}`
    : `Thanks for reaching out! For immediate assistance, contact us on WhatsApp: ${WHATSAPP_NUMBER}`
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { t, language, dir } = useLanguage()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: language === 'ar' 
            ? 'مرحباً! أنا مساعدك الذكي في لاين كوفي. كيف يمكنني مساعدتك؟' 
            : 'Hi! I\'m your Line Coffee AI assistant. How can I help you?'
        }
      ])
    }
  }, [isOpen, language, messages.length])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = getResponse(input, language)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl group sm:h-14 sm:w-14',
          dir === 'rtl' ? 'left-5 sm:left-6' : 'right-20 sm:right-24'
        )}
        aria-label="Open AI Chat"
      >
        <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={cn(
              'fixed inset-x-3 bottom-20 z-50 flex h-[min(500px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-24 sm:w-[350px]',
              dir === 'rtl' ? 'sm:left-6' : 'sm:right-6'
            )}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('Line Coffee Bot', 'بوت لاين كوفي')}</h3>
                  <p className="text-xs opacity-80">{t('Always here to help', 'دائماً هنا للمساعدة')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-secondary-foreground rounded-bl-md'
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('Type a message...', 'اكتب رسالة...')}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
