# LINE COFFEE â€” COMPLETE REVERSE-ENGINEERING & REBUILD AUDIT

**Audit Date:** 2026-06-07  
**Source Branch:** main  
**Purpose:** Complete documentation sufficient to rebuild the entire platform from scratch in any tech stack.

---

# PHASE 1 â€” EXECUTIVE SUMMARY

## What This Platform Is

LINE COFFEE is a bilingual (Arabic / English) premium coffee e-commerce platform targeting the Egyptian market. It sells packaged coffee beans and blends online, accepts orders exclusively via WhatsApp-confirmed checkout (no payment gateway integration), and includes two interactive product builders that let customers compose custom espresso blends and custom flavored coffees.

## Business Purpose

- Sell directly to end consumers online, bypassing wholesale-only distribution
- Launched 2015 as a B2B cafe supply business under founder Sayed Kamal (28 years at Bon Al Orouba) â€” this platform is the direct-to-consumer evolution
- Revenue model: product sales (EGP), collected on delivery or electronic wallet (no card gateway)
- WhatsApp is the actual fulfillment channel â€” the website creates an order and generates a pre-filled WhatsApp message that the customer sends to the business

## Target Users

| Segment | Description |
|---|---|
| Primary | Egyptian Arabic-speaking coffee drinkers, 25â€“45, smartphone users |
| Secondary | English-speaking expats and educated bilingual consumers in Egypt |
| B2B interest | Cafes and coffee shops (mentioned in brand story, not a separate B2B flow) |

## Main Customer Journey

1. Lands on homepage â†’ scrolls hero, categories, best sellers
2. Clicks category or product card â†’ product detail page
3. Selects weight (250g / 500g / 1kg) â†’ adds to cart
4. OR navigates to custom builder â†’ configures blend/flavor â†’ adds to cart
5. Opens cart drawer â†’ reviews items
6. Clicks "Checkout" â†’ must be logged in (redirected to login if not)
7. Fills shipping form (autofilled from profile) â†’ selects payment method
8. Submits â†’ server validates prices and stock â†’ order created â†’ WhatsApp URL opens
9. Customer sends pre-filled WhatsApp message to the business to confirm

## Main Admin Journey

1. Logs in with admin email â†’ redirected to `/dashboard/admin`
2. Views overview: revenue, active orders, sales chart, top products
3. Checks notification bell for pending orders
4. Opens Orders â†’ reviews pending â†’ updates status
5. Manages Products / Categories / Coffee Beans / Flavors as needed
6. Manages Discounts, Blog, Reviews, Contact Messages
7. Opens Settings â†’ updates announcement bar, WhatsApp number, site info, homepage section order
8. Opens Media (Banners) â†’ updates section images via Media Studio

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
- User auth (Supabase Auth â€” email/password)
- User dashboard: profile, orders, addresses, wishlist
- Admin dashboard: full CRUD for products, categories, orders, blog, discounts, reviews, customers, contact messages
- CMS: homepage section order/visibility, announcement bar rules, site settings
- Media Studio: image upload with visual effects presets, per-section image management
- Order tracking by order number (public)
- SEO: sitemap.ts, robots.ts, per-page metadata
- Vercel Analytics integration

## Unique Features

1. **AI Espresso Intelligence** â€” `lib/config/espresso-intelligence.ts` scores 28+ coffee bean origins against 5 flavour profiles (Balanced, Crema, Chocolate-Nutty, Bright, Strong) and recommends optimal blends with weighted ratios
2. **WhatsApp-first fulfillment** â€” no payment gateway; the website creates an order record then generates a wa.me URL with the full order as a pre-formatted Arabic message
3. **Homepage CMS** â€” admin can reorder and show/hide any of 9 homepage sections without touching code
4. **Visual Effects Presets** â€” Media Studio applies CSS filter chains (blur, brightness, contrast, sepia, vignette) to uploaded images with 7 named presets (Luxury Dark, Warm Coffee, Golden Glow, etc.)
5. **Announcement Rule Engine** â€” admin creates typed announcement rules (text, free_shipping, discount, product_promo, custom_link) with date windows, animations, and per-rule active toggles
6. **Custom item stock tracking** â€” espresso beans and flavor bases have their own inventory tracked in kg; checkout deducts fractional kg via a Supabase RPC

## Strengths

- Beautiful, premium dark-gold aesthetic consistent throughout
- Full Arabic RTL support with instant language switching
- WhatsApp fulfillment is frictionless for the Egyptian market
- Custom builders are genuinely sophisticated (AI ratio logic, pricing formulas)
- Admin is feature-rich for a small brand
- Supabase RLS enforces row-level security correctly
- Server-side pricing revalidation in checkout prevents client-side price manipulation

## Weaknesses

- No payment gateway â€” requires manual collection
- Admin authentication is a single hardcoded email (no role table)
- No guest checkout â€” user must create account to complete order
- Blog CMS is minimal (no rich text editor visible in codebase)
- Search is client-side only (loads all products, then filters locally)
- No automated email notifications to customers
- Cart items table has a loose schema (client_item_id, nullable product_id) from iterative migration history
- Multiple overlapping SQL migration files suggest schema evolved without clean consolidation

## Technical Debt

- Two sets of type definitions (`lib/types.ts` and `lib/types/database.ts`) with overlapping but inconsistent interfaces
- Multiple SQL migration files that partially overlap â€” the canonical schema is in `001_create_tables.sql` but later scripts alter it without being consolidated
- `ADMIN_EMAIL` is a hardcoded string constant â€” no DB-level admin role system
- Cart `client_item_id` column exists for custom items but the relationship between cart and order items is partially denormalized
- `discount` field on orders exists twice (as `discount` and `discount_amount`)
- WhatsApp API integration uses CallMeBot (unofficial, unreliable) for proactive notifications

---

# PHASE 2 â€” BRAND IDENTITY AUDIT

## Brand Name

**LINE COFFEE** (English) / **Ù„Ø§ÙŠÙ† ÙƒÙˆÙÙŠ** (Arabic)

## Brand Positioning

"Premium coffee crafted for warm daily rituals." â€” boutique-quality coffee sold directly to Egyptian consumers online, with a family heritage story rooted in 28 years of supply expertise.

## Brand Personality

| Trait | Expression |
|---|---|
| Premium | Dark backgrounds, gold accents, Playfair Display serif headings |
| Warm | Beige/brown palette, "warm daily rituals" copy, coffee photography |
| Authentic | Family story, founder named, supply roots narrative |
| Minimal | Spacious layouts, no clutter, breathable sections |
| Elegant | Smooth Framer Motion animations, glass morphism header |

## Visual Style

