# CGIC Design System — Blog Implementation Guide

This document captures every UX/UI convention, design token, component pattern, and animation rule used on the CGIC corporate website. Use it to build a blog that looks and feels like a native part of the CGIC ecosystem — without access to the original codebase.

---

## 1. Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^16 | Framework (App Router, `src/` dir) |
| react | ^19 | UI |
| tailwindcss | ^4 | Styling via `@theme` CSS directive (no `tailwind.config`) |
| @tailwindcss/postcss | ^4 | PostCSS plugin |
| next-intl | ^4 | i18n (FR default, EN, NL) |
| framer-motion | ^12 | Animations |
| Inter (next/font/google) | — | Primary typeface |

**PostCSS config** (`postcss.config.mjs`):
```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

---

## 2. Color Palette

Defined via Tailwind 4 `@theme` in `globals.css`. Use these class names directly.

### Navy (Primary Dark)
| Token | Hex | Use |
|-------|-----|-----|
| `navy-950` | `#00003d` | Deepest — hero overlays, header bg, footer bg |
| `navy-900` | `#000850` | Primary dark sections, CTA banners |
| `navy-800` | `#001070` | Hover states on dark bg |
| `navy-700` | `#0a1a8a` | Accent dark |
| `navy-600` | `#1a2fa0` | Unused currently |

### Accent (CTA Blue)
| Token | Hex | Use |
|-------|-----|-----|
| `accent` | `#0066ff` | CTAs, links, section labels, icons on dark bg |
| `accent-light` | `#3388ff` | Hover state, hero CTA text hover |
| `accent-dark` | `#0050cc` | Button hover (primary variant) |

### Neutrals
| Token | Hex | Use |
|-------|-----|-----|
| `gray-100` | `#f5f5f7` | Light section bg (client logos, stats) |
| `gray-200` | `#e8e8ed` | Borders on light bg |
| `gray-300` | `#d1d1d6` | Numbered items (e.g., "01") |
| `gray-400` | `#8e8e93` | Muted body text, stats labels |
| `gray-500` | `#636366` | Secondary body text |
| `gray-600` | `#48484a` | — |
| `gray-700` | `#2c2c2e` | Default body text color |

### Opacity conventions on dark backgrounds
| Pattern | Use |
|---------|-----|
| `text-white` | Headlines, active nav |
| `text-white/70` | Subtitle on hero |
| `text-white/60` | Company name in footer |
| `text-white/50` | Body text on dark bg, footer links |
| `text-white/40` | Description text on dark, section labels |
| `text-white/30` | Footer section headers, copyright |
| `text-white/25` | Legal details (LEI, DUNS) |
| `text-white/10` | Borders, grid separators |
| `text-white/5` | Subtle bottom borders |
| `bg-white/10` | Grid gap color on dark sections |
| `border-white/5` | Bottom bar border |

---

## 3. Typography

**Font**: Inter via `next/font/google` with `display: "swap"`, loaded as CSS variable `--font-inter`.

### Scale
| Size | Tailwind class | Use |
|------|---------------|-----|
| 8xl | `text-8xl` (lg breakpoint) | Homepage hero headline |
| 7xl | `text-7xl` (md breakpoint) | Inner page hero headlines |
| 6xl | `text-6xl` (sm breakpoint) | Section titles on light bg |
| 5xl | `text-5xl` | Section titles, mobile hero |
| 4xl | `text-4xl` | Default section heading |
| 3xl | `text-3xl` | Subsection titles, service list titles |
| 2xl | `text-2xl` | Card titles, form section headers |
| xl | `text-xl` | Card headings, CTA text |
| lg | `text-lg` | Body text, subtitles |
| `text-[15px]` | — | Body text on dark bg (services grid) |
| sm | `text-sm` | Nav links, footer links, descriptions |
| xs | `text-xs` | Section labels (uppercase), form labels |

### Weight Rules
| Weight | Use |
|--------|-----|
| `font-bold` | All headings (h1–h3), logo, stats numbers |
| `font-semibold` | Card titles, button text, footer company name |
| `font-medium` | Section labels, nav active, link hover states |
| `font-normal` | Nav links (inactive) |
| `font-light` | Hero CTA text, mobile nav links |

