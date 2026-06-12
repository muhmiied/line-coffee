# Line Coffee — Design System Specification

> **الغرض من الملف:** ده مرجع كامل لنظام التصميم (UI/UX) بتاع Line Coffee. أي AI agent أو مطوّر يقرا الملف ده المفروض يقدر يعيد إنتاج **نفس المود بالظبط** — نفس الألوان، نفس الخطوط، نفس الموشن، نفس الإحساس السينمائي الفخم.
>
> **الهوية في جملة:** قهوة فاخرة مصرية — مود سينمائي داكن (Cinematic Dark) بلون ذهبي/بُنّي دافئ، إضاءات (glows) ناعمة، زجاج ضبابي (glassmorphism)، وحركة هادئة فخمة. بيدعم عربي/إنجليزي مع RTL.

---

## 0. القاعدة الذهبية (Design Principles)

أي حاجة تتبني لازم تتبع المبادئ دي:

1. **داكن دائماً (Dark-first).** الخلفية قهوة سوداء عميقة، مفيش وضع فاتح. `color-scheme: dark`.
2. **الذهبي هو البطل.** لون واحد أساسي = ذهبي/بُنّي دافئ (`#B6885E`). يُستخدم للأزرار، اللينكات، الإضاءات، والتفاصيل. **ممنوع** ألوان صارخة أو بنفسجي.
3. **الإضاءة الناعمة (Ambient Glow).** كل سيكشن وكارت بيكون فيه توهج ذهبي خفيف (radial-gradient + box-shadow). ده اللي بيدي الإحساس السينمائي.
4. **الزجاج الضبابي (Glass).** النافبار والكروت والـ panels بتستخدم `backdrop-filter: blur` مع شفافية.
5. **حركة هادئة وفخمة.** كل الانتقالات بتستخدم `cubic-bezier(0.22, 1, 0.36, 1)` بمدة 400–520ms. مفيش حركة سريعة أو حادة.
6. **خط Serif للعناوين (Playfair) + Cairo للعربي.** فخامة كلاسيكية.
7. **احترام `prefers-reduced-motion`** دايماً.

---

## 1. الألوان (Color System)

النظام بيعتمد على متغيرات CSS بصيغة **HSL** (للتوكنز) + **HEX** (للاستخدام المباشر).

### 1.1 لوحة الألوان الأساسية (Brand Palette — HEX)

| الاسم | HEX | الاستخدام |
|------|-----|-----------|
| `--coffee-black` | `#0B0806` | الخلفية الرئيسية (أعمق درجة) |
| `--coffee-deep` | `#120D09` | خلفية ثانوية / كروت زجاجية |
| `--coffee-dark` | `#15100B` | أسطح muted |
| `--coffee-surface` | `#1B140F` | أسطح ثانوية / كروت |
| `--gold` | `#B6885E` | **اللون الأساسي** (أزرار، لينكات، حدود) |
| `--gold-light` | `#D6A373` | ذهبي فاتح (accent، hover، توهج) |
| `--cream` | `#F5E6D8` | النص الأساسي (عناوين) |
| `--cream-muted` | `#D6B79A` | نص ثانوي |
| `--cream-dim` | `#B79B85` | نص خافت / placeholder |
| `--gold-border` | `rgba(182,136,94,0.12)` | حدود خفيفة |
| `--gold-glow` | `rgba(182,136,94,0.25)` | توهج محيطي |

### 1.2 توكنز shadcn (HSL) — `:root`

> مهم: القيم متخزّنة كـ HSL **بدون** `hsl()` عشان تشتغل مع Tailwind v4 (`hsl(var(--token))`).

