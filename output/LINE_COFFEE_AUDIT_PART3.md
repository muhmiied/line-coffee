# LINE COFFEE AUDIT — PART 3

---

# PHASE 10 — CMS AUDIT

## Content Ownership Model

LINE COFFEE has a hybrid content model:
1. **Database-driven dynamic content** — products, categories, orders, blog posts, testimonials, discounts
2. **Key-value settings store** — `site_settings` table with structured public/private settings
3. **Media items table** — `site_media` (banners) table for section images and their content overlays
4. **Hardcoded fallbacks** — all public settings have code-level fallbacks in `lib/config/site.ts`

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
  → /api/settings/public (GET, no auth)
  → buildPublicSettings() (merges DB values with hardcoded fallbacks)
  → usePublicSettings() hook (client) or getPublicSettings() (server)
  → Footer, Header, Checkout, Contact components
```

## Section Visibility Controls

Homepage sections can be individually:
1. **Hidden** — `homepage_section_visibility[key] = false` → section not rendered
2. **Reordered** — `homepage_section_order` array determines render sequence

Changes take effect on next page load (server-side rendering at request time).

---

# PHASE 11 — DATABASE AUDIT

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
**Trigger:** `on_auth_user_created` → auto-inserts profile row on user signup  

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
**RLS:** Public SELECT (all visible to anyone — pricing is public)  

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
| currency | TEXT | DEFAULT 'SAR' | Note: Should be 'EGP' — appears to be legacy default |
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
| total_price | DECIMAL(10,2) | NOT NULL | unit_price × quantity |
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

**Unique:** (user_id, product_id, size) — original schema; updated schema may use (user_id, client_item_id)  
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
| rating | INTEGER | CHECK (1–5) DEFAULT 5 | |
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
`bitterness, body, acidity, crema, strength` (1–5 scale)

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
| value | DECIMAL | Percent (0–100) or EGP amount |
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
| overlay_opacity | DECIMAL | 0–0.85 |
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
  ← profiles (1:1)
  ← addresses (1:many)
  ← cart_items (1:many)
  ← wishlist_items (1:many)
  ← orders (1:many)

categories
  ← products (1:many)

products
  ← product_sizes (1:many, max 3)
  ← cart_items (1:many, nullable)
  ← wishlist_items (1:many)
  ← order_items (1:many, nullable for custom)

orders
  ← order_items (1:many)

flavor_bases
  ← flavor_options (1:many)

site_settings (key-value, no FK)
site_media (no FK, uses section_key string)
testimonials (standalone)
coffee_beans (standalone)
discounts (standalone)
blog_posts (standalone)
contact_messages (standalone)
```

## Database Triggers

1. `on_auth_user_created` — AFTER INSERT on `auth.users` → creates profile row
2. `update_profiles_updated_at` — BEFORE UPDATE on profiles → sets updated_at = NOW()
3. `update_categories_updated_at` — same for categories
4. `update_products_updated_at` — same for products
5. `update_addresses_updated_at` — same for addresses
6. `update_orders_updated_at` — same for orders
7. `update_cart_items_updated_at` — same for cart_items
8. `set_order_number` — BEFORE INSERT on orders WHEN order_number IS NULL → generates order number

---

# PHASE 12 — API AUDIT

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

# PHASE 13 — CODE ARCHITECTURE AUDIT

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
- No explicit route groups defined — simple file-based structure
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

- **Provider:** Supabase Auth (email/password only — no OAuth visible)
- **Session storage:** httpOnly cookies (Supabase SSR package `@supabase/ssr`)
- **Server client:** `lib/supabase/server.ts` — `createServerClient()` using cookie store
- **Client:** `lib/supabase/client.ts` — `createBrowserClient()`
- **Admin/Service role:** `lib/supabase/admin.ts` — `createClient()` with service role key, bypasses RLS
- **Auth state:** `getInitialAuthState()` in `lib/auth/session.ts` — SSR fetch of user + profile
- **Admin check:** `isAdminEmail(email)` — compares to hardcoded `ADMIN_EMAIL` constant
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
  ↓ page request
Next.js Server (SSR)
  → fetches public settings (Supabase admin client)
  → renders page with initial state
  ↓ HTML + JS bundle
Browser (hydration)
  → AuthProvider: validates session, loads profile
  → LanguageProvider: reads localStorage language
  → useCartStore: rehydrates from localStorage, syncs ownerId
  ↓ user interaction
Browser
  → useCartStore.addItem() → optimistic local update + POST /api/cart
  → useWishlistStore.toggle() → optimistic local + POST /api/wishlist
  → /checkout → POST /api/checkout → Supabase writes → WhatsApp URL
```

---

# PHASE 14 — SECURITY AUDIT

## Authentication

**Supabase Auth** manages sessions via httpOnly cookies. Secure by default. No JWT stored in localStorage.

**Vulnerability:** Password reset flow relies on Supabase email delivery — if SMTP not configured, users cannot reset passwords.

## Authorization

**Admin Protection:**
- ALL admin API routes check `isAdminEmail(user?.email)` using the hardcoded `ADMIN_EMAIL` constant
- This is a single-email check, not a role system
- **Critical Risk:** If the admin email account is compromised, attacker has full admin access with no secondary factor
- **Risk:** Admin email is hardcoded in source code — if the repo is ever public, the admin identity is exposed

**User Protection:**
- RLS policies ensure users cannot access other users' orders, cart, wishlist, or profile
- Orders INSERT policy allows `user_id IS NULL` (supports guest orders — but checkout requires auth, so this may be a residual policy)

## Pricing Security

The checkout route (`POST /api/checkout`) recomputes ALL prices server-side:
- Unit prices fetched directly from `product_sizes.price` — client-submitted prices are ignored
- Custom item prices recomputed from DB bean/flavor prices — client prices discarded
- Discount amounts recomputed from DB discount rules — client amounts discarded
- Total = server-computed subtotal + server-computed shipping - server-computed discount

**This is correctly implemented.** Client cannot submit false prices.

## Order Security

- Stock validated with optimistic locking (race condition protection)
- Custom stock deducted atomically via RPC
- Discount usage limits enforced atomically
- Order number uniqueness checked before insert

## Data Exposure Risks

1. **`ADMIN_EMAIL` in source code** — if repository becomes public, admin email is exposed
2. **Admin API route at `/api/admin/orders`** returns full order list including customer names, phones, addresses — only protected by email check, no rate limiting
3. **`/api/products?limit=120`** loads all products to browser for search — acceptable for small catalog but would be a problem at scale
4. **Cart sync API** (`/api/cart`) stores client-submitted `unit_price` — this is stored but NOT used for actual order pricing. Could be confusing but not exploitable.
5. **`contact_messages` table** — contact form submissions are stored; no rate limiting visible on `POST /api/contact`

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
