# LINE COFFEE Reverse Engineering and Rebuild Audit

Date: 2026-06-07

Scope: read-only audit and rebuild documentation. No app code, database data, migrations, commits, or runtime behavior were changed.

## Source Basis

This document is based on static inspection of the Next.js application, Supabase migrations/scripts, shared configuration, UI components, API route handlers, and dashboard pages.

Important limits:

- No live Supabase database was queried.
- No browser/runtime QA was performed because the request was documentation-only.
- Several source files contain mojibake in Arabic text. Treat Arabic copy and migration seed text as content that needs verification from the brand owner before a rebuild.

## 1. Executive Summary

LINE COFFEE is a bilingual premium coffee ecommerce and brand website. It combines a luxury marketing site, product catalog, custom coffee builders, account-based checkout, WhatsApp-assisted fulfillment, public order tracking, and an admin dashboard for commerce and CMS operations.

Primary actors:

| Actor | Goal |
| --- | --- |
| Visitor | Browse brand story, products, blog, reviews, and contact channels. |
| Customer | Create account, save cart/wishlist, build custom products, place orders, track orders, cancel eligible orders, submit reviews. |
| Admin | Manage products, categories, orders, customers, media sections, settings, reviews, discounts, blog posts, contact messages, beans, flavors, and notifications. |

Core customer journey:

1. Land on the homepage.
2. Browse categories or search products.
3. Add standard products or custom builder products to cart.
4. Sign in or sign up.
5. Checkout with delivery details and payment method.
6. System creates an order, validates stock/prices/discounts server-side, deducts stock, and opens a WhatsApp message.
7. Customer tracks order by order number and may submit a review.

Core admin journey:

1. Sign in with the configured admin email.
2. Enter `/dashboard/admin`.
3. Review pending orders and update status/payment/admin notes.
4. Maintain catalog, CMS, discounts, stock, and public settings.

System summary:

| Layer | Current implementation |
| --- | --- |
| Framework | Next.js App Router, React, TypeScript |
| Styling | TailwindCSS v4, global premium coffee theme |
| Database/Auth | Supabase Auth, Postgres, RLS, service-role admin operations |
| State | Zustand for local/persisted cart and wishlist, React contexts for auth/language |
| CMS | Supabase-backed `site_settings`, `banners`, `blog_posts`, testimonials/reviews |
| Commerce | Products, sizes, discounts, orders, order items, stock controls |
| Fulfillment | WhatsApp URL handoff, optional Telegram notification |

Strengths:

- Strong premium brand direction across layout, color, typography, and motion.
- Server-side checkout validates prices, product visibility, discounts, and stock.
- Rich media builder allows homepage and page sections to be edited without code.
- Custom espresso and flavor builders are a differentiated commerce feature.
- Bilingual and RTL support are built into layout and language context.
- Admin dashboard covers the main operational workflows.

Main rebuild risks and technical debt:

- Arabic copy appears corrupted in several files and migration seeds.
- Admin authorization is based on one hardcoded email, not a real roles table.
- Checkout stock/order work is not wrapped in one full database transaction for all side effects.
- There are overlapping legacy order/cart/blog concepts (`orders.service`, `/api/orders`, `blogs`, `blog_posts`, `carts`, `cart_items`).
- Public order tracking exposes order detail to anyone with an order number.
- Some admin APIs return raw database error messages.
- Footer references support pages that are not present.
- Fallback product/content data is mixed deeply into frontend code.

## 2. Brand Audit

Brand identity:

| Area | Current behavior | Rebuild requirement |
| --- | --- | --- |
| Personality | Premium, cozy, minimal, warm, elegant, coffee-luxury. | Preserve quiet luxury; avoid playful/cheap ecommerce styling. |
| Primary brand colors | Project rule says `#522500`, `#FFDCC2`, black, white. Current CSS uses darker coffee-black surfaces plus gold/cream accents. | Decide whether to preserve current dark luxury palette or normalize to the written brand tokens. Do not mix random colors. |
| Typography | Local Playfair Display for English display text; Google Cairo for Arabic. | Keep Playfair Display + Cairo or equivalent licensing-safe replacements. |
| Layout | Spacious sections, glass panels, cinematic backgrounds, soft borders. | Keep generous spacing and strong hierarchy. |
| Motion | Subtle fade, shimmer, hover scale, scroll progress, reduced-motion support. | Keep motion restrained and accessible. |
| Imagery | Coffee lifestyle, product, roasting, cafe atmosphere. | Use real product/cafe imagery where possible; generated/stock-like assets should not hide product details. |
| Bilingual | `html lang` and `dir` are controlled by local storage and language provider. | Preserve RTL layout, Arabic font, and copy parity. |

Visual system in `app/globals.css`:

- Coffee dark backgrounds: `#0B0806`, `#120D09`, `#15100B`, `#1B140F`.
- Gold accents: `#B6885E`, `#D6A373`.
- Cream text: `#F5E6D8`, `#D6B79A`, `#B79B85`.
- Reusable classes include `glass`, `nav-glass`, `luxury-panel`, `premium-button`, `premium-button-outline`, `premium-image-card`, and `premium-section-kicker`.

Brand rebuild principle:

The public site should feel like a boutique coffee brand first and a store second. Product grids and admin tools can be functional, but the customer-facing surface should stay warm, restrained, and image-led.

## 3. Website Structure and Public Page Audit

Public sitemap:

| Route | Purpose | Main data/components | Rebuild notes |
| --- | --- | --- | --- |
| `/` | Homepage landing and conversion hub. | `app/page.tsx`, home sections, `site_settings`, `banners`, products, blog, testimonials. | Section order and visibility are CMS-driven. |
| `/products` | Main catalog and custom builder hub. | Categories, products, `ProductsHero`, `MakeYourEspressoBlend`, `CustomizeFlavor`. | Default category is Turkish blends; custom categories render builders. |
| `/products/[slug]` | Product detail page. | Product by slug, category, sizes, related products, `ProductDetail`. | Uses static rating/social proof; rebuild should source this or remove it. |
| `/about` | Brand story page. | `about_top`, `about_story` media sections. | Media-builder controlled imagery/copy. |
| `/contact` | Contact details and WhatsApp contact form. | `contact_page` media, public settings, `/api/contact`. | Contact form creates admin message and returns WhatsApp URL. |
| `/blog` | Blog index. | `/api/blog/public`, media hero, fallback posts. | Canonical backend table is `blog_posts`, with legacy `blogs` fallback. |
| `/blog/[slug]` | Blog detail. | Admin Supabase read of published post. | Includes fallback behavior for schema drift. |
| `/checkout` | Account-based checkout. | Zustand cart, auth/profile, discounts, `/api/checkout`. | Requires login; success opens WhatsApp handoff. |
| `/track` | Public order tracking. | `/api/orders/track`. | Query order number is not auto-filled in the inspected page. |
| `/reviews` | Public review submission. | `/api/reviews`, testimonials table. | Reviews require admin approval. |
| `/privacy-policy` | Legal placeholder. | Site constants/settings. | Needs final legal content. |
| `/terms-of-use` | Legal placeholder. | Site constants/settings. | Needs final legal content. |
| `/auth/login` | Sign in. | Auth actions, next redirect. | Admins redirect to admin dashboard by email. |
| `/auth/signup` | Account creation. | Supabase Auth, profile metadata. | Requires phone, WhatsApp, address, password. |
| `/auth/forgot-password` | Reset request. | Auth action. | Standard Supabase email flow. |
| `/auth/reset-password` | Password reset. | Auth action. | Standard Supabase email flow. |
| `/auth/callback` | Auth callback. | Supabase session exchange. | Redirects to requested next path. |
| `/dashboard/*` | Customer dashboard. | Protected by proxy/session. | Customer orders/profile/settings/wishlist. |
| `/dashboard/admin/*` | Admin dashboard. | Protected by proxy admin email and API guards. | Commerce and CMS operations. |

Homepage section system:

| Section key | Component | Purpose | Data source |
| --- | --- | --- | --- |
| `hero` | `HeroSection` | Full-viewport slideshow with CTAs/stats. | `/api/media?section_key=hero`, fallback slides. |
| `categories` | `CategoriesSection` | Category cards and custom category highlights. | `/api/categories`, `/api/media?media_type=category`, fallback categories. |
| `features` | `FeaturesPills` | Trust/value props. | `home_features` media/content, fallback feature pills. |
| `story` | `StorySection` | Brand story split section. | `about_lower` media/content, fallback story. |
| `best_sellers` | `BestSellersSection` | Featured product grid. | Supabase `products.is_best_seller`, `best_sellers` media/content. |
| `blog` | `BlogSection` | Recent editorial content. | `/api/blog/public`, fallback posts. |
| `testimonials` | `TestimonialsSection` | Social proof. | `/api/testimonials?featured=true&limit=3`, `testimonials` media/content. |
| `instagram` | `InstagramSection` | Social lifestyle grid. | `home_instagram` media/settings, fallback images. |
| `contact` | `ContactSection` | Contact CTA and form. | `home_contact` media/settings, `/api/contact`. |

Global layout:

- `app/layout.tsx` loads fonts, auth/language providers, top navigation, footer, cart drawer, wishlist drawer, WhatsApp button, discount banner, toaster, and analytics.
- `StickyTopBar` combines announcement bar and header.
- Footer hides on admin routes.
- Header has navigation, search, language selector, notifications, wishlist/cart buttons, account/admin menus.

## 4. UI/UX Audit

Customer-facing UX:

| Flow | Current UX | Rebuild requirement |
| --- | --- | --- |
| Navigation | Sticky glass header with desktop nav and mobile menu. | Keep simple: Home, Products, About, Contact, Blog, account/cart. |
| Search | Header preloads product list and filters client-side. | For larger catalogs, rebuild as debounced server search. |
| Catalog browsing | Sidebar categories, search, category default, product grid. | Add clear all-products state if desired; current default is category-led. |
| Product cards | Image, badges, stock, wishlist, quick add, size prices. | Preserve quick commerce but keep visuals premium. |
| Product detail | Gallery, size selection, quantity, stock, wishlist, related products. | Replace static rating with real reviews or remove. |
| Cart | Side drawer with standard and custom item details, shipping threshold, quantity controls. | Keep drawer pattern; stock checks should stay server-authoritative. |
| Checkout | Auth-only, profile autofill, delivery fields, payment method, discount validation. | Keep minimal fields and clear validation. |
| Tracking | Public order lookup and timeline. | Consider adding phone/email verification before showing details. |
| Reviews | Public review form with approval queue. | Keep moderation workflow. |

Responsive/RTL observations:

- Layout uses `dir` and language-aware text helper.
- Arabic font override is global.
- Product/category grids use responsive column counts.
- Builders are dense but use a shared premium configurator shell.
- Rebuild should test mobile widths heavily for builder controls, cart details, and admin tables.