Dark-luxury coffee aesthetic. Nearly black backgrounds (#070504, #0B0806) with warm gold (#B6885E, #D6A373, #c8941a) accents and cream/beige (#FFDCC2, #F5E6D8) text. Not a light/white e-commerce site â€” it is deliberately dark and cinematic.

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
| Cairo | Arabic body and headings | Google Fonts | 300â€“900 |
| System sans | Body fallback | Browser default | â€” |

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
- `initial: { opacity: 0, y: 16 }` â†’ `animate: { opacity: 1, y: 0 }` for section reveals
- `initial: { opacity: 0, x: Â±16 }` for logo and nav
- `AnimatePresence` for mobile menu slide-in (spring, damping 25, stiffness 200)
- Hover: `whileHover={{ scale: 1.02 }}` on product cards
- Transition durations: 200â€“400ms, ease-in-out
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
- Side-by-side product grid (3â€“4 columns)
- Admin layout: fixed 215px sidebar + content area

---

# PHASE 3 â€” WEBSITE STRUCTURE AUDIT

## Complete Sitemap

```
/ (Homepage)
/products (Products listing)
/products/[slug] (Product detail)
/about (About Us)
/contact (Contact)
/blog (Blog listing)
/blog/[slug] (Blog post)
/checkout (Checkout â€” auth required)
/track (Order tracking â€” public)
/reviews (Customer reviews â€” public)
/privacy-policy (Legal)
/terms-of-use (Legal)
/auth/login
/auth/signup
/auth/forgot-password
/auth/reset-password
/auth/error
/auth/callback (Supabase OAuth callback)
/dashboard (User account â€” auth required)
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
- **Default copy:** "Coffee Crafted for Quiet Luxury" / "Ù‚Ù‡ÙˆØ© Ù…ØµÙ…Ù…Ø© Ù„Ø±ÙØ§Ù‡ÙŠØ© Ù‡Ø§Ø¯Ø¦Ø©"
- **CTA:** "Shop Coffee" â†’ `/products`
- **Data source:** `site_media` table, section_key = 'hero'; falls back to Unsplash URL
- **Visibility control:** Admin Settings â†’ Homepage Layout toggle

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
- **Content:** 3 feature cards (Premium Beans, Freshly Packed, Made With Care) â€” editable via Media Studio
- **Data source:** `site_media` section_key = 'home_features'
- **Visibility control:** Admin Settings toggle

### Section 4: Story

- **Position:** Fourth
- **Purpose:** Brand narrative, founder story
- **Desktop:** Split layout â€” image left, text right (or reversed in RTL)
- **Mobile:** Stacked â€” image on top, text below
- **Content:** Eyebrow, title, body paragraph, feature list, stats, CTA button
- **Default:** "A Family Coffee Legacy, Now Online" â€” Sayed Kamal story since 2015
- **CTA:** "Learn More About Us" â†’ `/about`
- **Data source:** `site_media` section_key = 'about_lower'
- **Visibility control:** Admin Settings toggle

### Section 5: Best Sellers

- **Position:** Fifth
- **Purpose:** Surface popular products, drive purchase
- **Desktop:** Section heading + horizontal product card grid
- **Mobile:** Scrollable or wrapped cards
- **Content:** Products with `is_best_seller = true`
- **CTA:** "View All Best Sellers" â†’ `/products?filter=best-seller`
- **Data source:** `GET /api/products?best_seller=true`
- **Visibility control:** Admin Settings toggle

### Section 6: Blog

- **Position:** Sixth
- **Purpose:** Content marketing, SEO, brand depth
- **Desktop:** 3-column blog card grid with thumbnail, date, title
- **Mobile:** Stacked cards
- **Content:** Latest published blog posts
- **CTA:** "Read More" â†’ `/blog`
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
- **Desktop:** Grid of 4â€“6 images
- **Mobile:** Grid or scroll
- **Content:** Images uploaded via Media Studio, section_key = 'home_instagram'; links to Instagram profile
- **CTA:** "Follow Us" â†’ Instagram URL from settings
- **Data source:** `site_media` table
- **Visibility control:** Admin Settings toggle

### Section 9: Contact

- **Position:** Ninth (last)
- **Purpose:** Lead capture, customer contact
- **Desktop:** Split layout â€” text/form left, image right
- **Mobile:** Stacked
- **Content:** Heading, subtitle, contact form (name, email, phone, message), phone/email display
- **CTA:** Form submit â†’ `POST /api/contact`
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
- **Data source:** `GET /api/orders/track?order_number=[number]` â€” public, no auth required

## Reviews (`/reviews`)

- **Purpose:** Display and submit product reviews
- **Data source:** `GET /api/reviews`

## Legal Pages

- `/privacy-policy` â€” content from `site_settings` key `legal_privacy_policy_content`
- `/terms-of-use` â€” content from `site_settings` key `legal_terms_of_use_content`

---

# PHASE 4 â€” UI/UX AUDIT

## Homepage Journey

1. User arrives â†’ sees full-viewport hero with dark overlay, bold serif headline, "Shop Coffee" button
2. Scrolls â†’ categories strip invites navigation by product type
3. Scrolls â†’ 3 trust pills reinforce brand quality
4. Scrolls â†’ story section creates brand connection
5. Scrolls â†’ best sellers section = primary conversion zone
6. Scrolls â†’ blog = optional depth
7. Scrolls â†’ testimonials = social proof before final CTA
8. Scrolls â†’ Instagram = brand lifestyle
9. Scrolls â†’ contact = capture anyone not yet converted

## Product Discovery Journey

1. From homepage categories OR products page
2. Category filter via URL param or sidebar filter
3. Product card: image (hover scales slightly), product name, size/price preview, quick-add
4. Clicking card â†’ product detail page

## Product Details Journey

1. Image gallery (multiple images, swipeable on mobile)
2. Bilingual name, category badge
3. Origin + roast level + flavor notes displayed as badges
4. Size selector (250g / 500g / 1kg) with price for each
5. Quantity selector
6. "Add to Cart" â†’ cart drawer opens automatically
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
6. AI recommendation renders: 2â€“4 beans with suggested ratios
7. User can override â€” select any beans from 28+ origins, manually set percentages
8. Real-time blend metrics radar chart (crema, body, acidity, bitterness, strength)
9. Real-time advice messages from `analyzeEspressoBlend()`
10. Step 4: Select weight (250g / 500g / 1kg)
11. Price calculated: `calculateBlendPrice(beans, 'ratios', size)`
12. Add to cart â†’ custom item added with `customizations` object containing bean selections and ratios

## Custom Product Journey (Flavor Builder)

1. User navigates to `/products?category=make-your-flavor`
2. Step 1: Select base (Turkish Coffee / Coffee Mix / Cappuccino / Hot Chocolate)
3. Step 2: Select flavor additions from categorized list (Nuts, Sweets, Fruits, Special)
4. Available flavors filtered by base compatibility
5. Step 3: Select weight
6. Price: `calculateFlavorPrice(basePrice, flavors, size)` = (base + sum of additions) Ã— kg, rounded to 5
7. Add to cart with customizations object

## Checkout Journey

1. User opens cart drawer â†’ clicks Checkout
2. If not logged in â†’ redirected to `/auth/login?next=/checkout`
3. Checkout page loads â€” form autofilled from profile (name, phone, address, city)
4. User fills any missing fields: first name, last name, email, phone, WhatsApp (optional), address, city, location link (optional), notes (optional)
5. Discount code field â€” user enters code â†’ `POST /api/discounts/validate` checks server-side
6. Payment method radio: Cash on Delivery / Electronic Wallet / InstaPay
7. Order summary shown: items, subtotal, shipping (25 EGP or FREE if subtotal â‰¥ threshold), discount, total
8. Free shipping progress bar if not yet reached threshold
9. User clicks "Place Order"
10. `POST /api/checkout` called with items, shipping_address, payment_method, discount_code, notes
11. Server validates everything (see Phase 8)
12. On success: WhatsApp URL returned
13. Success screen shown with order number and "Send Order on WhatsApp" button
14. User taps button â†’ wa.me URL opens WhatsApp with pre-filled message

## WhatsApp Order Journey

The WhatsApp message (in Arabic) contains:
- "ðŸ›’ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ - Line Coffee"
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
- **Mobile:** Hamburger â†’ side panel with search, nav links, account links, language switcher
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

- **Must create account to checkout** â€” no guest checkout
- Search is client-side (can be slow for large catalogs)
- No payment gateway â€” WhatsApp confirmation is an extra manual step
- No automated email confirmation

## Recommended Improvements

- Guest checkout
- Server-side search (Supabase full-text or Algolia)
- Email order confirmation via Resend or SendGrid
- Role-based admin (not single email hardcode)
- Payment gateway integration (Paymob, Fawry for Egypt)
# LINE COFFEE AUDIT â€” PART 2

---

# PHASE 5 â€” CONTENT AUDIT

## Writing Style

Bilingual across every user-facing surface. Arabic is primary (RTL, Cairo font). English is parallel (LTR, Playfair Display for headings, sans for body). All UI strings use the pattern `t('English text', 'Ø§Ù„Ù†Øµ Ø§Ù„Ø¹Ø±Ø¨ÙŠ')`.

## Tone of Voice

**Arabic:** Warm, premium, conversational. Uses first-person plural ("Ù‚Ù‡ÙˆØªÙ†Ø§", "Ù†Ø­Ù…ØµÙ‡Ø§"). Poetic but not flowery. Emotionally resonant phrases: "Ø·Ù‚ÙˆØ³ ÙŠÙˆÙ…ÙŠØ© Ø¯Ø§ÙØ¦Ø©", "Ø±ÙØ§Ù‡ÙŠØ© Ù‡Ø§Ø¯Ø¦Ø©", "Ù†Ù‡Ø§ÙŠØ© Ù„Ø§ ØªÙÙ†Ø³Ù‰".

**English:** Elegant, minimal. Brand copywriting style. Short declarative sentences. "Coffee Crafted for Quiet Luxury." "Selected beans, slow-roasted for depth, warmth, and a finish that lingers beautifully."

## Hero Copy Style

- **Structure:** Eyebrow label (small caps, tracking-wide, gold) â†’ Large serif headline â†’ Subtitle paragraph â†’ CTA button â†’ Optional stat row
- **Arabic eyebrow example:** "ØªØ­Ù…ÙŠØµØ§Øª Ù…Ù…ÙŠØ²Ø©"
- **English eyebrow example:** "Signature Roasts"
- **Pattern:** aspirational noun phrase (not imperative) + sensory/descriptive subtitle

## About Page Style

- **Structure:** Narrative paragraphs with founder name (Sayed Kamal) + years (28, 2015) + brand origin (Bon Al Orouba) â†’ Feature cards â†’ Values cards
- **Tone:** Authentic, heritage, trust-building
- **Arabic body example:** "Ø¨Ø¯Ø£Øª Ù„Ø§ÙŠÙ† ÙƒÙˆÙÙŠ Ø¹Ø§Ù… 2015 ÙƒÙ…Ø´Ø±ÙˆØ¹ Ø¹Ø§Ø¦Ù„ÙŠ Ù„ØªÙˆØ±ÙŠØ¯ Ø§Ù„Ù‚Ù‡ÙˆØ© Ø¨Ù‚ÙŠØ§Ø¯Ø© Ø³ÙŠØ¯ ÙƒÙ…Ø§Ù„ØŒ Ø¨Ø¹Ø¯ Ø®Ø¨Ø±Ø© 28 Ø¹Ø§Ù…Ù‹Ø§..."
- **English body example:** "Line Coffee began in 2015 as a family supply business..."

## Product Copy Style

- **Name:** Bilingual (name_en / name_ar)
- **Short description:** 1â€“2 sentences, sensory
- **Full description:** Origin, roast notes, brewing suggestions
- **Flavor notes:** Array of single-word descriptors (e.g., "chocolate", "caramel", "floral")
- **Roast level:** light / medium / dark / espresso

## Bean Description Style (Espresso Builder)

Each bean has Arabic and English description pairs. Pattern:
- Arabic: "[flavor profile] Ùˆ [finish]" e.g., "ØªÙˆØ§Ø²Ù† Ø£Ù†ÙŠÙ‚ Ø¨ÙŠÙ† Ø§Ù„ÙƒØ±Ø§Ù…ÙŠÙ„ ÙˆØ§Ù„ÙØ§ÙƒÙ‡Ø© Ø§Ù„Ø®ÙÙŠÙØ©"
- English: "[body characteristic] with [flavor note]" e.g., "Elegant caramel balance with light fruit notes."

## Blog Style

- **Title:** Informative or curiosity-driven
- **Structure:** Title + cover image + date + body
- **Tone:** Educational, brand-adjacent
- **CMS:** Admin blog page â€” content model not visible (likely plain text or minimal rich text)

## Footer Style

- **Brand blurb:** 1â€“2 sentence mission statement in both languages
- **Arabic example:** "Ù‚Ù‡ÙˆØ© Ø·Ø§Ø²Ø¬Ø© Ø§Ù„ØªØ­Ù…ÙŠØµ Ù„Ø·Ù‚ÙˆØ³ ÙŠÙˆÙ…ÙŠØ© Ø¯Ø§ÙØ¦Ø©ØŒ Ù…Ù† ØªÙˆÙ„ÙŠÙØ§Øª ØªØ±ÙƒÙŠ Ø¥Ù„Ù‰ ØªÙˆÙ„ÙŠÙØ§Øª Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ ÙˆØ§Ù„Ù†ÙƒÙ‡Ø§Øª Ø§Ù„Ù…Ù…ÙŠØ²Ø©."
- **Section headers:** Gold, small, tracking-wide
- **Links:** Subdued warm tone, hover to gold

## Contact Page Style

- **Heading:** "Let Us Help You Choose" / "Ø¯Ø¹Ù†Ø§ Ù†Ø³Ø§Ø¹Ø¯Ùƒ ÙÙŠ Ø§Ù„Ø§Ø®ØªÙŠØ§Ø±"
- **Subtitle:** Helpful, service-oriented: "Contact us and we will guide you to the right coffee."
- **Form labels:** Simple, bilingual

---

# PHASE 6 â€” PRODUCT SYSTEM AUDIT

## Category System

Each category has:

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| slug | TEXT | URL-safe identifier |
| name_en | TEXT | English name |
| name_ar | TEXT | Arabic name |
| description_en | TEXT | Optional |
| description_ar | TEXT | Optional |
| image_url | TEXT | Optional cover image |
| sort_order | INTEGER | Display order |
| is_visible | BOOLEAN | Hides from public if false |

### Known Categories (from footer config and codebase)

| Slug | English Name | Arabic Name | Purpose |
|---|---|---|---|
| turkish-blends | Turkish Blends | ØªÙˆÙ„ÙŠÙØ§Øª ØªØ±ÙƒÙŠ | Pre-ground Turkish coffee mixes |
| espresso-blends | Espresso Blends | ØªÙˆÙ„ÙŠÙØ§Øª Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ | Espresso-style blended products |
| easy-coffee | Easy Coffee | Ø¥ÙŠØ²ÙŠ ÙƒÙˆÙÙŠ | Instant/easy preparation |
| flavor-coffee | Flavor Coffee | Ù‚Ù‡ÙˆØ© Ø¨Ø§Ù„Ù†ÙƒÙ‡Ø§Øª | Pre-flavored coffee products |
| make-your-espresso | Make Your Espresso | Ø§ØµÙ†Ø¹ Ø¥Ø³Ø¨Ø±ÙŠØ³Ùˆ Ø®Ø§ØµØªÙƒ | Custom espresso builder category |
| make-your-flavor | Make Your Flavor | Ø§ØµÙ†Ø¹ Ù†ÙƒÙ‡ØªÙƒ | Custom flavor builder category |

**Display rules:** `is_visible = true` required for public display. Ordered by `sort_order ASC`.

## Product System

Each product has:

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| slug | TEXT | Unique, URL-safe |
| name_en | TEXT | |
| name_ar | TEXT | |
| description_en | TEXT | Full description |
| description_ar | TEXT | |
| short_description_en | TEXT | Card subtitle |
| short_description_ar | TEXT | |
| category_id | UUID | FK to categories |
| images | TEXT[] | Array of image URLs |
| origin | TEXT | Country of origin |
| roast_level | ENUM | light/medium/dark/espresso |
| flavor_notes | TEXT[] | Tasting note tags |
| is_featured | BOOLEAN | Homepage featured flag |
| is_best_seller | BOOLEAN | Best sellers section flag |
| is_new | BOOLEAN | "New" badge flag |
| is_visible | BOOLEAN | Public visibility |
| stock_quantity | INTEGER | Current stock |
| low_stock_threshold | INTEGER | Triggers "low stock" warning |
| is_manually_out_of_stock | BOOLEAN | Admin override for OOS |

## Product Size / Variant System

Each product can have up to 3 size variants:

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| product_id | UUID | FK to products |
| size | ENUM | '250g' / '500g' / '1kg' |
| price | DECIMAL(10,2) | In EGP |
| compare_at_price | DECIMAL(10,2) | Strikethrough/original price (optional) |
| sku | TEXT | Stock keeping unit (optional) |
| is_available | BOOLEAN | Per-size availability |

**Constraint:** UNIQUE(product_id, size) â€” one price row per weight per product.

## Pricing Logic

- Price shown = `product_sizes.price` for selected size
- Discount shown = `product_sizes.compare_at_price` (strikethrough)
- No percentage logic on product level â€” discounts are handled via discount codes at checkout
- Custom item pricing: formula-based (see Phase 7)

## Inventory Logic

### Regular Products
- `stock_quantity` is decremented at checkout via optimistic-lock UPDATE:
  ```sql
  UPDATE products SET stock_quantity = stock_quantity - qty
  WHERE id = ? AND stock_quantity = [read_value] AND is_manually_out_of_stock = false
  ```
- If 0 rows updated â†’ race condition detected â†’ 409 Conflict returned
- `is_manually_out_of_stock = true` acts as immediate OOS regardless of stock_quantity
- `low_stock_threshold`: if `stock_quantity <= low_stock_threshold`, display "Low Stock" warning on product

### Custom Items (Beans/Flavors)
- `coffee_beans.stock_quantity` and `flavor_options.stock_quantity` are in KG (fractional)
- Required kg = `packageSizeToKg(size) Ã— quantity`
- 250g = 0.25 kg, 500g = 0.5 kg, 1kg = 1.0 kg
- Deduction via `deduct_checkout_stock` Supabase RPC (requires migration 016)
- Error codes: `INSUFFICIENT_BEAN_STOCK`, `INSUFFICIENT_FLAVOR_STOCK`

## Product Relationships

- `products.category_id` â†’ `categories.id` (many-to-one)
- `product_sizes.product_id` â†’ `products.id` (many-to-many: one product, many sizes)
- `order_items.product_id` â†’ `products.id` (nullable â€” custom items have null product_id)
- `cart_items.product_id` â†’ `products.id` (nullable in updated schema)

## Product Visibility

Products appear publicly when:
1. `is_visible = true`
2. Category `is_visible = true` (for category browsing)
3. At least one `product_sizes.is_available = true`

Products flagged:
- `is_featured = true` â†’ Homepage featured section
- `is_best_seller = true` â†’ Best Sellers section
- `is_new = true` â†’ "New" badge on card

---

# PHASE 7 â€” CUSTOM BUILDERS AUDIT

## Custom Espresso Blend Builder

### Purpose
Allow customers to compose their own espresso blend from single-origin coffee beans, set gram ratios, and receive AI-guided recommendations.

### Inputs
| Input | Control | Range |
|---|---|---|
| Espresso Profile | Radio/Tab selector | Balanced / Crema / Chocolate-Nutty / Bright / Strong |
| Body Preference | Toggle | Medium / Full |
| Arabica Only | Toggle | true/false |
| Budget Aware | Toggle | true/false |
| Bean Selection | Multi-select grid | 28+ beans from DB/config |
| Bean Ratios | Slider/number input | 0â€“100% per bean (must total 100%) |
| Weight | Size selector | 250g / 500g / 1kg |

### Bean Catalog (as of code snapshot)

28 origins including:
- **Arabica:** India, India Plantation, India Washed Arabica, India Washed AA, Brazil, Brazil 17-18, Brazil Santos Fine Cup, Colombia, Colombia 18, Ethiopia, Ethiopia Lekempti, Guatemala, Yemen, Peru, Costa Rica, Tanzania Arabica, Kenyan Arabica, Nicaragua, Uganda
- **Robusta:** Indonesia, Indonesia XL, Indonesia Large, Indonesia Medium, India Robusta, India Robusta AA, Vietnam, Vietnam Washed, Vietnam Clean, Uganda 18

Beans sourced from `coffee_beans` DB table; fallback from `DEFAULT_CUSTOM_BLEND_BEANS` constant in `lib/config/customization.ts`.

### AI Recommendation Logic (`lib/config/espresso-intelligence.ts`)

**Profiles Configuration:**

| Profile ID | Target crema | Target body | Target acidity | Key weights |
|---|---|---|---|---|
| balanced | 3.4 | 3.5 | 2.8 | bodyÃ—1.2, cremaÃ—1, acidityÃ—0.8 |
| crema | 4.7 | 4.2 | 2.0 | cremaÃ—1.8, bodyÃ—1.2, strengthÃ—1.1 |
| chocolate-nutty | 3.4 | 4.0 | 2.2 | chocolateÃ—1.7, nuttyÃ—1.4, bodyÃ—1.1 |
| bright | 2.8 | 3.0 | 4.4 | acidityÃ—1.8, bitternessÃ—1.0 |
| strong | 4.0 | 4.6 | 1.8 | strengthÃ—1.8, bodyÃ—1.4, cremaÃ—1.2 |

**Bean Metric Derivation:**
Each bean has 7 metrics: crema, body, acidity, bitterness, strength, chocolate, nutty.
- If the bean row has explicit values â†’ use those
- Otherwise â†’ derived from text pattern matching against bean ID + origin + description:
  - Robusta beans: higher crema (4.4â€“4.8), body (4.5), strength (4.4â€“4.8)
  - Ethiopian/Kenyan/Tanzanian/bright keywords â†’ acidity 4.3
  - Brazil/Colombia/India/chocolate keywords â†’ chocolate 4.5, body 4
  - Nutty keywords â†’ nutty 4.4

**Scoring:**
```
score = 10 - weighted_distance_from_target + arabicaBonus + robustaBonus - budgetPenalty
```
- `arabicaBonus = 0.35` for arabica beans in 'bright' or 'balanced' profiles
- `robustaBonus = 0.55` for robusta in 'crema' or 'strong'
- `budgetPenalty` scales with price range if budgetAware = true

**Ratio Assignment:**
- Top 2â€“4 beans selected by score
- Ratios computed via weighted contribution function `getManualBeanWeight()`
- Robusta capped at 40% for crema/strong, 25% otherwise
- All ratios rounded to nearest 5%, adjusted to total exactly 100%

**Advice System (`analyzeEspressoBlend`):**
Returns live text advice:
- If >4 beans selected: "Too crowded, reduce to 2-4"
- If ratios don't sum to 100%: "Set total to 100%"
- If robusta >35% for non-bold profiles: "Reduce robusta"
- If high acidity + low body: "Use fuller bean as base"
- Normal: shows suggested ratio string

### Pricing Formula
```
unitPrice = roundCleanPrice(weightedAverageRawCostPerKg Ã— sizeKg)
roundCleanPrice = Math.round(value / 5) * 5
```
Example: 3 beans at 50%/30%/20% with prices 600/700/400 per kg, 500g size:
- Raw = 0.50Ã—600 + 0.30Ã—700 + 0.20Ã—400 = 300+210+80 = 590/kg
- Price = round(590 Ã— 0.5 / 5) Ã— 5 = round(59) Ã— 5 = 295 EGP

### Validation Rules
- At checkout: bean IDs validated against DB `coffee_beans` table
- Each bean checked: `is_active = true`, `is_manually_out_of_stock = false`, `stock_quantity >= required_kg`
- Ratios must sum to ~100% (Â±0.2% tolerance)
- `type: 'espresso-blend'` must be present in customizations object

### Order Storage
Custom items stored in `order_items` with:
- `product_id = null`
- `product_name = "Custom Espresso Blend"` (or localized)
- `size = '250g'|'500g'|'1kg'`
- `customizations = { type: 'espresso-blend', beans: [{ id, name_en, name_ar, percent }] }`
- Price is server-recomputed from DB bean prices â€” client price is discarded

### Text Flow Diagram

```
USER SELECTS PROFILE â†’ [AI scores all beans] â†’ RECOMMENDATION RENDERED
                                                        â†“
USER CAN OVERRIDE â†’ [ADD/REMOVE BEANS] â†’ [ADJUST RATIOS]
                                                        â†“
                            [REAL-TIME METRICS CHART UPDATES]
                                                        â†“
                            [ADVICE MESSAGE UPDATES]
                                                        â†“
USER SELECTS WEIGHT â†’ [PRICE CALCULATED] â†’ ADD TO CART
                                                        â†“
                    [customizations object saved to cart]
                                                        â†“
CHECKOUT â†’ [SERVER validates against DB] â†’ [STOCK DEDUCTED IN KG] â†’ ORDER CREATED
```

---

## Custom Flavor Builder

### Purpose
Allow customers to compose a custom flavored coffee by choosing a base type and one or more flavor additions.

### Inputs

| Input | Control |
|---|---|
| Base Type | Card selector (4 options) |
| Flavor Additions | Multi-select grid with categories |
| Weight | Size selector (250g / 500g / 1kg) |

### Base Options

| ID | English | Arabic | Price/kg | Description |
|---|---|---|---|---|
| turkish-coffee | Turkish Coffee | Ø§Ù„Ù‚Ù‡ÙˆØ© Ø§Ù„ØªØ±ÙƒÙŠØ© | 400 EGP/kg | Sealed Turkish coffee base |
| coffee-mix | Coffee Mix | ÙƒÙˆÙÙŠ Ù…ÙŠÙƒØ³ | 430 EGP/kg | Fine instant coffee with Polish creamer |
| cappuccino | Cappuccino | ÙƒØ§Ø¨ØªØ´ÙŠÙ†Ùˆ | 530 EGP/kg | Cafe-style instant with foam |
| hot-chocolate | Hot Chocolate | Ù‡ÙˆØª Ø´ÙˆÙƒÙ„ÙŠØª | 430 EGP/kg | Warm cocoa base |

### Flavor Additions (30+ options)

Grouped into: Sweets, Nuts, Fruits, Special

| Category | Examples | Standard Price | Chunks Price |
|---|---|---|---|
| Sweets | Chocolate, Caramel, Vanilla, Lotus, Oreo, Cinnabon | 50 EGP/kg | 70 EGP/kg |
| Nuts | Hazelnut, Almond, Pistachio, Hazelnut Chunks | 50â€“70 EGP/kg | â€” |
| Fruits | Strawberry, Banana, Mango, Peach, Cherry, Blueberry, Apple, Grape, etc. | 50 EGP/kg | â€” |
| Special | Coconut, Mocha, Pina Colada, Apple Hookah, Grape Hookah, Hot Cider | 50 EGP/kg | â€” |

Some flavors restricted by base:
- Turkish + Coffee Mix only: Apple, Grape, Orange, Watermelon, Guava, Pineapple
- Turkish only: Apple Hookah, Grape Hookah, Hot Cider

### Pricing Formula

```
baseRaw = base.price (EGP/kg)
additionsRaw = sum of each selected flavor.price_delta (EGP/kg)
rawPerKg = baseRaw + additionsRaw
unitPrice = roundCleanPrice(rawPerKg Ã— sizeKg)
roundCleanPrice = Math.round(value / 5) * 5
```

Example: Cappuccino base (530) + Chocolate (50) + Hazelnut (50) = 630/kg, 250g:
- 630 Ã— 0.25 = 157.5 â†’ rounded to 155 or 160 EGP

### Validation at Checkout

- `type: 'flavor'` in customizations
- base ID must match `flavor_bases.id` in DB, `is_active = true`
- Each flavor option: `flavor_options.id` in DB, `is_active = true`, `stock_quantity >= required_kg`
- Required kg = `packageSizeToKg(size) Ã— quantity`
- `assigned_emails` check on flavor_bases (not in current schema but planned)

### Order Storage
- `product_id = null`
- `customizations = { type: 'flavor', base: { id, name_en, name_ar }, flavors: [{ id }] }`
- Price server-recomputed from DB

### Text Flow Diagram

```
USER SELECTS BASE â†’ [FLAVOR LIST FILTERED BY BASE] â†’ USER SELECTS FLAVORS
                                                              â†“
                                        [INCOMPATIBLE FLAVORS GREYED OUT]
                                                              â†“
                                        USER SELECTS WEIGHT â†’ [PRICE SHOWN]
                                                              â†“
                                        ADD TO CART â†’ [customizations saved]
                                                              â†“
                CHECKOUT â†’ [SERVER validates base + flavors against DB] â†’ ORDER CREATED
```

---

# PHASE 8 â€” ORDER SYSTEM AUDIT

## Cart

### Storage
- **Client-side (all users):** Zustand store, persisted to localStorage under key `line-coffee-cart`
- **Server-side (logged-in users):** `cart_items` table in Supabase, synced on mutations

### Cart Item Schema (Zustand)
```typescript
{
  id: string           // client-generated unique ID (product_id + size, or custom hash)
  product_id: string   // Supabase UUID (or synthetic ID for custom items)
  name_en: string
  name_ar: string
  size: '250g' | '500g' | '1kg'
  price: number        // unit price in EGP
  quantity: number
  image: string        // image URL
  stock_quantity?: number
  customizations?: Record<string, unknown>
}
```

### Cart Sync Behavior
- `addItem` â†’ `POST /api/cart` with product ID, size, quantity, and item metadata
- `updateQuantity` â†’ `PATCH /api/cart/[itemId]`
- `removeItem` â†’ `DELETE /api/cart/[itemId]`
- `clearCart` â†’ `DELETE /api/cart`
- Owner ID tracked in store: `syncOwner(userId)` called on auth state change
- On user logout: `resetForGuest()` clears cart and ownerId

### Custom Item Stock Cap
`getCustomItemMaxQuantity()` in `lib/custom-stock.ts` limits quantity of custom items based on ingredient availability. Max 10 units per custom item type.

## Checkout

### Route
`POST /api/checkout`

### Authentication
- Must be logged in (checks `supabase.auth.getUser()`)
- Returns 401 if not authenticated
- Uses service-role admin client for DB writes (bypasses RLS)

### Input Payload
```typescript
{
  items: CheckoutItemInput[]  // cart items with product_id, size, quantity, customizations
  shipping_address: {
    first_name: string
    last_name?: string
    email?: string
    phone: string
    whatsapp?: string
    address: string
    city?: string
    location_link?: string
  }
  payment_method: 'cod' | 'electronic_wallet' | 'instapay'
  discount_code?: string
  notes?: string
}
```

## Order Creation â€” Full Step-by-Step

**Step 1: Auth Check**
- `supabase.auth.getUser()` â†’ must have user
- Extracts `userId`, `userEmail`

**Step 2: Input Validation**
- `items` must be non-empty array
- `shipping_address.first_name` required
- `shipping_address.phone` required

**Step 3: Catalog Fetch**
- Extract all UUID product IDs from items
- `SELECT id, name_en, images, is_visible, stock_quantity, is_manually_out_of_stock, product_sizes FROM products WHERE id IN (...)`
- Build `catalogProducts` map

**Step 4: Item Sanitization Loop** (per item)
- Parse `quantity` (integer 1â€“99)
- Parse `size` (string, max 40 chars)
- If `product_id` is UUID:
  - Look up in catalogProducts
  - Check `is_visible = true`
  - Check selected size exists and `is_available = true`
  - Check `is_manually_out_of_stock = false`
  - Check `stock_quantity >= total_requested` (across all cart lines for same product)
  - Get server-side `unit_price` from `product_sizes.price`
  - Compute `total_price = unit_price Ã— quantity`
- If `product_id` is NOT a UUID (custom item):
  - Call `validateAndPriceCustomItem()` â†’ validates beans or flavors from DB
  - Returns server-computed `unitPrice`
- Append to `sanitizedItems`

**Step 5: Subtotal Computation**
```
computedSubtotal = sum(item.total_price for item in sanitizedItems)
```

**Step 6: Shipping Calculation**
- Fetch free shipping settings from `site_settings`:
  - `free_shipping_threshold` (default 200 EGP)
  - `free_shipping_active` (default true)
  - `free_shipping_starts_at`, `free_shipping_ends_at` (date window)
- `computedShippingCost = computedSubtotal >= threshold ? 0 : 25` (when active)

**Step 7: Discount Validation** (if discount_code provided)
```sql
SELECT code, type, value, min_order, max_uses, uses, expires_at, assigned_emails
FROM discounts WHERE code = UPPER(discount_code) AND is_active = true
```
Checks:
- Discount exists and is active
- Not expired (`expires_at > NOW()`)
- Under usage limit (`uses < max_uses`)
- Assigned to this user's email (if `assigned_emails` not empty)
- Subtotal meets minimum order amount
If percentage: `discountAmount = subtotal Ã— value / 100`
If fixed: `discountAmount = min(value, subtotal)`

**Step 8: Total Computation**
```
computedTotal = max(0, subtotal + shipping - discountAmount)
```

**Step 9: Order Number Generation**
Format: `[INITIALS]-[LAST3PHONE]-[SEQUENCE]`
Example: `MS-171-0042` for Mohamed Sayed, phone ending 171, 42nd order
- Initials from first+last name
- Last 3 digits of phone
- Sequence = total orders count + 1, padded to 4 digits
- Uniqueness checked via DB lookup (up to 25 attempts)

**Step 10: Order Insert**
```sql
INSERT INTO orders (
  order_number, user_id, customer_name, customer_email, customer_phone,
  address, items, subtotal, shipping_cost, tax, discount_code, discount_amount,
  total, shipping_address, billing_address, payment_method, payment_status, status, notes
) VALUES (...)
```
- `items` = JSONB snapshot of sanitizedItems
- `tax = 0` (no tax currently)
- `payment_status = 'pending'`
- `status = 'pending'`

**Step 11: Order Items Insert**
```sql
INSERT INTO order_items (...) VALUES (...)  -- one row per item
```
If this fails: order is deleted (compensating transaction)

**Step 12: Stock Deduction â€” Regular Products**
For each catalogProduct in the order:
```sql
UPDATE products
SET stock_quantity = stock_quantity - qty
WHERE id = ? AND stock_quantity = [read_value] AND is_manually_out_of_stock = false
```
Optimistic lock: if 0 rows updated â†’ race condition â†’ order deleted â†’ 409 returned

**Step 13: Stock Deduction â€” Custom Items**
```sql
SELECT deduct_checkout_stock(
  p_products: [],
  p_beans: [{ id, required_kg }],
  p_flavors: [{ id, required_kg }]
)
```
RPC handles atomic decrement of fractional kg quantities.

**Step 14: Discount Usage Increment**
```sql
UPDATE discounts SET uses = uses + 1 WHERE code = appliedDiscountCode
```

**Step 15: WhatsApp URL Construction**
```
orderMessage = buildOrderMessage(...)  -- English format for admin
waMessage = buildWhatsAppMessage(...)  -- Arabic format for customer
whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_PHONE_E164}?text=${encodeURIComponent(waMessage)}`
```

