# Design System Skill

Use this skill when asked to create, update, or audit UI components for the line-coffee project.

## Stack

- **Framework**: Next.js 14+ with App Router and RSC (`rsc: true`)
- **Language**: TypeScript + TSX
- **Styling**: Tailwind CSS with CSS variables (`cssVariables: true`)
- **Component library**: shadcn/ui — style `new-york`, base color `neutral`
- **Icons**: lucide-react
- **Aliases**: `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`

## Rules

1. **Always use shadcn/ui primitives** from `@/components/ui` as the base — never raw HTML where a primitive exists.
2. **Tailwind only** — no inline styles, no CSS modules, no styled-components.
3. **CSS variables for colors** — use `bg-background`, `text-foreground`, `border`, `ring`, etc. Never hardcode hex values.
4. **cn() for class merging** — always import from `@/lib/utils`.
5. **RSC by default** — add `"use client"` only when state, effects, or browser APIs are required.
6. **Lucide icons** — import from `lucide-react`, size via `className` (e.g. `size-4`).
7. **Responsive** — mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`).
8. **Arabic/RTL aware** — this is a bilingual (Arabic + English) coffee shop app; use `dir` prop or `rtl:` variants where layout flips.

## Adding a new shadcn component

```bash
npx shadcn@latest add <component-name>
```

## Component template

```tsx
import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
}

export function MyComponent({ className }: MyComponentProps) {
  return (
    <div className={cn("...", className)}>
      {/* content */}
    </div>
  )
}
```

## When the user shares a Figma design

1. Use the `figma` MCP tool to read the design file or node.
2. Map Figma tokens → Tailwind CSS variable equivalents.
3. Build the component following the rules above.
4. Use the `puppeteer` MCP tool to screenshot the rendered result and compare with the design.
