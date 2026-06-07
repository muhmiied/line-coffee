# LINE COFFEE AUDIT — PART 4

---

# PHASE 15 — FEATURE INVENTORY

| # | Feature Name | Purpose | Frontend Location | Backend Location | DB Dependency | Dashboard Dependency | Business Value | Complexity | Rebuild Priority |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Product Catalog | Browse/buy products | `/products`, `/products/[slug]` | `/api/products`, `/api/products/[slug]` | products, product_sizes, categories | Products, Categories | Critical | Low | P1 |
| 2 | Category Browsing | Filter products by type | `/products?category=` | `/api/categories` | categories | Categories | High | Low | P1 |
| 3 | Product Search | Find products by name | Header search (client-side) | `/api/products?limit=120` | products | None | High | Low | P1 |
| 4 | Cart (Local) | Store items before checkout | CartDrawer, Zustand | None (local) | None | None | Critical | Low | P1 |
| 5 | Cart (Server Sync) | Persist cart for logged-in users | CartDrawer, useCartStore | `/api/cart`, `/api/cart/[id]` | cart_items | None | Medium | Medium | P2 |
| 6 | Wishlist | Save products for later | WishlistDrawer | `/api/wishlist` | wishlist_items | None | Medium | Low | P2 |
| 7 | Auth (Email/Password) | Account creation and login | `/auth/login`, `/auth/signup` | Supabase Auth | auth.users, profiles | None | Critical | Low | P1 |
| 8 | Checkout | Place order | `/checkout` | `/api/checkout` | orders, order_items, products, discounts | Settings | Critical | High | P1 |
| 9 | WhatsApp Order Delivery | Fulfill order via WhatsApp | Checkout success screen | `/api/checkout` (builds URL) | None | Settings (wa_phone) | Critical | Low | P1 |
| 10 | Discount Codes | Apply coupon codes | Checkout page | `/api/discounts/validate`, `/api/checkout` | discounts | Discounts | High | Medium | P1 |
| 11 | Free Shipping Threshold | Auto-apply free shipping | Cart, Checkout | `/api/settings/free-shipping`, Checkout API | site_settings | Settings | High | Low | P1 |
| 12 | Custom Espresso Builder | Build custom espresso blend | `/products?category=make-your-espresso` | `/api/checkout` (validates) | coffee_beans | Coffee Beans | High | Very High | P1 |
| 13 | AI Espresso Intelligence | Recommend bean ratios | Premium Configurator component | Client-side only (lib/config/espresso-intelligence.ts) | None | None | High | Very High | P2 |
| 14 | Custom Flavor Builder | Build custom flavored coffee | `/products?category=make-your-flavor` | `/api/checkout` (validates) | flavor_bases, flavor_options | Flavors | High | High | P1 |
| 15 | Bilingual Support (AR/EN) | Arabic RTL + English LTR | All pages | All API responses (bilingual fields) | All tables (bilingual columns) | None | Critical | Medium | P1 |
| 16 | Language Switcher | Toggle between AR and EN | Header | None | None | None | High | Low | P1 |
| 17 | Announcement Bar | Promotional messages at top | StickyTopBar | `/api/settings/announcement` | site_settings | Settings | Medium | Medium | P2 |
| 18 | Homepage CMS | Reorder/hide homepage sections | Homepage (app/page.tsx) | `/api/settings/public`, `/api/admin/settings/public` | site_settings | Settings | High | Medium | P1 |
| 19 | Media Studio | Upload/manage section images | `/dashboard/admin/banners` | `/api/admin/media-studio`, `/api/admin/media/upload` | site_media, Supabase Storage | Banners | High | High | P1 |
| 20 | Visual Effects Presets | Image filter system | Media Studio | Client-side CSS | site_media | Banners | Medium | Medium | P2 |
| 21 | Blog CMS | Create/manage blog posts | `/blog`, `/blog/[slug]` | `/api/admin/blog`, `/api/blog/public` | blog_posts | Blog | Medium | Low | P2 |
| 22 | Testimonials | Customer reviews display | Homepage, `/reviews` | `/api/testimonials`, `/api/admin/reviews` | testimonials | Reviews | Medium | Low | P2 |
| 23 | Order Tracking | Track order by number | `/track` | `/api/orders/track` | orders | None | High | Low | P1 |
| 24 | User Dashboard | Account management | `/dashboard` | `/api/profile`, `/api/orders` | profiles, orders | None | High | Medium | P1 |
| 25 | Admin Dashboard | Business overview | `/dashboard/admin` | `/api/admin/stats` | All tables | All | Critical | High | P1 |
| 26 | Admin Orders | Manage all orders | `/dashboard/admin/orders` | `/api/admin/orders`, `/api/admin/orders/[id]` | orders, order_items | Orders | Critical | High | P1 |
| 27 | Admin Products CRUD | Manage product catalog | `/dashboard/admin/products` | `/api/admin/products` | products, product_sizes | Products | Critical | Medium | P1 |
| 28 | Admin Categories CRUD | Manage categories | `/dashboard/admin/categories` | `/api/admin/categories` | categories | Categories | High | Low | P1 |
| 29 | Admin Discounts | Create/manage discount codes | `/dashboard/admin/discounts` | `/api/admin/discounts` | discounts | Discounts | High | Medium | P1 |
| 30 | Admin Settings | Configure all site settings | `/dashboard/admin/settings` | `/api/admin/settings/public`, `/api/settings/announcement` | site_settings | Settings | High | Medium | P1 |
| 31 | Admin Coffee Beans | Manage espresso builder inventory | `/dashboard/admin/coffee-beans` | `/api/admin/coffee-beans` | coffee_beans | Coffee Beans | High | Medium | P1 |
| 32 | Admin Flavors | Manage flavor builder inventory | `/dashboard/admin/flavors` | `/api/admin/flavors` | flavor_bases, flavor_options | Flavors | High | Medium | P1 |
| 33 | Admin Customers | View customer list | `/dashboard/admin/customers` | `/api/admin/customers` | profiles, orders | Customers | Medium | Low | P2 |
| 34 | Admin Blog | Manage blog content | `/dashboard/admin/blog` | `/api/admin/blog` | blog_posts | Blog | Medium | Low | P2 |
| 35 | Admin Reviews | Moderate testimonials | `/dashboard/admin/reviews` | `/api/admin/reviews` | testimonials | Reviews | Medium | Low | P2 |
| 36 | Admin Contact Messages | View contact form submissions | `/dashboard/admin/contact-messages` | `/api/admin/contact-messages` | contact_messages | Contact | Medium | Low | P2 |
| 37 | Telegram Notifications | Order alerts to admin Telegram | Server-side only | `/api/checkout` | None | None | Medium | Low | P3 |
| 38 | WhatsApp Notifications (CallMeBot) | Proactive WhatsApp alerts | Admin Settings | `/api/admin/whatsapp/send`, `/api/admin/settings/whatsapp` | site_settings | Settings | Medium | Low | P3 |
| 39 | SEO (Sitemap + Robots) | Search engine indexing | `app/sitemap.ts`, `app/robots.ts` | None | products, categories, blog | None | High | Low | P1 |
| 40 | Scroll Progress Bar | Visual reading progress indicator | All pages | None | None | None | Low | Low | P3 |
| 41 | WhatsApp Floating Button | Quick contact access | All pages | `/api/settings/whatsapp` | site_settings | Settings | Medium | Low | P2 |
| 42 | Discount Banner | Bottom-of-screen discount teaser | All pages | `/api/settings/public` | site_settings | Settings | Medium | Low | P2 |
| 43 | Notification Center | In-app notifications for users | Header | `/api/notifications` | notifications (inferred) | None | Low | Medium | P3 |
| 44 | About Page (CMS) | Brand story, values | `/about` | `/api/admin/media-studio` | site_media | Banners | Medium | Low | P2 |
| 45 | Contact Form | Lead capture | `/contact`, homepage contact | `/api/contact` | contact_messages | None | Medium | Low | P1 |
| 46 | Privacy Policy (CMS) | Legal page | `/privacy-policy` | `/api/settings/public` | site_settings | Settings | Medium | Low | P2 |
| 47 | Terms of Use (CMS) | Legal page | `/terms-of-use` | `/api/settings/public` | site_settings | Settings | Medium | Low | P2 |
| 48 | Order Cancellation | Admin can cancel orders with stock restore | Admin Orders page | `/api/admin/orders/[id]` (DELETE) | orders, products, coffee_beans | Orders | High | High | P1 |
| 49 | Vercel Analytics | Page view tracking | `app/layout.tsx` (production only) | None | None | None | Low | Low | P3 |
| 50 | Dashboard Sales Chart | 30-day revenue visualization | Admin Overview | `/api/admin/stats` | orders | Dashboard | Medium | Medium | P2 |

