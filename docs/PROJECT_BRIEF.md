# Alsena Group — Project Brief

**Client:** Alsena Group
**Prepared by:** Codolie Labs SL
**Date:** 2026-01-22 (intake) | 2026-02-17 (this brief) | 2026-07-15 (CGIC CMS decision)
**Status:** Active — CGIC content-platform scope updated

> **CGIC scope update (2026-07-15):** CGIC will add a headless WordPress editorial platform for Jobs and Articles. The implementation source of truth is [`HEADLESS_WORDPRESS_CONTENT_PLATFORM_SPEC.md`](./HEADLESS_WORDPRESS_CONTENT_PLATFORM_SPEC.md). Where this original intake brief conflicts with that specification for CGIC, the newer specification takes precedence.

---

## 1. Project Overview

Alsena Group has commissioned Codolie Labs to design and develop **3 corporate websites**. All sites serve as credibility/lead generation landing pages for group entities in the **staffing/consulting sector**.

| # | Domain | Working Name | Purpose |
|---|--------|-------------|---------|
| 1 | www.cgic.be | CGIC | Corporate info + Lead generation + Jobs + Articles |
| 2 | www.alsena-group.eu | Alsena | Corporate info + Lead generation + Blog |
| 3 | www.davit-consortium.eu | Davit | Corporate info + Lead generation |

**Timeline:** Sites 1 & 2 in parallel, Site 3 after.

---

## 2. Primary Goals (Per Site)

All 3 sites share the same dual objective:
- **Contact / Lead form** — Primary user action
- **Present information / credibility** — Establish trust and authority

---

## 3. Pages & Structure

### Site 1 — CGIC (7 sections)

| Page | Notes |
|------|-------|
| Home | Hero + value prop + CTA |
| About | Company story, team, mission |
| Services / Products | Service offerings |
| Jobs | Headless WordPress job listing, filters, and offer details |
| Insights | Headless WordPress article listing and article details |
| Contact | Lead form (primary CTA) |
| Legal (Privacy / Terms) | GDPR-compliant legal pages |

### Site 2 — Alsena (6 pages)

| Page | Notes |
|------|-------|
| Home | Hero + value prop + CTA |
| About | Group story, leadership, mission |
| Services / Products | Service offerings |
| Blog / Resources | CMS-driven content section |
| Contact | Lead form (primary CTA) |
| Legal (Privacy / Terms) | GDPR-compliant legal pages |

### Site 3 — Davit (4 pages)

| Page | Notes |
|------|-------|
| Home | Hero + value prop + CTA |
| About | Consortium story, partners, mission |
| Contact | Lead form (primary CTA) |
| Legal (Privacy / Terms) | GDPR-compliant legal pages |

---

## 4. Functionality

| Feature | CGIC | Alsena | Davit |
|---------|------|--------|-------|
| Contact form | Yes | Yes | Yes |
| CMS / Articles | Yes — headless WordPress | Yes | No |
| Job board | Yes — headless WordPress | No | No |
| Analytics (GA4) | Yes | Yes | Yes |
| Multilingual (i18n) | Yes | Yes | Yes |
| Newsletter signup | No | No | No |
| E-commerce | No | No | No |
| Booking system | No | No | No |
| User accounts | No | No | No |

---

## 5. Internationalization (i18n)

**Strategy:** All 3 sites are multilingual.
- **Primary language:** French (FR) — content written first in French
- **Additional languages:** To be confirmed (likely NL + EN given .be and .eu domains)
- **Routing:** Subpath-based (`/fr/services`, `/en/services`, `/nl/services`)
- **Implementation:** Next.js App Router `[lang]` dynamic segment + JSON dictionaries

**Open question:** Exact list of languages per site.

---

## 6. Content Responsibility

| Content Type | Provided By |
|-------------|-------------|
| Copy (text) | Client (Alsena Group) |
| Images | Codolie Labs |
| Logo / Brand assets | Codolie Labs |
| Videos | Codolie Labs |
| Legal pages | Client (Alsena Group) |

**Content delivery date:** Not yet defined — **blocker for kickoff**.
> Delays in content delivery automatically delay timelines.

---

## 7. Design Direction

### Brand Tone
- Clean / minimal
- Corporate / professional
- Modern / tech

### Visual References