**Step 16: Telegram Notification**
```
POST https://api.telegram.org/bot{token}/sendMessage
{ chat_id, text: orderMessage.slice(0, 3900) }
```
Skipped if `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` env vars are missing.

**Step 17: Response**
```json
{
  "success": true,
  "order": { "id", "order_number", "total", "status" },
  "whatsapp_url": "https://wa.me/201004761171?text=...",
  "message": "Order created successfully"
}
```

## Order Status Flow

```
pending â†’ confirmed â†’ preparing (processing) â†’ shipped â†’ delivered
                â†˜ cancelled
```

| Status | Meaning | Who sets it |
|---|---|---|
| pending | Just placed, awaiting admin review | System (automatic) |
| confirmed | Admin has reviewed and accepted | Admin |
| preparing | Being packaged/prepared | Admin |
| shipped | Dispatched for delivery | Admin |
| delivered | Customer received | Admin |
| cancelled | Cancelled by customer or admin | Admin or Customer |

Cancellation fields: `cancelled_at`, `cancellation_initiated_by` ('customer' | 'admin'), `cancellation_reason`, `stock_restored_at`.

## WhatsApp Message Format (Arabic)

```
ðŸ›’ *Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ - Line Coffee*
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
ðŸ“¦ Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨: *[ORDER_NUMBER]*

ðŸ‘¤ *Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„*
Ø§Ù„Ø§Ø³Ù…: [NAME]
Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„: [PHONE]
Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„: [EMAIL]
Ø§Ù„Ø¹Ù†ÙˆØ§Ù†: [ADDRESS, CITY]

ðŸ›ï¸ *Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª*
1. [PRODUCT NAME] - [SIZE]
   Ø§Ù„ÙƒÙ…ÙŠØ©: [QTY]  |  Ø§Ù„Ø³Ø¹Ø±: [PRICE] Ø¬.Ù…  |  Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ: [TOTAL] Ø¬.Ù…

ðŸ’° *Ù…Ù„Ø®Øµ Ø§Ù„Ø·Ù„Ø¨*
Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ÙØ±Ø¹ÙŠ: [SUBTOTAL] Ø¬.Ù…
Ø§Ù„Ø´Ø­Ù†: [SHIPPING] Ø¬.Ù… / ØªÙˆØµÙŠÙ„ Ù…Ø¬Ø§Ù†ÙŠ
Ø§Ù„Ø®ØµÙ… ([CODE]): -[AMOUNT] Ø¬.Ù…
*Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ: [TOTAL] Ø¬.Ù…*

ðŸ’³ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹: [PAYMENT_LABEL]
ðŸ“ Ù…Ù„Ø§Ø­Ø¸Ø§Øª: [NOTES]
```

