# Line Coffee Mobile App Readiness Technical Audit

تاريخ التقرير: 14 مايو 2026

المشروع: Line Coffee

المسار المحلي:

`D:\Graphic\LINE COFFEE\New folder\LINE COFFEE 1`

الغرض من التقرير:

تقييم جاهزية مشروع Line Coffee الحالي، وهو موقع ويب مبني غالبا بـ Next.js / React / TailwindCSS / Supabase، لكي يشارك نفس الباك إند وقاعدة البيانات ونظام المصادقة والطلبات مع تطبيق موبايل مستقبلي مبني بـ React Native + Expo.

ملاحظة مهمة:

هذا التقرير مبني على مراجعة قراءة فقط. لم يتم تعديل أي ملفات كود أثناء التدقيق.

---

## Executive Summary

مشروع Line Coffee الحالي فيه أساس جيد لمتجر إلكتروني: صفحات منتجات، Checkout، Dashboard للعميل، Admin Dashboard، Supabase Auth، وجداول منتجات وطلبات وسلة ومفضلة. لكن المشروع غير جاهز حاليا ليكون الباك إند المشترك لتطبيق React Native + Expo حقيقي.

السبب الرئيسي أن المنطق موزع بين أماكن كثيرة:

- Local browser stores للـ cart والـ wishlist.
- API routes في `app/api`.
- Services في `lib/services`.
- Server Actions في `lib/actions`.
- Direct Supabase calls من بعض مكونات الواجهة.
- SQL scripts و migrations غير متطابقة بالكامل.

أهم قرار قبل بدء تطبيق الموبايل:

لا تبدأ تطبيق الموبايل كـ production app الآن. الأفضل أولا تنظيف وتثبيت الباك إند وقاعدة البيانات وتوحيد checkout/order/cart/auth contracts، ثم بناء تطبيق Expo فوق API/DB contract ثابت.

---

## 1. Project Structure Audit

### Current Folder Structure

المجلدات الأساسية:

- `app/`
  يحتوي على Next.js App Router pages و API routes.

- `components/`
  يحتوي على مكونات الواجهة: layout، home sections، products، cart، wishlist، و UI components.

- `lib/`
  يحتوي على Supabase clients، auth helpers، actions، services، hooks، stores، config، types.

- `hooks/`
  يحتوي على hooks مكررة أو مشابهة لبعض hooks الموجودة داخل `components/ui`.

- `scripts/`
  يحتوي على SQL setup/seed scripts.

- `supabase/migrations/`
  يحتوي على migration رئيسي للـ ecommerce upgrade.

- `public/`
  يحتوي على fonts، brand assets، logos، placeholders، images.

- `styles/`
  يحتوي على ملف CSS قديم/غير مستخدم غالبا، لأن التطبيق يستورد `app/globals.css`.

### Main App Routes

Storefront routes:

- `app/page.tsx`
- `app/products/page.tsx`
- `app/products/[slug]/page.tsx`
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/checkout/page.tsx`
- `app/track/page.tsx`

Auth routes:

- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/error/page.tsx`

Customer dashboard:

- `app/dashboard/page.tsx`
- `app/dashboard/orders/page.tsx`
- `app/dashboard/profile/page.tsx`

Admin dashboard:

- `app/dashboard/admin/page.tsx`
- `app/dashboard/admin/orders/page.tsx`
- `app/dashboard/admin/products/page.tsx`
- `app/dashboard/admin/categories/page.tsx`
- `app/dashboard/admin/customers/page.tsx`
- `app/dashboard/admin/analytics/page.tsx`
- `app/dashboard/admin/reviews/page.tsx`
- `app/dashboard/admin/discounts/page.tsx`
- `app/dashboard/admin/blog/page.tsx`
- `app/dashboard/admin/banners/page.tsx`
- `app/dashboard/admin/settings/page.tsx`
- `app/dashboard/admin/coffee-beans/page.tsx`
- `app/dashboard/admin/flavors/page.tsx`

API routes:

- Public/customer APIs under `app/api/*`
- Admin APIs under `app/api/admin/*`

