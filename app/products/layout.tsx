import type { ReactNode } from 'react'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Products | Line Coffee',
  description: 'Explore Line Coffee products including Turkish Blends, Espresso Blends, Make Your Espresso, Easy Coffee, Coffee Mix, Cappuccino, Flavor Coffee, Hot Chocolate, and Make Your Flavor.',
  path: '/products',
})

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children
}
