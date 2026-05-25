import type { ReactNode } from 'react'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Products | Line Coffee',
  description: 'Explore Line Coffee products including Turkish coffee, espresso, flavored coffee, coffee mix, cappuccino, and hot chocolate.',
  path: '/products',
})

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children
}