---

# PHASE 16 — REBUILD SPECIFICATION

## LINE COFFEE REBUILD BLUEPRINT

---

### What MUST Remain Identical

1. **Brand colors** — #522500 (primary brown), #FFDCC2 (primary beige), gold palette (#B6885E, #D6A373, #c8941a)
2. **Typography** — Playfair Display for English headings, Cairo for Arabic
3. **Bilingual Arabic/English support** — RTL Arabic switching, bilingual DB fields, `t(en, ar)` pattern
4. **WhatsApp fulfillment flow** — Egyptian market depends on WhatsApp; the pre-filled Arabic message format is business-critical
5. **Three weight variants** — 250g / 500g / 1kg with individual pricing
6. **Custom Espresso Builder** — bean selection, ratio setting, price formula, AI recommendation profiles
7. **Custom Flavor Builder** — base + additions structure, pricing formula, base-compatibility filtering
8. **Order number format** — `INITIALS-PHONE3-SEQUENCE` (e.g., MS-171-0042) — customers may quote these
9. **Server-side price revalidation** — prices must NEVER be trusted from client; always recomputed from DB
10. **Optimistic stock locking** — concurrent checkout protection via conditional UPDATE
11. **Order status flow** — pending → confirmed → preparing → shipped → delivered → cancelled
12. **Homepage section CMS** — admins must be able to reorder and hide sections without code changes
13. **Admin authentication** — single admin account (migrate to role system but preserve single-admin UX)
14. **Payment methods** — cod / electronic_wallet / instapay (no card gateway)
15. **Free shipping logic** — threshold-based, configurable, date-windowed

