# LINE COFFEE — COMPLETE REVERSE-ENGINEERING & REBUILD AUDIT

**Audit Date:** 2026-06-07  
**Source Branch:** main  
**Purpose:** Complete documentation sufficient to rebuild the entire platform from scratch in any tech stack.

---

# PHASE 1 — EXECUTIVE SUMMARY

## What This Platform Is

LINE COFFEE is a bilingual (Arabic / English) premium coffee e-commerce platform targeting the Egyptian market. It sells packaged coffee beans and blends online, accepts orders exclusively via WhatsApp-confirmed checkout (no payment gateway integration), and includes two interactive product builders that let customers compose custom espresso blends and custom flavored coffees.

## Business Purpose

- Sell directly to end consumers online, bypassing wholesale-only distribution
- Launched 2015 as a B2B cafe supply business under founder Sayed Kamal (28 years at Bon Al Orouba) — this platform is the direct-to-consumer evolution
- Revenue model: product sales (EGP), collected on delivery or electronic wallet (no card gateway)
- WhatsApp is the actual fulfillment channel — the website creates an order and generates a pre-filled WhatsApp message that the customer sends to the business

## Target Users

| Segment | Description |
|---|---|
| Primary | Egyptian Arabic-speaking coffee drinkers, 25–45, smartphone users |
| Secondary | English-speaking expats and educated bilingual consumers in Egypt |
| B2B interest | Cafes and coffee shops (mentioned in brand story, not a separate B2B flow) |

## Main Customer Journey

1. Lands on homepage → scrolls hero, categories, best sellers
2. Clicks category or product card → product detail page
3. Selects weight (250g / 500g / 1kg) → adds to cart
4. OR navigates to custom builder → configures blend/flavor → adds to cart
5. Opens cart drawer → reviews items
6. Clicks "Checkout" → must be logged in (redirected to login if not)
7. Fills shipping form (autofilled from profile) → selects payment method
8. Submits → server validates prices and stock → order created → WhatsApp URL opens
9. Customer sends pre-filled WhatsApp message to the business to confirm

## Main Admin Journey

1. Logs in with admin email → redirected to `/dashboard/admin`
2. Views overview: revenue, active orders, sales chart, top products
3. Checks notification bell for pending orders
4. Opens Orders → reviews pending → updates status
5. Manages Products / Categories / Coffee Beans / Flavors as needed
6. Manages Discounts, Blog, Reviews, Contact Messages
7. Opens Settings → updates announcement bar, WhatsApp number, site info, homepage section order
8. Opens Media (Banners) → updates section images via Media Studio

## Core Features

- Bilingual site (Arabic RTL / English LTR) with language persistence
- Product catalog with categories, filtering, and search
- Three size variants per product (250g / 500g / 1kg)
- Custom Espresso Blend Builder (AI-assisted ratio suggestions)
- Custom Flavor Coffee Builder (base + flavor additions)
- Cart (local Zustand store + server sync for logged-in users)
- Wishlist (local Zustand + server sync)
- Checkout with discount codes and shipping threshold logic
- WhatsApp order delivery (pre-filled message to business number)
- Telegram order notification (server-side, optional via env vars)
- User auth (Supabase Auth — email/password)
- User dashboard: profile, orders, addresses, wishlist
- Admin dashboard: full CRUD for products, categories, orders, blog, discounts, reviews, customers, contact messages
- CMS: homepage section order/visibility, announcement bar rules, site settings
- Media Studio: image upload with visual effects presets, per-section image management
- Order tracking by order number (public)
- SEO: sitemap.ts, robots.ts, per-page metadata
- Vercel Analytics integration

## Unique Features

