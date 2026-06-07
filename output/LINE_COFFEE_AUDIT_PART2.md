# LINE COFFEE AUDIT — PART 2

---

# PHASE 5 — CONTENT AUDIT

## Writing Style

Bilingual across every user-facing surface. Arabic is primary (RTL, Cairo font). English is parallel (LTR, Playfair Display for headings, sans for body). All UI strings use the pattern `t('English text', 'النص العربي')`.

## Tone of Voice

**Arabic:** Warm, premium, conversational. Uses first-person plural ("قهوتنا", "نحمصها"). Poetic but not flowery. Emotionally resonant phrases: "طقوس يومية دافئة", "رفاهية هادئة", "نهاية لا تُنسى".

**English:** Elegant, minimal. Brand copywriting style. Short declarative sentences. "Coffee Crafted for Quiet Luxury." "Selected beans, slow-roasted for depth, warmth, and a finish that lingers beautifully."

## Hero Copy Style

- **Structure:** Eyebrow label (small caps, tracking-wide, gold) → Large serif headline → Subtitle paragraph → CTA button → Optional stat row
- **Arabic eyebrow example:** "تحميصات مميزة"
- **English eyebrow example:** "Signature Roasts"
- **Pattern:** aspirational noun phrase (not imperative) + sensory/descriptive subtitle

## About Page Style

- **Structure:** Narrative paragraphs with founder name (Sayed Kamal) + years (28, 2015) + brand origin (Bon Al Orouba) → Feature cards → Values cards
- **Tone:** Authentic, heritage, trust-building
- **Arabic body example:** "بدأت لاين كوفي عام 2015 كمشروع عائلي لتوريد القهوة بقيادة سيد كمال، بعد خبرة 28 عامًا..."
- **English body example:** "Line Coffee began in 2015 as a family supply business..."

## Product Copy Style

- **Name:** Bilingual (name_en / name_ar)
- **Short description:** 1–2 sentences, sensory
- **Full description:** Origin, roast notes, brewing suggestions
- **Flavor notes:** Array of single-word descriptors (e.g., "chocolate", "caramel", "floral")
- **Roast level:** light / medium / dark / espresso

## Bean Description Style (Espresso Builder)

Each bean has Arabic and English description pairs. Pattern:
- Arabic: "[flavor profile] و [finish]" e.g., "توازن أنيق بين الكراميل والفاكهة الخفيفة"
- English: "[body characteristic] with [flavor note]" e.g., "Elegant caramel balance with light fruit notes."

## Blog Style

- **Title:** Informative or curiosity-driven
- **Structure:** Title + cover image + date + body
- **Tone:** Educational, brand-adjacent
- **CMS:** Admin blog page — content model not visible (likely plain text or minimal rich text)

## Footer Style

- **Brand blurb:** 1–2 sentence mission statement in both languages
- **Arabic example:** "قهوة طازجة التحميص لطقوس يومية دافئة، من توليفات تركي إلى توليفات إسبريسو والنكهات المميزة."
- **Section headers:** Gold, small, tracking-wide
- **Links:** Subdued warm tone, hover to gold

## Contact Page Style

- **Heading:** "Let Us Help You Choose" / "دعنا نساعدك في الاختيار"
- **Subtitle:** Helpful, service-oriented: "Contact us and we will guide you to the right coffee."
- **Form labels:** Simple, bilingual

---

# PHASE 6 — PRODUCT SYSTEM AUDIT

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
| turkish-blends | Turkish Blends | توليفات تركي | Pre-ground Turkish coffee mixes |
| espresso-blends | Espresso Blends | توليفات إسبريسو | Espresso-style blended products |
| easy-coffee | Easy Coffee | إيزي كوفي | Instant/easy preparation |
| flavor-coffee | Flavor Coffee | قهوة بالنكهات | Pre-flavored coffee products |
| make-your-espresso | Make Your Espresso | اصنع إسبريسو خاصتك | Custom espresso builder category |
| make-your-flavor | Make Your Flavor | اصنع نكهتك | Custom flavor builder category |

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

**Constraint:** UNIQUE(product_id, size) — one price row per weight per product.

## Pricing Logic