#### Site 1 (CGIC) — Primary Reference

**GE Aerospace** — https://www.geaerospace.com/
- **Full-screen video hero** with dark overlay + massive centered headline
- Deep navy/atmosphere blue (#00003d) as dominant color
- Oversized bold sans-serif typography — headlines command attention
- Generous whitespace — sections breathe, nothing cramped
- Card-based content grids below hero (reports, portfolio, news)
- Fixed mega-menu header — logo left, navigation right
- Minimal animation — content speaks, no flashy transitions
- High contrast: dark backgrounds + white text + subtle accent colors
- Multi-column footer with social links
- Premium industrial-grade corporate gravitas

#### General References (All Sites)

**Gentis** — https://www.gentis.com/en
- Dark hero sections with bold headlines and dual CTAs
- Premium feel with subtle gradient overlays ("noise shadows")
- Client logo carousel for social proof
- Card-based content layout (jobs, insights, testimonials)
- Clean sans-serif typography, dark backgrounds + white text + accent color
- Multilingual nav (EN/FR/NL)

**Robert Half** — https://www.roberthalf.com/be/en
- Professional dark/charcoal hero
- Noto Sans typography — clean, contemporary
- Mega-menu navigation organized by audience
- Insight cards, industry carousels
- Awards/social proof section

### Design Patterns to Follow
- **Full-screen video hero** (at minimum for CGIC homepage, evaluate for others)
- Dark hero + light content sections alternating
- Oversized headline typography with clear CTAs
- Logo/client carousel for trust signals
- Card-based service/content grids
- Generous whitespace and section spacing
- Minimal, purposeful animations (Framer Motion)
- Mobile-first responsive design
- Language switcher in header navigation
- Fixed header with mega-menu

### Design Deliverables
- 1 design revision round per site (per intake agreement)
- Additional revisions = additional quote

---

## 8. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 16+** (App Router) | SSG/ISR, SEO-first, React Server Components, React 19 |
| Styling | **Tailwind CSS 4** | Utility-first, rapid iteration, design consistency |
| Animations | **Framer Motion** | Subtle scroll/hover animations matching GE Aerospace feel |
| i18n | **next-intl** or native `[lang]` routing | Subpath routing, JSON dictionaries, server-side |
| Forms | **React Hook Form + Zod** | Validation, type safety |
| Email | **Resend** or **Nodemailer** | Contact form delivery |
| CGIC content CMS | **Headless WordPress + ACF Pro + Polylang Pro** | Non-technical Jobs and Articles publishing |
| Alsena blog | **MDX + Contentlayer** or headless CMS | Client-manageable content; final choice remains open |
| Analytics | **Google Analytics 4** + **Vercel Analytics** | Traffic + Web Vitals |
| Hosting | **Vercel** | Zero-config deployment, edge network, preview URLs |

### Approach: 1 Project, 1 Repo Per Site

Each website is its own standalone Next.js project and repository. No monorepo. This keeps each site independent, simple to deploy, and avoids coupling between entities that may diverge over time.

We start with **Site 1 (CGIC)**, then replicate the structure for Sites 2 and 3 with per-site customization (branding, pages, content).

### Project Structure — Site 1 (CGIC)

```
cgic-website/
├── public/
│   ├── videos/
│   │   └── hero.mp4              # Hero background video
│   ├── images/
│   │   ├── logo.svg
│   │   ├── og-image.jpg
│   │   └── clients/              # Client logos for carousel
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── app/
│   │   ├── [lang]/
│   │   │   ├── layout.tsx        # Root layout (html lang, fonts, analytics)
│   │   │   ├── page.tsx          # Home — video hero + sections
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx      # Lead form (primary CTA)
│   │   │   └── legal/
│   │   │       ├── privacy/page.tsx
│   │   │       └── terms/page.tsx
│   │   ├── proxy.ts              # i18n locale detection + redirect
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Fixed nav + mega-menu + lang switcher
│   │   │   └── Footer.tsx        # Multi-column footer + socials
│   │   ├── sections/
│   │   │   ├── VideoHero.tsx     # Full-screen video + overlay + big text
│   │   │   ├── AboutPreview.tsx
│   │   │   ├── ServicesGrid.tsx  # Card-based services
│   │   │   ├── ClientLogos.tsx   # Logo carousel / trust bar
│   │   │   └── CTABanner.tsx     # Contact CTA section
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   └── forms/
│   │       └── ContactForm.tsx   # React Hook Form + Zod + server action
│   │
│   ├── dictionaries/
│   │   ├── fr.json               # Primary language
│   │   ├── en.json
│   │   └── nl.json
│   │
│   ├── lib/
│   │   ├── dictionaries.ts       # getDictionary + hasLocale
│   │   ├── i18n.ts               # Locale config, supported locales
│   │   └── utils.ts              # Shared helpers (cn, formatDate, etc.)
│   │
│   └── styles/
│       └── fonts.ts              # Font loading config
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Site 2 (Alsena) — Additions vs. Site 1
- `src/app/[lang]/blog/page.tsx` — Blog listing
- `src/app/[lang]/blog/[slug]/page.tsx` — Blog post
- `src/content/` — MDX blog posts directory
- `src/components/sections/BlogGrid.tsx` — Blog card grid
- `src/components/sections/BlogPost.tsx` — Article layout

### Site 3 (Davit) — Lighter vs. Site 1
- No Services page
- No Blog
- 4 pages only: Home, About, Contact, Legal

### SEO Strategy

- `generateMetadata()` per page with localized titles/descriptions
- `generateStaticParams()` for all locale + route combinations (full static generation)
- Structured data (JSON-LD) for Organization, LocalBusiness, BreadcrumbList
- `sitemap.xml` and `robots.txt` generated per site
- Open Graph + Twitter Card meta tags
- `hreflang` tags for multilingual SEO
- Semantic HTML (header, main, nav, section, article)
- Core Web Vitals optimized (Vercel Analytics monitoring)

### Deployment

- 1 repo per site → 1 Vercel project per site (3 total)
- Custom domains pointed via DNS (client-owned)
- Preview deployments on every PR for client review
- Production on `main` branch merge
- Start with CGIC, clone structure for Alsena and Davit

---

## 9. Domains & Hosting

| Item | Status |
|------|--------|
| Domains owned by client | Yes |
| Hosting | Vercel (Codolie manages deployment) |
| DNS config | Client points domains to Vercel |
| SSL | Automatic via Vercel |

---

## 10. Open Questions (Blocker)

These must be answered before final proposal and kickoff:

### To Client (Alsena Group)

| # | Question | Impact |
|---|----------|--------|
| 1 | **What languages per site?** FR is primary — do we add NL and EN? Same set for all 3? | Scope multiplier (content + dev) |
| 2 | **Relationship between entities?** Is Alsena the parent with CGIC and Davit as subsidiaries? | Design system strategy (shared vs. independent) |
| 3 | **Content delivery date?** When will French copy be ready? | Direct blocker on page builds |
| 4 | **Blog (Alsena):** Needed at launch or scaffolded for later? Who writes? Frequency? | Affects CMS choice and scope |
| 5 | **Contact form destination?** Email only? Or CRM integration (HubSpot, Pipedrive, etc.)? | Backend complexity |
| 6 | **Brand assets:** Do CGIC, Alsena, Davit already have logos/brand guidelines? Or creating from scratch? | Design phase scope |
| 7 | **Design references:** Any sites to avoid or specific elements disliked? | Prevents wasted revision rounds |

### Internal (Codolie)

| # | Question | Owner |
|---|----------|-------|
| 8 | Capacity for Sites 1 & 2 in parallel (~11 pages + i18n + blog)? | Damien |
| 9 | Does the quote account for i18n on all 3 sites + blog CMS? | Damien |
| 10 | Video production for CGIC hero — in-house or stock footage? | Damien |

---

## 11. Scope Guardrails

> Per intake document — **not yet signed by client**.

- This document + intake form define the **full scope**
- Anything not written here is **out of scope**
- **1 design revision round** per site unless otherwise agreed
- New features or pages require a **new quote**
- Timeline depends on **timely content delivery**

**Status:** Awaiting client signature on intake form.

---

## 12. Next Steps

1. Send open questions to Alsena Group
2. Receive signed intake form with scope guardrails confirmed
3. Receive content delivery date commitment
4. Codolie delivers final proposal with timeline and kickoff date
5. Kickoff: repo setup, design phase begins

---

*Codolie Labs SL — 2026*