1. **AI Espresso Intelligence** — `lib/config/espresso-intelligence.ts` scores 28+ coffee bean origins against 5 flavour profiles (Balanced, Crema, Chocolate-Nutty, Bright, Strong) and recommends optimal blends with weighted ratios
2. **WhatsApp-first fulfillment** — no payment gateway; the website creates an order record then generates a wa.me URL with the full order as a pre-formatted Arabic message
3. **Homepage CMS** — admin can reorder and show/hide any of 9 homepage sections without touching code
4. **Visual Effects Presets** — Media Studio applies CSS filter chains (blur, brightness, contrast, sepia, vignette) to uploaded images with 7 named presets (Luxury Dark, Warm Coffee, Golden Glow, etc.)
5. **Announcement Rule Engine** — admin creates typed announcement rules (text, free_shipping, discount, product_promo, custom_link) with date windows, animations, and per-rule active toggles
6. **Custom item stock tracking** — espresso beans and flavor bases have their own inventory tracked in kg; checkout deducts fractional kg via a Supabase RPC

## Strengths

- Beautiful, premium dark-gold aesthetic consistent throughout
- Full Arabic RTL support with instant language switching
- WhatsApp fulfillment is frictionless for the Egyptian market
- Custom builders are genuinely sophisticated (AI ratio logic, pricing formulas)
- Admin is feature-rich for a small brand
- Supabase RLS enforces row-level security correctly
- Server-side pricing revalidation in checkout prevents client-side price manipulation

## Weaknesses

- No payment gateway — requires manual collection
- Admin authentication is a single hardcoded email (no role table)
- No guest checkout — user must create account to complete order
- Blog CMS is minimal (no rich text editor visible in codebase)
- Search is client-side only (loads all products, then filters locally)
- No automated email notifications to customers
- Cart items table has a loose schema (client_item_id, nullable product_id) from iterative migration history
- Multiple overlapping SQL migration files suggest schema evolved without clean consolidation

## Technical Debt

- Two sets of type definitions (`lib/types.ts` and `lib/types/database.ts`) with overlapping but inconsistent interfaces
- Multiple SQL migration files that partially overlap — the canonical schema is in `001_create_tables.sql` but later scripts alter it without being consolidated
- `ADMIN_EMAIL` is a hardcoded string constant — no DB-level admin role system
- Cart `client_item_id` column exists for custom items but the relationship between cart and order items is partially denormalized
- `discount` field on orders exists twice (as `discount` and `discount_amount`)
- WhatsApp API integration uses CallMeBot (unofficial, unreliable) for proactive notifications

---

# PHASE 2 — BRAND IDENTITY AUDIT

## Brand Name

**LINE COFFEE** (English) / **لاين كوفي** (Arabic)

## Brand Positioning

"Premium coffee crafted for warm daily rituals." — boutique-quality coffee sold directly to Egyptian consumers online, with a family heritage story rooted in 28 years of supply expertise.

## Brand Personality

| Trait | Expression |
|---|---|
| Premium | Dark backgrounds, gold accents, Playfair Display serif headings |
| Warm | Beige/brown palette, "warm daily rituals" copy, coffee photography |
| Authentic | Family story, founder named, supply roots narrative |
| Minimal | Spacious layouts, no clutter, breathable sections |
| Elegant | Smooth Framer Motion animations, glass morphism header |

## Visual Style