\`\`\`css
:root {
  --background: 20 30% 3%;       /* #0B0806 - قهوة سوداء */
  --foreground: 30 60% 90%;      /* #F5E6D8 - كريمي */

  --card: 27 33% 5%;
  --card-foreground: 30 60% 90%;

  --popover: 25 35% 6%;
  --popover-foreground: 30 60% 90%;

  --primary: 28 37% 54%;          /* #B6885E - الذهبي الأساسي */
  --primary-foreground: 20 30% 3%;

  --secondary: 27 29% 8%;         /* #1B140F */
  --secondary-foreground: 30 60% 90%;

  --muted: 25 31% 6%;             /* #15100B */
  --muted-foreground: 28 42% 72%;

  --accent: 29 55% 65%;           /* #D6A373 - ذهبي فاتح */
  --accent-foreground: 20 30% 3%;

  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 100%;

  --border: 28 22% 16%;           /* بُنّي خفيف دافئ */
  --input: 27 29% 8%;
  --ring: 28 37% 54%;             /* ذهبي */

  --chart-1: 28 37% 54%;
  --chart-2: 29 55% 65%;
  --chart-3: 28 42% 72%;
  --chart-4: 27 29% 40%;
  --chart-5: 27 29% 20%;

  --radius: 0.625rem;             /* 10px - زوايا متوسطة */

  /* Sidebar (لوحة الأدمن) */
  --sidebar: 20 40% 4%;
  --sidebar-foreground: 30 60% 90%;
  --sidebar-primary: 28 37% 54%;
  --sidebar-primary-foreground: 20 30% 3%;
  --sidebar-accent: 27 29% 8%;
  --sidebar-accent-foreground: 30 60% 90%;
  --sidebar-border: 28 22% 16%;
  --sidebar-ring: 28 37% 54%;

  /* منحنى الحركة الفخم - يُستخدم في كل الانتقالات */
  --ease-luxury: cubic-bezier(0.22, 1, 0.36, 1);
}
\`\`\`

> **قاعدة:** لو غيّرت لون خلفية لازم تغيّر لون النص معاه عشان التباين. استخدم التوكنز (`bg-background text-foreground`, `bg-card text-card-foreground`) مش ألوان مباشرة.

### 1.3 خلفية الـ body (مهمة جداً للمود)

الخلفية مش لون صلب — هي طبقتين: توهج ذهبي من فوق + تدرّج عمودي قهوة.

\`\`\`css
body {
  background:
    radial-gradient(circle at 50% -10%, rgba(182, 136, 94, 0.08), transparent 34rem),
    linear-gradient(180deg, #0B0806 0%, #120D09 45%, #0B0806 100%);
  background-color: #0B0806;
}
\`\`\`

---

## 2. الخطوط (Typography)

### 2.1 العائلات

| المتغير | الخط | الاستخدام |
|---------|------|-----------|
| `--font-playfair` | **Playfair Display** (Serif, local font) | كل العناوين h1–h6 والنصوص الإنجليزية الفخمة. أوزان: 400/700/900 + Italic |
| `--font-cairo` | **Cairo** (Google Font) | كل النصوص العربية. أوزان: 300–900 |

\`\`\`css
@theme inline {
  --font-sans: var(--font-playfair), Georgia, 'Times New Roman', serif;
  --font-serif: var(--font-playfair), Georgia, 'Times New Roman', serif;
  --font-arabic-brand: var(--font-cairo), 'Segoe UI', Tahoma, sans-serif;
}
\`\`\`

> ملاحظة: `font-sans` و `font-serif` الاتنين = Playfair (مود سينمائي موحّد). العربي بيتبدّل تلقائياً لـ Cairo عبر `html[lang="ar"]`.

### 2.2 إعداد الخطوط في Next.js (layout.tsx)

\`\`\`tsx
import localFont from 'next/font/local'
import { Cairo } from 'next/font/google'

const playfair = localFont({
  src: [
    { path: '../public/fonts/PlayfairDisplay-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/PlayfairDisplay-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../public/fonts/PlayfairDisplay-Black.ttf', weight: '900', style: 'normal' },
    // + Italic variants
  ],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

// <html className={`${playfair.variable} ${cairo.variable} bg-background`}>
// <body className="font-sans antialiased">
\`\`\`

### 2.3 قواعد الكتابة (Type Scale)

\`\`\`css
h1,h2,h3,h4,h5,h6 {
  font-family: var(--font-playfair);  /* font-serif */
  color: #F5E6D8;                       /* cream */
  line-height: 1.16;
  text-wrap: balance;
}
h1 { font-weight: 800; }
h2, h3 { font-weight: 700; }
p { line-height: 1.75; }

/* العربي - line-height أوسع */
html[lang="ar"] body { line-height: 1.85; }
html[lang="ar"] h1,h2,h3 { line-height: 1.24; font-weight: 700; }
\`\`\`

- **النص العادي:** `leading-relaxed` (1.75)، حجم لا يقل عن 14px.
- **العناوين:** دايماً `text-balance` أو `text-pretty`.

---

## 3. الموشن والحركة (Motion System)

المود بيعتمد على مكتبة **framer-motion** (للـ scroll reveals) + **CSS keyframes** (للتأثيرات المستمرة). المكتبة: `framer-motion: ^12` + `tw-animate-css`.

### 3.1 المنحنى الموحّد

كل الانتقالات تستخدم: `cubic-bezier(0.22, 1, 0.36, 1)` (متغير `--ease-luxury`) بمدة **400–520ms**. ده سرّ الإحساس "الفخم الهادي".

### 3.2 Framer Motion Variants (Scroll Reveal)

دي الـ primitives الجاهزة — استخدمها لإظهار السيكشنز عند التمرير:

\`\`\`tsx
'use client'
import { motion, type Variants } from 'framer-motion'

export const viewportConfig = { once: true, amount: 0.1 }

// السيكشن بالكامل - بيظهر من تحت لفوق مع stagger للأطفال
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: 'easeOut', staggerChildren: 0.15 },
  },
}

// عنصر مفرد داخل السيكشن
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

// الصور - بتظهر مع تكبير خفيف يرجع لطبيعته
export const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
}
\`\`\`

**نمط الاستخدام:**
\`\`\`tsx
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.1 }}
  variants={sectionVariants}
>
  <motion.div variants={itemVariants}>عنصر 1</motion.div>
  <motion.div variants={itemVariants}>عنصر 2</motion.div>
</motion.section>
\`\`\`

- **WordByWord:** عنوان بيظهر كلمة كلمة (`staggerChildren: 0.1`, كل كلمة `y: 28 → 0`, مدة 0.45s).
- القاعدة العامة: العناصر بتطلع من تحت (`y: 40`) مع fade، الصور بتعمل zoom-out بسيط.

### 3.3 CSS Keyframes (تأثيرات مستمرة)

\`\`\`css
/* توهج ذهبي نابض - للإضاءات المحيطة */
@keyframes goldPulse { 0%,100% { opacity: 0.18; } 50% { opacity: 0.32; } }
.gold-pulse { animation: goldPulse 4s ease-in-out infinite; }

/* لمعة تمر على العناوين (shimmer sweep) */
@keyframes premium-heading-sweep {
  0%,32% { transform: translateX(-135%); opacity: 0; }
  44% { opacity: 1; }
  66%,100% { transform: translateX(135%); opacity: 0; }
}

/* شريط متحرك (logos / نصوص) */
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 30s linear infinite; }
.animate-marquee:hover { animation-play-state: paused; }

/* كشف الصورة - clip من اليمين لليسار */
@keyframes imageReveal { to { clip-path: inset(0 0 0 0); } }
.image-reveal { clip-path: inset(0 100% 0 0); animation: imageReveal 1s ease-out forwards; }
\`\`\`

### 3.4 احترام تقليل الحركة (إلزامي)

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
\`\`\`

---

## 4. الكلاسات المميزة (Signature Utility Classes)

دي قلب الهوية البصرية. انسخها بالظبط من `globals.css`.

### 4.1 الزجاج (Glassmorphism)

\`\`\`css
/* كارت زجاجي عام */
.glass {
  background: rgba(18, 13, 9, 0.78);
  backdrop-filter: blur(24px) saturate(1.18);
  border: 1px solid rgba(182, 136, 94, 0.16);
  box-shadow: 0 24px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(245,230,216,0.06);
}

/* النافبار الزجاجي */
.nav-glass {
  background:
    linear-gradient(180deg, rgba(27,20,15,0.86), rgba(11,8,6,0.74)),
    rgba(11,8,6,0.72);
  backdrop-filter: blur(26px) saturate(1.22);
  border-bottom: 1px solid rgba(182,136,94,0.16);
  box-shadow: 0 18px 60px rgba(0,0,0,0.45), 0 1px 0 rgba(214,163,115,0.08) inset;
}

/* panel فخم (نماذج، dialogs) */
.luxury-panel {
  background: linear-gradient(145deg, rgba(27,20,15,0.9), rgba(11,8,6,0.76));
  border: 1px solid rgba(182,136,94,0.16);
  box-shadow: 0 24px 70px rgba(0,0,0,0.38), inset 0 1px 0 rgba(245,230,216,0.045);
  backdrop-filter: blur(18px);
}
\`\`\`

### 4.2 الأزرار الفخمة

\`\`\`css
/* الزر الأساسي - تدرّج ذهبي + يرتفع عند الهوفر */
.premium-button {
  background: linear-gradient(135deg, #A8744E 0%, #D6A373 46%, #B6885E 100%);
  color: #0B0806;
  box-shadow: 0 12px 34px rgba(182,136,94,0.28), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: transform 420ms var(--ease-luxury), box-shadow 420ms var(--ease-luxury);
}
.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 48px rgba(182,136,94,0.38), 0 0 0 1px rgba(245,230,216,0.08);
}

/* زر outline - زجاجي بحدود ذهبية */
.premium-button-outline {
  background: rgba(182,136,94,0.075);
  color: #D6A373;
  border: 1px solid rgba(182,136,94,0.3);
  backdrop-filter: blur(12px);
  transition: transform 420ms var(--ease-luxury), border-color 420ms var(--ease-luxury);
}
.premium-button-outline:hover {
  transform: translateY(-2px);
  background: rgba(182,136,94,0.13);
  border-color: rgba(214,163,115,0.55);
}
\`\`\`

### 4.3 الكروت (Hover Lift + Glow)

النمط الموحّد للكروت: ترتفع `-5px` عند الهوفر + توهج ذهبي + حدّ ذهبي يفتح.

\`\`\`css
.premium-image-card, .luxury-card {
  border: 1px solid rgba(182,136,94,0.13);
  box-shadow: 0 18px 54px rgba(0,0,0,0.32);
  transition: transform 520ms var(--ease-luxury), box-shadow 520ms var(--ease-luxury),
              border-color 520ms var(--ease-luxury);
  will-change: transform;
}
.premium-image-card:hover, .luxury-card:hover {
  transform: translateY(-5px);
  border-color: rgba(214,163,115,0.34);
  box-shadow: 0 28px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(182,136,94,0.16),
              0 0 34px rgba(182,136,94,0.11);
}
\`\`\`

### 4.4 عناصر السيكشن (Kicker + Heading Shimmer)

\`\`\`css
/* الكيكر - عنوان صغير فوق العنوان الكبير، بخطين ذهبيين على الجانبين */
.premium-section-kicker {
  display: inline-flex; align-items: center; gap: 0.9rem;
  color: #D6A373;
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.24em; text-transform: uppercase;
  text-shadow: 0 0 22px rgba(214,163,115,0.18);
}
.premium-section-kicker::before, .premium-section-kicker::after {
  content: ""; height: 1px; flex: 1 1 4rem;
  background: linear-gradient(90deg, transparent, rgba(214,163,115,0.68));
}

/* العنوان مع لمعة تمر عليه كل 6.4 ثانية */
.premium-heading-shimmer {
  position: relative; display: inline-block;
  color: #F5E6D8;
  text-shadow: 0 0 28px rgba(214,163,115,0.12);
}
/* ::after فيه gradient sweep - شوف premium-heading-sweep keyframe */

/* نص بتدرّج ذهبي */
.text-gradient {
  background: linear-gradient(135deg, #B6885E 0%, #D6A373 60%, #F5E6D8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
\`\`\`

### 4.5 السيكشن السينمائي + الفواصل

\`\`\`css
/* سيكشن بإضاءة علوية + خط ذهبي فاصل فوق */
.cinematic-section {
  position: relative; overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgba(182,136,94,0.075), transparent 34rem),
    linear-gradient(180deg, #0B0806, #120D09);
}
/* ::before = خط ذهبي متوهّج فوق، ::after = هالة ذهبية كبيرة */

/* فاصل بين السيكشنز - خط ذهبي متوهّج في النص */
.section-divider {
  height: 84px;
  background: linear-gradient(180deg, rgba(11,8,6,0), rgba(18,13,9,0.36), rgba(11,8,6,0));
}
\`\`\`

### 4.6 ورق ممزّق (Torn Paper)

حواف ممزّقة بين السيكشنز عبر SVG في `background-image` (كلاسات: `.torn-paper`, `.torn-paper-top`, `.torn-paper-dark`). بتدّي إحساس عضوي/حِرَفي. الألوان في الـ SVG لازم تطابق لون السيكشن (`#0B0806` أو `#120D09`).

