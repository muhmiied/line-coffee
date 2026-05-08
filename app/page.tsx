import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturesPills } from '@/components/home/features-pills'
import { StorySection } from '@/components/home/story-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { InstagramSection } from '@/components/home/instagram-section'
import { ContactSection } from '@/components/home/contact-section'
import { VideoSection } from '@/components/home/video-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturesPills />
      <StorySection />
      <VideoSection />
      <BestSellersSection />
      <TestimonialsSection />
      <InstagramSection />
      <ContactSection />
    </>
  )
}