## Payment Methods

| Code | Arabic Label | English Label |
|---|---|---|
| cod | Ø§Ù„Ø¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… | Cash on Delivery |
| electronic_wallet | Ù…Ø­ÙØ¸Ø© Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© | Electronic Wallet |
| instapay | Ø¥Ù†Ø³ØªØ§Ø¨Ø§ÙŠ | InstaPay |

---

# PHASE 9 â€” DASHBOARD AUDIT

## Admin Authentication

- Admin is determined exclusively by email comparison: `user.email === ADMIN_EMAIL`
- `ADMIN_EMAIL = 'm.sayed@abu-elhassan.com'` hardcoded in `lib/config/site.ts`
- All admin API routes call `isAdminEmail(user?.email)` â†’ returns 403 if false
- No DB role table, no JWT custom claims, no middleware-level protection (route-level check only)

## Admin Layout (`/dashboard/admin/layout.tsx`)

- Fixed 215px left sidebar (desktop)
- Top bar with search input, language toggle, notification bell, settings link, avatar dropdown
- Notification bell shows count of pending orders (polls every 60 seconds)
- Mobile: sidebar replaced by horizontal scrollable tab strip below top bar
- Background: `#0B0806` (near black), radial gold gradient overlay

## Admin Navigation Items

| Route | Label EN | Label AR | Icon |
|---|---|---|---|
| /dashboard/admin | Dashboard | Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© | LayoutDashboard |
| /dashboard/admin/orders | Orders | Ø§Ù„Ø·Ù„Ø¨Ø§Øª | Package |
| /dashboard/admin/products | Products | Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª | ShoppingBag |
| /dashboard/admin/categories | Categories | Ø§Ù„ÙØ¦Ø§Øª | Tag |
| /dashboard/admin/coffee-beans | Coffee Beans | Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù‚Ù‡ÙˆØ© | Coffee |
| /dashboard/admin/flavors | Flavors | Ø§Ù„Ù†ÙƒÙ‡Ø§Øª | Sparkles |
| /dashboard/admin/customers | Customers | Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ | Users |
| /dashboard/admin/contact-messages | Contact | Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ | MessageSquare |
| /dashboard/admin/reviews | Reviews | Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø§Øª | Star |
| /dashboard/admin/discounts | Discounts | Ø§Ù„Ø®ØµÙˆÙ…Ø§Øª | Percent |
| /dashboard/admin/blog | Blog | Ø§Ù„Ù…Ø¯ÙˆÙ†Ø© | FileText |
| /dashboard/admin/banners | Media | Ø§Ù„ÙˆØ³Ø§Ø¦Ø· | Image |
| /dashboard/admin/settings | Settings | Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª | Settings |

## Dashboard Overview (`/dashboard/admin`)

**Data source:** `GET /api/admin/stats`

**Stat Cards:**
- Total Sales (EGP) â€” delivered revenue only (confirmed/preparing/shipped/delivered statuses)
- Active Orders card â€” breakdown: Confirmed / Preparing / Shipped counts + amounts
- Total Customers count
- Cancelled Orders count

**Sales Chart:** Area chart, last 30 days, daily sales data (Recharts AreaChart)

**Recent Orders:** List of 5 most recent orders with status badge and total

**Categories Grid:** Category images with product counts

**Customer Donut Chart:** New vs returning customers this month (Recharts PieChart)

**Top Products:** Ranked by units sold in last 30 days with image, name, sold count, price

**Recent Reviews:** 3 review cards with star rating, customer name, excerpt

## Orders Page (`/dashboard/admin/orders`)

**Data source:** `GET /api/admin/orders` â†’ returns all orders with items, sorted by created_at DESC

**Features:**
- Full orders table: order number, customer name, date, status badge, total
- Status filter chips
- Search by order number or customer name
- Click row â†’ order detail modal or inline expansion
- Status update dropdown per order
- Cancellation with reason
- WhatsApp integration: button to open WhatsApp with order info
- Stock restoration on cancellation