### 4.7 تفاصيل صغيرة بتفرق

\`\`\`css
/* التحديد (selection) */
::selection { background: rgba(182,136,94,0.35); color: #F5E6D8; }

/* focus ring ذهبي */
:focus-visible { outline: 2px solid rgba(182,136,94,0.7); outline-offset: 2px; }

/* scrollbar رفيع ذهبي */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #120D09; }
::-webkit-scrollbar-thumb { background: rgba(182,136,94,0.3); border-radius: 3px; }

/* الإدخالات (inputs) - خلفية داكنة شفافة + حدّ ذهبي */
input, textarea, select {
  border-color: rgba(182,136,94,0.34) !important;
  background-color: rgba(18,13,9,0.76) !important;
  color: #F5E6D8 !important;
}
input:focus { border-color: rgba(214,163,115,0.72) !important;
  box-shadow: 0 0 0 3px rgba(182,136,94,0.24) !important; }

/* شريط تقدّم التمرير - أعلى الصفحة */
.scroll-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #B6885E, #D6A373, #F5E6D8);
  transform-origin: left; z-index: 9999;
}
\`\`\`

---

## 5. التخطيط والمسافات (Layout & Spacing)

- **Mobile-first** دايماً، وبعدين `md:` و `lg:`.
- **Flexbox** للأغلبية، **Grid** للتخطيطات ثنائية البعد فقط.
- استخدم **gap** للمسافات (`gap-4`, `gap-6`) — **ممنوع** خلط margin/padding مع gap على نفس العنصر.
- استخدم سلّم Tailwind (`p-4`, `py-6`, `gap-4`) مش قيم عشوائية (`p-[16px]`).
- **الزوايا:** `--radius: 0.625rem` (10px). كروت كبيرة `rounded-2xl`، كروت صغيرة `rounded-xl`، أزرار `rounded-md`.
- **العرض الأقصى للمحتوى:** عادة `max-w-7xl mx-auto px-4 md:px-6`.
- **حشو السيكشن العمودي:** `py-16 md:py-24` أو أكبر للسيكشنز البطولية.
- **النافبار ثابت (sticky):** المحتوى الرئيسي بياخد `pt-20 md:pt-24` عشان مايتغطّاش.

### الـ Layout الأساسي (ترتيب الـ providers)

\`\`\`tsx
<html lang="en" dir="ltr" className={`${playfair.variable} ${cairo.variable} bg-background`}>
  <body className="font-sans antialiased min-h-screen flex flex-col">
    <LanguageProvider>        {/* تبديل عربي/إنجليزي + RTL */}
      <AuthProvider>
        <ScrollProgress />     {/* شريط تقدّم أعلى الصفحة */}
        <StickyTopBar />       {/* نافبار زجاجي ثابت */}
        <main className="flex-1 pt-20 md:pt-24">{children}</main>
        <Footer />
        <CartDrawer /> <WishlistDrawer /> <WhatsAppButton /> <DiscountBanner />
        <Toaster position="top-center" richColors />  {/* sonner */}
      </AuthProvider>
    </LanguageProvider>
  </body>
</html>
\`\`\`

---

## 6. دعم العربي و RTL (Bilingual)

ده جزء أساسي من الهوية — الموقع ثنائي اللغة بالكامل.

- اللغة محفوظة في `localStorage` تحت مفتاح `line-coffee-language` (`'ar'` أو `'en'`).
- سكربت صغير في `<head>` بيضبط `dir` و `lang` قبل الـ hydration عشان يمنع الـ flash.
- عند `lang="ar"`: الخط يتحوّل لـ Cairo، الاتجاه `rtl`، الـ line-height يزيد.
- استخدم خصائص منطقية (logical properties): `marginInlineEnd` بدل `margin-right`، `ps-*`/`pe-*` بدل `pl-*`/`pr-*`.
- النصوص دايماً بتيجي كزوج (عربي/إنجليزي) عبر دالة `t('English', 'عربي')`.

\`\`\`tsx
// نمط الترجمة المستخدم في كل الكومبوننتس
const { t } = useLanguage()
<h2>{t('Best Sellers', 'الأكثر مبيعاً')}</h2>
\`\`\`

---

## 7. المكتبات والاعتماديات (Tech Stack)

| الغرض | المكتبة |
|------|---------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 (`@import 'tailwindcss'`) |
| الكومبوننتس | shadcn/ui (Radix UI primitives) |
| الموشن | `framer-motion` ^12 + `tw-animate-css` |
| الأيقونات | `lucide-react` (أحجام 16/20/24px) — **ممنوع** إيموجي كأيقونات |
| التنبيهات (toasts) | `sonner` (موضع `top-center`, `richColors`) |
| الخطوط | `next/font` (Playfair محلي + Cairo من Google) |

### كومبوننتس shadcn المستخدمة فعلياً في المشروع
`accordion, badge, breadcrumb, button, dialog, dropdown-menu, input, label, radio-group, select, separator, sheet, skeleton, textarea, toggle, tooltip` — بالإضافة لكومبوننتس مخصّصة: `animated-counter, discount-banner, scroll-progress, whatsapp-button, motion-primitives`.

---

## 8. تعليمات للـ AI Agent (Checklist للتنفيذ)

عشان تعيد نفس المود بالظبط، اتبع ده بالترتيب:

1. **انسخ كل توكنز الألوان** من القسم 1.2 في `:root` داخل `globals.css` (HSL).
2. **أضف متغيرات الـ HEX و `--ease-luxury`** (قسم 1.1).
3. **اضبط خلفية الـ body** بالتدرّج المزدوج (قسم 1.3) — دي أهم خطوة للإحساس السينمائي.
4. **ركّب الخطوط** Playfair (serif/عناوين) + Cairo (عربي) زي قسم 2.2، واضبط `@theme inline`.
5. **انسخ الكلاسات المميزة** كلها من القسم 4 (glass, premium-button, premium-image-card, cinematic-section, kicker, shimmer, torn-paper).
6. **ركّب الموشن:** ملف `motion-primitives.tsx` (قسم 3.2) + الـ keyframes في CSS (قسم 3.3).
7. **التزم بمنحنى الحركة** `cubic-bezier(0.22,1,0.36,1)` ومدة 400–520ms في **كل** transition.
8. **كل سيكشن** = إضاءة ذهبية محيطة + ظهور بـ scroll reveal (`sectionVariants`) + كيكر فوق العنوان.
9. **كل كارت** = حدّ ذهبي خفيف + ارتفاع `-5px` وتوهج عند الهوفر.
10. **لا تنسَ** `prefers-reduced-motion`, دعم RTL, و focus rings الذهبية.

### الإحساس النهائي المطلوب
> داكن • فخم • دافئ • سينمائي • هادئ الحركة • ذهبي متوهّج • زجاجي. لو الناتج حسّيته "صارخ" أو "مسطّح" أو "بارد" → غلط. لازم يبقى دافي وعميق وفخم زي علبة قهوة فاخرة.