### Tracking (Letter Spacing)
| Class | Use |
|-------|-----|
| `tracking-tight` | All headings (h1, h2, h3) |
| `tracking-wide` | Nav links |
| `tracking-[0.2em]` | Logo, uppercase section labels, footer section headers |
| `tracking-[0.15em]` | Form labels, stats sublabels |

### Section Labels Pattern (CRITICAL)
Every major section starts with a small uppercase accent label above the heading:
```html
<p class="text-sm font-medium uppercase tracking-[0.2em] text-accent">
  Section Label
</p>
<h2 class="mt-4 text-4xl font-bold leading-tight tracking-tight text-navy-950 sm:text-5xl">
  Main Heading
</h2>
```
On dark backgrounds, use `text-accent-light` for the label and `text-white` for the heading.

---

## 4. Layout & Spacing

### Container
- **Max width**: `max-w-[1400px]` (NOT the default `max-w-7xl`)
- **Horizontal padding**: `px-6 lg:px-12`
- **Centering**: `mx-auto`

### Section Padding
| Use | Class |
|-----|-------|
| Major sections | `py-32 sm:py-40` |
| Compact sections (logos, stats) | `py-16 sm:py-24` or `py-20` |
| Hero inner padding | `pb-20 lg:pb-28` (bottom-aligned) |

### Grid Gaps
| Context | Class |
|---------|-------|
| Two-column content | `gap-16` |
| Card grids | `gap-8` |
| Dark grids with separator lines | `gap-px bg-white/10` (cells have bg matching parent) |
| Form columns | `gap-8` |
| Contact page 5-col split | `grid gap-20 lg:grid-cols-5` (3 + 2) |

---

## 5. Component Patterns

### Hero (Inner Pages)
Full-width image with gradient overlay, content bottom-left:
```
<section class="relative flex min-h-[70vh] items-end overflow-hidden">
  <div class="absolute inset-0">
    <img src="..." class="h-full w-full object-cover" />
  </div>
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
  <div class="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-28">
    <!-- accent label + massive h1 here -->
  </div>
  <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-transparent" />
</section>
```

Key rules:
- Always `items-end` (content sticks to bottom)
- Gradient: `bg-gradient-to-t from-black/80 via-black/40 to-black/20`
- Bottom accent line: 1px height, gradient left-to-right from accent to transparent
- Headlines: `text-5xl sm:text-6xl md:text-7xl`, `max-w-3xl` or `max-w-4xl`
- Leading: `leading-[1.05]`

### Homepage Hero (Video)
Same pattern but with `<video>` instead of `<img>`, `h-screen` height, and a scroll indicator mouse icon at the bottom.

### CTA Link Pattern (NOT buttons)
The site prefers text links with arrow circles over chunky buttons:
```html
<a class="group inline-flex items-center gap-3 text-xl font-medium text-white transition-colors hover:text-accent-light">
  Link Text
  <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-all group-hover:border-accent-light group-hover:bg-accent-light/10">
    <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" ...>
      <!-- right arrow -->
    </svg>
  </span>
</a>
```
On light bg: use `text-navy-950 hover:text-accent` and `border-navy-950/20 group-hover:border-accent`.

### Dark Grid Section
Cards separated by 1px white/10 lines, cells use parent bg color:
```html
<div class="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
  <div class="bg-navy-950 p-10 transition-colors hover:bg-navy-900">
    <!-- icon (text-accent), title (text-white mt-6), body (text-white/50 mt-3) -->
  </div>
</div>
```

### Content Row (List Items)
Horizontal layout with number + icon + title + description:
```html
<div class="group grid items-center gap-8 border-b border-gray-100 py-12 md:grid-cols-12 md:py-16">
  <div class="md:col-span-1"><span class="text-sm font-medium text-gray-300">01</span></div>
  <div class="md:col-span-1"><!-- SVG icon in text-accent --></div>
  <div class="md:col-span-4"><h3 class="text-2xl font-bold tracking-tight text-navy-950 group-hover:text-accent sm:text-3xl">Title</h3></div>
  <div class="md:col-span-6"><p class="text-lg leading-relaxed text-gray-400">Description</p></div>
</div>
```