### Components Location

Reusable-ish components:

- `components/products/product-card.tsx`
- `components/products/product-detail.tsx`
- `components/cart/cart-drawer.tsx`
- `components/wishlist/wishlist-drawer.tsx`
- `components/layout/header.tsx`
- `components/layout/footer.tsx`

UI components:

- `components/ui/*`

Home sections:

- `components/home/*`

### Hooks, Utils, Types, Backend Helpers

Hooks:

- `lib/hooks/use-products.ts`
- `lib/hooks/use-cart.ts`
- `lib/hooks/use-wishlist.ts`
- `hooks/use-mobile.ts`
- `components/ui/use-mobile.tsx`
- `hooks/use-toast.ts`
- `components/ui/use-toast.ts`

Utils:

- `lib/utils.ts`

Types:

- `lib/types.ts`
- `lib/types/database.ts`

Supabase helpers:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `lib/supabase/proxy.ts`
- `lib/supabase/config.ts`

Services:

- `lib/services/products.service.ts`
- `lib/services/categories.service.ts`
- `lib/services/cart.service.ts`
- `lib/services/orders.service.ts`
- `lib/services/wishlist.service.ts`
- `lib/services/testimonials.service.ts`

Auth:

- `lib/auth/session.ts`
- `lib/auth/redirect.ts`
- `lib/actions/auth.actions.ts`

State:

- `lib/store/cart.ts`
- `lib/store/wishlist.ts`

### Structure Assessment

The structure is usable for a web app, but not clean enough yet for a shared web/mobile backend.

Main problems:

- Business logic is split between services, API routes, pages, and client stores.
- There are duplicate type definitions in `lib/types.ts` and `lib/types/database.ts`.
- There are duplicate hooks in `hooks/` and `components/ui/`.
- Some app pages are too large:
  - `app/products/page.tsx`
  - `app/checkout/page.tsx`
  - `app/dashboard/admin/products/page.tsx`
  - `app/dashboard/admin/categories/page.tsx`
  - `app/dashboard/admin/orders/page.tsx`
- SQL schema sources are inconsistent.

Recommendation:

Before mobile development, create one clear backend/data layer and one shared type source.

---

## 2. Frontend Audit

### UI Structure

The storefront has strong visual direction and a premium coffee brand feel. The site uses dark coffee tones, gold accents, large imagery, luxury cards, and bilingual UI.

Important files:

- `app/layout.tsx`
- `app/globals.css`
- `components/layout/header.tsx`
- `components/layout/sticky-top-bar.tsx`
- `components/home/*`
- `components/products/*`
- `app/products/page.tsx`
- `app/checkout/page.tsx`

### Reusable Components

Reusable within the web app:

- Product cards
- Product detail layout
- Home sections
- Admin cards/tables conceptually
- Cart and wishlist drawers for web

Reusable for mobile only at logic/model level:

- Product data shape
- Category data shape
- Order data shape
- Checkout concepts
- Brand assets
- Localization strings conceptually

Not directly reusable in React Native:

- `next/image`
- `next/link`
- `next/navigation`
- shadcn/Radix UI components
- Framer Motion web animations
- Browser-only drawers/modals
- Tailwind web class-based layouts
- DOM/localStorage/sessionStorage-specific code

### Components Too Tightly Coupled To Web

Examples:

- `components/layout/header.tsx`
  Uses Next navigation, DOM scroll, browser search dropdown, desktop/mobile web menu.

- `components/cart/cart-drawer.tsx`
  Uses web drawer, fixed positioning, local Zustand store.

- `components/wishlist/wishlist-drawer.tsx`
  Same issue as cart.

- `app/checkout/page.tsx`
  Mixes UI, form state, promo validation, local cart, totals, order payload, and WhatsApp opening.

- `app/products/page.tsx`
  Very large. Includes hardcoded products, filters, customization flows, DB fetch fallback, cart behavior, UI layout.

### Mobile Responsiveness Issues

The storefront is mostly responsive, but:

- Admin dashboard is desktop-first because of fixed sidebar in `app/dashboard/admin/layout.tsx`.
- Product and checkout pages are large and complex; future maintenance on mobile breakpoints will be harder.
- Header has hardcoded sample search products instead of real product search.
- Some linked customer dashboard pages do not exist:
  - `/dashboard/wishlist`
  - `/dashboard/addresses`
  - `/dashboard/settings`

### Typography / Theme / Colors

Brand instructions say:

- Primary Brown: `#522500`
- Primary Beige: `#FFDCC2`
- Arabic Font: `VLAX`
- English Font: `Playfair Display`

Current implementation:

- Uses Playfair Display.
- Uses Cairo for Arabic, not VLAX.
- Main CSS palette is more cinematic dark/gold:
  - `#0B0806`
  - `#120D09`
  - `#B6885E`
  - `#D6A373`
  - `#F5E6D8`

Assessment:

The visual result is premium, but it does not fully match the written brand rules. Decide whether the dark/gold luxury palette is now the real brand system, or revert closer to `#522500` / `#FFDCC2`.

---

## 3. Backend / API Audit

### How Frontend Talks To Backend

The project uses multiple data access patterns:

1. API routes:
   - `app/api/products/route.ts`
   - `app/api/categories/route.ts`
   - `app/api/cart/route.ts`
   - `app/api/orders/route.ts`
   - `app/api/checkout/route.ts`
   - `app/api/admin/*`

2. Service layer:
   - `lib/services/*`

3. Server actions:
   - `lib/actions/auth.actions.ts`

4. Direct Supabase calls from components/pages:
   - `components/home/featured-products.tsx`
   - `components/home/best-sellers-section.tsx`
   - `app/products/[slug]/page.tsx`

5. Browser local state:
   - `lib/store/cart.ts`
   - `lib/store/wishlist.ts`

### Important Backend Functions

Products:

- `getProducts`
- `getProductBySlug`
- `getProductById`
- `getFeaturedProducts`
- `getBestSellers`
- `getNewArrivals`
- `getRelatedProducts`
- `countProducts`

Categories:

- `getCategories`
- `getCategoryBySlug`
- `getCategoriesWithCount`

Cart:

- `getCartItems`
- `addToCart`
- `updateCartItem`
- `removeFromCart`
- `clearCart`
- `getCartCount`
- `getCartTotal`

Orders:

- `getUserOrders`
- `getOrderById`
- `getOrderByNumber`
- `createOrder`
- `cancelOrder`

Wishlist:

- `getWishlist`
- `addToWishlist`
- `removeFromWishlist`
- `isInWishlist`
- `toggleWishlist`
- `getWishlistCount`

Auth:

- `signUp`
- `signIn`
- `updateProfile`
- `forgotPassword`
- `resetPassword`
- `requireUser`
- `requireAdminUser`

Checkout:

- Main checkout logic is inside `app/api/checkout/route.ts`, not centralized in a service/RPC.

### Centralized Or Scattered?

Business logic is scattered.

Good:

- There is a service layer in `lib/services`.

Problem:

- Newer API routes often bypass services and directly use Supabase admin client.
- Checkout is separate from `orders.service.ts`.
- Web checkout calculates and submits totals from client-side code.
- Admin logic is duplicated across API routes.

### Backend Suitability For Mobile

Not yet suitable.

A mobile app needs a stable backend contract. Right now, the web app relies on a mix of browser-local state, Next.js-only server actions, cookie-based SSR Supabase clients, and direct API routes.

Recommendation:

Create one shared backend API/RPC layer for:

- Catalog read
- Product detail read
- Cart sync
- Wishlist sync
- Checkout
- Order history
- Order tracking
- Profile updates
- Payment status

---

## 4. Supabase / Database Audit

### Supabase Files

Supabase client/admin/config:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `lib/supabase/proxy.ts`
- `lib/supabase/config.ts`

Main migration:

- `supabase/migrations/001_ecommerce_upgrade.sql`

SQL scripts:

- `scripts/001_create_tables.sql`
- `scripts/002_enable_rls.sql`
- `scripts/003_create_triggers.sql`
- `scripts/004_orders.sql`
- `scripts/005_cart_wishlist.sql`
- `scripts/008_orders_products_dashboard.sql`
- `scripts/011_customization_options.sql`
- and seed scripts

### Tables Used By Code

Visible from code:

- `profiles`
- `categories`
- `products`
- `product_sizes`
- `orders`
- `order_items`
- `cart_items`
- `wishlist_items`
- `testimonials`
- `discounts`
- `banners`
- `blog_posts`
- `site_settings`
- `coffee_beans`
- `flavor_bases`
- `flavor_options`

### Major Schema Mismatches

Important mismatch 1:

`supabase/migrations/001_ecommerce_upgrade.sql` creates:

- `carts`
- `wishlists`

But the app code uses:

- `cart_items`
- `wishlist_items`

Important mismatch 2:

Migration creates:

- `blogs`

But app code uses:

- `blog_posts`

Important mismatch 3:

Discount logic uses:

- `assigned_emails`

But the visible main migration does not clearly define that column.

Important mismatch 4:

There are multiple order schemas across SQL files:

- `orders` with `shipping_cost`
- older script with `delivery_fee`
- older payment methods like `cash`, `mobile_wallet`, `bank_transfer`
- current code uses `cod`, `electronic_wallet`, `instapay`

### Products

Handled by:

- `products`
- `product_sizes`

Good:

- Products have multilingual names/descriptions.
- Product sizes are normalized.
- Visibility flags exist.
- Featured/best seller/new flags exist.

Issues:

- Stock is product-level, not size-level.
- No inventory movement/reservation history.
- Admin page uses price input fields mapped to `product_sizes`.
- Some SQL adds `price_250`, `price_500`, `price_1000`, which conflicts conceptually with normalized `product_sizes`.

### Users / Profiles

Handled by:

- Supabase Auth
- `profiles`

Issues:

- Signup captures fields that are not fully persisted by the main trigger.
- Profile page simulates saving instead of actually calling the API.
- No clear user role table.

### Cart

Two models exist:

- Browser local cart in `lib/store/cart.ts`.
- Server cart in `cart_items` through API/services.

Current storefront mainly uses local cart.

This is a major problem for a shared mobile/web system.

### Wishlist

Same issue:

- Browser local wishlist in `lib/store/wishlist.ts`.
- Server wishlist in `wishlist_items`.

### Orders / Order Items

Orders are stored in:

- `orders`
- `order_items`

There is also an `items` JSON snapshot on `orders`.

This can be useful, but should be intentional. Right now it increases duplication and possible inconsistency.

### Inventory

Inventory is weak.

Current checkout deducts stock in `app/api/checkout/route.ts` by reading stock, subtracting, and updating product quantity.

Problems:

- Not transactional.
- Race conditions possible.
- No size-specific stock.
- No reservation.
- No audit log.
- No rollback if stock update fails after order creation.

### Payments

Current fields:

- `payment_method`
- `payment_status`

Missing:

- `payments` table.
- Provider transaction ID.
- Webhook verification.
- Payment proof upload.
- Refund records.
- Idempotency key.

### RLS Assumptions

Some RLS policies are reasonable, but the overall state is inconsistent due to multiple SQL files.

Potential risks:

- Guest order read policies differ between scripts.
- Order item policies differ between scripts.
- Public discounts may reveal information.
- Admin operations rely heavily on service role API routes.
- `site_settings` needs careful RLS because it contains sensitive values like WhatsApp API keys.

### What May Break In Mobile

- Mobile may call tables that do not exist depending on which SQL file was actually run.
- Mobile cannot rely on web localStorage cart.
- Mobile cannot use Next.js server actions.
- Mobile cannot use SSR cookie session helpers.
- Checkout API currently expects client-calculated totals and local cart payloads.
- Guest checkout/order tracking needs a stable public-safe design.

---

## 5. Authentication Audit

### Current Login / Signup

Login:

- `app/auth/login/page.tsx`
- calls `signIn` from `lib/actions/auth.actions.ts`
- uses Supabase `signInWithPassword`

Signup:

