import type { ReactNode } from 'react'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Blog | Line Coffee',
  description: 'Coffee stories, brewing guides, and Line Coffee updates in Arabic and English.',
  path: '/blog',
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children
}