---

### What SHOULD Remain Identical

1. Dark premium aesthetic — near-black backgrounds, gold accents, warm tones
2. Product card structure — image, bilingual name, size/price preview, add-to-cart
3. Cart drawer pattern — slide-in from side, item list, quantity controls, checkout CTA
4. Wishlist drawer pattern
5. Glass morphism header with transparency-on-hero behavior
6. Order tracking by order number (public, no auth required)
7. Announcement bar with multiple rule types
8. Media Studio concept — per-section image management with content overlays
9. Visual effects system — CSS filter presets on images
10. Discount code system with assigned_emails restriction
11. Testimonials system with admin approval flow
12. Blog with bilingual content
13. Contact form submission to DB
14. Telegram notification on new order
15. Admin overview dashboard with sales chart, recent orders, top products

---

### What MAY Be Improved

1. Search — replace client-side loading of all products with server-side search (Supabase full-text or Algolia)
2. Checkout — add guest checkout option
3. Email notifications — add transactional email for order confirmation (Resend, SendGrid, Mailgun)
4. Blog editor — add rich text editor (Tiptap, Lexical) to replace plain text
5. Image upload — replace URL-based uploads with better UX (drag-drop with preview)
6. Analytics — replace/supplement Vercel Analytics with more detailed admin analytics
7. WhatsApp notifications — replace CallMeBot with official WhatsApp Business API
8. Product import/export — CSV upload for bulk product management

---

### What SHOULD Be Redesigned

1. **Admin authentication** — replace single hardcoded email with proper role column in profiles table
2. **Cart schema** — consolidate to single clean schema; remove `client_item_id` / `unit_price` dual-purpose confusion
3. **Type definitions** — merge `lib/types.ts` and `lib/types/database.ts` into single source of truth
4. **Currency** — fix `DEFAULT 'SAR'` on orders table to `DEFAULT 'EGP'`
5. **Discount field deduplication** — remove duplicate `discount` and `discount_amount` columns; pick one
6. **SQL migrations** — consolidate overlapping migration files into single canonical schema
7. **Order creation flow** — move WhatsApp message building to a separate service module for testability
8. **Error handling** — standardize error response format across all API routes

---

### Technical Debt NOT to Carry Forward

1. Hardcoded `ADMIN_EMAIL` in source code
2. Duplicate type definitions across two files
3. `DEFAULT 'SAR'` currency (wrong market default)
4. Duplicate `discount`/`discount_amount` columns
5. Multiple overlapping SQL migration files
6. `cart_items.unit_price` stored from client (creates false sense of record)
7. CallMeBot for WhatsApp notifications (unofficial, unreliable)
8. Client-side search loading all products (not scalable)
9. No email delivery on order creation (purely WhatsApp)

---

### Recommended Architecture for Clean Rebuild

#### Option A: Keep Next.js Stack (Recommended for Speed)

```
Frontend:    Next.js 14+ (App Router, React Server Components)
Styling:     Tailwind CSS 4 + shadcn/ui components
Animation:   Framer Motion
State:       Zustand (cart, wishlist) + React Context (auth, language)
Auth:        Supabase Auth
Database:    Supabase PostgreSQL (managed Postgres with RLS)
Storage:     Supabase Storage (images)
Hosting:     Vercel
Email:       Resend (transactional email)
Search:      Supabase full-text search or Algolia
Analytics:   Vercel Analytics + PostHog
WhatsApp:    WhatsApp Business API (official)
Telegram:    Keep existing Telegram bot for admin alerts
```

