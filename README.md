# CGIC website

Next.js public website for CG International Consulting, including multilingual marketing pages, a native RecruitCRM job board and application flow, and WordPress-ready Insights.

## Content modes

RecruitCRM is the source of truth for jobs. The public website fetches published, open jobs server-side and renders a native list, filters, detail pages, and application forms. The RecruitCRM token is never sent to the browser.

Applications follow this server-side sequence:

1. validate the job and PDF résumé;
2. find or create the RecruitCRM candidate;
3. attach the current résumé and apply them to the selected job;
4. return success to the candidate.

Talent Vault is not part of the candidate-facing application flow. If `TALENT_VAULT_API_URL` is deliberately configured, it runs afterward as an invisible, best-effort sidecar. Its availability and result can never block, delay, or change the RecruitCRM application outcome.

Insights run without WordPress by default using typed multilingual fixtures from `src/lib/content/fixtures.ts`. The previous custom Jobs UI, typed job fixtures, detail route, and WordPress job scaffold remain in the repository but are not linked from the public job board or emitted in the sitemap.

Configure the server integrations in `.env.local`:

```bash
cp .env.example .env.local
# Add RECRUITCRM_API_TOKEN
```

Required for live jobs and applications:

- `RECRUITCRM_API_TOKEN`: private RecruitCRM bearer token.
- `RECRUITCRM_API_URL`: defaults to `https://api.recruitcrm.io`.
- `RECRUITCRM_JOBS_PAGE`: public RecruitCRM board identifier; defaults to `Alsena_Ltd_jobs`.

Optional internal sidecar:

- `TALENT_VAULT_API_URL`: Talent Vault API base including `/api`. Leave unset unless CGIC explicitly enables background capture.

Résumés are currently limited to 4 MB PDFs because Vercel Functions impose a 4.5 MB request payload limit. Larger files will require direct-to-storage client uploads.

Set `WORDPRESS_API_URL` to use WordPress for Insights. The WordPress Jobs scaffold remains in the repository but is no longer the public job source.

WordPress REST responses are validated, normalized, and sanitized under `src/lib/content/` and `src/lib/wordpress/`.

## Content routes

- `/{locale}/jobs`
- `/{locale}/insights`
- `/{locale}/insights/{slug}`
- `/{locale}/feed.xml`
- `/api/revalidate`

Supported locales are French (`fr`), English (`en`), and Dutch (`nl`).

## WordPress handoff

The installable integration scaffold remains in `wordpress/plugins/cgic-content/`. It is retained and has not been deleted, although RecruitCRM supersedes its public Jobs listing.

The full architecture, content model, workflows, and acceptance criteria are in `docs/HEADLESS_WORDPRESS_CONTENT_PLATFORM_SPEC.md`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/fr/jobs](http://localhost:3000/fr/jobs) or [http://localhost:3000/fr/insights](http://localhost:3000/fr/insights).

The application uses Next.js App Router, React, Tailwind CSS, next-intl, and Framer Motion.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Job translations

Job copy is authored once in RecruitCRM, in whatever language the recruiter uses, and
translated into the other locales by a scheduled job. The Alsena site shares the same
RecruitCRM board and the same custom fields, so a translation written by either site's
cron is rendered by both; the schedules are offset (Alsena 06:00/18:00, CGIC 07:00/19:00)
so they never race on the same empty field.

- `/api/cron/translate-jobs` fills any **empty** `description_en` / `description_fr` /
  `description_nl` job custom field and never touches a field that already has content —
  so a recruiter's correction survives every later run. To force a re-translation, clear
  the field in RecruitCRM.
- Translations are stored as **Markdown**, not HTML. These custom fields strip tags:
  `<ul><li>a</li></ul>` comes back as `a`. Markdown carries the structure through untouched
  and stays readable for a recruiter editing the record.
- A bare `<` silently truncates the stored value from that point to the end. The model is
  instructed to emit `&lt;`, and `escapeForCustomField()` enforces it before writing.
- Fields are `longtext`, capped at **5000 characters**. A translation over the cap fails
  that one locale and is reported in the cron response rather than being written truncated.
- Each run stops at a 240s budget (or `?limit=`) and reports `incomplete`; the next run
  resumes because only empty fields are filled.
- The site renders the stored Markdown through the same sanitiser as any other CMS copy.
  When a locale has no translation yet, the page falls back to the source description and
  omits `inLanguage` rather than asserting a language it cannot know.