**Impact on website:** Order status changes affect what customer sees in `/dashboard/orders` and `/track`

## Products Page (`/dashboard/admin/products`)

**Data source:** `GET /api/admin/products` / `POST` / `PATCH /api/admin/products/[id]`

**Features:**
- Product list table with image, name, category, stock, visibility toggle
- Create/Edit product form: all fields including bilingual names, images (URL input or upload), origin, roast level, flavor notes, category select, flags (featured, best_seller, new), stock settings
- Size management: add/edit 250g/500g/1kg prices and compare_at prices
- Bulk visibility toggle

## Categories Page (`/dashboard/admin/categories`)

**Features:**
- Category list with image, name (bilingual), sort order, visibility toggle
- Create/edit category: slug, name_en, name_ar, description, image, sort_order, is_visible
- Slug must be unique

## Coffee Beans Page (`/dashboard/admin/coffee-beans`)

**Purpose:** Manage the inventory of coffee beans available for the Custom Espresso Builder

**Fields per bean:**
- name_en, name_ar, origin, family (arabica/robusta/other)
- price (EGP/kg)
- description_en, description_ar
- is_active (visibility in builder)
- stock_quantity (in kg), low_stock_threshold, is_manually_out_of_stock
- sort_order
- Optional sensory metrics: bitterness, body, acidity, crema, strength (1â€“5 scale)

**Data source:** `GET/POST /api/admin/coffee-beans`, `PATCH/DELETE /api/admin/coffee-beans/[id]`

## Flavors Page (`/dashboard/admin/flavors`)

**Purpose:** Manage flavor bases and their flavor addition options

**Structure:** Two levels
1. **Flavor Bases** (base types like Turkish Coffee, Coffee Mix, etc.)
   - name_en, name_ar, price (base price/kg), is_active, sort_order
2. **Flavor Options** (flavor additions under each base)
   - name_en, name_ar, price_delta (addition price/kg), option_type (standard/chunks)
   - stock_quantity (kg), low_stock_threshold, is_manually_out_of_stock, is_active

**Data source:** `GET/POST /api/admin/flavors`, `PATCH/DELETE /api/admin/flavors/[id]`

## Customers Page (`/dashboard/admin/customers`)

**Purpose:** View registered customers

**Displays:** Name, email, registration date, order count, total spent
**Data source:** `GET /api/admin/customers` (reads from `profiles` + order aggregates)

## Contact Messages (`/dashboard/admin/contact-messages`)

**Purpose:** View messages submitted via contact form
**Data source:** `GET /api/admin/contact-messages` (reads `contact_messages` table)
**Fields shown:** Name, email, phone, message, date

## Reviews (`/dashboard/admin/reviews`)

**Purpose:** Moderate customer reviews/testimonials
**Features:** List reviews, approve/reject, toggle visibility, delete
**Data source:** `GET /api/admin/reviews` â†’ reads `testimonials` table

## Discounts (`/dashboard/admin/discounts`)

**Purpose:** Create and manage discount codes

**Fields per discount:**
- `code` (TEXT UNIQUE, stored UPPERCASE)
- `type` ('percentage' | 'fixed')
- `value` (number â€” percent or EGP amount)
- `min_order` (minimum subtotal in EGP, 0 = no minimum)
- `max_uses` (NULL = unlimited)
- `uses` (current use count)
- `expires_at` (TIMESTAMPTZ, NULL = never expires)
- `is_active` (BOOLEAN)
- `assigned_emails` (TEXT[] â€” if non-empty, only these email addresses can use it)

**Data source:** `GET/POST /api/admin/discounts`, `DELETE /api/admin/discounts/[id]`

## Blog (`/dashboard/admin/blog`)

**Purpose:** Create and manage blog posts

**Fields:** Title (bilingual), slug, content, cover image, published status, published_at date

**Data source:** `GET/POST /api/admin/blog`, `PATCH/DELETE /api/admin/blog/[postId]`

## Media/Banners (`/dashboard/admin/banners`)

**Purpose:** Upload and manage images for all website sections (Media Studio)

**Section types covered:**
- `hero` â€” Homepage hero slides (supports multiple slides)
- `about_top` â€” About page top banner
- `about_lower` / `story` â€” Homepage story section / About story image
- `about_story` â€” About page story block
- `about_values` â€” About page values
- `products_banner` â€” Products page hero
- `blog_page` â€” Blog page hero
- `contact_page` â€” Contact page hero
- `track_page` â€” Track order page
- `categories` â€” Category card images
- `testimonials` â€” Testimonials section background
- `home_features` â€” Features pills section
- `best_sellers` â€” Best sellers section
- `home_blog` â€” Blog section on homepage
- `home_instagram` â€” Instagram section images
- `home_contact` â€” Contact section on homepage

**Per-image settings:**
- Image URL / upload to Supabase Storage (`line-coffee-media` bucket)
- Mobile image URL (separate for mobile)
- Overlay opacity (0â€“0.85)
- Object position (center/top/bottom/left/right)
- Alt text (bilingual)
- Content fields (title_en, title_ar, subtitle_en, subtitle_ar, button_text, button_link)
- Visual effects: overlay_color, gradient_type, blur, brightness, contrast, saturation, warmth, vignette, glow, grain
- 7 named visual presets: Luxury Dark, Warm Coffee, Golden Glow, Cinematic Brown, Elegant Matte, Soft Premium, Espresso Mood

**Upload restrictions:**
- Max size: 8 MB
- Allowed types: JPEG, PNG, WebP
- Minimum dimensions enforced per section (hero: 1920Ã—900, banners: 1600Ã—800)

## Settings Page (`/dashboard/admin/settings`)

**Sections:**

### 1. Announcement Bar Manager
- Toggle bar on/off globally
- Create/delete/reorder announcement rules
- Rule types: text, free_shipping, discount, product_promo, custom_link
- Per rule: Arabic text, English text, animation (fade/marquee), duration (ms), date window
- Free shipping rule: minimum order amount (auto-applies at checkout)
- Live preview of announcement text

### 2. WhatsApp Notifications (CallMeBot)
- WhatsApp number for proactive admin notifications (not order delivery)
- CallMeBot API key
- Test message button

### 3. Brand Settings
- site_name, tagline, logo_url, logo_alt, favicon_url

### 4. Contact Settings
- phone, email, address_line_1, address_line_2, city, country, opening_hours

### 5. Social Media
- Facebook URL, Instagram URL, TikTok URL, YouTube URL

### 6. Footer
- footer_blurb text

### 7. SEO
- default_title, default_description, default_keywords

### 8. Homepage Layout
- Reorder sections via up/down arrows
- Toggle section visibility on/off
- Sections: hero, categories, features, story, best_sellers, blog, testimonials, instagram, contact
# LINE COFFEE AUDIT â€” PART 3

---

# PHASE 10 â€” CMS AUDIT

## Content Ownership Model

LINE COFFEE has a hybrid content model:
1. **Database-driven dynamic content** â€” products, categories, orders, blog posts, testimonials, discounts
2. **Key-value settings store** â€” `site_settings` table with structured public/private settings
3. **Media items table** â€” `site_media` (banners) table for section images and their content overlays
4. **Hardcoded fallbacks** â€” all public settings have code-level fallbacks in `lib/config/site.ts`

## Editable Content (via Admin)

| Content Area | Admin Page | Stored In | Frontend Consumed By |
|---|---|---|---|
| Products | /admin/products | `products` + `product_sizes` tables | `/products`, `/products/[slug]`, best sellers |
| Categories | /admin/categories | `categories` table | `/products`, homepage categories section |
| Blog posts | /admin/blog | `blog_posts` table | `/blog`, `/blog/[slug]`, homepage blog section |
| Testimonials | /admin/reviews | `testimonials` table | Homepage testimonials section, `/reviews` |
| Discounts | /admin/discounts | `discounts` table | Checkout API |
| Coffee beans | /admin/coffee-beans | `coffee_beans` table | Custom espresso builder |
| Flavor bases/options | /admin/flavors | `flavor_bases` + `flavor_options` | Custom flavor builder |
| Site settings | /admin/settings | `site_settings` table | All pages (fetched server-side) |
| Section images | /admin/banners | `site_media` table | Homepage sections, page banners |
| Announcement bar | /admin/settings | `site_settings` key: `announcement_bar` | Sticky top bar |
| Homepage layout | /admin/settings | `site_settings` keys: `homepage_section_order`, `homepage_section_visibility` | Homepage render order |

## Static / Hardcoded Content

| Content | Location | Notes |
|---|---|---|
| Admin email | `lib/config/site.ts` | Must be changed in code |
| WhatsApp order number | `lib/config/site.ts` | Also overrideable via settings |
| Default legal text | `lib/config/site.ts` | Temporary placeholders |
| Navigation links | `components/layout/header.tsx` | Hardcoded array |
| Footer link slugs | `components/layout/footer.tsx` | Hardcoded, dynamically resolved to category names |
| Bean catalog fallback | `lib/config/customization.ts` | Used if DB empty |
| Flavor additions fallback | `lib/config/customization.ts` | Used if DB empty |

## Settings Key-Value Store

Table: `site_settings` with columns `key TEXT UNIQUE, value JSONB`

**Public settings keys (accessible without auth):**
```
brand_site_name, brand_tagline, brand_logo_url, brand_logo_alt, brand_favicon_url
contact_phone, contact_email, contact_address_line_1, contact_address_line_2
contact_city, contact_country, contact_opening_hours
wa_phone
social_facebook_url, social_instagram_url, social_tiktok_url, social_youtube_url
footer_blurb
seo_default_title, seo_default_description, seo_default_keywords
legal_privacy_policy_content, legal_terms_of_use_content
homepage_section_order, homepage_section_visibility
```

**Private settings keys (admin only):**
```
announcement_bar (JSONB: { active, rules: [...] })
free_shipping_threshold, free_shipping_active, free_shipping_starts_at, free_shipping_ends_at
wa_phone, wa_apikey (WhatsApp notification)
```

## How Content Reaches the Frontend

### Server-Side (SSR)
- Homepage (`app/page.tsx`): fetches public settings using admin client at render time
- Generates metadata (title, description, OG tags) from settings
- Determines section order and visibility before rendering

### Client-Side (CSR)
- Footer: fetches categories from `/api/categories` on mount
- Header: fetches all products (for search) from `/api/products?limit=120` on mount
- All dashboard pages: fetch on mount with `cache: 'no-store'`
- Public settings hook (`usePublicSettings`): fetches `/api/settings/public` on mount, memoized

### Data Flow for Public Settings
```
site_settings (DB) 
  â†’ /api/settings/public (GET, no auth)
  â†’ buildPublicSettings() (merges DB values with hardcoded fallbacks)
  â†’ usePublicSettings() hook (client) or getPublicSettings() (server)
  â†’ Footer, Header, Checkout, Contact components
```

## Section Visibility Controls

Homepage sections can be individually:
1. **Hidden** â€” `homepage_section_visibility[key] = false` â†’ section not rendered
2. **Reordered** â€” `homepage_section_order` array determines render sequence

Changes take effect on next page load (server-side rendering at request time).

---

# PHASE 11 â€” DATABASE AUDIT

## Full Table Inventory

### Table: `profiles`
**Purpose:** Extended user profile linked to Supabase auth users

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, FK auth.users(id) CASCADE | Matches auth user ID |
| first_name | TEXT | nullable | |
| last_name | TEXT | nullable | |
| phone | TEXT | nullable | |
| avatar_url | TEXT | nullable | |
| preferred_language | TEXT | CHECK ('en','ar'), DEFAULT 'en' | |
| address | TEXT | nullable | Primary delivery address |
| city | TEXT | nullable | |
| notes | TEXT | nullable | Customer notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**Indexes:** PK on id  
**RLS:** Users can SELECT/INSERT/UPDATE/DELETE their own row only  
**Trigger:** `on_auth_user_created` â†’ auto-inserts profile row on user signup  

---