#### Option B: Alternative Tech Stack

```
Frontend:    React + Vite (SPA) or Remix
Backend:     Node.js (Fastify or Hono) — separate from frontend
Database:    PostgreSQL (Supabase or self-hosted)
ORM:         Drizzle ORM or Prisma
Auth:        Better Auth or Clerk (with role support)
Storage:     Cloudinary or AWS S3
Cache:       Redis (for settings, cart sessions)
CDN:         Cloudflare
Email:       Resend
```

---

### Recommended Database Design (Clean Rebuild)

#### Core Tables

```sql
-- Users (managed by auth provider)
profiles (id, first_name, last_name, phone, whatsapp, avatar_url, preferred_language, address, city, location_link, notes, role, created_at, updated_at)
-- role: ENUM('customer', 'admin', 'staff')

addresses (id, user_id, label, street_address, city, state, postal_code, country, is_default, created_at)

-- Products
categories (id, slug, name_en, name_ar, description_en, description_ar, image_url, sort_order, is_visible)
products (id, slug, name_en, name_ar, description_en, description_ar, short_description_en, short_description_ar, category_id, images TEXT[], origin, roast_level, flavor_notes TEXT[], is_featured, is_best_seller, is_new, is_visible, stock_quantity, low_stock_threshold, is_manually_out_of_stock)
product_sizes (id, product_id, size ENUM('250g','500g','1kg'), price DECIMAL, compare_at_price DECIMAL, sku, is_available)

-- Custom Builders
coffee_beans (id, slug, name_en, name_ar, origin, family ENUM('arabica','robusta','other'), price_per_kg DECIMAL, description_en, description_ar, is_active, stock_kg DECIMAL, low_stock_kg DECIMAL, is_manually_oos, sort_order, bitterness, body, acidity, crema, strength)
flavor_bases (id, slug, name_en, name_ar, price_per_kg DECIMAL, description_en, description_ar, is_active, sort_order)
flavor_options (id, base_id, slug, name_en, name_ar, price_delta_per_kg DECIMAL, type ENUM('standard','chunks'), is_active, stock_kg DECIMAL, low_stock_kg DECIMAL, is_manually_oos, sort_order)

-- Commerce
discounts (id, code TEXT UNIQUE, type ENUM('percentage','fixed'), value DECIMAL, min_order DECIMAL DEFAULT 0, max_uses INTEGER, uses INTEGER DEFAULT 0, expires_at TIMESTAMPTZ, is_active, assigned_emails TEXT[])

cart_items (id, user_id, client_item_id TEXT UNIQUE, product_id UUID nullable, name_en, name_ar, image, size, quantity, unit_price DECIMAL, customizations JSONB, created_at, updated_at)

wishlist_items (id, user_id, product_id, created_at, UNIQUE(user_id, product_id))

orders (id, order_number TEXT UNIQUE, user_id nullable, customer_name, customer_email, customer_phone, customer_whatsapp, address, city, location_link, subtotal DECIMAL, shipping_cost DECIMAL, tax DECIMAL DEFAULT 0, discount_code, discount_amount DECIMAL DEFAULT 0, total DECIMAL, currency TEXT DEFAULT 'EGP', shipping_address JSONB, payment_method ENUM('cod','electronic_wallet','instapay'), payment_status ENUM('pending','paid','failed','refunded'), status ENUM('pending','confirmed','preparing','shipped','delivered','cancelled'), notes, cancelled_at, cancellation_initiated_by, cancellation_reason, stock_restored_at, created_at, updated_at)

order_items (id, order_id, product_id nullable, product_name, product_image, size, quantity, unit_price DECIMAL, total_price DECIMAL, customizations JSONB, created_at)

-- CMS
site_settings (key TEXT UNIQUE, value JSONB, updated_at)
site_media (id, section_key, slide_key, title_en, title_ar, subtitle_en, subtitle_ar, body_en, body_ar, image_url, mobile_image_url, link_url, button_text_en, button_text_ar, button_link, overlay_opacity, object_position, content JSONB, layout JSONB, sort_order, is_active, starts_at, ends_at, created_at, updated_at)

-- Content
blog_posts (id, slug TEXT UNIQUE, title_en, title_ar, content_en TEXT, content_ar TEXT, excerpt_en, excerpt_ar, cover_image, author, is_published, published_at, seo_title, seo_description, created_at, updated_at)
testimonials (id, customer_name, customer_avatar, content_en, content_ar, rating INTEGER, is_featured, is_visible, is_approved, created_at)
contact_messages (id, name, email, phone, message, is_read, created_at)
```