- `app/auth/signup/page.tsx`
- calls `signUp` from `lib/actions/auth.actions.ts`
- uses Supabase `auth.signUp`
- sends metadata like first name, last name, phone, WhatsApp, address, location link

Callback:

- `app/auth/callback/route.ts`
- exchanges code for session

Session refresh:

- `proxy.ts`
- `lib/supabase/proxy.ts`

Protected routes:

- `app/dashboard/layout.tsx`
- `lib/auth/session.ts`

Admin protection:

- `lib/config/site.ts`
- hardcoded `ADMIN_EMAIL`

### Safety Assessment

Good:

- Uses Supabase Auth.
- Uses `auth.getUser()` to verify sessions.
- Redirect sanitization exists in `lib/auth/redirect.ts`.

Problems:

- Admin role is hardcoded by email.
- Profile metadata from signup is not fully stored.
- Profile update page is not actually updating the profile.
- The web auth flow is Next.js/server-action/cookie based, not portable to React Native.

### React Native Reuse

Can reuse:

- Same Supabase project.
- Same auth users.
- Same `profiles` table after cleanup.
- Same email/password auth.

Cannot directly reuse:

- `createBrowserClient` from `@supabase/ssr`.
- `createServerClient`.
- Next.js server actions.
- Cookie-based middleware/proxy.
- Next redirects.

Mobile needs:

- `@supabase/supabase-js`
- AsyncStorage session persistence.
- Expo deep links for auth callbacks.
- Mobile-specific auth provider.
- Shared profile API or direct RLS-safe Supabase calls.

---

## 6. Cart And Checkout Audit

### How Cart Works Now

Main storefront cart:

- `lib/store/cart.ts`
- Zustand persisted to browser localStorage as `line-coffee-cart`
- Used by:
  - `components/products/product-card.tsx`
  - `components/products/product-detail.tsx`
  - `components/cart/cart-drawer.tsx`
  - `app/checkout/page.tsx`

Server cart:

- `lib/services/cart.service.ts`
- `/api/cart`
- `/api/cart/[itemId]`

Problem:

There are two cart systems. The web storefront mostly uses local cart, while the API/server cart exists but is not the main checkout source.

### Checkout Flow

Checkout page:

- Reads local cart.
- Calculates subtotal/shipping/discount/total in browser.
- Validates promo through `/api/discounts/validate`.
- Sends full item and price payload to `/api/checkout`.

Checkout API:

- `app/api/checkout/route.ts`
- Allows guest checkout.
- Uses service role to insert into `orders`.
- Inserts `order_items`.
- Deducts product stock.
- Increments discount uses.
- Generates WhatsApp message URL.

### Critical Checkout Risk

The server trusts client-submitted:

- Product names.
- Unit prices.
- Item totals.
- Subtotal.
- Shipping cost.
- Discount amount.
- Final total.

This is unsafe for real ecommerce and very risky before adding mobile.

### Stock / Inventory

Stock reduction is not safe enough.

Current approach:

- Read `stock_quantity`.
- Calculate `newQty`.
- Update product.

Problems:

- Not atomic.
- No transaction.
- Race conditions possible.
- Overselling possible.
- No stock movement log.
- No per-size inventory.

### Guest Checkout

Guest checkout exists through `/api/checkout`.

Logged-in checkout also exists, but because it uses local cart, logged-in user cart is not reliably synced to Supabase.

### What Should Change Before Mobile

- Pick one cart source of truth.
- Recalculate all prices server-side.
- Revalidate discounts during checkout.
- Use database transaction/RPC/Edge Function for order creation.
- Add idempotency key.
- Add inventory movement/reservation logic.
- Make the mobile and web checkout call the same endpoint.

---

## 7. Orders And Dashboard Audit

### Order Storage

Orders are stored in:

- `orders`
- `order_items`

Important order fields:

- `order_number`
- `user_id`
- `customer_name`
- `customer_email`
- `customer_phone`
- `address`
- `subtotal`
- `shipping_cost`
- `discount_code`
- `discount_amount`
- `total`
- `shipping_address`
- `billing_address`
- `items`
- `payment_method`
- `payment_status`
- `status`
- `notes`