Accessibility notes:

- Reduced-motion media query exists.
- Buttons and form controls generally have visible labels or icons.
- Rebuild should add systematic keyboard/focus testing for drawers, menus, admin modals, and builder controls.

## 5. Content Audit

Content sources:

| Content type | Current source |
| --- | --- |
| Brand constants | `lib/config/site.ts` |
| Public settings | `site_settings`, `lib/config/public-settings.ts` |
| Homepage/page media copy | `banners.content`, `banners.layout`, `lib/media.ts` |
| Products/categories | Supabase tables plus fallback catalog in `lib/config/product-system.ts` |
| Builder options | `coffee_beans`, `flavor_bases`, `flavor_options`, `site_settings`, fallback config |
| Blog | `blog_posts` canonical, legacy `blogs` compatibility |
| Testimonials/reviews | `testimonials` |
| Legal pages | Placeholder settings/constants |

Tone:

- English copy is premium lifestyle/commercial.
- Arabic copy is intended to mirror the same experience, but many inspected strings are corrupted.
- Rebuild should start with a clean bilingual copy deck before data migration.

Content gaps:

- Legal pages need final policy text.
- Footer links reference support routes that are not present: `/faq`, `/shipping`, `/returns`.
- Product fallback data is useful for demos but should not be the source of truth in production.
- Several UI messages are hardcoded rather than fully CMS-managed.

## 6. Product System Audit

Canonical category taxonomy:

| Slug | Purpose |
| --- | --- |
| `turkish-blends` | Turkish coffee blends. |
| `espresso-blends` | Ready espresso blends. |
| `make-your-espresso` | Custom espresso builder. |
| `easy-coffee` | Easy/instant-style coffee line. |
| `coffee-mix` | Coffee mix products. |
| `cappuccino` | Cappuccino products. |
| `flavor-coffee` | Flavored coffee products. |
| `hot-chocolate` | Hot chocolate products. |
| `make-your-flavor` | Custom flavor builder. |

Product data model:

| Concept | Current fields |
| --- | --- |
| Product identity | `id`, `slug`, `name_en`, `name_ar`, descriptions, short descriptions. |
| Classification | `category_id`, category relation, aliases in config. |
| Media | `images` text array. |
| Coffee details | `origin`, `roast_level`, `flavor_notes`. |
| Merchandising | `is_featured`, `is_best_seller`, `is_new`, `is_visible`. |
| Stock | `stock_quantity`, `low_stock_threshold`, `is_manually_out_of_stock`. |
| Sizes | `product_sizes`: `250g`, `500g`, `1kg`, price, compare-at price, sku, availability. |

Stock states:

| State | Rule |
| --- | --- |
| Sold out | `is_manually_out_of_stock = true` or `stock_quantity <= 0`. |
| Low stock | `stock_quantity <= low_stock_threshold`. |
| Available | Visible, size available, stock above threshold. |

Pricing:

- Standard products use `product_sizes.price`.
- Sale display uses `compare_at_price` when present.
- Fallback generated prices use product config and a 1.6 multiplier.
- Checkout ignores client prices and recalculates from database rows.

Fallback catalog:

- Turkish blends: Turkish Silk, Strike Coffee, Cairo Nights, High Mood.
- Espresso blends: HEAVY CREMA, AROMA BODY, HEADSHOT, BLACK LABEL.
- Easy Coffee: Classic Line, Gold Line.
- Coffee Mix: Original, Hazelnut, Caramel.
- Cappuccino: Original, Chocolate, Vanilla.
- Flavor Coffee: Hazelnut, Chocolate Chunk.
- Hot Chocolate: Original.

Rebuild requirement:

Move fallback/demo data into seeds or fixtures. Production code should prefer a single catalog source of truth and clearly mark demo-only data.

## 7. Custom Builders Audit

### Make Your Espresso

Purpose: allow customers to build a custom espresso blend from coffee bean origins.

Current frontend:

- Implemented inside `app/products/page.tsx`.
- Uses shared UI shell from `components/products/premium-configurator.tsx`.
- Fetches `/api/customization-options`.
- Modes: quick recommendation and custom ratio.
- Profiles: balanced, crema, chocolate/nutty, bright, strong.
- Preferences include body, budget, and Arabica preference.

Current intelligence:

- `lib/config/espresso-intelligence.ts` scores beans using explicit metrics or text heuristics.
- Recommends 2 to 4 beans.
- Caps Robusta except for strong/crema profiles.
- Produces advice warnings for too many beans, invalid ratio totals, too much Robusta, low body, and over-dominant beans.

Pricing:

- `calculateBlendRawCost` uses weighted bean price by ratio or average by type.
- `calculateBlendPrice` multiplies raw cost by package kg and rounds cleanly.
- Current blend price does not add packaging/profit margin in the final formula.

Stock:

- Beans have `stock_quantity`, `low_stock_threshold`, and manual out-of-stock.
- Custom stock usage converts selected package size to kg and multiplies by ratio and quantity.
- Server checkout validates bean existence, activity, stock, and exact 100 percent total.

Cart shape:

- `product_id` is a synthetic value: `build-your-espresso`.
- `customizations.type = espresso-blend`.
- Beans are stored with id/name/family/origin/percent/stock flags.

### Customize Flavor

Purpose: allow customers to choose a base drink and up to three flavor additions.

Current frontend:

- Implemented inside `app/products/page.tsx`.
- Fetches active bases/options from `/api/customization-options`.
- Bases: Turkish Coffee, Coffee Mix, Cappuccino, Hot Chocolate.
- Flavor groups: Sweets LINE, Nuts, Fruits, Special Order.
- Maximum selected flavors: 3.

Pricing:

- Base price plus selected flavor price deltas per kg.
- Package sizes: `250g`, `500g`, `1kg`.
- `calculateFlavorPrice` multiplies by package kg and rounds cleanly.

Stock:

- Flavor option rows have stock and manual out-of-stock controls.
- Availability is tracked per base where the same flavor exists under multiple bases.
- Server checkout validates base, selected flavors, stock, and final price.

Cart shape:

- `product_id` is synthetic: `custom-flavor-{base.id}`.
- `customizations.type = flavor`.
- Base and flavors are persisted in the cart item snapshot.

Rebuild requirement:

Treat custom products as first-class order item types, not fake product IDs. A clean rebuild should use an `order_item_type` enum and normalized snapshots for recipe, price inputs, and stock consumption.

## 8. Order System Audit

Checkout endpoint: `POST /api/checkout`.

Server responsibilities:

1. Require authenticated user.
2. Require service-role Supabase client.
3. Validate shipping fields.
4. Sanitize item quantities and strings.
5. Load real products and sizes from database.
6. Validate product visibility, size availability, stock, and manual out-of-stock state.
7. Validate custom espresso beans and flavor options.
8. Recalculate all prices server-side.
9. Validate discount code, assignment, minimum order, expiry, and usage limit.
10. Apply shipping settings from `site_settings`.
11. Insert order and order items.
12. Deduct stock.
13. Increment discount usage.
14. Build WhatsApp message URL.
15. Optionally send Telegram notification.

Order number:

- Current checkout builds a readable customer/phone/sequence style order number.
- Database trigger also has an older random `LC-YYYYMMDD-####` generator as fallback.

Order status flow:

| Status | Meaning |
| --- | --- |
| `pending` | Created, waiting for admin confirmation. |
| `confirmed` | Accepted/confirmed. |
| `preparing` | Being prepared. |
| `shipped` | Out for delivery. |
| `delivered` | Completed. |
| `cancelled` | Cancelled by admin or eligible customer. |

Payment methods:

- `cod`
- `electronic_wallet`
- `instapay`

Payment statuses:

- `pending`
- `paid`
- `failed`
- `refunded`

Cancellation:

- Admin can cancel most non-final orders and stock is restored.
- Customer cancellation is allowed within 24 hours unless shipped/delivered/cancelled.
- Order status helper maps legacy `processing` to `preparing`.

Tracking:

- `GET /api/orders/track?order=...` returns status, totals, shipping details, and item lines.
- Public tracking requires only order number.

Risk notes:

- Order creation, item insertion, product stock deduction, custom stock deduction, discount use increment, and notification side effects are not one single database transaction.
- Product stock deduction and custom RPC deduction are separate paths in the inspected checkout logic.
- If a later step fails after an earlier stock write, rollback may be incomplete.
- Public tracking by order number only is convenient but exposes order details to anyone who knows/guesses the number.

Rebuild requirement:

Move checkout into one transactional backend operation or database function. The transaction should create the order, create order items, deduct all inventory, reserve/consume discounts, and return a result atomically.

## 9. Dashboard Audit

Customer dashboard:

| Route | Purpose |
| --- | --- |
| `/dashboard` | Account overview and redirect logic for admin users. |
| `/dashboard/orders` | Customer order list and eligible cancellation. |
| `/dashboard/profile` | Profile data update. |
| `/dashboard/settings` | Language/account settings. |
| `/dashboard/addresses` | Address management surface. |
| `/dashboard/wishlist` | Saved products. |

Admin dashboard shell:

- Client-side shell in `app/dashboard/admin/layout.tsx`.
- Sidebar/topbar navigation.
- Pending order polling every 60 seconds.
- Mobile horizontal nav support.
- Admin access depends on proxy/API admin email checks.

Admin modules:

| Route | Purpose | APIs |
| --- | --- | --- |
| `/dashboard/admin` | Overview cards and stats. | `/api/admin/stats` |
| `/dashboard/admin/analytics` | Analytics view. | `/api/admin/stats` |
| `/dashboard/admin/orders` | Order operations. | `/api/admin/orders`, `/api/admin/orders/[orderId]` |
| `/dashboard/admin/products` | Product CRUD, sizes, visibility, stock. | `/api/admin/products`, `/api/admin/products/[productId]` |
| `/dashboard/admin/categories` | Category CRUD and product recategorization. | `/api/admin/categories`, `/api/admin/categories/[categoryId]` |
| `/dashboard/admin/coffee-beans` | Bean CRUD, family, price, stock. | `/api/admin/coffee-beans`, `/api/admin/coffee-beans/[id]` |
| `/dashboard/admin/flavors` | Flavor base/option CRUD and stock. | `/api/admin/flavors`, `/api/admin/flavors/[id]` |
| `/dashboard/admin/customers` | Customer list and notifications. | `/api/admin/customers`, `/api/admin/notifications` |
| `/dashboard/admin/contact-messages` | Contact inbox. | `/api/admin/contact-messages` |
| `/dashboard/admin/reviews` | Review approval/feature/visibility/delete. | `/api/admin/reviews` |
| `/dashboard/admin/discounts` | Discount CRUD, assignments, WhatsApp send. | `/api/admin/discounts`, `/api/admin/discounts/[discountId]`, `/api/admin/whatsapp/send` |
| `/dashboard/admin/blog` | Blog post CRUD and media upload. | `/api/admin/blog`, `/api/admin/blog/[postId]`, `/api/admin/media/upload` |
| `/dashboard/admin/banners` | Media Studio and visual section builder. | `/api/admin/media-studio`, `/api/admin/media/upload` |
| `/dashboard/admin/settings` | Announcement, public settings, WhatsApp settings. | `/api/settings/announcement`, `/api/admin/settings/public`, `/api/admin/settings/whatsapp` |