- Price shown = `product_sizes.price` for selected size
- Discount shown = `product_sizes.compare_at_price` (strikethrough)
- No percentage logic on product level — discounts are handled via discount codes at checkout
- Custom item pricing: formula-based (see Phase 7)

## Inventory Logic

### Regular Products
- `stock_quantity` is decremented at checkout via optimistic-lock UPDATE:
  ```sql
  UPDATE products SET stock_quantity = stock_quantity - qty
  WHERE id = ? AND stock_quantity = [read_value] AND is_manually_out_of_stock = false
  ```
- If 0 rows updated → race condition detected → 409 Conflict returned
- `is_manually_out_of_stock = true` acts as immediate OOS regardless of stock_quantity
- `low_stock_threshold`: if `stock_quantity <= low_stock_threshold`, display "Low Stock" warning on product

### Custom Items (Beans/Flavors)
- `coffee_beans.stock_quantity` and `flavor_options.stock_quantity` are in KG (fractional)
- Required kg = `packageSizeToKg(size) × quantity`
- 250g = 0.25 kg, 500g = 0.5 kg, 1kg = 1.0 kg
- Deduction via `deduct_checkout_stock` Supabase RPC (requires migration 016)
- Error codes: `INSUFFICIENT_BEAN_STOCK`, `INSUFFICIENT_FLAVOR_STOCK`

## Product Relationships

- `products.category_id` → `categories.id` (many-to-one)
- `product_sizes.product_id` → `products.id` (many-to-many: one product, many sizes)
- `order_items.product_id` → `products.id` (nullable — custom items have null product_id)
- `cart_items.product_id` → `products.id` (nullable in updated schema)

## Product Visibility

Products appear publicly when:
1. `is_visible = true`
2. Category `is_visible = true` (for category browsing)
3. At least one `product_sizes.is_available = true`

Products flagged:
- `is_featured = true` → Homepage featured section
- `is_best_seller = true` → Best Sellers section
- `is_new = true` → "New" badge on card

---

# PHASE 7 — CUSTOM BUILDERS AUDIT

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
| Bean Ratios | Slider/number input | 0–100% per bean (must total 100%) |
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
| balanced | 3.4 | 3.5 | 2.8 | body×1.2, crema×1, acidity×0.8 |
| crema | 4.7 | 4.2 | 2.0 | crema×1.8, body×1.2, strength×1.1 |
| chocolate-nutty | 3.4 | 4.0 | 2.2 | chocolate×1.7, nutty×1.4, body×1.1 |
| bright | 2.8 | 3.0 | 4.4 | acidity×1.8, bitterness×1.0 |
| strong | 4.0 | 4.6 | 1.8 | strength×1.8, body×1.4, crema×1.2 |

**Bean Metric Derivation:**
Each bean has 7 metrics: crema, body, acidity, bitterness, strength, chocolate, nutty.
- If the bean row has explicit values → use those
- Otherwise → derived from text pattern matching against bean ID + origin + description:
  - Robusta beans: higher crema (4.4–4.8), body (4.5), strength (4.4–4.8)
  - Ethiopian/Kenyan/Tanzanian/bright keywords → acidity 4.3
  - Brazil/Colombia/India/chocolate keywords → chocolate 4.5, body 4
  - Nutty keywords → nutty 4.4

**Scoring:**
```
score = 10 - weighted_distance_from_target + arabicaBonus + robustaBonus - budgetPenalty
```
- `arabicaBonus = 0.35` for arabica beans in 'bright' or 'balanced' profiles
- `robustaBonus = 0.55` for robusta in 'crema' or 'strong'
- `budgetPenalty` scales with price range if budgetAware = true