Dark-luxury coffee aesthetic. Nearly black backgrounds (#070504, #0B0806) with warm gold (#B6885E, #D6A373, #c8941a) accents and cream/beige (#FFDCC2, #F5E6D8) text. Not a light/white e-commerce site — it is deliberately dark and cinematic.

## Design Language

- Glass morphism for header (`nav-glass` CSS class with backdrop blur)
- Radial gradient overlays on section images
- Thin gold hairlines as dividers (`rgba(182,136,94,0.25)`)
- Rounded cards (rounded-2xl) with subtle border and shadow
- Scroll progress indicator (thin gold line at page top)
- Hover states: subtle scale, glow shadow, color shift to gold

## Color Palette

| Role | Hex | Usage |
|---|---|---|
| Primary Brown | `#522500` | Brand primary, deep backgrounds |
| Primary Beige | `#FFDCC2` | Light accent, hero text highlight |
| Gold Mid | `#B6885E` | Borders, icons, hover states |
| Gold Light | `#D6A373` | Active nav, badges, headings |
| Gold Bright | `#c8941a` | Admin dashboard, CTAs, charts |
| Near-Black | `#070504` | Footer background |
| Dark | `#0B0806` | Page background |
| Dark Card | `#120D09` | Card backgrounds |
| Admin Dark | `#0f0900` | Admin layout background |
| White | `#FFFFFF` | Text on dark |
| Theme Beige | `rgba(245,230,216,x)` | Body text on dark |

## Typography

| Font | Role | Source | Weights |
|---|---|---|---|
| Playfair Display | English headings, brand name | Local TTF files in `/public/fonts/` | 400, 400i, 700, 700i, 900, 900i |
| Cairo | Arabic body and headings | Google Fonts | 300–900 |
| System sans | Body fallback | Browser default | — |

**CSS variables:** `--font-playfair`, `--font-cairo`

**Typography rules:**
- Heading hierarchy: h1 large/hero, h2 section titles, h3 card titles
- Spacious line-height for Arabic (Cairo renders wider)
- No crowded text, no oversized paragraphs
- Tracking-wide (letter-spacing) on section eyebrow labels

## Iconography

Lucide React icons throughout. Icons are monochrome, small (h-4 w-4 to h-5 w-5), colored in brand gold tones on dark backgrounds.

## Animation Style

Framer Motion for all animations:
- `initial: { opacity: 0, y: 16 }` → `animate: { opacity: 1, y: 0 }` for section reveals
- `initial: { opacity: 0, x: ±16 }` for logo and nav
- `AnimatePresence` for mobile menu slide-in (spring, damping 25, stiffness 200)
- Hover: `whileHover={{ scale: 1.02 }}` on product cards
- Transition durations: 200–400ms, ease-in-out
- NO bounce, NO aggressive spring, NO flash

## UI Style

- Drawer pattern (vaul) for cart and wishlist
- Sheet/Dialog (Radix) for modals
- Sonner toasts for feedback messages (position: top-center, richColors)
- Radix UI primitives for all interactive elements
- Tailwind utility classes only (no CSS modules, no styled-components)

## Mobile Design Philosophy

- Primary design target: mobile first
- Header collapses to hamburger menu that slides in from the edge matching the reading direction (RTL: left, LTR: right)
- Cart and wishlist as full-height drawers
- Touch-friendly tap targets
- Safe area insets respected (env(safe-area-inset-bottom))
- Stack layouts on mobile, grid on desktop

## Desktop Design Philosophy

- Max container width with centered content
- Sticky transparent-to-glass header on scroll
- Horizontal navigation with dropdown menus
- Side-by-side product grid (3–4 columns)
- Admin layout: fixed 215px sidebar + content area

---

# PHASE 3 — WEBSITE STRUCTURE AUDIT

## Complete Sitemap

```
/ (Homepage)
/products (Products listing)
/products/[slug] (Product detail)
/about (About Us)
/contact (Contact)
/blog (Blog listing)
/blog/[slug] (Blog post)
/checkout (Checkout — auth required)
/track (Order tracking — public)
/reviews (Customer reviews — public)
/privacy-policy (Legal)
/terms-of-use (Legal)
/auth/login
/auth/signup
/auth/forgot-password
/auth/reset-password
/auth/error
/auth/callback (Supabase OAuth callback)
/dashboard (User account — auth required)
/dashboard/profile
/dashboard/orders
/dashboard/addresses
/dashboard/wishlist
/dashboard/settings
/dashboard/admin (Admin only)
/dashboard/admin/orders
/dashboard/admin/products
/dashboard/admin/categories
/dashboard/admin/coffee-beans
/dashboard/admin/flavors
/dashboard/admin/customers
/dashboard/admin/contact-messages
/dashboard/admin/reviews
/dashboard/admin/discounts
/dashboard/admin/blog
/dashboard/admin/banners
/dashboard/admin/settings
/dashboard/admin/analytics
```

## Homepage (`/`)

### Section 1: Hero

- **Position:** First (top)
- **Purpose:** First impression, brand statement, CTA to shop
- **Desktop:** Full-viewport-height image with centered/left text overlay, eyebrow label, large serif title, subtitle, primary CTA button, stats row (15+ Origins, 72h Fresh Roast, 100% Arabica)
- **Mobile:** Same but text repositioned, button full-width
- **Content:** Managed via Media Studio (`section_key: 'hero'`, supports slides)
- **Default copy:** "Coffee Crafted for Quiet Luxury" / "قهوة مصممة لرفاهية هادئة"
- **CTA:** "Shop Coffee" → `/products`
- **Data source:** `site_media` table, section_key = 'hero'; falls back to Unsplash URL
- **Visibility control:** Admin Settings → Homepage Layout toggle

### Section 2: Categories

- **Position:** Second
- **Purpose:** Navigate directly to product category
- **Desktop:** Horizontal scrollable card row or grid, each card = category image + name
- **Mobile:** Horizontal scroll
- **Content:** Category images from `categories` table; category names bilingual
- **CTA:** Each card links to `/products?category=[slug]`
- **Data source:** `GET /api/categories`
- **Visibility control:** Admin Settings toggle

### Section 3: Features Pills

- **Position:** Third
- **Purpose:** Trust signals / value propositions
- **Desktop:** 3 horizontal pill/card row
- **Mobile:** Stack or scroll
- **Content:** 3 feature cards (Premium Beans, Freshly Packed, Made With Care) — editable via Media Studio
- **Data source:** `site_media` section_key = 'home_features'
- **Visibility control:** Admin Settings toggle

### Section 4: Story

- **Position:** Fourth
- **Purpose:** Brand narrative, founder story
- **Desktop:** Split layout — image left, text right (or reversed in RTL)
- **Mobile:** Stacked — image on top, text below
- **Content:** Eyebrow, title, body paragraph, feature list, stats, CTA button
- **Default:** "A Family Coffee Legacy, Now Online" — Sayed Kamal story since 2015
- **CTA:** "Learn More About Us" → `/about`
- **Data source:** `site_media` section_key = 'about_lower'
- **Visibility control:** Admin Settings toggle

### Section 5: Best Sellers

- **Position:** Fifth
- **Purpose:** Surface popular products, drive purchase
- **Desktop:** Section heading + horizontal product card grid
- **Mobile:** Scrollable or wrapped cards
- **Content:** Products with `is_best_seller = true`
- **CTA:** "View All Best Sellers" → `/products?filter=best-seller`
- **Data source:** `GET /api/products?best_seller=true`
- **Visibility control:** Admin Settings toggle

### Section 6: Blog

- **Position:** Sixth
- **Purpose:** Content marketing, SEO, brand depth
- **Desktop:** 3-column blog card grid with thumbnail, date, title
- **Mobile:** Stacked cards
- **Content:** Latest published blog posts
- **CTA:** "Read More" → `/blog`
- **Data source:** `GET /api/blog/public`
- **Visibility control:** Admin Settings toggle

### Section 7: Testimonials

- **Position:** Seventh
- **Purpose:** Social proof
- **Desktop:** Card carousel or grid of review cards with stars and customer name
- **Mobile:** Swipeable carousel
- **Content:** `testimonials` table, `is_visible = true`, `is_featured = true`
- **Data source:** `GET /api/testimonials`
- **Visibility control:** Admin Settings toggle

### Section 8: Instagram

- **Position:** Eighth
- **Purpose:** Social media showcase, follow prompt
- **Desktop:** Grid of 4–6 images
- **Mobile:** Grid or scroll
- **Content:** Images uploaded via Media Studio, section_key = 'home_instagram'; links to Instagram profile
- **CTA:** "Follow Us" → Instagram URL from settings
- **Data source:** `site_media` table
- **Visibility control:** Admin Settings toggle

### Section 9: Contact

- **Position:** Ninth (last)
- **Purpose:** Lead capture, customer contact
- **Desktop:** Split layout — text/form left, image right
- **Mobile:** Stacked
- **Content:** Heading, subtitle, contact form (name, email, phone, message), phone/email display
- **CTA:** Form submit → `POST /api/contact`
- **Data source:** Public settings (phone, email)
- **Visibility control:** Admin Settings toggle

---

## Products Page (`/products`)

- **Purpose:** Browse and filter all products
- **Hero banner:** Image from `site_media` section_key = 'products_banner'
- **Filters:** By category (URL param `?category=[slug]`), by flag (`?filter=best-seller`, `?filter=new`, `?filter=featured`)
- **Grid:** Responsive product cards
- **Data source:** `GET /api/products` with filter params

## Product Detail (`/products/[slug]`)

- **Purpose:** View full product info, select size, add to cart
- **Sections:** Image gallery, product name (bilingual), category badge, origin, roast level, flavor notes, size selector with prices, add-to-cart button, product description, related products
- **Data source:** `GET /api/products/[slug]`

## About Page (`/about`)

- **Purpose:** Brand story, values, team narrative
- **Sections:** Hero banner (`about_top`), story block (`about_story`), values cards (`about_values`), optional stats
- **Data source:** `site_media` table for images; static content from Media Studio

## Contact Page (`/contact`)

- **Purpose:** Direct contact with the business
- **Sections:** Hero banner, contact form, phone/email/address from public settings
- **Data source:** `GET /api/settings/public`

## Blog Listing (`/blog`)

- **Purpose:** Article listing
- **Sections:** Hero banner (`blog_page`), article grid with thumbnail + title + date + excerpt
- **Data source:** `GET /api/blog/public`

## Blog Post (`/blog/[slug]`)

- **Purpose:** Single article
- **Sections:** Title, date, cover image, body content
- **Data source:** `GET /api/blog/[slug]`

## Track Order (`/track`)

- **Purpose:** Customers track order status by order number
- **Data source:** `GET /api/orders/track?order_number=[number]` — public, no auth required

## Reviews (`/reviews`)

- **Purpose:** Display and submit product reviews
- **Data source:** `GET /api/reviews`

## Legal Pages

- `/privacy-policy` — content from `site_settings` key `legal_privacy_policy_content`
- `/terms-of-use` — content from `site_settings` key `legal_terms_of_use_content`

---

# PHASE 4 — UI/UX AUDIT

## Homepage Journey

1. User arrives → sees full-viewport hero with dark overlay, bold serif headline, "Shop Coffee" button
2. Scrolls → categories strip invites navigation by product type
3. Scrolls → 3 trust pills reinforce brand quality
4. Scrolls → story section creates brand connection
5. Scrolls → best sellers section = primary conversion zone
6. Scrolls → blog = optional depth
7. Scrolls → testimonials = social proof before final CTA
8. Scrolls → Instagram = brand lifestyle
9. Scrolls → contact = capture anyone not yet converted

## Product Discovery Journey

1. From homepage categories OR products page
2. Category filter via URL param or sidebar filter
3. Product card: image (hover scales slightly), product name, size/price preview, quick-add
4. Clicking card → product detail page

## Product Details Journey

1. Image gallery (multiple images, swipeable on mobile)
2. Bilingual name, category badge
3. Origin + roast level + flavor notes displayed as badges
4. Size selector (250g / 500g / 1kg) with price for each
5. Quantity selector
6. "Add to Cart" → cart drawer opens automatically
7. Related products shown below

## Add to Cart Journey

1. User clicks "Add to Cart"
2. `useCartStore.addItem()` called with item data
3. Item added to Zustand store (persisted to localStorage)
4. If user is logged in: `POST /api/cart` syncs to DB
5. Cart drawer opens showing item + quantity controls
6. Checkout button at bottom of drawer

## Custom Product Journey (Espresso Builder)

1. User navigates to `/products?category=make-your-espresso` or similar
2. Premium configurator component loads
3. Step 1: Select Espresso Profile (Balanced / Crema / Chocolate-Nutty / Bright / Strong)
4. Step 2: Select Body Preference (Medium / Full)
5. Step 3: Toggle Arabica Only and Budget Aware
6. AI recommendation renders: 2–4 beans with suggested ratios
7. User can override — select any beans from 28+ origins, manually set percentages
8. Real-time blend metrics radar chart (crema, body, acidity, bitterness, strength)
9. Real-time advice messages from `analyzeEspressoBlend()`
10. Step 4: Select weight (250g / 500g / 1kg)
11. Price calculated: `calculateBlendPrice(beans, 'ratios', size)`
12. Add to cart → custom item added with `customizations` object containing bean selections and ratios

## Custom Product Journey (Flavor Builder)

1. User navigates to `/products?category=make-your-flavor`
2. Step 1: Select base (Turkish Coffee / Coffee Mix / Cappuccino / Hot Chocolate)
3. Step 2: Select flavor additions from categorized list (Nuts, Sweets, Fruits, Special)
4. Available flavors filtered by base compatibility
5. Step 3: Select weight
6. Price: `calculateFlavorPrice(basePrice, flavors, size)` = (base + sum of additions) × kg, rounded to 5
7. Add to cart with customizations object

## Checkout Journey

1. User opens cart drawer → clicks Checkout
2. If not logged in → redirected to `/auth/login?next=/checkout`
3. Checkout page loads — form autofilled from profile (name, phone, address, city)
4. User fills any missing fields: first name, last name, email, phone, WhatsApp (optional), address, city, location link (optional), notes (optional)
5. Discount code field — user enters code → `POST /api/discounts/validate` checks server-side
6. Payment method radio: Cash on Delivery / Electronic Wallet / InstaPay
7. Order summary shown: items, subtotal, shipping (25 EGP or FREE if subtotal ≥ threshold), discount, total
8. Free shipping progress bar if not yet reached threshold
9. User clicks "Place Order"
10. `POST /api/checkout` called with items, shipping_address, payment_method, discount_code, notes
11. Server validates everything (see Phase 8)
12. On success: WhatsApp URL returned
13. Success screen shown with order number and "Send Order on WhatsApp" button
14. User taps button → wa.me URL opens WhatsApp with pre-filled message

## WhatsApp Order Journey

The WhatsApp message (in Arabic) contains:
- "🛒 طلب جديد - Line Coffee"
- Order number
- Customer name, phone, optional email, address
- Itemized product list with sizes, quantities, prices
- Subtotal, shipping, discount, total
- Payment method

## Post-Purchase Journey

1. User sees success screen with order number
2. Can track order at `/track?order_number=[number]`
3. Logged-in users see order in `/dashboard/orders`

## Navigation Patterns

- **Header:** Logo (links home), nav links, language switcher, search, wishlist, cart, user dropdown
- **Header transparency:** Transparent on hero pages (`/`, `/products`, `/about`, `/products/[slug]`), becomes glass on scroll or on non-hero pages
- **Mobile:** Hamburger → side panel with search, nav links, account links, language switcher
- **Footer:** Logo, brand blurb, category links, "Make Your Product" links, company links, support/legal links, contact (phone, email, address), social icons

## Conversion Patterns

- Cart auto-opens on add
- Free shipping progress bar in cart
- WhatsApp button (floating, bottom right) as secondary conversion path
- Discount banner (bottom of screen, CMS-driven)
- Announcement bar with promotion rules

## Trust-Building Elements

- Star ratings on product cards
- Testimonials section
- Founder story with 28 years experience narrative
- "Freshly Packed" / "Premium Beans" trust pills
- Order number visible after checkout
- Order tracking page (no account needed)

## Friction Points

- **Must create account to checkout** — no guest checkout
- Search is client-side (can be slow for large catalogs)
- No payment gateway — WhatsApp confirmation is an extra manual step
- No automated email confirmation

## Recommended Improvements

- Guest checkout
- Server-side search (Supabase full-text or Algolia)
- Email order confirmation via Resend or SendGrid
- Role-based admin (not single email hardcode)
- Payment gateway integration (Paymob, Fawry for Egypt)
