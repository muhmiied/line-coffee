import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturesPills } from '@/components/home/features-pills'
import { StorySection } from '@/components/home/story-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { BlogSection } from '@/components/home/blog-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { InstagramSection } from '@/components/home/instagram-section'
import { ContactSection } from '@/components/home/contact-section'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Line Coffee | Premium Coffee in Egypt | قهوة فاخرة بطابع دافئ',
  description: 'Shop freshly roasted Turkish coffee, espresso blends, flavored coffee, cappuccino, and hot chocolate from Line Coffee in Egypt.',
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturesPills />
      <StorySection />
      <BestSellersSection />
      <BlogSection />
      <TestimonialsSection />
      <InstagramSection />
      <ContactSection />
    </>
  )
}