**Ratio Assignment:**
- Top 2–4 beans selected by score
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
unitPrice = roundCleanPrice(weightedAverageRawCostPerKg × sizeKg)
roundCleanPrice = Math.round(value / 5) * 5
```
Example: 3 beans at 50%/30%/20% with prices 600/700/400 per kg, 500g size:
- Raw = 0.50×600 + 0.30×700 + 0.20×400 = 300+210+80 = 590/kg
- Price = round(590 × 0.5 / 5) × 5 = round(59) × 5 = 295 EGP

### Validation Rules
- At checkout: bean IDs validated against DB `coffee_beans` table
- Each bean checked: `is_active = true`, `is_manually_out_of_stock = false`, `stock_quantity >= required_kg`
- Ratios must sum to ~100% (±0.2% tolerance)
- `type: 'espresso-blend'` must be present in customizations object

### Order Storage
Custom items stored in `order_items` with:
- `product_id = null`
- `product_name = "Custom Espresso Blend"` (or localized)
- `size = '250g'|'500g'|'1kg'`
- `customizations = { type: 'espresso-blend', beans: [{ id, name_en, name_ar, percent }] }`
- Price is server-recomputed from DB bean prices — client price is discarded

### Text Flow Diagram

```
USER SELECTS PROFILE → [AI scores all beans] → RECOMMENDATION RENDERED
                                                        ↓
USER CAN OVERRIDE → [ADD/REMOVE BEANS] → [ADJUST RATIOS]
                                                        ↓
                            [REAL-TIME METRICS CHART UPDATES]
                                                        ↓
                            [ADVICE MESSAGE UPDATES]
                                                        ↓
USER SELECTS WEIGHT → [PRICE CALCULATED] → ADD TO CART
                                                        ↓
                    [customizations object saved to cart]
                                                        ↓
CHECKOUT → [SERVER validates against DB] → [STOCK DEDUCTED IN KG] → ORDER CREATED
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
| turkish-coffee | Turkish Coffee | القهوة التركية | 400 EGP/kg | Sealed Turkish coffee base |
| coffee-mix | Coffee Mix | كوفي ميكس | 430 EGP/kg | Fine instant coffee with Polish creamer |
| cappuccino | Cappuccino | كابتشينو | 530 EGP/kg | Cafe-style instant with foam |
| hot-chocolate | Hot Chocolate | هوت شوكليت | 430 EGP/kg | Warm cocoa base |

### Flavor Additions (30+ options)

Grouped into: Sweets, Nuts, Fruits, Special

| Category | Examples | Standard Price | Chunks Price |
|---|---|---|---|
| Sweets | Chocolate, Caramel, Vanilla, Lotus, Oreo, Cinnabon | 50 EGP/kg | 70 EGP/kg |
| Nuts | Hazelnut, Almond, Pistachio, Hazelnut Chunks | 50–70 EGP/kg | — |
| Fruits | Strawberry, Banana, Mango, Peach, Cherry, Blueberry, Apple, Grape, etc. | 50 EGP/kg | — |
| Special | Coconut, Mocha, Pina Colada, Apple Hookah, Grape Hookah, Hot Cider | 50 EGP/kg | — |

Some flavors restricted by base:
- Turkish + Coffee Mix only: Apple, Grape, Orange, Watermelon, Guava, Pineapple
- Turkish only: Apple Hookah, Grape Hookah, Hot Cider

### Pricing Formula

```
baseRaw = base.price (EGP/kg)
additionsRaw = sum of each selected flavor.price_delta (EGP/kg)
rawPerKg = baseRaw + additionsRaw
unitPrice = roundCleanPrice(rawPerKg × sizeKg)
roundCleanPrice = Math.round(value / 5) * 5
```

Example: Cappuccino base (530) + Chocolate (50) + Hazelnut (50) = 630/kg, 250g:
- 630 × 0.25 = 157.5 → rounded to 155 or 160 EGP

### Validation at Checkout

- `type: 'flavor'` in customizations
- base ID must match `flavor_bases.id` in DB, `is_active = true`
- Each flavor option: `flavor_options.id` in DB, `is_active = true`, `stock_quantity >= required_kg`
- Required kg = `packageSizeToKg(size) × quantity`
- `assigned_emails` check on flavor_bases (not in current schema but planned)

### Order Storage
- `product_id = null`
- `customizations = { type: 'flavor', base: { id, name_en, name_ar }, flavors: [{ id }] }`
- Price server-recomputed from DB

### Text Flow Diagram

```
USER SELECTS BASE → [FLAVOR LIST FILTERED BY BASE] → USER SELECTS FLAVORS
                                                              ↓
                                        [INCOMPATIBLE FLAVORS GREYED OUT]
                                                              ↓
                                        USER SELECTS WEIGHT → [PRICE SHOWN]
                                                              ↓
                                        ADD TO CART → [customizations saved]
                                                              ↓
                CHECKOUT → [SERVER validates base + flavors against DB] → ORDER CREATED
```