### Customer Order Display

Customer orders:

- `app/dashboard/orders/page.tsx`
- `/api/orders`
- `lib/services/orders.service.ts`

Tracking:

- `app/track/page.tsx`
- `/api/orders/track`

### Admin Order Display / Update

Admin order list:

- `app/dashboard/admin/orders/page.tsx`
- `app/api/admin/orders/route.ts`

Admin order update:

- `app/api/admin/orders/[orderId]/route.ts`

### Order Status Flow

Existing statuses:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

Issues:

- No `order_status_history` table.
- No transition validation.
- No timestamps like `confirmed_at`, `shipped_at`, `delivered_at` in the main active flow.
- Cancellation reason is appended to notes, not structured.

### Dashboard Logic Separation

Admin and customer logic are separated by route, but:

- Admin auth is hardcoded by email.
- Admin APIs duplicate guard logic.
- Admin routes use service role heavily.
- No shared admin authorization helper with DB roles.

### Mobile Screens That Can Reuse Data Model

After cleanup, mobile can reuse:

- My Orders
- Order Detail
- Track Order
- Reorder
- Support / WhatsApp contact
- Payment status display

---

## 8. Payments Audit

### Current Payment Methods

Defined in checkout UI:

- `cod`
- `electronic_wallet`
- `instapay`

### Current Payment Logic

The current logic is mostly labels and database status.

There is:

- No payment gateway.
- No payment transaction table.
- No proof upload.
- No payment webhook.
- No provider confirmation.
- No mobile payment flow.

### Payment Status

Exists as:

- `pending`
- `paid`
- `failed`
- `refunded`

But no strong lifecycle exists around it.

### Needed For Mobile Checkout

Before mobile app:

- Decide payment model.
- Add `payments` table.
- Add transaction IDs.
- Add payment proof support if using InstaPay/wallet manually.
- Add webhook/verification if using a gateway.
- Add admin-only payment status changes.
- Add idempotency to prevent duplicate orders/payment attempts.

---

## 9. Code Quality Audit

### Duplicated Logic

Examples:

- Types duplicated:
  - `lib/types.ts`
  - `lib/types/database.ts`

- Hooks duplicated:
  - `hooks/use-mobile.ts`
  - `components/ui/use-mobile.tsx`
  - `hooks/use-toast.ts`
  - `components/ui/use-toast.ts`

- Cart duplicated:
  - Local Zustand cart
  - Supabase `cart_items` API/service

- Wishlist duplicated:
  - Local Zustand wishlist
  - Supabase `wishlist_items` API/service

### Messy / Large Files

Largest/high-risk files:

- `app/products/page.tsx`
- `app/checkout/page.tsx`
- `components/layout/header.tsx`
- `app/dashboard/admin/products/page.tsx`
- `app/dashboard/admin/categories/page.tsx`
- `app/dashboard/admin/orders/page.tsx`
- `app/api/checkout/route.ts`

These files mix UI, data fetching, business logic, state management, and presentation.

### Unsafe Client-Side Logic

Important risks:

- Checkout sends trusted totals from browser.
- Promo code validation happens before checkout, but checkout should revalidate.
- Cart item prices come from local browser state.
- Product customization produces synthetic product IDs like `blend-*` and `flavor-*`.

### Hardcoded Values

Examples:

- `ADMIN_EMAIL` in `lib/config/site.ts`
- Contact phone/email in `lib/config/site.ts`
- Header search uses `sampleProducts` instead of real API.
- Profile page uses demo defaults like Ahmed/Hassan.
- Shipping threshold and cost hardcoded in multiple places.

### Weak TypeScript / Tooling

Problems:

- `next.config.mjs` has `typescript.ignoreBuildErrors: true`.
- `npm run lint` fails because `eslint` is not installed.
- Some code uses `as any`.
- Manual DB types are not generated from Supabase.

### Security Issues

Critical:

- `app/api/settings/announcement/route.ts` returns `wa_apikey` from public GET. This exposes a sensitive WhatsApp API key to all visitors.