Rebuild requirement:

Use role-based access control instead of hardcoded admin email. Keep the admin information architecture, but separate commerce operations from content editing for clarity.

## 10. CMS Audit

CMS storage:

| Feature | Storage |
| --- | --- |
| Public site settings | `site_settings` key/value JSON. |
| Announcement/free shipping | `site_settings` keys and announcement rules. |
| WhatsApp settings | `site_settings`. |
| Homepage section order/visibility | `site_settings` keys validated by `lib/config/public-settings.ts`. |
| Page/section media | `banners` table. |
| Media assets | Supabase bucket `line-coffee-media`. |
| Blog posts | `blog_posts` table, legacy `blogs` fallback. |
| Testimonials/reviews | `testimonials`. |
| Contact messages | `contact_messages`. |

Media Studio model:

`banners` began as a simple banner table and was extended into a flexible visual section table.

Key fields:

- Identity: `id`, `section_key`, `slide_key`, `usage_area`, `media_type`.
- Copy: `title_en`, `title_ar`, `subtitle_en`, `subtitle_ar`, `content` JSON.
- Media: `image_url`, `mobile_image_url`, `images` JSON, `alt_en`, `alt_ar`.
- Layout: `section_type`, `layout` JSON, `object_position`, `overlay_opacity`.
- CTA: `button_text_en`, `button_text_ar`, `button_link`, `link_url`.
- Behavior: `animation_type`, `animation_duration`, `device_visibility`.
- Scheduling: `starts_at`, `ends_at`.
- Sorting/visibility: `sort_order`, `is_active`, `is_featured`.

Supported website sections:

- Homepage hero, categories, features, story, best sellers, blog, testimonials, Instagram, contact.
- Product banner.
- About top/story/lower.
- Contact page.
- Blog hero.
- Generic banner/card/text/contact templates.

CMS rebuild recommendation:

Keep `section_key` and JSON content/layout flexibility, but define strict schemas per section type. This avoids fragile frontend assumptions while preserving editor freedom.

## 11. Database Audit

Main database tables:

| Table | Purpose | Important fields |
| --- | --- | --- |
| `profiles` | User profile linked to Supabase Auth. | `id`, names, phone, WhatsApp, avatar, address, city, notes, location link, preferred language. |
| `categories` | Product categories. | slug, bilingual names/descriptions, image, sort order, visibility. |
| `products` | Standard catalog products. | slug, bilingual content, category, images, origin, roast, notes, flags, visibility, stock. |
| `product_sizes` | Product variants/prices. | product id, size, price, compare-at price, sku, availability. |
| `orders` | Order header and customer snapshot. | order number, user, customer info, address snapshots, totals, discount, payment, status, notes, items JSON. |
| `order_items` | Order line snapshots. | order id, product id, name, image, size, quantity, prices, customizations JSON. |
| `cart_items` | Persisted customer cart. | user, product, client item id, name/image snapshot, size, quantity, unit price, customizations. |
| `wishlist_items` | Persisted wishlist. | user, product. |
| `testimonials` | Reviews/testimonials. | customer name/avatar, bilingual content, rating, featured, visible, approved. |
| `discounts` | Discount codes. | code, type, value, min order, max uses, uses, active, expiry, assigned emails. |
| `banners` | Section media and CMS content. | image/media fields, section keys, copy, layout/content JSON, scheduling. |
| `blogs` | Legacy blog table. | slug, bilingual title/content/excerpt, cover image, published state. |
| `blog_posts` | Canonical blog table used by app scripts/admin. | slug, bilingual title/content/excerpt, SEO fields, cover, published state, sort. |
| `customization_options` | Legacy generic customization options. | type, bilingual names, active, sort. |
| `coffee_beans` | Custom espresso bean options. | names, origin, descriptions, family, price, active, stock, threshold, manual out. |
| `flavor_bases` | Custom flavor base products. | names, price, active, sort. |
| `flavor_options` | Custom flavor additions per base. | base id, names, price delta, type, active, stock, threshold, manual out. |
| `site_settings` | JSON key/value configuration. | key, value, timestamps. |
| `notifications` | User notifications. | user, type/title/message/data, read state. |
| `contact_messages` | Admin contact inbox. | name, email, subject, message, status. |

Important relationships:

- `profiles.id` -> `auth.users.id`.
- `products.category_id` -> `categories.id`.
- `product_sizes.product_id` -> `products.id`.
- `orders.user_id` -> `auth.users.id`.
- `order_items.order_id` -> `orders.id`.
- `order_items.product_id` -> `products.id`.
- `cart_items.user_id` -> `auth.users.id`; `cart_items.product_id` -> `products.id`.
- `wishlist_items.user_id` -> `auth.users.id`; `wishlist_items.product_id` -> `products.id`.
- `flavor_options.base_id` -> `flavor_bases.id`.
- `notifications.user_id` -> `auth.users.id`.

RLS pattern:

| Table group | Read/write model |
| --- | --- |
| Public catalog/media/blog/reviews | Public can read visible/published/active rows. |
| Profiles, cart, wishlist, notifications | Users can read/write their own rows. |
| Orders | Users can read own orders; service role manages all. |
| Admin-managed tables | Service role manages writes. |
| Discounts | Public read policy was removed; validation happens through server API. |
| Contact messages | Service role only. |

Functions/triggers:

| Function/trigger | Purpose |
| --- | --- |
| `handle_new_user` trigger | Creates profile after Supabase Auth signup. |
| `generate_order_number` trigger | Fallback order number generation. |
| `update_*_updated_at` triggers | Keep timestamps fresh for settings, banners, cart, blog, etc. |
| `deduct_checkout_stock(jsonb,jsonb,jsonb)` | Service-role-only atomic deduction for product, bean, and flavor stock payloads inside the function. |

Schema drift note:

The app has both migrations and loose SQL scripts. Some canonical app expectations, especially `blog_posts` and testimonial approval, are defined in `scripts/` rather than only in `supabase/migrations/`. A rebuild should consolidate schema into one ordered migration history.

## 12. API Audit

Public/customer APIs:

| Method | Route | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public visible categories. | Public |
| GET | `/api/products` | Public product list/filter/search. | Public |
| GET | `/api/products/[slug]` | Public product detail. | Public |
| GET | `/api/media` | Active/scheduled section media. | Public |
| GET | `/api/blog/public` | Published posts list. | Public |
| GET | `/api/blog/[slug]` | Published post detail. | Public |
| GET | `/api/testimonials` | Visible/featured testimonials. | Public |
| POST | `/api/reviews` | Submit review for moderation. | Public |
| POST | `/api/contact` | Save contact message and return WhatsApp URL. | Public |
| GET | `/api/flavors` | Flavor data. | Public |
| GET | `/api/coffee-beans` | Bean data. | Public |
| GET | `/api/customization-options` | Builder beans, bases, additions. | Public |
| GET | `/api/settings/public` | Public site settings. | Public |
| GET | `/api/settings/free-shipping` | Free shipping state. | Public |
| GET | `/api/settings/whatsapp` | WhatsApp contact settings. | Public |
| GET | `/api/settings/announcement` | Announcement bar settings. | Public |
| PATCH | `/api/settings/announcement` | Update announcement/settings. | Admin |
| GET | `/api/discounts/validate` | Validate discount code server-side. | Optional user |
| GET | `/api/discounts/my` | Assigned discounts. | Customer |
| GET/POST/PUT/DELETE | `/api/cart` | Persist customer cart. | Customer |
| PATCH/DELETE | `/api/cart/[itemId]` | Update/delete cart row. | Customer |
| GET/POST/PUT/DELETE | `/api/wishlist` | Persist wishlist. | Customer |
| GET/PATCH | `/api/profile` | Read/update profile. | Customer |
| POST | `/api/checkout` | Create order from cart payload. | Customer |
| GET/POST | `/api/orders` | Legacy/customer order routes. | Customer |
| GET/PATCH | `/api/orders/[orderId]` | Read/cancel customer order. | Customer |
| GET | `/api/orders/track` | Public order tracking by number. | Public |
| GET/PATCH | `/api/notifications` | Read/mark user notifications. | Customer |

Admin APIs:

| Method | Route | Purpose |
| --- | --- | --- |
| GET/POST | `/api/admin/products` | List/create products and size rows. |
| PATCH/DELETE | `/api/admin/products/[productId]` | Update/delete product. |
| GET/POST | `/api/admin/categories` | List/create categories. |
| PUT/PATCH/DELETE | `/api/admin/categories/[categoryId]` | Update/delete category. |
| GET | `/api/admin/orders` | List orders and order stats. |
| PATCH | `/api/admin/orders/[orderId]` | Update status/payment/notes/cancellation. |
| GET | `/api/admin/stats` | Dashboard stats. |
| GET | `/api/admin/customers` | Customer list. |
| POST | `/api/admin/notifications` | Send customer notifications. |
| GET/PATCH | `/api/admin/contact-messages` | Manage contact messages. |
| GET/PATCH/DELETE | `/api/admin/reviews` | Moderate reviews. |
| GET/POST | `/api/admin/discounts` | List/create discounts. |
| DELETE | `/api/admin/discounts/[discountId]` | Delete discount. |
| GET/POST | `/api/admin/blog` | List/create posts. |
| PUT/DELETE | `/api/admin/blog/[postId]` | Update/delete post. |
| GET/POST | `/api/admin/media-studio` | List/create section media. |
| PUT/DELETE | `/api/admin/media-studio/[itemId]` | Update/delete media item. |
| POST | `/api/admin/media/upload` | Upload media to Supabase storage. |
| GET/PATCH | `/api/admin/settings/public` | Public editable settings. |
| GET/PATCH | `/api/admin/settings/whatsapp` | WhatsApp notification settings. |
| GET/PATCH | `/api/admin/customization-options` | Update builder configuration. |
| POST | `/api/admin/whatsapp/send` | Send WhatsApp message helper. |
| GET/POST | `/api/admin/coffee-beans` | List/create beans. |
| PATCH/DELETE | `/api/admin/coffee-beans/[id]` | Update/delete bean. |
| GET/POST | `/api/admin/flavors` | List/create flavor bases/options. |
| PATCH/DELETE | `/api/admin/flavors/[id]` | Update/delete flavor item. |

API design observations:

- Most admin routes check the Supabase user and `isAdminEmail`.
- Service-role client is used for admin writes and server-side protected reads.
- Public routes generally filter to active/visible/published rows.
- Several route handlers return fallback data on missing service-role config.
- Rebuild should standardize response shape, error codes, validation, rate limiting, and logging.

## 13. Code Architecture Audit

Folder responsibilities:

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js App Router pages, layouts, and API routes. |
| `components/home/` | Homepage sections. |
| `components/layout/` | Header, footer, announcement/top bar, drawers, global buttons. |
| `components/products/` | Product cards, detail, configurator shell. |
| `components/cart/` | Cart drawer and cart UI. |
| `components/notifications/` | Notification center. |
| `hooks/` | UI/data hooks such as section content. |
| `lib/config/` | Brand, product system, shipping, customization, announcement, public settings. |
| `lib/services/` | Product/category/order service helpers. |
| `lib/store/` | Zustand cart/wishlist persistence. |
| `lib/supabase/` | Browser/server/admin Supabase clients and proxy session refresh. |
| `lib/context/` | Auth and language providers. |
| `lib/types*` | TypeScript model types and database-like types. |
| `supabase/migrations/` | Ordered migrations. |
| `scripts/` | Manual SQL setup/reconciliation/seeding scripts. |

State management:

- Auth state: `AuthProvider`, Supabase session, profile loading, login merge of local cart/wishlist to server.
- Language state: local storage key `line-coffee-language`, updates `html lang/dir`.
- Cart state: Zustand persisted `line-coffee-cart`, synced to `/api/cart` when authenticated.
- Wishlist state: persisted and synced similarly.

Architecture rebuild recommendation:

Separate domain modules more clearly:

- `catalog`: categories, products, sizes, stock.
- `custom-products`: espresso/flavor recipes, pricing, stock usage.
- `checkout`: validation, order transaction, discount, shipping, notification.
- `cms`: settings, sections, media, blog, reviews.
- `identity`: auth, profile, roles, permissions.

## 14. Security Audit

Current protections:

| Area | Current protection |
| --- | --- |
| Session refresh | `proxy.ts` updates Supabase session. |
| Customer dashboard | Redirects unauthenticated users to login. |
| Admin dashboard | Proxy blocks non-admin email for `/dashboard/admin*`. |
| Admin APIs | Check current user email with `isAdminEmail`. |
| Service-role operations | Server-only admin Supabase client. |
| Discounts | Public RLS read removed; validation through server route. |
| Checkout | Server recalculates prices, validates stock, ignores client pricing. |
| Redirects | Auth actions sanitize redirect path. |

Security risks:

| Risk | Impact | Rebuild recommendation |
| --- | --- | --- |
| Hardcoded admin email | No scalable roles or staff permissions. | Add `roles` or `staff_members` table with RBAC. |
| Public tracking by order number | Order details are visible to anyone with the number. | Require phone/email match or signed tracking token. |
| Non-atomic checkout side effects | Possible stock/order inconsistency on partial failure. | Use one transaction/RPC for all checkout writes. |
| Raw DB errors in admin APIs | May leak schema internals. | Log server-side; return safe error codes/messages. |
| Contact/review public posts | Spam risk. | Add rate limits, honeypot, CAPTCHA or abuse detection. |
| Media upload | File validation exists by extension/type, but rebuild needs strict content scanning and quotas. | Validate MIME, size, dimensions, auth, storage path ownership. |
| Client-side fallback content | Could mask broken backend in production. | Fail visibly in admin/staging; use fallbacks only in demo mode. |

## 15. Feature Inventory

| Feature | Frontend | Backend/API | DB/CMS | Admin | Priority |
| --- | --- | --- | --- | --- | --- |
| Bilingual site | Language provider, RTL, copy helpers. | Public settings/content APIs. | Bilingual fields. | CMS fields. | Must |
| Homepage CMS | Home section components. | `/api/media`, settings APIs. | `banners`, `site_settings`. | Media Studio/settings. | Must |
| Catalog | Product pages/cards/detail. | Products/categories APIs. | `products`, `product_sizes`, `categories`. | Product/category CRUD. | Must |
| Cart | Cart drawer and Zustand store. | `/api/cart`. | `cart_items`. | None. | Must |
| Wishlist | Wishlist drawer/page/store. | `/api/wishlist`. | `wishlist_items`. | None. | Should |
| Checkout | Checkout page. | `/api/checkout`. | `orders`, `order_items`, stock tables. | Order management. | Must |
| Discounts | Promo input. | `/api/discounts/validate`. | `discounts`. | Discount CRUD. | Should |
| WhatsApp order handoff | Success flow opens URL. | Checkout/contact/admin WhatsApp helpers. | Settings. | WhatsApp settings. | Must for current operations |
| Order tracking | `/track` timeline. | `/api/orders/track`. | `orders`, `order_items`. | Status updates. | Must |
| Reviews | Public review page, testimonial section. | `/api/reviews`, `/api/testimonials`. | `testimonials`. | Review moderation. | Should |
| Blog | Blog index/detail. | Blog APIs. | `blog_posts`. | Blog CRUD. | Should |
| Contact form | Contact pages/sections. | `/api/contact`. | `contact_messages`. | Contact inbox. | Should |
| Espresso builder | Builder UI/intelligence. | Customization options, checkout validation. | `coffee_beans`, order item customizations. | Bean CRUD. | Differentiator/Must |
| Flavor builder | Builder UI. | Customization options, checkout validation. | `flavor_bases`, `flavor_options`. | Flavor CRUD. | Differentiator/Must |
| Notifications | Notification center. | `/api/notifications`, admin send. | `notifications`. | Customer notification send. | Should |
| Announcement bar | Sticky top bar. | `/api/settings/announcement`. | `site_settings`. | Settings page. | Should |
| Admin analytics | Admin stats cards. | `/api/admin/stats`. | Orders/products/users. | Analytics page. | Should |
| Media upload | Admin upload controls. | `/api/admin/media/upload`. | Supabase storage + `banners`. | Media Studio/blog. | Must for CMS |