---

# PHASE 8 — ORDER SYSTEM AUDIT

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
- `addItem` → `POST /api/cart` with product ID, size, quantity, and item metadata
- `updateQuantity` → `PATCH /api/cart/[itemId]`
- `removeItem` → `DELETE /api/cart/[itemId]`
- `clearCart` → `DELETE /api/cart`
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

## Order Creation — Full Step-by-Step

**Step 1: Auth Check**
- `supabase.auth.getUser()` → must have user
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
- Parse `quantity` (integer 1–99)
- Parse `size` (string, max 40 chars)
- If `product_id` is UUID:
  - Look up in catalogProducts
  - Check `is_visible = true`
  - Check selected size exists and `is_available = true`
  - Check `is_manually_out_of_stock = false`
  - Check `stock_quantity >= total_requested` (across all cart lines for same product)
  - Get server-side `unit_price` from `product_sizes.price`
  - Compute `total_price = unit_price × quantity`
- If `product_id` is NOT a UUID (custom item):
  - Call `validateAndPriceCustomItem()` → validates beans or flavors from DB
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
If percentage: `discountAmount = subtotal × value / 100`
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

**Step 12: Stock Deduction — Regular Products**
For each catalogProduct in the order:
```sql
UPDATE products
SET stock_quantity = stock_quantity - qty
WHERE id = ? AND stock_quantity = [read_value] AND is_manually_out_of_stock = false
```
Optimistic lock: if 0 rows updated → race condition → order deleted → 409 returned

**Step 13: Stock Deduction — Custom Items**
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
pending → confirmed → preparing (processing) → shipped → delivered
                ↘ cancelled
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
🛒 *طلب جديد - Line Coffee*
─────────────────────────
📦 رقم الطلب: *[ORDER_NUMBER]*

👤 *بيانات العميل*
الاسم: [NAME]
الموبايل: [PHONE]
الإيميل: [EMAIL]
العنوان: [ADDRESS, CITY]

🛍️ *المنتجات*
1. [PRODUCT NAME] - [SIZE]
   الكمية: [QTY]  |  السعر: [PRICE] ج.م  |  الإجمالي: [TOTAL] ج.م

💰 *ملخص الطلب*
المجموع الفرعي: [SUBTOTAL] ج.م
الشحن: [SHIPPING] ج.م / توصيل مجاني
الخصم ([CODE]): -[AMOUNT] ج.م
*الإجمالي النهائي: [TOTAL] ج.م*

