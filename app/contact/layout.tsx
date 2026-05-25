import type { ReactNode } from 'react'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Contact Line Coffee | تواصل معنا',
  description: 'Contact Line Coffee for orders, support, wholesale inquiries, and coffee questions in Egypt.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