## 16. Rebuild Blueprint

### Must Keep

- Premium bilingual brand system.
- Product catalog with category taxonomy and 250g/500g/1kg pricing.
- Cart, checkout, discounts, stock validation, order tracking.
- WhatsApp-based fulfillment handoff.
- Admin order/product/category/settings/media management.
- Custom espresso and custom flavor builders.
- Public reviews with admin moderation.

### Should Improve

- Replace hardcoded admin email with RBAC.
- Make checkout atomic.
- Normalize custom products as their own order item types.
- Consolidate migrations and remove schema drift.
- Clean Arabic content encoding.
- Replace dead footer routes or build the missing pages.
- Replace static ratings with real review aggregates.
- Standardize API validation and error responses.

### May Defer

- Advanced analytics.
- Customer notification center.
- Blog SEO enhancements.
- Instagram/social feed automation.
- Multi-admin permission granularity beyond owner/admin/staff.

### Recommended Rebuild Architecture

Frontend:

- Next.js or equivalent SSR-capable framework.
- App-wide brand tokens and bilingual typography.
- Route groups: public site, auth, customer dashboard, admin dashboard.
- Server-rendered public pages where possible.
- Client islands for cart, builders, media sliders, forms, and admin editors.

Backend:

- Dedicated domain services for catalog, custom products, checkout, CMS, identity.
- Zod or equivalent validation at every mutation endpoint.
- Transactional checkout service.
- Centralized error handling and logging.
- Rate limiting for public forms and discount validation.

Database:

- Clean schema with ordered migrations only.
- Core tables: users/profiles/roles, categories, products, product variants, stock ledger, carts, wishlist, discounts, orders, order items, order events, CMS sections, media assets, blog posts, reviews, contact messages, notifications.
- Add an inventory ledger for auditability instead of only decrementing current stock.
- Use snapshots on orders for names/prices/customizations at purchase time.

CMS:

- Section schema by type.
- Separate media assets from section placements.
- Preview mode for admin.
- Scheduling and device visibility can stay.

Checkout:

1. Accept client cart payload.
2. Authenticate user.
3. Re-read catalog/custom option rows.
4. Recalculate item prices and stock usage.
5. Validate discount and shipping.
6. In one transaction: create order, create items, deduct/reserve stock, consume discount, append order event.
7. After commit: send WhatsApp/Telegram/email notifications.
8. Return order summary and tracking token.

Admin:

- RBAC roles: owner, manager, content editor, order staff.
- Audit log for order/product/discount/settings changes.
- Clear split between commerce and content modules.
- Data tables should have search, filters, pagination, and safe destructive confirmations.

Migration plan from current project:

1. Export live Supabase schema and data.
2. Fix Arabic text encoding before import.
3. Map `blogs` into `blog_posts`.
4. Map old `carts`/`wishlists` into `cart_items`/`wishlist_items` if still present.
5. Normalize custom order item snapshots.
6. Recreate media bucket and map `banners` records to new CMS sections/media assets.
7. Recalculate product/review aggregates if implemented.
8. Run checkout/order/status regression tests before launch.

QA checklist for rebuild:

- Mobile, tablet, desktop visual checks for every public page.
- Arabic and English copy parity.
- RTL layout for header, products, cart, checkout, tracking, admin.
- Standard product checkout with stock decrement.
- Espresso builder checkout with fractional bean stock decrement.
- Flavor builder checkout with flavor stock decrement.
- Discount min-order, max-use, expiry, and assigned-email tests.
- Admin status transitions and cancellation stock restore.
- Public tracking privacy check.
- Media Studio edit, schedule, mobile image, and section visibility checks.
- Login/signup/password reset/profile update.

## Files Inspected

Key files and directories inspected:

- `package.json`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/products/page.tsx`
- `app/products/[slug]/page.tsx`
- `app/checkout/page.tsx`
- `app/track/page.tsx`
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/reviews/page.tsx`
- `app/dashboard/layout.tsx`
- `app/dashboard/admin/layout.tsx`
- `app/dashboard/admin/*`
- `app/api/**`
- `components/home/*`
- `components/layout/*`
- `components/products/*`
- `components/cart/*`
- `components/notifications/*`
- `lib/config/site.ts`
- `lib/config/public-settings.ts`
- `lib/config/product-system.ts`
- `lib/config/customization.ts`
- `lib/config/espresso-intelligence.ts`
- `lib/config/shipping.ts`
- `lib/context/auth.tsx`
- `lib/context/language.tsx`
- `lib/store/cart.ts`
- `lib/media.ts`
- `lib/order-status.ts`
- `lib/custom-stock.ts`
- `lib/stock.ts`
- `lib/supabase/*`
- `lib/services/*`
- `lib/types.ts`
- `lib/types/database.ts`
- `proxy.ts`
- `supabase/migrations/*`
- `scripts/022_fix_blog_schema.sql`
- `scripts/023_add_testimonials_approval.sql`

No source code files were modified for this audit.