### Table: `categories`
**Purpose:** Product categories for browsing and filtering

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| slug | TEXT | UNIQUE NOT NULL | URL-safe identifier |
| name_en | TEXT | NOT NULL | |
| name_ar | TEXT | NOT NULL | |
| description_en | TEXT | nullable | |
| description_ar | TEXT | nullable | |
| image_url | TEXT | nullable | Category card image |
| sort_order | INTEGER | DEFAULT 0 | |
| is_visible | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**RLS:** Public SELECT when `is_visible = true`; Admin bypasses via service role  

---

### Table: `products`
**Purpose:** Main product catalog

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| slug | TEXT | UNIQUE NOT NULL | |
| name_en | TEXT | NOT NULL | |
| name_ar | TEXT | NOT NULL | |
| description_en | TEXT | nullable | |
| description_ar | TEXT | nullable | |
| short_description_en | TEXT | nullable | Card subtitle |
| short_description_ar | TEXT | nullable | |
| category_id | UUID | FK categories(id) SET NULL | |
| images | TEXT[] | DEFAULT '{}' | Array of image URLs |
| origin | TEXT | nullable | Country of origin |
| roast_level | TEXT | CHECK (light/medium/dark/espresso) | |
| flavor_notes | TEXT[] | DEFAULT '{}' | Tasting tags |
| is_featured | BOOLEAN | DEFAULT false | |
| is_best_seller | BOOLEAN | DEFAULT false | |
| is_new | BOOLEAN | DEFAULT false | |
| is_visible | BOOLEAN | DEFAULT true | |
| stock_quantity | INTEGER | DEFAULT 0 | |
| low_stock_threshold | INTEGER | DEFAULT 5 | |
| is_manually_out_of_stock | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**Indexes:** slug, category_id, is_featured (partial), is_best_seller (partial)  
**RLS:** Public SELECT when `is_visible = true`  

---

### Table: `product_sizes`
**Purpose:** Size/weight variants with pricing for each product

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| product_id | UUID | NOT NULL FK products(id) CASCADE | |
| size | TEXT | CHECK ('250g','500g','1kg') | |
| price | DECIMAL(10,2) | NOT NULL | In EGP |
| compare_at_price | DECIMAL(10,2) | nullable | Strikethrough price |
| sku | TEXT | nullable | |
| is_available | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Unique:** (product_id, size)  
**Index:** product_id  
**RLS:** Public SELECT (all visible to anyone â€” pricing is public)  

---

### Table: `addresses`
**Purpose:** Saved delivery addresses for users

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL FK auth.users(id) CASCADE | |
| label | TEXT | NOT NULL DEFAULT 'Home' | |
| street_address | TEXT | NOT NULL | |
| city | TEXT | NOT NULL | |
| state | TEXT | nullable | |
| postal_code | TEXT | nullable | |
| country | TEXT | NOT NULL DEFAULT 'Saudi Arabia' | Note: default may be outdated for Egypt |
| is_default | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**RLS:** Users can only access their own addresses  

---

### Table: `orders`
**Purpose:** Customer orders

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| order_number | TEXT | UNIQUE NOT NULL | Format: INITIALS-PHONE3-SEQUENCE |
| user_id | UUID | FK auth.users(id) SET NULL | nullable for guest orders |
| customer_name | TEXT | nullable | Denormalized snapshot |
| customer_email | TEXT | nullable | Denormalized snapshot |
| customer_phone | TEXT | nullable | Denormalized snapshot |
| address | TEXT | nullable | Combined address string |
| subtotal | DECIMAL(10,2) | NOT NULL | |
| shipping_cost | DECIMAL(10,2) | DEFAULT 0 | |
| tax | DECIMAL(10,2) | DEFAULT 0 | Always 0 currently |
| discount_code | TEXT | nullable | Applied code |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 | Amount deducted |
| discount | DECIMAL(10,2) | DEFAULT 0 | Duplicate field (legacy) |
| total | DECIMAL(10,2) | NOT NULL | Final amount |
| currency | TEXT | DEFAULT 'SAR' | Note: Should be 'EGP' â€” appears to be legacy default |
| shipping_address | JSONB | nullable | Full shipping form snapshot |
| billing_address | JSONB | nullable | Same as shipping currently |
| items | JSONB/JSONB[] | nullable | Snapshot of order items |
| payment_method | TEXT | CHECK (cod/electronic_wallet/instapay) | |
| payment_status | TEXT | CHECK (pending/paid/failed/refunded) | DEFAULT 'pending' |
| status | TEXT | CHECK (pending/confirmed/preparing/processing/shipped/delivered/cancelled) | |
| cancelled_at | TIMESTAMPTZ | nullable | |
| cancellation_initiated_by | TEXT | CHECK (customer/admin) | |
| cancellation_reason | TEXT | nullable | |
| stock_restored_at | TIMESTAMPTZ | nullable | |
| notes | TEXT | nullable | Customer notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**Indexes:** user_id, order_number, status, created_at DESC  
**RLS:** Users can SELECT their own orders; anyone can INSERT (supports guest checkout)  
**Trigger:** `set_order_number` if order_number is null on INSERT  

---

### Table: `order_items`
**Purpose:** Line items for each order

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| order_id | UUID | NOT NULL FK orders(id) CASCADE | |
| product_id | UUID | FK products(id) SET NULL | nullable for custom items |
| product_name | TEXT | NOT NULL | Snapshot at time of order |
| product_image | TEXT | nullable | Snapshot URL |
| size | TEXT | nullable | '250g'/'500g'/'1kg' |
| quantity | INTEGER | NOT NULL | |
| unit_price | DECIMAL(10,2) | NOT NULL | Server-validated price |
| total_price | DECIMAL(10,2) | NOT NULL | unit_price Ã— quantity |
| customizations | JSONB | nullable | Espresso/flavor builder selections |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Index:** order_id  
**RLS:** Users can read items from their own orders  

---

### Table: `cart_items`
**Purpose:** Server-side shopping cart for logged-in users

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL FK auth.users(id) CASCADE | |
| product_id | UUID | FK products(id) CASCADE | nullable for custom items in updated schema |
| client_item_id | TEXT | nullable | Client-generated unique ID |
| name_en | TEXT | nullable | Denormalized for custom items |
| name_ar | TEXT | nullable | |
| image | TEXT | nullable | |
| unit_price | DECIMAL | nullable | Stored client price (not authoritative) |
| customizations | JSONB | nullable | |
| size | TEXT | NOT NULL | |
| quantity | INTEGER | NOT NULL DEFAULT 1 | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Trigger-updated |

**Unique:** (user_id, product_id, size) â€” original schema; updated schema may use (user_id, client_item_id)  
**RLS:** Users can only access their own cart items  

---

### Table: `wishlist_items`
**Purpose:** Saved products for later

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| user_id | UUID | NOT NULL FK auth.users(id) CASCADE | |
| product_id | UUID | NOT NULL FK products(id) CASCADE | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Unique:** (user_id, product_id)  
**RLS:** Users can only access their own wishlist  

---

### Table: `testimonials`
**Purpose:** Customer reviews displayed on homepage

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK DEFAULT gen_random_uuid() | |
| customer_name | TEXT | NOT NULL | |
| customer_avatar | TEXT | nullable | |
| content_en | TEXT | NOT NULL | |
| content_ar | TEXT | nullable | |
| rating | INTEGER | CHECK (1â€“5) DEFAULT 5 | |
| is_featured | BOOLEAN | DEFAULT false | |
| is_visible | BOOLEAN | DEFAULT true | |
| is_approved | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | nullable | |

**RLS:** Public SELECT when `is_visible = true`  

---

### Table: `coffee_beans`
**Purpose:** Inventory of coffee bean origins for the Custom Espresso Builder

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name_en | TEXT | |
| name_ar | TEXT | |
| origin | TEXT | Country |
| family | TEXT | arabica/robusta/other |
| price | DECIMAL | Price per kg in EGP |
| description_en | TEXT | |
| description_ar | TEXT | |
| is_active | BOOLEAN | Show in builder |
| stock_quantity | DECIMAL | In kg (fractional) |
| low_stock_threshold | DECIMAL | |
| is_manually_out_of_stock | BOOLEAN | |
| sort_order | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

Optional sensory metrics (may be added columns or stored in JSONB):
`bitterness, body, acidity, crema, strength` (1â€“5 scale)

---

### Table: `flavor_bases`
**Purpose:** Base coffee types for the Custom Flavor Builder

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name_en | TEXT | |
| name_ar | TEXT | |
| price | DECIMAL | Price per kg |
| type | TEXT | Classification |
| description_en | TEXT | |
| description_ar | TEXT | |
| is_active | BOOLEAN | |
| sort_order | INTEGER | |

---

### Table: `flavor_options`
**Purpose:** Flavor additions under each base

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| base_id | UUID | FK flavor_bases(id) |
| name_en | TEXT | |
| name_ar | TEXT | |
| price_delta | DECIMAL | Additional price per kg |
| option_type | TEXT | standard/chunks |
| is_active | BOOLEAN | |
| stock_quantity | DECIMAL | In kg |
| low_stock_threshold | DECIMAL | |
| is_manually_out_of_stock | BOOLEAN | |
| sort_order | INTEGER | |

---

### Table: `discounts`
**Purpose:** Discount codes for checkout

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| code | TEXT | UNIQUE, stored UPPERCASE |
| type | TEXT | percentage/fixed |
| value | DECIMAL | Percent (0â€“100) or EGP amount |
| min_order | DECIMAL | Minimum subtotal (0 = no minimum) |
| max_uses | INTEGER | NULL = unlimited |
| uses | INTEGER | Current use count |
| expires_at | TIMESTAMPTZ | NULL = never expires |
| is_active | BOOLEAN | |
| assigned_emails | TEXT[] | If non-empty, restricted to these emails |

---

### Table: `site_settings`
**Purpose:** Key-value store for all site configuration

| Column | Type | Notes |
|---|---|---|
| key | TEXT | UNIQUE |
| value | JSONB | String, number, boolean, array, or object |

Upserted on save, read at page request time.

---

### Table: `site_media` (also referenced as banners)
**Purpose:** Website section images and their content configuration

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| title_ar | TEXT | |
| title_en | TEXT | |
| subtitle_ar | TEXT | |
| subtitle_en | TEXT | |
| image_url | TEXT | Primary image URL |
| mobile_image_url | TEXT | Optional mobile-specific image |
| link_url | TEXT | Optional CTA link |
| sort_order | INTEGER | |
| is_active | BOOLEAN | |
| section_key | TEXT | Maps to WEBSITE_SECTIONS keys |
| slide_key | TEXT | For hero slides |
| section_type | TEXT | full_hero/split_content/etc |
| media_type | TEXT | hero/section/banner/category/testimonial |
| usage_area | TEXT | Specific section area |
| alt_en | TEXT | |
| alt_ar | TEXT | |
| is_featured | BOOLEAN | |
| button_text_ar | TEXT | |
| button_text_en | TEXT | |
| button_link | TEXT | |
| overlay_opacity | DECIMAL | 0â€“0.85 |
| object_position | TEXT | CSS object-position value |
| content | JSONB | SectionBuilderContent structure |
| layout | JSONB | SectionBuilderLayout structure |
| animation_type | TEXT | |
| animation_duration | INTEGER | |
| device_visibility | JSONB | |
| starts_at | TIMESTAMPTZ | |
| ends_at | TIMESTAMPTZ | |
| images | JSONB | Array of {url, path, bucket, width, height, object_position} |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

### Table: `blog_posts` (inferred from API)
**Purpose:** Blog article content

Likely columns: id, slug, title_en, title_ar, content (text/rich text), cover_image, excerpt_en, excerpt_ar, published_at, is_published, author, created_at, updated_at

---

### Table: `contact_messages` (inferred from API)
**Purpose:** Contact form submissions

Likely columns: id, name, email, phone, message, created_at, is_read

---

## Entity Relationship Summary

```
auth.users (Supabase Auth)
  â† profiles (1:1)
  â† addresses (1:many)
  â† cart_items (1:many)
  â† wishlist_items (1:many)
  â† orders (1:many)

categories
  â† products (1:many)

products
  â† product_sizes (1:many, max 3)
  â† cart_items (1:many, nullable)
  â† wishlist_items (1:many)
  â† order_items (1:many, nullable for custom)

orders
  â† order_items (1:many)

flavor_bases
  â† flavor_options (1:many)

site_settings (key-value, no FK)
site_media (no FK, uses section_key string)
testimonials (standalone)
coffee_beans (standalone)
discounts (standalone)
blog_posts (standalone)
contact_messages (standalone)
```