### Image + Text Two-Column
```html
<div class="grid items-center gap-16 lg:grid-cols-2">
  <div><!-- text content: label + heading + body + link --></div>
  <div class="relative">
    <div class="aspect-[4/3] overflow-hidden rounded-sm">
      <img class="h-full w-full object-cover" />
    </div>
    <!-- Geometric accent block: -->
    <div class="absolute -bottom-6 -left-6 h-24 w-24 bg-accent sm:-bottom-8 sm:-left-8 sm:h-32 sm:w-32" />
  </div>
</div>
```
Alternate: accent block can be `bg-navy-950` and positioned `-right-6 -bottom-6`.

### Stats Bar
```html
<section class="bg-navy-950 py-20"> <!-- or bg-gray-100 for light variant -->
  <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
    <div class="text-center">
      <div class="text-4xl font-bold text-white sm:text-5xl">150+</div>
      <div class="mt-2 text-sm uppercase tracking-[0.15em] text-white/40">Label</div>
    </div>
  </div>
</section>
```
Light variant: `text-navy-950` for numbers, `text-gray-400` for labels.

### Form Inputs
Underline style (no rounded boxes):
```html
<label class="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">Label *</label>
<input class="mt-2 w-full border-b border-gray-200 bg-transparent pb-3 text-gray-700 placeholder:text-gray-300 transition-colors focus:border-accent focus:outline-none" />
```

### Card (Light bg)
```html
<div class="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
```

---

## 6. Animations (Framer Motion)

### Standard ease curve
```js
ease: [0.25, 0.1, 0.25, 1]  // used for hero and major reveals
```

### Scroll reveal (sections)
```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.8 }}
>
```

### Hero text entrance
```jsx
initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
```
Subtitle/CTA delay: `0.8` (staggered after heading).

### Stagger children
```jsx
transition={{ duration: 0.5, delay: i * 0.08 }}  // for grid items
transition={{ duration: 0.5, delay: i * 0.1 }}   // for list items
```

### Image reveal
```jsx
initial={{ opacity: 0, scale: 0.95 }}
whileInView={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.8, delay: 0.2 }}
```

---

## 7. Header

- **Fixed**, transparent over hero, transitions to `bg-navy-950/90 backdrop-blur-xl border-b border-white/5` on scroll (> 50px)
- Logo: left-aligned, `text-xl font-bold tracking-[0.2em] uppercase text-white`
- Nav links: centered, `text-[15px] font-normal tracking-wide`, active = `text-white` with animated underline (`layoutId="activeNav"`, `h-px bg-white`), inactive = `text-white/70 hover:text-white`
- Gap between links: `gap-10`
- Transition duration: `duration-500`
- Mobile: animated hamburger (3 spans, framer-motion rotate), slide-down menu with `backdrop-blur-xl`

---

## 8. Footer

- `bg-navy-950`, `py-20`
- Top border: `h-px bg-white/10`
- 4-column grid: Company info | Navigation | Contact | Legal
- Section headers: `text-xs font-semibold uppercase tracking-[0.2em] text-white/30`
- Links: `text-sm text-white/50 hover:text-white`
- Bottom bar: `border-t border-white/5 pt-8 text-center text-xs text-white/30`

---

## 9. Icons

- **Source**: Heroicons outline style (24x24 viewBox, strokeWidth 1.5)
- **Size on dark grids**: `h-8 w-8`
- **Size on detail pages**: `h-10 w-10`
- **Size on contact info**: `h-5 w-5`
- **Color**: `text-accent`, hover: `text-accent-light` (dark bg) or `text-accent-dark` (light bg)
- **NEVER** use emojis — always SVG icons

---

## 10. Blog-Specific Guidelines

When building the blog, follow these patterns:

### Blog Listing Page
- Hero: full-width image hero (same as inner pages), `min-h-[60vh]`
- Grid: use `grid gap-8 sm:grid-cols-2 lg:grid-cols-3` on white bg
- Cards: image top (aspect-[16/9] rounded-sm overflow-hidden), accent label for category, bold title, gray-400 excerpt, date in `text-xs uppercase tracking-[0.15em] text-gray-300`
- Pagination: text links with arrow circles (same CTA link pattern)