High:

- Checkout trusts client totals.
- Admin role is hardcoded by email.
- Public tracking endpoint uses order number only. This may be acceptable for guest tracking, but order numbers should be unguessable and returned data should be minimal.

Medium:

- Admin flavor GET route appears to bypass admin guard.
- Service role is used widely in API routes.
- Discount visibility and assigned emails need careful RLS.

### Performance Problems

- Large client components.
- Product page fetches up to 300 products then filters client-side.
- Blog detail fetches all blog posts and filters client-side.
- Admin stats computes many aggregates in application code instead of DB views/RPC.
- No obvious caching strategy for catalog APIs.

---

## 10. Mobile App Readiness

### Is This Project Ready To Support React Native + Expo?

No.

It has useful foundations, but the backend/database/auth/order system is not stable or centralized enough yet.

### What Can Be Reused?

Can reuse:

- Supabase project.
- Product/category/order concepts.
- Brand assets.
- Some TypeScript interfaces after cleanup.
- Public catalog data model.
- Order status model after improving history.
- Profile model after schema cleanup.

### What Must Be Rewritten?

For mobile:

- All UI components.
- Navigation.
- Auth provider/session storage.
- Cart/wishlist UI.
- Checkout UI.
- Product list/detail UI.
- Admin dashboard should remain web-only for now.

For backend:

- Checkout flow must be rewritten.
- Cart synchronization should be redesigned.
- Payment handling should be added.
- Admin authorization should be redesigned.

### Backend Parts To Clean First

- Checkout API.
- Orders service.
- Cart/wishlist source of truth.
- Profile API.
- Admin guard helper.
- Settings/secrets separation.
- Discount validation and usage.

### Database Parts To Fix First

- One official migration path.
- Table naming consistency.
- RLS policy consistency.
- Payment tables.
- Inventory movement/reservation.
- Order status history.
- Admin roles.
- Address model.

### Risks If Mobile Starts Now

- Web and mobile may create different order formats.
- Users may see inconsistent cart/wishlist.
- Mobile checkout may copy insecure web checkout.
- Inventory may become inaccurate.
- Payment status may become unreliable.
- Auth code from web will not port cleanly.
- Schema mismatches will slow the mobile build.

---

## 11. Recommended Architecture

### Recommended Direction

Move to a monorepo before building the mobile app.

Suggested structure:

```text
apps/
  web/
    app/
    components/
  mobile/
    app/
    src/

packages/
  shared/
    types/
    schemas/
    constants/
    pricing/
  api-client/
  supabase/

supabase/
  migrations/
  functions/
    create-order/
    validate-discount/
    payment-webhook/
```

### Current Next.js Web App

Recommended web structure:

```text
app/
  api/
  (storefront)/
  dashboard/
components/
  storefront/
  dashboard/
  admin/
  ui/
lib/
  server/
  client/
  services/
  auth/
```

### Future React Native + Expo App

Recommended mobile structure:

```text
apps/mobile/
  app/
    (auth)/
    (tabs)/
    product/
    checkout/
    orders/
  src/
    components/
    features/
      auth/
      catalog/
      cart/
      checkout/
      orders/
    lib/
      supabase.ts
      api-client.ts
```

### Shared Supabase Backend

Use Supabase for:

- Auth
- Database
- Storage
- RLS
- Edge Functions/RPC for sensitive business logic

Use direct Supabase client only for safe, RLS-protected reads/writes:

- Public visible products/categories
- Own profile
- Own orders
- Own wishlist/cart if policies are strong

Use server/Edge Function for:

- Checkout
- Payment creation/confirmation
- Discount usage
- Stock deduction
- Admin mutations
- WhatsApp notifications

### Shared Types / Business Logic

Share:

- Generated DB types.
- Zod schemas.
- API response types.
- Constants like order statuses/payment methods.
- Pricing helpers only if they do not become the source of truth for final checkout.

Do not share:

- Web UI components.
- React Native UI components.
- Next.js-specific auth/session code.
- Browser localStorage stores.

