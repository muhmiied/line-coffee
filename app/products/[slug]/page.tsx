import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductDetail } from '@/components/products/product-detail'
import { RelatedProducts } from '@/components/products/related-products'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name_en, name_ar, description_en, images')
    .eq('slug', slug)
    .single()

  if (!product) {
    return createPageMetadata({
      title: 'Product Not Found',
      description: 'The requested Line Coffee product could not be found.',
      path: `/products/${slug}`,
    })
  }

  const title = `${product.name_en || product.name_ar} | Line Coffee`
  const description = product.description_en || `Shop ${product.name_en || product.name_ar} from Line Coffee. Premium coffee delivered in Egypt.`
  const image = Array.isArray(product.images) ? product.images[0] : null

  return createPageMetadata({
    title,
    description,
    path: `/products/${slug}`,
    image,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, sizes:product_sizes(*), category:categories(*)')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products from the same category
  let relatedProducts = []
  if (product.category_id) {
    const { data } = await supabase
      .from('products')
      .select('*, sizes:product_sizes(*)')
      .eq('category_id', product.category_id)
      .eq('is_visible', true)
      .neq('id', product.id)
      .limit(4)

    relatedProducts = data || []
  }

  return (
    <div className="min-h-screen pb-16">
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  )
}