---

### Recommended Dashboard Architecture

1. **Role-based access** — `profiles.role` determines access, not hardcoded email
2. **Route middleware** — check role in Next.js middleware or layout component
3. **Audit log** — log all admin mutations (product changes, order status changes) to `admin_audit_log` table
4. **Real-time order alerts** — Supabase Realtime subscription to new orders instead of 60-second polling
5. **Admin layout** — keep 215px fixed sidebar + top bar pattern (it works well)
6. **Mobile admin** — horizontal scrolling tab strip (current approach is adequate)

---

### Recommended CMS Architecture

1. **Keep site_settings key-value store** — flexible and admin-friendly
2. **Add content versioning** — `site_settings_history` table for rollback capability
3. **Rich text for blog** — store as JSON (Tiptap/ProseMirror format) not plain text
4. **Image management** — centralize all media into single `site_media` table with clear section mapping
5. **Section content schema** — keep `SectionBuilderContent` JSON structure (it is well-designed)
6. **Preview mode** — allow admin to preview site settings changes before publishing

---

### Recommended Frontend Architecture

```
app/
  (marketing)/          # Public pages (homepage, about, blog, etc.)
  (shop)/               # Commerce pages (products, checkout, track)
  (account)/            # Auth + user dashboard
  (admin)/              # Admin dashboard (role-protected)
  api/                  # Route handlers

components/
  ui/                   # Design system (shadcn/Radix)
  layout/               # Header, Footer, drawers
  home/                 # Homepage sections
  products/             # Product components
  builders/             # Espresso + Flavor builders
  admin/                # Admin-specific components

lib/
  config/               # Site config, shipping, customization
  context/              # React contexts
  hooks/                # Custom hooks
  stores/               # Zustand stores
  services/             # API client functions
  types/                # TypeScript types (single source)
  utils/                # Utilities
```

---

### Recommended Backend Architecture

Keep Next.js API routes for simplicity, OR extract to separate Fastify/Hono service if:
- Team wants separate deployments
- Need more complex middleware (rate limiting, request queuing)
- Plan to build mobile app that needs same API

If separate backend:
```
POST /api/v1/checkout         # Order creation with full validation
GET  /api/v1/products         # With server-side search
GET  /api/v1/categories
GET  /api/v1/orders/:number   # Public tracking
PATCH /api/v1/admin/orders/:id # Status management
...
```

Key services to extract into modules:
- `PricingService` — product pricing, discount calculation, shipping
- `InventoryService` — stock checking, deduction, restoration
- `OrderService` — order creation, number generation, status management
- `NotificationService` — WhatsApp URL, Telegram, email
- `CustomBuilderService` — espresso/flavor validation and pricing

---

## Final Notes for Rebuild Agent

### Critical Implementation Details

1. The `buildWhatsAppMessage()` function outputs Arabic text — this is what the customer sends to the business. The message format is business-critical and should be preserved exactly.

2. The espresso builder pricing formula: `roundCleanPrice(weightedAvgCostPerKg × sizeKg)` where `roundCleanPrice = Math.round(value / 5) * 5`. This rounding-to-5 is important for pricing that looks clean in EGP.

3. The flavor builder pricing: `roundCleanPrice((basePrice + sum(flavors)) × sizeKg)`.

4. Custom item stock is tracked in **fractional kg**, not units. 250g = 0.25 kg consumed from bean/flavor inventory.

5. Order number format: `[INITIALS]-[LAST3DIGITS_OF_PHONE]-[SEQUENCE]`. Initials taken from first+last name (first character of each). Sequence = total order count + 1, zero-padded to 4 digits.

6. The site operates in Egypt. Currency is EGP. Phone format: +20XXXXXXXXXX.

7. Language is stored in `localStorage` as key `line-coffee-language` with values `'ar'` or `'en'`. Direction is set on `<html>` element immediately on page load via inline script (before hydration).

8. The admin dashboard polls for pending orders every 60 seconds via `setInterval` — replace with Supabase Realtime in the rebuild.

9. All public settings have hardcoded fallbacks — the site works even if the database is completely empty, falling back to the code-level defaults in `lib/config/site.ts`.

10. The espresso intelligence scoring system uses text pattern matching (regex against bean names and descriptions) to derive sensory metrics when explicit metrics are not stored. This is a fallback system — ideally explicit metrics should be entered for all beans.