### Monorepo Or Separate Repos?

Recommendation: monorepo.

Why:

- Shared types are critical.
- Shared validation schemas reduce mismatch.
- One migration folder avoids schema drift.
- Web/mobile API client can be versioned together.
- Easier to keep checkout contracts consistent.

Separate repos only make sense if teams are fully separate and you already have strong API versioning. This project is not there yet.

---

## 12. Final Action Plan

### A. Critical Issues To Fix Before Mobile App

1. Remove sensitive `wa_apikey` from public `/api/settings/announcement`.

2. Unify database schema into one official Supabase migration source.

3. Fix naming mismatches:
   - `cart_items` vs `carts`
   - `wishlist_items` vs `wishlists`
   - `blog_posts` vs `blogs`

4. Rewrite checkout so server calculates:
   - Product prices
   - Subtotal
   - Shipping
   - Discount
   - Total

5. Make order creation transactional using Supabase RPC or Edge Function.

6. Add safe inventory deduction:
   - Validate stock.
   - Deduct atomically.
   - Prevent race conditions.
   - Record inventory movements.

7. Replace hardcoded admin email with DB roles.

8. Fix RLS policies for:
   - Orders
   - Order items
   - Discounts
   - Settings
   - Admin-only data

9. Add unique and indexed `order_number`.

10. Stop exposing service-role-powered behavior through weakly protected API routes.

### B. Important Improvements Before Mobile App

1. Generate Supabase TypeScript types from the real database.

2. Delete/merge duplicate type files.

3. Delete/merge duplicate hooks.

4. Choose one cart model:
   - Server cart for logged-in users.
   - Anonymous cart/session model for guests.

5. Choose one wishlist model:
   - Prefer server wishlist for logged-in users.

6. Make profile update page actually call `/api/profile` or a shared service.

7. Add Zod validation for all API request bodies.

8. Add linting and install/configure ESLint.

9. Remove `typescript.ignoreBuildErrors: true`.

10. Extract large pages into smaller feature components.

11. Add tests for:
   - Checkout
   - Discounts
   - Stock
   - Auth
   - Orders
   - Admin permissions

### C. Nice-To-Have Improvements

1. Add payment provider integration.

2. Add payment proof upload for wallet/InstaPay.

3. Add order status history.

4. Add customer addresses table and address CRUD screens.

5. Add push notification token table for mobile.

6. Add product review system.

7. Add admin audit logs.

8. Add database views/RPC for analytics.

9. Add API versioning.

10. Add proper search endpoint.

### D. What Is Already Good And Should Not Be Changed

1. Supabase is a good backend choice for web + Expo.

2. The App Router structure is usable.

3. The service layer idea in `lib/services` is good and should be strengthened.

4. Product/category/order concepts are already present.

5. The UI has a premium visual direction.

6. Bilingual Arabic/English support is already started.

7. Admin dashboard has useful business screens.

8. Product sizes are normalized in `product_sizes`, which is better than only storing flat price columns.

### E. Suggested First Steps For Creating The Mobile App

1. Fix critical backend/security/database issues first.

2. Create a monorepo with:
   - `apps/web`
   - `apps/mobile`
   - `packages/shared`
   - `packages/api-client`

3. Generate shared Supabase DB types.

4. Define shared Zod schemas for:
   - Product
   - Cart item
   - Checkout request
   - Order response
   - Profile update

5. Build one server-authoritative checkout endpoint.

6. Build Expo auth with Supabase AsyncStorage and deep links.

7. Start mobile app with this order:
   - Auth
   - Catalog
   - Product detail
   - Cart
   - Checkout
   - Orders
   - Order tracking

8. Keep admin dashboard web-only until the customer mobile app is stable.

---

## Final Recommendation

Do not start the React Native + Expo mobile app as a real production app yet.

Start with backend cleanup first:

- Secure settings.
- Unify schema.
- Fix checkout.
- Fix cart/wishlist.
- Add proper auth roles.
- Add payment/inventory foundations.

After that, the mobile app will be much easier to build, and both web and mobile can safely share the same Supabase backend/database/order system.