## Database Triggers

1. `on_auth_user_created` â€” AFTER INSERT on `auth.users` â†’ creates profile row
2. `update_profiles_updated_at` â€” BEFORE UPDATE on profiles â†’ sets updated_at = NOW()
3. `update_categories_updated_at` â€” same for categories
4. `update_products_updated_at` â€” same for products
5. `update_addresses_updated_at` â€” same for addresses
6. `update_orders_updated_at` â€” same for orders
7. `update_cart_items_updated_at` â€” same for cart_items
8. `set_order_number` â€” BEFORE INSERT on orders WHEN order_number IS NULL â†’ generates order number

---

# PHASE 12 â€” API AUDIT

## Public API Routes (No Authentication Required)

### `GET /api/categories`
- **Purpose:** Return all visible categories
- **Output:** `{ success: true, data: Category[] }`
- **Query filter:** `is_visible = true`, ordered by `sort_order ASC`

### `GET /api/products`
- **Purpose:** Return product list with optional filters
- **Params:** `category` (slug), `filter` (best-seller/new/featured), `limit`, `page`, `q` (search)
- **Output:** `{ success: true, data: ProductWithDetails[], pagination: {...} }`

### `GET /api/products/[slug]`
- **Purpose:** Return single product with sizes and category
- **Output:** `{ success: true, data: ProductWithDetails }`

### `GET /api/blog/public`
- **Purpose:** Return published blog posts
- **Output:** `{ success: true, data: BlogPost[] }`

### `GET /api/blog/[slug]`
- **Purpose:** Return single published blog post
- **Output:** `{ success: true, data: BlogPost }`

### `GET /api/testimonials`
- **Purpose:** Return visible testimonials
- **Output:** `{ success: true, data: Testimonial[] }`

### `GET /api/coffee-beans`
- **Purpose:** Return active coffee beans for espresso builder
- **Output:** `{ success: true, data: CoffeeBean[] }`

### `GET /api/flavors`
- **Purpose:** Return active flavor bases with their options
- **Output:** `{ success: true, data: FlavorBase[] }`

### `GET /api/customization-options`
- **Purpose:** Return combined customization config
- **Output:** `{ success: true, data: { beans, flavor_bases, flavor_additions } }`

### `GET /api/settings/announcement`
- **Purpose:** Return announcement bar configuration
- **Output:** `{ active: boolean, rules: AnnouncementRule[] }`

### `GET /api/settings/whatsapp`
- **Purpose:** Return WhatsApp phone number for floating button
- **Output:** `{ wa_phone: string }`

### `GET /api/settings/free-shipping`
- **Purpose:** Return free shipping threshold and active status
- **Output:** `{ threshold: number, active: boolean, starts_at, ends_at }`

### `GET /api/settings/public`
- **Purpose:** Return all public site settings
- **Auth:** None required
- **Output:** `PublicSiteSettings` object

### `POST /api/discounts/validate`
- **Purpose:** Validate a discount code for a given subtotal
- **Input:** `{ code: string, subtotal: number }`
- **Output:** `{ success: true, data: { code, type, value, discount_amount } }`

### `GET /api/discounts/my`
- **Purpose:** Return discount codes assigned to the current user
- **Auth:** Required (user)
- **Output:** `{ success: true, data: Discount[] }`

### `GET /api/orders/track`
- **Purpose:** Public order tracking
- **Params:** `?order_number=[number]`
- **Output:** `{ success: true, data: { order_number, status, total, created_at, items } }`

### `POST /api/checkout`
- **Purpose:** Create order (see Phase 8 for full detail)
- **Auth:** Required (user)
- **Input:** items, shipping_address, payment_method, discount_code, notes
- **Output:** `{ success: true, order: {...}, whatsapp_url: string }`

### `GET/POST /api/cart`
- **Purpose:** Get or add to server-side cart
- **Auth:** Required

### `PATCH/DELETE /api/cart/[itemId]`
- **Purpose:** Update or remove cart item
- **Auth:** Required

### `GET/POST /api/wishlist`
- **Purpose:** Get or add to wishlist
- **Auth:** Required

### `GET/PATCH /api/profile`
- **Purpose:** Get or update user profile
- **Auth:** Required

### `POST /api/contact`
- **Purpose:** Submit contact form
- **Input:** `{ name, email, phone, message }`
- **Output:** `{ success: true }`

### `GET /api/reviews`
- **Purpose:** Public product reviews (approved testimonials)
- **Output:** `{ success: true, data: Testimonial[] }`

### `GET /api/notifications`
- **Purpose:** User notifications
- **Auth:** Required

---

## Admin API Routes (Admin Email Required)

### Settings

| Route | Method | Purpose |
|---|---|---|
| /api/admin/settings/public | GET | Read all public settings |
| /api/admin/settings/public | PATCH | Update public settings (whitelisted keys only) |
| /api/admin/settings/whatsapp | GET | Read WhatsApp config |
| /api/admin/settings/whatsapp | PATCH | Update WhatsApp phone and API key |
| /api/settings/announcement | PATCH | Update announcement bar rules |
| /api/settings/free-shipping | PATCH | Update free shipping settings |

### Orders

| Route | Method | Purpose |
|---|---|---|
| /api/admin/orders | GET | All orders with stats |
| /api/admin/orders/[orderId] | GET | Single order |
| /api/admin/orders/[orderId] | PATCH | Update status, notes |
| /api/admin/orders/[orderId] | DELETE | Cancel order (with stock restoration) |

### Products

| Route | Method | Purpose |
|---|---|---|
| /api/admin/products | GET | All products |
| /api/admin/products | POST | Create product |
| /api/admin/products/[productId] | PATCH | Update product |
| /api/admin/products/[productId] | DELETE | Delete product |

### Categories

| Route | Method | Purpose |
|---|---|---|
| /api/admin/categories | GET | All categories |
| /api/admin/categories | POST | Create category |
| /api/admin/categories/[categoryId] | PATCH | Update category |
| /api/admin/categories/[categoryId] | DELETE | Delete category |

### Coffee Beans

| Route | Method | Purpose |
|---|---|---|
| /api/admin/coffee-beans | GET | All beans |
| /api/admin/coffee-beans | POST | Create bean |
| /api/admin/coffee-beans/[id] | PATCH | Update bean |
| /api/admin/coffee-beans/[id] | DELETE | Delete bean |

### Flavors

| Route | Method | Purpose |
|---|---|---|
| /api/admin/flavors | GET | All flavor bases with options |
| /api/admin/flavors | POST | Create flavor base |
| /api/admin/flavors/[id] | PATCH | Update flavor base |
| /api/admin/flavors/[id] | DELETE | Delete flavor base |

### Blog

| Route | Method | Purpose |
|---|---|---|
| /api/admin/blog | GET | All blog posts |
| /api/admin/blog | POST | Create post |
| /api/admin/blog/[postId] | PATCH | Update post |
| /api/admin/blog/[postId] | DELETE | Delete post |

### Other Admin Routes

| Route | Method | Purpose |
|---|---|---|
| /api/admin/stats | GET | Dashboard statistics |
| /api/admin/customers | GET | All customers |
| /api/admin/reviews | GET | All reviews |
| /api/admin/discounts | GET/POST | List/create discounts |
| /api/admin/discounts/[id] | DELETE | Delete discount |
| /api/admin/contact-messages | GET | All contact messages |
| /api/admin/notifications | GET/POST | Admin notifications |
| /api/admin/whatsapp/send | POST | Send WhatsApp via CallMeBot |
| /api/admin/media/upload | POST | Upload image to Supabase Storage |
| /api/admin/media-studio | GET/POST | List/create media items |
| /api/admin/media-studio/[itemId] | PATCH/DELETE | Update/delete media item |

---

# PHASE 13 â€” CODE ARCHITECTURE AUDIT

## Folder Structure

```
app/                          # Next.js App Router pages
  api/                        # API route handlers
    admin/                    # Admin-only API routes
    cart/                     # Cart management
    checkout/                 # Order creation
    orders/                   # Order tracking
    settings/                 # Public settings
    (other public routes)
  auth/                       # Auth pages (login, signup, etc.)
  blog/                       # Blog listing + detail
  checkout/                   # Checkout page
  dashboard/                  # User + admin dashboards
    admin/                    # Admin section
  products/                   # Product listing + detail
  about/, contact/, reviews/  # Static/dynamic content pages
  layout.tsx                  # Root layout (providers, fonts, header, footer)
  page.tsx                    # Homepage
  globals.css                 # Global styles
  robots.ts                   # Robots.txt generation
  sitemap.ts                  # Sitemap generation

components/
  home/                       # Homepage section components
  layout/                     # Header, Footer, StickyTopBar, PageLoader
  products/                   # ProductCard, ProductDetail, ProductsGrid, etc.
  cart/                       # CartDrawer
  wishlist/                   # WishlistDrawer
  notifications/              # NotificationCenter
  pages/                      # Page-specific component collections
    about/                    # About page components
    blog/                     # Blog components
    products/                 # Products page components
  ui/                         # Design system primitives (Radix + shadcn)

lib/
  auth/                       # Session helpers, auth redirect
  config/                     # Site config, shipping, customization, espresso AI
  context/                    # React contexts (auth, language)
  hooks/                      # Custom hooks
  services/                   # Data fetching services
  store/                      # Zustand stores (cart, wishlist)
  supabase/                   # Supabase clients (client, server, admin, proxy)
  types.ts                    # Type definitions
  types/database.ts           # Extended type definitions
  utils.ts                    # Utility functions
  seo.ts                      # SEO helpers
  media.ts                    # Media Studio types and config
  stock.ts                    # Stock helpers
  custom-stock.ts             # Custom item stock helpers
  order-status.ts             # Order status normalization
  order-item-details.ts       # Order item formatting

public/
  brand/                      # Logo files (logo-white.svg, etc.)
  fonts/                      # Local font files (PlayfairDisplay TTF files)
  images/                     # Static image assets

scripts/                      # SQL migration scripts
output/                       # This audit document
```

## Routing Structure

**Next.js App Router** with file-based routing. All pages use React Server Components by default; client interactivity added with `'use client'` directive.

**Route Groups:**
- No explicit route groups defined â€” simple file-based structure
- Dashboard auth guard handled at component level (not middleware)
- Admin auth guard handled at API level (email check in each handler)

## State Management

| State | Store | Persistence |
|---|---|---|
| Cart items | Zustand (`useCartStore`) | localStorage + server sync |
| Wishlist items | Zustand (`useWishlistStore`) | localStorage + server sync |
| Language preference | React Context (`LanguageProvider`) + localStorage | localStorage key: `line-coffee-language` |
| Auth state | React Context (`AuthProvider`) | Supabase session (httpOnly cookies) |
| Public settings | SWR hook (`usePublicSettings`) | Memory cache, refetched each session |

## Authentication Architecture

- **Provider:** Supabase Auth (email/password only â€” no OAuth visible)
- **Session storage:** httpOnly cookies (Supabase SSR package `@supabase/ssr`)
- **Server client:** `lib/supabase/server.ts` â€” `createServerClient()` using cookie store
- **Client:** `lib/supabase/client.ts` â€” `createBrowserClient()`
- **Admin/Service role:** `lib/supabase/admin.ts` â€” `createClient()` with service role key, bypasses RLS
- **Auth state:** `getInitialAuthState()` in `lib/auth/session.ts` â€” SSR fetch of user + profile
- **Admin check:** `isAdminEmail(email)` â€” compares to hardcoded `ADMIN_EMAIL` constant
- **Language-aware redirect:** `lib/auth/redirect.ts`

## Database Architecture

- **Supabase PostgreSQL** with Row Level Security
- All public tables have RLS enabled
- Service role client used for all checkout/admin mutations (bypasses RLS)
- User-facing reads use anon/session client (respects RLS)

## Frontend Architecture

