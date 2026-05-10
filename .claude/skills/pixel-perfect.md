# Pixel-Perfect Implementation Skill

Use this skill whenever the user shares a screenshot or image of a webpage and asks you to build it.

## Core Rule

**Build exactly what you see. Nothing more. Nothing less.**

Never improvise, "improve", or add anything not visible in the image. If you are unsure about a detail (exact color, exact spacing, exact font weight), ask before assuming.

---

## Phase 1 — Analysis (before writing a single line of code)

When the user sends an image, do this first:

1. **Describe the page out loud** — list every section, every element, every visible state.
2. **Identify the layout** — grid, flex, columns, full-width, centered, etc.
3. **Extract colors** — backgrounds, text, borders, shadows. Map each one to the nearest Tailwind CSS variable from the design system (`bg-background`, `text-muted-foreground`, etc.). If a color has no match, ask the user before hardcoding.
4. **Extract typography** — font sizes, weights, line heights, letter spacing.
5. **Identify components** — which shadcn/ui primitives map to what you see (Card, Button, Badge, Table, Input, etc.).
6. **Identify interactive states** — hover, active, disabled, loading — only if visible in the screenshot.
7. **Note RTL/Arabic text** — if any Arabic text is visible, apply `dir="rtl"` and `rtl:` Tailwind variants where needed.
8. **List unknowns** — anything unclear or ambiguous. Ask the user to clarify before coding.

Only start coding after this analysis is confirmed (or the user says "go ahead").

---

## Phase 2 — Frontend Implementation

### Rules

- Use the **design-system** skill rules: shadcn/ui + Tailwind + TypeScript + `cn()`.
- Match spacing **exactly** using Tailwind scale (`p-4`, `gap-6`, `mt-2`, etc.). If spacing doesn't match the scale, use arbitrary values (`p-[18px]`).
- Match colors **exactly**. Prefer CSS variables. Use arbitrary Tailwind (`bg-[#1a1a1a]`) only if the color is not in the design system — and flag it to the user.
- Match font sizes, weights, and line heights exactly.
- **Do not add** animations, transitions, tooltips, or hover effects unless they are visible in the image.
- **Do not reorganize** the layout. Build it in the same order the elements appear.
- **Do not add placeholder content** that isn't in the image (e.g., don't invent extra cards or rows).

### Component structure

Build as a Server Component by default. Add `"use client"` only for interactive elements visible in the image (forms, dropdowns, modals, etc.).

### File placement

Follow the Next.js App Router convention:
- Pages → `app/<route>/page.tsx`
- Reusable sections → `components/<section-name>.tsx`
- UI primitives already exist → `components/ui/`

---

## Phase 3 — Backend / Data Wiring

After the frontend is done, wire up real data:

1. **Identify data sources** from the UI — tables, lists, cards with dynamic content, user info, stats, etc.
2. **Check existing code first** — look in `lib/`, `app/api/`, `hooks/` for existing queries, API routes, or Supabase calls before creating new ones.
3. **Match the data shape** to exactly what the UI shows — no extra fields, no missing fields.
4. **Use Server Components + async/await** for data fetching where possible (no useEffect data fetching).
5. **Loading and error states** — only implement if they are visible in the screenshot.

---

## Phase 4 — Verification

After implementation:

1. Use the **puppeteer** MCP tool to screenshot the rendered page at `http://localhost:3000/<route>`.
2. Compare side-by-side with the original image.
3. List any visible differences.
4. Fix differences before reporting done.
5. Test at mobile viewport if the original image shows a mobile layout.

---

## Modification Protocol

When the user says "change X" or "update Y":

1. **Identify exactly which element** is being changed.
2. **Touch only that element** — do not refactor surrounding code.
3. **Confirm scope** if the change could affect multiple places: "This change affects 3 components — should I update all of them or just this page?"
4. **Do not "clean up"** unrelated code while making the change.
5. After the change, re-screenshot and confirm it looks correct.

---

## What you must NEVER do without being explicitly told

- Change the layout or order of elements
- Add new sections or components not in the image
- Change colors, fonts, or spacing "to better match the design system"
- Add loading skeletons if not in the image
- Add error handling UI if not in the image
- Rename or restructure files
- Refactor working code
- Add comments or documentation
