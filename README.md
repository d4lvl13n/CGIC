# CGIC website

Next.js public website for CG International Consulting, including multilingual marketing pages, RecruitCRM Jobs, and WordPress-ready Insights.

## Content modes

The public Jobs page embeds the live RecruitCRM board at `https://recruitcrm.io/jobs/Alsena_Ltd_jobs`. RecruitCRM is now the public source of truth for active opportunities.

Insights run without WordPress by default using typed multilingual fixtures from `src/lib/content/fixtures.ts`. The previous custom Jobs UI, typed job fixtures, detail route, and WordPress job scaffold remain in the repository but are not linked from the public job board or emitted in the sitemap.

Set `WORDPRESS_API_URL` to switch the server-side content provider to WordPress:

```bash
cp .env.example .env.local
# Edit WORDPRESS_API_URL and secrets in .env.local
```

WordPress REST responses are validated, normalized, and sanitized under `src/lib/content/` and `src/lib/wordpress/`.

## Content routes

- `/{locale}/jobs`
- `/{locale}/insights`
- `/{locale}/insights/{slug}`
- `/{locale}/feed.xml`
- `/api/revalidate`

Supported locales are French (`fr`), English (`en`), and Dutch (`nl`).

## WordPress handoff

The installable integration scaffold remains in `wordpress/plugins/cgic-content/`. It is retained for now and has not been deleted, although RecruitCRM supersedes its public Jobs listing.

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
