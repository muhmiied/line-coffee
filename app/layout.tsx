import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Noto_Naskh_Arabic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Suspense } from 'react'
import { LanguageProvider } from '@/lib/context/language'
import { AuthProvider } from '@/lib/context/auth'
import { StickyTopBar } from '@/components/layout/sticky-top-bar'
import { Footer } from '@/components/layout/footer'
import { PageLoader } from '@/components/layout/page-loader'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { WishlistDrawer } from '@/components/wishlist/wishlist-drawer'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { AIChatbot } from '@/components/ui/ai-chatbot'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { DiscountBanner } from '@/components/ui/discount-banner'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Line Coffee | قهوتك بطعم مختلف',
    template: '%s | Line Coffee',
  },
  description: 'قهوة مميزة بطعم مختلف. اكتشف أجود أنواع القهوة التركية، الإسبريسو، الكابتشينو، والهوت شوكلت. توصيل لجميع أنحاء مصر.',
  keywords: ['قهوة', 'لاين كوفي', 'قهوة تركي', 'كابتشينو', 'هوت شوكلت', 'coffee', 'Line Coffee', 'Egypt', 'مصر'],
  authors: [{ name: 'Line Coffee' }],
  creator: 'Line Coffee',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    siteName: 'Line Coffee',
    title: 'Line Coffee | قهوتك بطعم مختلف',
    description: 'قهوة مميزة بطعم مختلف. اكتشف أجود أنواع القهوة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Line Coffee | قهوتك بطعم مختلف',
    description: 'قهوة مميزة بطعم مختلف. اكتشف أجود أنواع القهوة.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFDCC2' },
    { media: '(prefers-color-scheme: dark)', color: '#522500' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="ltr" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${notoNaskhArabic.variable} bg-background`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('line-coffee-language');if(l==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}else{document.documentElement.dir='ltr';document.documentElement.lang='en';}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col w-full">
        <LanguageProvider>
          <AuthProvider>
            <ScrollProgress />
            <Suspense fallback={null}>
              <PageLoader />
            </Suspense>
            <StickyTopBar />
            <main className="flex-1 w-full pt-20 md:pt-24">{children}</main>
            <Footer />
            <CartDrawer />
            <WishlistDrawer />
            <WhatsAppButton />
            <AIChatbot />
            <DiscountBanner />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