- **React 19** with Server Components
- **Server Components** for data fetching at page level (SEO-friendly)
- **Client Components** for interactive UI (cart, header, auth, builders)
- **Framer Motion** for animations
- **Radix UI** for accessible primitive components
- **TailwindCSS 4** for styling (no CSS modules)
- **SWR** for client-side data fetching with caching
- **Zustand 5** for global client state

## Backend Architecture

- **Next.js API Routes** (Route Handlers in App Router)
- No separate backend server
- Supabase handles auth, database, and storage
- Server-side logic only in API routes (checkout validation, pricing, stock)
- Telegram notification via direct HTTP call to Bot API
- WhatsApp integration: client-side wa.me URL (order delivery) + CallMeBot (admin alerts)

## How Everything Connects

```
Browser
  â†“ page request
Next.js Server (SSR)
  â†’ fetches public settings (Supabase admin client)
  â†’ renders page with initial state
  â†“ HTML + JS bundle
Browser (hydration)
  â†’ AuthProvider: validates session, loads profile
  â†’ LanguageProvider: reads localStorage language
  â†’ useCartStore: rehydrates from localStorage, syncs ownerId
  â†“ user interaction
Browser
  â†’ useCartStore.addItem() â†’ optimistic local update + POST /api/cart
  â†’ useWishlistStore.toggle() â†’ optimistic local + POST /api/wishlist
  â†’ /checkout â†’ POST /api/checkout â†’ Supabase writes â†’ WhatsApp URL
```

---

# PHASE 14 â€” SECURITY AUDIT

## Authentication

**Supabase Auth** manages sessions via httpOnly cookies. Secure by default. No JWT stored in localStorage.

**Vulnerability:** Password reset flow relies on Supabase email delivery â€” if SMTP not configured, users cannot reset passwords.

## Authorization

**Admin Protection:**
- ALL admin API routes check `isAdminEmail(user?.email)` using the hardcoded `ADMIN_EMAIL` constant
- This is a single-email check, not a role system
- **Critical Risk:** If the admin email account is compromised, attacker has full admin access with no secondary factor
- **Risk:** Admin email is hardcoded in source code â€” if the repo is ever public, the admin identity is exposed

**User Protection:**
- RLS policies ensure users cannot access other users' orders, cart, wishlist, or profile
- Orders INSERT policy allows `user_id IS NULL` (supports guest orders â€” but checkout requires auth, so this may be a residual policy)

## Pricing Security

The checkout route (`POST /api/checkout`) recomputes ALL prices server-side:
- Unit prices fetched directly from `product_sizes.price` â€” client-submitted prices are ignored
- Custom item prices recomputed from DB bean/flavor prices â€” client prices discarded
- Discount amounts recomputed from DB discount rules â€” client amounts discarded
- Total = server-computed subtotal + server-computed shipping - server-computed discount

**This is correctly implemented.** Client cannot submit false prices.

## Order Security

- Stock validated with optimistic locking (race condition protection)
- Custom stock deducted atomically via RPC
- Discount usage limits enforced atomically
- Order number uniqueness checked before insert

## Data Exposure Risks

1. **`ADMIN_EMAIL` in source code** â€” if repository becomes public, admin email is exposed
2. **Admin API route at `/api/admin/orders`** returns full order list including customer names, phones, addresses â€” only protected by email check, no rate limiting
3. **`/api/products?limit=120`** loads all products to browser for search â€” acceptable for small catalog but would be a problem at scale
4. **Cart sync API** (`/api/cart`) stores client-submitted `unit_price` â€” this is stored but NOT used for actual order pricing. Could be confusing but not exploitable.
5. **`contact_messages` table** â€” contact form submissions are stored; no rate limiting visible on `POST /api/contact`

## Supabase RLS Policies (Confirmed)

| Table | Policy | Condition |
|---|---|---|
| profiles | SELECT own | `auth.uid() = id` |
| profiles | INSERT/UPDATE/DELETE own | `auth.uid() = id` |
| categories | SELECT | `is_visible = true` |
| products | SELECT | `is_visible = true` |
| product_sizes | SELECT | `true` (all public) |
| addresses | All CRUD | `auth.uid() = user_id` |
| orders | SELECT | `auth.uid() = user_id OR user_id IS NULL` |
| orders | INSERT | `true` (guests can place orders) |
| orders | UPDATE | `auth.uid() = user_id` |
| order_items | SELECT | via order ownership check |
| order_items | INSERT | `true` |
| cart_items | All CRUD | `auth.uid() = user_id` |
| wishlist_items | SELECT/INSERT/DELETE | `auth.uid() = user_id` |
| testimonials | SELECT | `is_visible = true` |

**Note:** `site_settings`, `site_media`, `discounts`, `coffee_beans`, `flavor_bases`, `flavor_options` RLS policies not shown in provided SQL but admin client bypasses RLS for writes.

## Recommendations

1. Implement DB role system instead of hardcoded admin email
2. Add rate limiting to `/api/contact`, `/api/checkout`, and `/api/discounts/validate`
3. Add 2FA to admin account
4. Move `ADMIN_EMAIL` to environment variable
5. Implement server-side session invalidation on password change
6. Add CSRF protection to state-changing API routes
# LINE COFFEE AUDIT â€” PART 4

---

# PHASE 15 â€” FEATURE INVENTORY

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

# PHASE 16 â€” REBUILD SPECIFICATION

## LINE COFFEE REBUILD BLUEPRINT

---

### What MUST Remain Identical

1. **Brand colors** â€” #522500 (primary brown), #FFDCC2 (primary beige), gold palette (#B6885E, #D6A373, #c8941a)
2. **Typography** â€” Playfair Display for English headings, Cairo for Arabic
3. **Bilingual Arabic/English support** â€” RTL Arabic switching, bilingual DB fields, `t(en, ar)` pattern
4. **WhatsApp fulfillment flow** â€” Egyptian market depends on WhatsApp; the pre-filled Arabic message format is business-critical
5. **Three weight variants** â€” 250g / 500g / 1kg with individual pricing
6. **Custom Espresso Builder** â€” bean selection, ratio setting, price formula, AI recommendation profiles
7. **Custom Flavor Builder** â€” base + additions structure, pricing formula, base-compatibility filtering
8. **Order number format** â€” `INITIALS-PHONE3-SEQUENCE` (e.g., MS-171-0042) â€” customers may quote these
9. **Server-side price revalidation** â€” prices must NEVER be trusted from client; always recomputed from DB
10. **Optimistic stock locking** â€” concurrent checkout protection via conditional UPDATE
11. **Order status flow** â€” pending â†’ confirmed â†’ preparing â†’ shipped â†’ delivered â†’ cancelled
12. **Homepage section CMS** â€” admins must be able to reorder and hide sections without code changes
13. **Admin authentication** â€” single admin account (migrate to role system but preserve single-admin UX)
14. **Payment methods** â€” cod / electronic_wallet / instapay (no card gateway)
15. **Free shipping logic** â€” threshold-based, configurable, date-windowed

---

### What SHOULD Remain Identical

1. Dark premium aesthetic â€” near-black backgrounds, gold accents, warm tones
2. Product card structure â€” image, bilingual name, size/price preview, add-to-cart
3. Cart drawer pattern â€” slide-in from side, item list, quantity controls, checkout CTA
4. Wishlist drawer pattern
5. Glass morphism header with transparency-on-hero behavior
6. Order tracking by order number (public, no auth required)
7. Announcement bar with multiple rule types
8. Media Studio concept â€” per-section image management with content overlays
9. Visual effects system â€” CSS filter presets on images
10. Discount code system with assigned_emails restriction
11. Testimonials system with admin approval flow
12. Blog with bilingual content
13. Contact form submission to DB
14. Telegram notification on new order
15. Admin overview dashboard with sales chart, recent orders, top products

---

### What MAY Be Improved

1. Search â€” replace client-side loading of all products with server-side search (Supabase full-text or Algolia)
2. Checkout â€” add guest checkout option
3. Email notifications â€” add transactional email for order confirmation (Resend, SendGrid, Mailgun)
4. Blog editor â€” add rich text editor (Tiptap, Lexical) to replace plain text
5. Image upload â€” replace URL-based uploads with better UX (drag-drop with preview)
6. Analytics â€” replace/supplement Vercel Analytics with more detailed admin analytics
7. WhatsApp notifications â€” replace CallMeBot with official WhatsApp Business API
8. Product import/export â€” CSV upload for bulk product management

---

### What SHOULD Be Redesigned

1. **Admin authentication** â€” replace single hardcoded email with proper role column in profiles table
2. **Cart schema** â€” consolidate to single clean schema; remove `client_item_id` / `unit_price` dual-purpose confusion
3. **Type definitions** â€” merge `lib/types.ts` and `lib/types/database.ts` into single source of truth
4. **Currency** â€” fix `DEFAULT 'SAR'` on orders table to `DEFAULT 'EGP'`
5. **Discount field deduplication** â€” remove duplicate `discount` and `discount_amount` columns; pick one
6. **SQL migrations** â€” consolidate overlapping migration files into single canonical schema
7. **Order creation flow** â€” move WhatsApp message building to a separate service module for testability
8. **Error handling** â€” standardize error response format across all API routes

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
Backend:     Node.js (Fastify or Hono) â€” separate from frontend
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

1. **Role-based access** â€” `profiles.role` determines access, not hardcoded email
2. **Route middleware** â€” check role in Next.js middleware or layout component
3. **Audit log** â€” log all admin mutations (product changes, order status changes) to `admin_audit_log` table
4. **Real-time order alerts** â€” Supabase Realtime subscription to new orders instead of 60-second polling
5. **Admin layout** â€” keep 215px fixed sidebar + top bar pattern (it works well)
6. **Mobile admin** â€” horizontal scrolling tab strip (current approach is adequate)

---

### Recommended CMS Architecture

1. **Keep site_settings key-value store** â€” flexible and admin-friendly
2. **Add content versioning** â€” `site_settings_history` table for rollback capability
3. **Rich text for blog** â€” store as JSON (Tiptap/ProseMirror format) not plain text
4. **Image management** â€” centralize all media into single `site_media` table with clear section mapping
5. **Section content schema** â€” keep `SectionBuilderContent` JSON structure (it is well-designed)
6. **Preview mode** â€” allow admin to preview site settings changes before publishing

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
- `PricingService` â€” product pricing, discount calculation, shipping
- `InventoryService` â€” stock checking, deduction, restoration
- `OrderService` â€” order creation, number generation, status management
- `NotificationService` â€” WhatsApp URL, Telegram, email
- `CustomBuilderService` â€” espresso/flavor validation and pricing

---

## Final Notes for Rebuild Agent

### Critical Implementation Details

1. The `buildWhatsAppMessage()` function outputs Arabic text â€” this is what the customer sends to the business. The message format is business-critical and should be preserved exactly.

2. The espresso builder pricing formula: `roundCleanPrice(weightedAvgCostPerKg Ã— sizeKg)` where `roundCleanPrice = Math.round(value / 5) * 5`. This rounding-to-5 is important for pricing that looks clean in EGP.

3. The flavor builder pricing: `roundCleanPrice((basePrice + sum(flavors)) Ã— sizeKg)`.

4. Custom item stock is tracked in **fractional kg**, not units. 250g = 0.25 kg consumed from bean/flavor inventory.

5. Order number format: `[INITIALS]-[LAST3DIGITS_OF_PHONE]-[SEQUENCE]`. Initials taken from first+last name (first character of each). Sequence = total order count + 1, zero-padded to 4 digits.

6. The site operates in Egypt. Currency is EGP. Phone format: +20XXXXXXXXXX.

7. Language is stored in `localStorage` as key `line-coffee-language` with values `'ar'` or `'en'`. Direction is set on `<html>` element immediately on page load via inline script (before hydration).

8. The admin dashboard polls for pending orders every 60 seconds via `setInterval` â€” replace with Supabase Realtime in the rebuild.

9. All public settings have hardcoded fallbacks â€” the site works even if the database is completely empty, falling back to the code-level defaults in `lib/config/site.ts`.

10. The espresso intelligence scoring system uses text pattern matching (regex against bean names and descriptions) to derive sensory metrics when explicit metrics are not stored. This is a fallback system â€” ideally explicit metrics should be entered for all beans.