💳 طريقة الدفع: [PAYMENT_LABEL]
📝 ملاحظات: [NOTES]
```

## Payment Methods

| Code | Arabic Label | English Label |
|---|---|---|
| cod | الدفع عند الاستلام | Cash on Delivery |
| electronic_wallet | محفظة إلكترونية | Electronic Wallet |
| instapay | إنستاباي | InstaPay |

---

# PHASE 9 — DASHBOARD AUDIT

## Admin Authentication

- Admin is determined exclusively by email comparison: `user.email === ADMIN_EMAIL`
- `ADMIN_EMAIL = 'm.sayed@abu-elhassan.com'` hardcoded in `lib/config/site.ts`
- All admin API routes call `isAdminEmail(user?.email)` → returns 403 if false
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
| /dashboard/admin | Dashboard | نظرة عامة | LayoutDashboard |
| /dashboard/admin/orders | Orders | الطلبات | Package |
| /dashboard/admin/products | Products | المنتجات | ShoppingBag |
| /dashboard/admin/categories | Categories | الفئات | Tag |
| /dashboard/admin/coffee-beans | Coffee Beans | أنواع القهوة | Coffee |
| /dashboard/admin/flavors | Flavors | النكهات | Sparkles |
| /dashboard/admin/customers | Customers | العملاء | Users |
| /dashboard/admin/contact-messages | Contact | رسائل التواصل | MessageSquare |
| /dashboard/admin/reviews | Reviews | المراجعات | Star |
| /dashboard/admin/discounts | Discounts | الخصومات | Percent |
| /dashboard/admin/blog | Blog | المدونة | FileText |
| /dashboard/admin/banners | Media | الوسائط | Image |
| /dashboard/admin/settings | Settings | الإعدادات | Settings |

## Dashboard Overview (`/dashboard/admin`)

**Data source:** `GET /api/admin/stats`

**Stat Cards:**
- Total Sales (EGP) — delivered revenue only (confirmed/preparing/shipped/delivered statuses)
- Active Orders card — breakdown: Confirmed / Preparing / Shipped counts + amounts
- Total Customers count
- Cancelled Orders count

**Sales Chart:** Area chart, last 30 days, daily sales data (Recharts AreaChart)

**Recent Orders:** List of 5 most recent orders with status badge and total

**Categories Grid:** Category images with product counts

**Customer Donut Chart:** New vs returning customers this month (Recharts PieChart)

**Top Products:** Ranked by units sold in last 30 days with image, name, sold count, price

**Recent Reviews:** 3 review cards with star rating, customer name, excerpt

## Orders Page (`/dashboard/admin/orders`)

**Data source:** `GET /api/admin/orders` → returns all orders with items, sorted by created_at DESC

**Features:**
- Full orders table: order number, customer name, date, status badge, total
- Status filter chips
- Search by order number or customer name
- Click row → order detail modal or inline expansion
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
- Optional sensory metrics: bitterness, body, acidity, crema, strength (1–5 scale)

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
**Data source:** `GET /api/admin/reviews` → reads `testimonials` table

## Discounts (`/dashboard/admin/discounts`)

**Purpose:** Create and manage discount codes

**Fields per discount:**
- `code` (TEXT UNIQUE, stored UPPERCASE)
- `type` ('percentage' | 'fixed')
- `value` (number — percent or EGP amount)
- `min_order` (minimum subtotal in EGP, 0 = no minimum)
- `max_uses` (NULL = unlimited)
- `uses` (current use count)
- `expires_at` (TIMESTAMPTZ, NULL = never expires)
- `is_active` (BOOLEAN)
- `assigned_emails` (TEXT[] — if non-empty, only these email addresses can use it)

**Data source:** `GET/POST /api/admin/discounts`, `DELETE /api/admin/discounts/[id]`

## Blog (`/dashboard/admin/blog`)

**Purpose:** Create and manage blog posts

**Fields:** Title (bilingual), slug, content, cover image, published status, published_at date

**Data source:** `GET/POST /api/admin/blog`, `PATCH/DELETE /api/admin/blog/[postId]`

## Media/Banners (`/dashboard/admin/banners`)

**Purpose:** Upload and manage images for all website sections (Media Studio)

**Section types covered:**
- `hero` — Homepage hero slides (supports multiple slides)
- `about_top` — About page top banner
- `about_lower` / `story` — Homepage story section / About story image
- `about_story` — About page story block
- `about_values` — About page values
- `products_banner` — Products page hero
- `blog_page` — Blog page hero
- `contact_page` — Contact page hero
- `track_page` — Track order page
- `categories` — Category card images
- `testimonials` — Testimonials section background
- `home_features` — Features pills section
- `best_sellers` — Best sellers section
- `home_blog` — Blog section on homepage
- `home_instagram` — Instagram section images
- `home_contact` — Contact section on homepage

**Per-image settings:**
- Image URL / upload to Supabase Storage (`line-coffee-media` bucket)
- Mobile image URL (separate for mobile)
- Overlay opacity (0–0.85)
- Object position (center/top/bottom/left/right)
- Alt text (bilingual)
- Content fields (title_en, title_ar, subtitle_en, subtitle_ar, button_text, button_link)
- Visual effects: overlay_color, gradient_type, blur, brightness, contrast, saturation, warmth, vignette, glow, grain
- 7 named visual presets: Luxury Dark, Warm Coffee, Golden Glow, Cinematic Brown, Elegant Matte, Soft Premium, Espresso Mood

**Upload restrictions:**
- Max size: 8 MB
- Allowed types: JPEG, PNG, WebP
- Minimum dimensions enforced per section (hero: 1920×900, banners: 1600×800)

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
