import type { ReactNode } from 'react'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'About Line Coffee | من نحن',
  description: 'Learn about Line Coffee, our coffee sourcing, roasting approach, and premium coffee experience in Egypt.',
  path: '/about',
})

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children
}