### Blog Post Page
- Hero: full-width featured image, `min-h-[60vh]`, bottom-left title
- Article body: `max-w-[800px] mx-auto px-6`, `prose` styles with:
  - Headings: `text-navy-950 font-bold tracking-tight`
  - Body: `text-gray-500 leading-relaxed text-lg`
  - Links: `text-accent hover:text-accent-dark`
  - Blockquotes: left border `border-l-2 border-accent pl-6`, italic text
  - Code blocks: `bg-gray-100 rounded-sm p-4`
  - Images within post: `rounded-sm` (NOT rounded-2xl)
- Author/date bar below hero: `text-sm uppercase tracking-[0.15em] text-gray-400`
- Related posts section at bottom: dark navy bg (`bg-navy-950`), 3-column grid with same card pattern

### Blog Categories/Tags
- Use the accent label pattern: `text-sm font-medium uppercase tracking-[0.2em] text-accent`
- Tags as minimal text, not pills/badges

### Back Link
Use the arrow CTA pattern (reversed arrow, pointing left):
```html
<a class="group inline-flex items-center gap-3 text-lg font-medium text-navy-950 hover:text-accent">
  <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-950/20 group-hover:border-accent">
    <svg class="h-4 w-4 rotate-180"><!-- right arrow SVG --></svg>
  </span>
  Back to Blog
</a>
```

---

## 11. Anti-Patterns (DO NOT)

- No rounded corners on images (use `rounded-sm` max)
- No pill-shaped buttons or tags
- No centered hero text — always bottom-left aligned
- No emoji icons — SVG only (Heroicons outline)
- No `max-w-7xl` — use `max-w-[1400px]`
- No heavy shadows on dark bg sections
- No color gradients in text
- No underlines on navigation (except the thin animated active indicator)
- No card borders on dark bg — use `gap-px bg-white/10` grid separator technique
- No generic blue (#007bff) — use the exact accent (#0066ff)
- No `font-sans` default — must load Inter via next/font
- Body text on dark bg is NEVER pure white — use `text-white/50` or `text-white/70`

---

## 12. Responsive Breakpoints

| Breakpoint | Use |
|------------|-----|
| Default (mobile) | Single column, `text-4xl` heroes, `px-6` |
| `sm` (640px) | `text-5xl` heroes, 2-col grids |
| `md` (768px) | Desktop nav visible, `text-6xl–7xl` heroes, 12-col grids |
| `lg` (1024px) | `text-7xl–8xl` heroes, `px-12`, 3-col grids, 2-col layouts |

---

## 13. CSS Theme Block (Copy-Paste)

```css
@import "tailwindcss";

@theme {
  --color-navy-950: #00003d;
  --color-navy-900: #000850;
  --color-navy-800: #001070;
  --color-navy-700: #0a1a8a;
  --color-navy-600: #1a2fa0;
  --color-accent: #0066ff;
  --color-accent-light: #3388ff;
  --color-accent-dark: #0050cc;
  --color-gray-100: #f5f5f7;
  --color-gray-200: #e8e8ed;
  --color-gray-300: #d1d1d6;
  --color-gray-400: #8e8e93;
  --color-gray-500: #636366;
  --color-gray-600: #48484a;
  --color-gray-700: #2c2c2e;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-size-display: 5rem;
  --font-size-display--line-height: 1;
  --font-size-hero: 4rem;
  --font-size-hero--line-height: 1.05;
  --font-size-heading: 3rem;
  --font-size-heading--line-height: 1.1;
  --font-size-subheading: 2rem;
  --font-size-subheading--line-height: 1.2;
}
```

---

## 14. Reference: GE Aerospace Inspiration

The design is inspired by [GE Aerospace](https://www.geaerospace.com):
- Full-bleed hero with video/image, content bottom-left
- Massive bold sans-serif headlines
- Clean navigation with generous spacing
- Dark/light section alternation
- Minimal decorative elements — let photography and typography do the work
- Text-based CTAs with arrow icons, not chunky buttons
- Overall feel: **corporate premium, confident, understated**
