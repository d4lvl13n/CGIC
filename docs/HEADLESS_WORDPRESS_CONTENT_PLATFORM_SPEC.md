# CGIC Headless WordPress Content Platform Specification

**Status:** Partially superseded for Jobs; retained for the WordPress/Insights handoff
**Date:** 2026-07-15
**Public frontend:** `https://www.cgic.be`
**Editorial backend:** `https://cms.cgic.be`
**Primary language:** French (`fr`)
**Additional languages:** English (`en`) and Dutch (`nl`)

## 0. RecruitCRM amendment — 2026-07-16

RecruitCRM is now the public source of truth and application surface for job opportunities. The multilingual `/{locale}/jobs` page embeds `https://recruitcrm.io/jobs/Alsena_Ltd_jobs` in a responsive iframe and provides a direct-link fallback.

This amendment supersedes the job-specific WordPress, ACF, REST, filtering, detail-page, preview, and structured-data requirements below. The previous custom Jobs UI, local detail route, fixtures, API integration, and WordPress job plugin scaffold are retained in the repository temporarily, but they are not linked from the public Jobs page and local job-detail URLs are not emitted in the sitemap. The WordPress decisions below continue to apply to Insights unless separately superseded.

## 1. Original WordPress decision (historical)

The original specification proposed WordPress as a headless editorial platform for:

1. Job offers
2. Articles and insights
3. Associated taxonomies, translations, and media

The existing Next.js application remains the only public website. WordPress provides the authenticated editing experience and the public read-only content API; it does not render the CGIC public frontend.

This decision supersedes the CGIC row in `docs/PROJECT_BRIEF.md` that states CGIC has no CMS or blog.

## 2. Goals

- Let non-technical staff create, translate, preview, publish, close, and archive job offers.
- Let non-technical staff author and publish articles using the WordPress block editor.
- Preserve the existing Next.js design system, multilingual routes, SEO behavior, and Vercel deployment.
- Make published changes visible quickly without rebuilding or redeploying the whole application.
- Support approximately 20–30 active jobs without a search service or custom database.
- Keep the integration small, observable, and recoverable when WordPress is temporarily unavailable.
- Maintain one clear source of truth for every field.

## 3. Non-goals

- Rebuilding the existing marketing pages in WordPress.
- Rendering a public WordPress theme.
- Candidate accounts, saved jobs, job alerts, or recruiter dashboards.
- A custom applicant-tracking system.
- Storing CVs in WordPress in the first release.
- Algolia, Elasticsearch, database-backed search, or server-side filtering for the initial catalogue size.
- Letting editors modify the public website layout or design system.
- Automatic machine translation in the first release.

## 4. System architecture

```text
Editors
   |
   v
cms.cgic.be/wp-admin
WordPress + ACF Pro + Polylang Pro
   |                    |
   | REST API           | signed publish webhook
   v                    v
Next.js server data layer ----> /api/revalidate
   |
   v
www.cgic.be
Jobs, article pages, sitemap, RSS, and structured data
```

### 4.1 Responsibilities

| Concern | Source of truth |
|---|---|
| Job and article content | WordPress |
| Publication state and publication dates | WordPress |
| Content translations and translation relationships | Polylang Pro |
| Job filter values | WordPress taxonomies |
| Featured images and article media | WordPress Media Library |
| Interface labels such as “Filter” and “No results” | Next.js translation dictionaries |
| Page layout, components, typography, and responsive behavior | Next.js |
| Canonical public URLs, metadata fallbacks, and structured data rendering | Next.js |
| Applications and candidate records | External application destination; not WordPress |

Content must not be copied into Next.js dictionaries or repository files. UI labels must not be managed in WordPress.

## 5. WordPress platform

### 5.1 Required software

- Current supported WordPress release
- ACF Pro
- Polylang Pro
- A version-controlled CGIC integration plugin, provisionally named `cgic-content`
- Security, backup, and SMTP tooling supplied by the selected managed WordPress host where possible

No page builder is required. WPGraphQL is not required; the standard WordPress REST API is sufficient for this scope.

### 5.2 CGIC integration plugin

The `cgic-content` plugin owns behavior specific to this project:

- Registers the `job` custom post type.
- Registers job taxonomies.
- Loads version-controlled ACF field definitions.
- Registers editor roles and capabilities.
- Removes irrelevant WordPress editing features.
- Sends signed content-change webhooks to Next.js.
- Rewrites WordPress preview links to the Next.js preview flow.
- Adds publication validation for required job fields.
- Adds REST response fields only when WordPress and ACF do not expose them natively.

The plugin source lives at `wordpress/plugins/cgic-content/` in this repository and is packaged for CMS deployment by CI. The content model must not exist only as configuration in the production database. ACF Local JSON or PHP registration must be committed with the plugin so staging and production remain reproducible. ACF documents Local JSON specifically as a version-control and environment-sync mechanism: <https://www.advancedcustomfields.com/resources/local-json/>.

### 5.3 WordPress public surface

- `cms.cgic.be/wp-admin/` provides the editor login.
- `cms.cgic.be/wp-json/` provides the content API.
- The WordPress homepage displays a minimal “CMS only” response or redirects authenticated editors to `/wp-admin/`.
- The WordPress-rendered frontend must carry `noindex` and must not appear in the CGIC sitemap.
- Public content requests from Next.js use the REST API server-to-server. Browser components do not call WordPress directly.

## 6. Content model: jobs

### 6.1 Custom post type

| Property | Value |
|---|---|
| Post type key | `job` |
| REST base | `jobs` |
| Public REST access | Published items only |
| WordPress archive | Disabled or `noindex` |
| Block editor | Disabled for the initial job form |
| Supported native fields | Title, slug, featured image, revision history |
| Translation | Enabled in Polylang Pro |

The post type must use `show_in_rest: true`. WordPress requires this setting for a custom post type to receive standard REST endpoints: <https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-rest-api-support-for-custom-content-types/>.

One WordPress post represents one language version of one job. Polylang links the French, English, and Dutch versions as translations.

Jobs must not be stored as rows in one ACF repeater, an Options Page, or a single WordPress Page. Separate posts provide native drafts, revisions, permissions, translations, stable URLs, and independent publication state.

### 6.2 Job taxonomies

| Taxonomy | Key | Required | Filtered publicly | Notes |
|---|---|---:|---:|---|
| Location | `job_location` | Yes | Yes | Controlled values such as Brussels, Antwerp, Remote |
| Expertise | `job_expertise` | Yes | Yes | Examples: IT, Project Management, Finance |
| Contract type | `job_contract_type` | Yes | Yes | Permanent, Freelance, Temporary, Internship |
| Work mode | `job_work_mode` | Yes | Yes | On-site, Hybrid, Remote |
| Skills | `job_skill` | No | No initially | Used for display and keyword matching |

Editors select terms; they do not enter these values as free text. Term slugs are stable integration identifiers and must not change after launch without a migration.

Polylang translation must be enabled for public-facing taxonomy labels. Next.js filtering uses stable term IDs or slugs, not translated names.

### 6.3 Job ACF fields

The ACF field group is named **Job details** and is visible only for the `job` post type.

| Field | ACF name | Type | Required | Notes |
|---|---|---|---:|---|
| Internal reference | `reference` | Text | Yes | Stable human-readable identifier, e.g. `CGIC-2026-014` |
| Short summary | `summary` | Textarea | Yes | Plain text, maximum 280 characters |
| Responsibilities | `responsibilities` | WYSIWYG | Yes | Restricted toolbar |
| Candidate profile | `candidate_profile` | WYSIWYG | Yes | Restricted toolbar |
| What CGIC offers | `offer` | WYSIWYG | No | Restricted toolbar |
| Start date | `start_date` | Date | No | ISO date in REST adapter |
| Closing date | `closing_date` | Date | Yes | Controls expiry and `validThrough` |
| Job state | `job_state` | Select | Yes | `open` or `closed`; default `open` |
| Featured | `featured` | True/false | No | Default false |
| Application URL | `application_url` | URL | Yes | External ATS or managed application form |
| Contact display name | `contact_name` | Text | No | Never exposes a WordPress user account |
| Remote applicant countries | `applicant_countries` | Multi-select country codes | Conditional | Required for remote-only jobs unless explicitly unrestricted |
| SEO title | `seo_title` | Text | No | Falls back to job title plus CGIC |
| SEO description | `seo_description` | Textarea | No | Falls back to summary |

ACF fields are enabled for the REST API through the field group setting. ACF supports custom fields on custom post types in the normal WordPress REST endpoints: <https://www.advancedcustomfields.com/resources/wp-rest-api-integration/>.

### 6.4 Location term fields

Each `job_location` term contains enough structured data for job SEO:

| Field | ACF name | Required |
|---|---|---:|
| Display label | Native term name | Yes |
| City | `city` | Conditional |
| Region | `region` | Conditional |
| Country code | `country_code` | Yes |
| Postal code | `postal_code` | No |
| Street address | `street_address` | No |

Remote-only jobs do not require a street address. Country restrictions for remote work must be stated explicitly in job content.

### 6.5 Job publication rules

A job cannot be published unless it has:

- A title and slug
- A unique internal reference
- Summary, responsibilities, and candidate profile
- Location, expertise, contract type, and work mode
- A closing date later than the publication date
- A valid HTTPS application URL
- A language assignment

Publishing validation runs in WordPress and returns actionable editor messages. Next.js validation remains a second defensive layer.

An active job satisfies all of the following:

- WordPress status is `publish`.
- `job_state` is `open`.
- `closing_date` has not passed in the `Europe/Brussels` timezone.

On publication, the CGIC plugin schedules a closure event for the closing date. The managed host must run real cron against WordPress at least every five minutes rather than relying only on visitor-triggered WP-Cron. The closure event sets `job_state` to `closed` and sends the normal signed webhook. Next.js time-based validation remains a defensive fallback.

Closed or expired jobs:

- Disappear from the jobs listing and job filters.
- Disappear from the XML sitemap.
- Remain available at their detail URL with a clear “Position closed” message.
- Do not show an application CTA.
- Do not emit `JobPosting` structured data.
- Emit `noindex, follow` while retained as a closed page.

Editors may move old jobs to Draft or Trash after the agreed retention period. The default retention period is 90 days after closing.

## 7. Content model: articles

### 7.1 WordPress posts

Articles use the native WordPress `post` type so editors retain the familiar block-editor workflow.

| Native feature | Usage |
|---|---|
| Title | Public article title |
| Slug | Localized public slug |
| Block content | Article body |
| Excerpt | Listing summary and metadata fallback |
| Featured image | Listing and social preview image |
| Categories | Primary public classification |
| Tags | Disabled initially to prevent taxonomy sprawl |
| Publication date | Public article date |
| Updated date | Public “updated” date where materially changed |
| Author | Internal audit only; public byline comes from ACF |
| Revisions | Enabled |
| Comments | Disabled |

### 7.2 Allowed article blocks

The editor block allow-list is:

- Paragraph
- Heading levels 2–4
- Bulleted and numbered lists
- Quote
- Image
- Gallery
- Table
- Separator
- Buttons/links
- Pullquote, if the frontend design includes it

Arbitrary HTML, scripts, iframes, unsupported embeds, layout columns, and theme-specific blocks are disabled. New block types require frontend rendering and responsive QA before being enabled.

### 7.3 Article ACF fields

| Field | ACF name | Type | Required | Notes |
|---|---|---|---:|---|
| Public byline | `byline` | Text | Yes | Defaults to `CGIC Editorial Team` |
| SEO title | `seo_title` | Text | No | Falls back to article title plus CGIC |
| SEO description | `seo_description` | Textarea | No | Falls back to excerpt |
| Social image | `social_image` | Image | No | Falls back to featured image |
| Featured article | `featured` | True/false | No | Default false |

Reading time is computed by Next.js from the rendered article text; editors do not enter it manually.

### 7.4 Article routes

The default public section name is **Insights**:

- `/{locale}/insights`
- `/{locale}/insights/{localized-slug}`
- `/{locale}/feed.xml`, with `/feed.xml` redirecting to the French feed

The route segment remains `insights` in all languages to match the existing project’s language-neutral route pattern. Visible navigation labels are translated.

Articles display newest first. The first release uses category chips and server-rendered pagination after 12 items. Full-text article search is out of scope.

## 8. Multilingual model

### 8.1 Languages

| Code | WordPress locale | Public prefix | Role |
|---|---|---|---|
| `fr` | `fr_FR` or agreed Belgian French locale | `/fr` | Primary |
| `en` | `en_GB` | `/en` | Secondary |
| `nl` | `nl_BE` | `/nl` | Secondary |

The final WordPress locale choice for French must be confirmed during CMS setup; public routing remains `fr`.

### 8.2 Translation behavior

Polylang Pro owns language assignments and translation relationships. Its REST integration adds `lang` and `translations` fields and supports `?lang=fr` for posts, terms, and custom post types: <https://polylang.pro/documentation/support/developers/rest-api/>.

Rules:

- Every item must have exactly one language.
- French is the source language unless an editor explicitly creates another source.
- Each translation is a separate WordPress post with its own title, body, excerpt, slug, and SEO fields.
- Publication is independent per translation.
- Missing translations do not block publication.
- Next.js emits `hreflang` only for published translations that exist.
- On a detail page, the language switcher navigates to the translated item’s localized slug.
- If no translation exists, the switcher navigates to that language’s listing page, never to unrelated or fallback content.
- Taxonomy terms shown publicly must be translated and linked in Polylang.

Machine translation may be added later, but generated text must remain Draft until reviewed by a human editor.

## 9. Editor experience and permissions

### 9.1 Roles

| Role | Capabilities |
|---|---|
| Administrator | WordPress and plugin administration; user management; all content |
| Job Editor | Create, edit, translate, preview, publish, close, and archive jobs; manage approved job taxonomy terms |
| Article Editor | Create, edit, translate, preview, publish, and archive articles; manage article categories and media |
| Reviewer | Edit and preview content; submit for review; cannot publish |
| Integration user | Server-only read access to drafts for preview; no interactive login |

At least two human administrator accounts must exist. Daily editorial users must not be administrators.

### 9.2 Job editor layout

The Job edit screen is ordered as:

1. Title and language
2. Classification: location, expertise, contract, work mode, skills
3. Summary
4. Responsibilities
5. Candidate profile
6. Offer
7. Dates and state
8. Application
9. SEO and featured settings
10. Translation links, preview, and publish controls

WordPress comments, discussion, trackbacks, custom-field metaboxes, and irrelevant post settings are hidden.

### 9.3 Editorial workflows

**New job:** Draft → Preview → Publish → Close/expire → Archive
**New article:** Draft → Preview → Pending Review (optional) → Publish → Update/archive
**Translation:** Create linked translation → Translate → Preview → Publish independently

The admin list for jobs shows language, reference, location, contract type, state, closing date, and publication status. Editors can filter the list by language, state, location, and expiry.

## 10. REST API contract

### 10.1 Endpoints consumed by Next.js

| Content | Endpoint pattern |
|---|---|
| Jobs list | `/wp-json/wp/v2/jobs?lang={locale}&status=publish&per_page=100` |
| Job by slug | `/wp-json/wp/v2/jobs?lang={locale}&slug={slug}&status=publish` |
| Articles list | `/wp-json/wp/v2/posts?lang={locale}&status=publish&page={n}&per_page=12` |
| Article by slug | `/wp-json/wp/v2/posts?lang={locale}&slug={slug}&status=publish` |
| Job taxonomy terms | Standard REST term endpoints with `lang={locale}` |
| Media | `_embed` on content responses where possible; media endpoint otherwise |

List queries use `_fields` and selective `_embed` parameters so WordPress returns only required data. WordPress documents these response controls as global REST parameters: <https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/>.

Every job taxonomy is registered with `show_in_rest: true`. Article pagination reads WordPress pagination headers such as `X-WP-Total` and `X-WP-TotalPages`; it must not infer whether another page exists from the number of returned records.

### 10.2 Server-only adapter

Raw WordPress response objects must not enter React components directly. Add a server-only adapter under `src/lib/wordpress/` that:

- Builds REST URLs.
- Fetches and caches responses.
- Validates payloads with Zod.
- Converts WordPress HTML entities and dates.
- Maps ACF values and taxonomies into stable application types.
- Resolves embedded media.
- Maps Polylang translation IDs to public alternate URLs.
- Rejects malformed published records and logs the content ID and validation issue.

Proposed normalized types:

```ts
type Locale = "fr" | "en" | "nl";

type JobSummary = {
  id: number;
  reference: string;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  location: TaxonomyValue;
  expertise: TaxonomyValue;
  contractType: TaxonomyValue;
  workMode: TaxonomyValue;
  skills: TaxonomyValue[];
  publishedAt: string;
  closingDate: string;
  featured: boolean;
};

type Job = JobSummary & {
  responsibilitiesHtml: string;
  candidateProfileHtml: string;
  offerHtml?: string;
  startDate?: string;
  state: "open" | "closed";
  applicationUrl: string;
  contactName?: string;
  featuredImage?: CmsImage;
  seo: SeoFields;
  translations: Partial<Record<Locale, TranslationRef>>;
};

type ArticleSummary = {
  id: number;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  category: TaxonomyValue;
  publishedAt: string;
  updatedAt: string;
  byline: string;
  featured: boolean;
  featuredImage?: CmsImage;
};
```

### 10.3 HTML trust boundary

- Only authenticated WordPress editors can create article and WYSIWYG content.
- WordPress sanitization and the block allow-list are the primary authoring controls.
- Next.js renders only fields explicitly permitted by the adapter.
- Script elements, inline event handlers, unsafe URL schemes, and unsupported embeds are stripped or rejected before rendering.
- Plain-text fields are always rendered as text, not HTML.

## 11. Next.js public experience

### 11.1 Routes

```text
src/app/[locale]/jobs/page.tsx
src/app/[locale]/jobs/[slug]/page.tsx
src/app/[locale]/insights/page.tsx
src/app/[locale]/insights/[slug]/page.tsx
src/app/[locale]/feed.xml/route.ts
src/app/feed.xml/route.ts
src/app/api/revalidate/route.ts
src/app/api/preview/route.ts
src/lib/wordpress/client.ts
src/lib/wordpress/jobs.ts
src/lib/wordpress/articles.ts
src/lib/wordpress/schemas.ts
```

The main navigation gains **Jobs** and **Insights**, with translated visible labels. The footer also links to both sections.

### 11.2 Jobs listing

The server renders all active job summaries for the selected locale. A client component performs instant local filtering.

Controls:

- Keyword search across title, summary, location, expertise, and skills
- Location
- Expertise
- Contract type
- Work mode
- Clear all filters

Behavior:

- Filter options are derived from all active jobs in the selected locale, not only the currently filtered subset.
- Option counts may respond to the other active filters, but a selected option is never hidden simply because the current combination has zero matches.
- Filter state is represented in URL search parameters.
- The back button restores the previous filter state.
- Results update immediately and announce the count to assistive technology.
- There is no pagination for the first 100 active jobs.
- A useful empty state explains that no role matches and offers a one-click reset.
- Cards show title, summary, location, contract type, work mode, and closing date.
- Featured jobs may be ordered first, followed by publication date descending.

### 11.3 Job detail

Each job detail page includes:

- Title and reference
- Location, expertise, contract type, work mode, and start date
- Summary
- Responsibilities
- Candidate profile
- What CGIC offers, when provided
- Skills
- Closing date
- Persistent Apply CTA on desktop and mobile
- Related active jobs based on expertise and location
- Closed-state banner when applicable

The Apply CTA opens the configured HTTPS application URL. External destinations are visibly identified and use safe link attributes.

### 11.4 Insights listing and detail

The Insights listing includes:

- Featured article treatment when configured
- Article cards with image, category, title, excerpt, date, byline, and reading time
- Category filter chips
- Server-rendered pagination after 12 articles

The article detail includes:

- Title, category, publication date, updated date when relevant, byline, and reading time
- Featured image with editor-provided alternative text
- Styled Gutenberg content matching `docs/CGIC-DESIGN-SYSTEM.md`
- Previous/next or related articles
- Share links implemented as ordinary links, without third-party tracking scripts

## 12. Applications boundary

The first release does not collect application data or CV files in WordPress or Next.js.

Each published job requires an `application_url` pointing to one of:

1. The client’s ATS
2. A managed GDPR-capable application form
3. Another explicitly approved recruitment platform

The external system owns consent capture, file uploads, retention, deletion requests, candidate notifications, and access controls.

If CGIC later wants a native application form, it requires a separate specification covering storage, malware scanning, encryption, retention, spam controls, consent, data-subject requests, email delivery, and processor agreements.

## 13. Cache invalidation and publication

### 13.1 Cache policy

- Jobs list responses use the `jobs` cache tag.
- Individual jobs use both `jobs` and `job:{wordpressId}` tags.
- Article lists use the `articles` tag.
- Individual articles use both `articles` and `article:{wordpressId}` tags.
- Taxonomies use content-type-specific taxonomy tags.
- A five-minute time-based refresh is retained as a fallback if a webhook is missed.

### 13.2 Webhook

The CGIC WordPress plugin sends a webhook when a relevant item is:

- Published
- Updated while published
- Closed or reopened
- Scheduled and then published
- Moved to Draft, Trash, or restored
- Deleted
- Given a new translation relationship
- Assigned changed public taxonomy terms

The payload contains event type, post type, post ID, language, old/new status, modified timestamp, and affected taxonomy identifiers. It contains no article body, candidate data, credentials, or application secrets.

The Next.js route:

- Accepts `POST` only.
- Verifies an HMAC signature over the raw body and rejects stale timestamps.
- Validates the payload schema.
- Revalidates the narrow content tag and the relevant listing, sitemap, and RSS tags.
- Returns a stable success/error response for WordPress logs.
- Does not accept a secret in the query string.

Next.js recommends tag-based revalidation for CMS content and supports it from Route Handlers: <https://nextjs.org/docs/app/getting-started/revalidating>.

WordPress ignores autosaves and revisions and debounces duplicate save hooks. Failed webhook deliveries are logged and retried with bounded exponential backoff.

## 14. Preview workflow

Preview is required for both jobs and articles before launch.

1. An editor clicks Preview in WordPress, causing WordPress to save a preview revision or autosave.
2. The CGIC plugin creates a short-lived, signed URL for `www.cgic.be/api/preview` containing post type, post ID, exact revision/autosave ID, language, timestamp, and signature.
3. Next.js validates the signature and enables Draft Mode.
4. Next.js fetches that exact revision/autosave through an authenticated WordPress REST endpoint using a dedicated server-only integration account and WordPress Application Password.
5. The editor is redirected to the correct frontend preview route.
6. A visible preview banner identifies unpublished content and provides an exit-preview action.

Requirements:

- Preview URLs expire after 10 minutes.
- Draft content is never cached publicly or indexed.
- WordPress integration credentials exist only in server environment variables.
- The integration account has only the capabilities required to read draft Jobs and Posts.
- A preview never silently falls back from the signed revision to the current published version.
- Preview errors explain whether the link expired, the content is missing, or WordPress is unavailable.

## 15. SEO and discovery

### 15.1 Jobs

Every active job detail page emits `JobPosting` JSON-LD using normalized job data, including:

- `title`
- `description`
- `datePosted`
- `validThrough`
- `employmentType`
- `hiringOrganization`
- `jobLocation` or applicable remote-work properties
- `identifier`
- `directApply` only when the destination genuinely supports direct application

Structured data is never emitted for a closed, expired, Draft, or previewed job.

Contract taxonomy slugs map through a tested explicit table to Schema.org values such as `FULL_TIME`, `CONTRACTOR`, `TEMPORARY`, and `INTERN`; translated labels are never used as schema identifiers. A remote-only job emits the appropriate remote-work properties and applicant-location requirements from `applicant_countries`. If the required remote eligibility data is missing, the job fails publication validation rather than emitting incomplete structured data.

### 15.2 Articles

Every article detail page emits `Article` or `BlogPosting` JSON-LD with headline, description, image, author/byline, publisher, publication date, modified date, canonical URL, and language.

### 15.3 Shared SEO requirements

- Canonical URLs always use `www.cgic.be`, never the WordPress URL.
- `hreflang` lists only existing published translations.
- Open Graph and social metadata use ACF overrides with documented fallbacks.
- The dynamic sitemap includes active jobs and published articles in all available languages.
- Closed jobs are excluded from the sitemap.
- `/{locale}/feed.xml` contains the latest 20 published articles for that language and uses only public CGIC URLs.
- `/feed.xml` redirects permanently to `/fr/feed.xml` as the default-language feed.
- Each localized layout advertises its matching localized feed rather than one mixed-language feed.
- CMS pages and preview routes are `noindex`.
- The WordPress domain must not appear in public canonical tags, Open Graph URLs, or structured data.

## 16. Media

- Editors upload article and job images to the WordPress Media Library.
- Alternative text is mandatory before an image can be used as a featured image.
- Recommended featured-image aspect ratio is documented in the editor help text.
- Upload size and allowed MIME types are restricted.
- SVG uploads are disabled unless a dedicated sanitized workflow is introduced.
- Next.js `images.remotePatterns` allows only the CMS media hostname or an approved media CDN.
- Images are rendered through `next/image` where practical.
- Deleting media that is still referenced is prevented operationally or surfaced by validation.
- Image URLs are normalized through the CMS adapter so a future CDN migration does not change component contracts.

## 17. Security and operations

### 17.1 WordPress

- Use managed hosting with staging, automated backups, TLS, WAF/rate limiting, and monitored updates.
- Require strong passwords and two-factor authentication for human editors.
- Use least-privilege roles.
- Disable XML-RPC unless a confirmed integration requires it.
- Disable comments and public user archives.
- Prevent anonymous REST user enumeration where it is not required.
- Keep the REST API enabled; Gutenberg, ACF, Polylang, and the headless frontend depend on it.
- Limit installed plugins to the approved inventory.
- Test WordPress, PHP, ACF, and Polylang upgrades in staging before production.
- Back up the database and uploads daily; document restoration and test it at least quarterly.

### 17.2 Secrets

- `WORDPRESS_API_URL`
- `WORDPRESS_PREVIEW_USERNAME`
- `WORDPRESS_PREVIEW_APPLICATION_PASSWORD`
- `WORDPRESS_PREVIEW_SIGNING_SECRET`
- `WORDPRESS_WEBHOOK_SIGNING_SECRET`

Secrets are stored independently in WordPress hosting and Vercel environment configuration. They are never exposed through `NEXT_PUBLIC_*`, committed to Git, placed in webhook query strings, or logged.

### 17.3 Monitoring

Monitor:

- CMS availability and TLS certificate
- REST endpoint health
- Webhook delivery failures
- Next.js content-adapter validation failures
- Preview failures
- Stale content age
- 404s for job and article routes
- Scheduled backup success

Logs must identify WordPress content IDs and event types without logging credentials or full content bodies.

### 17.4 Deployment and environments

- Local, staging, and production environments use the same version-controlled CGIC plugin.
- Staging and production have separate WordPress databases, uploads, users, credentials, webhook secrets, and Next.js environment variables.
- Plugin and ACF schema changes are deployed to staging and verified before production.
- A production database backup is taken before a schema-changing plugin release.
- Content is not overwritten when plugin code is deployed.
- Plugin releases are versioned and include a rollback package and release notes.
- Next.js and WordPress releases may deploy independently, but backward-compatible REST changes are required during the transition window.

## 18. Failure behavior

- Cached public content remains available during a temporary WordPress outage.
- A transient CMS failure must not turn an already cached page into a 500 response.
- A new uncached route that cannot load required content returns a controlled error or 404 and records the failure.
- A malformed WordPress record is excluded from listings and logged; it must not crash the entire list.
- The five-minute fallback refresh corrects missed webhooks.
- Editors see webhook and validation failures in WordPress with actionable retry guidance.
- Build and deployment health checks explicitly test one job endpoint, one article endpoint, and CMS-independent marketing pages.

## 19. Analytics

Track through the existing analytics layer:

- `jobs_viewed`
- `job_filter_changed`
- `job_search_used`
- `job_detail_viewed`
- `job_apply_clicked`
- `insights_viewed`
- `article_viewed`
- `article_category_selected`

Events use job reference, taxonomy slugs, article ID, locale, and destination class. They must not include names, email addresses, CV data, free-text searches that could contain personal data, or full external URLs with query parameters.

## 20. Implementation phases

### Phase 0 — Confirmations

- Confirm managed WordPress host and staging environment.
- Confirm `cms.cgic.be` DNS ownership.
- Confirm Polylang Pro and ACF Pro licences.
- Confirm French WordPress locale.
- Confirm the public label and route `Insights` / `/insights`.
- Confirm approved application platform and URL format.
- Confirm who may publish versus submit for review.
- Confirm job retention period; default is 90 days.

### Phase 1 — CMS foundation

- Provision staging and production WordPress.
- Install approved plugins.
- Build and version the `cgic-content` plugin.
- Register roles, Jobs, taxonomies, ACF fields, and languages.
- Configure media policies, backups, security, and noindex behavior.
- Seed representative content in all three languages.

### Phase 2 — Next.js data layer

- Add WordPress environment configuration.
- Add REST client, Zod schemas, normalized types, caching, and error handling.
- Add media host configuration.
- Add fixture-driven unit tests for raw REST payload normalization.

### Phase 3 — Public Jobs

- Add navigation and translated UI labels.
- Build jobs list, filters, URL state, details, closed states, related jobs, metadata, and structured data.
- Add dynamic sitemap entries.
- Add analytics events.

### Phase 4 — Public Insights

- Build article listing, category filtering, pagination, details, block styling, metadata, structured data, and related articles.
- Implement localized feeds and the default `/feed.xml` redirect.
- Add dynamic sitemap entries and analytics.

### Phase 5 — Editorial integration

- Implement signed webhooks and fallback revalidation.
- Implement signed preview and Draft Mode.
- Add admin columns, validation, help text, and editor restrictions.
- Test scheduled publishing, updates, closure, deletion, and translations.

### Phase 6 — Launch

- Train editors with a short written runbook and recorded walkthrough.
- Run accessibility, responsive, SEO, structured-data, security, and failure-mode QA.
- Verify production webhooks and preview.
- Publish initial jobs and articles.
- Monitor logs and analytics during the first week.

## 21. Acceptance criteria

### CMS and permissions

- A Job Editor can complete the full job lifecycle without developer assistance.
- An Article Editor can author a structured article without layout controls that break the frontend.
- A Reviewer cannot publish.
- Editors cannot administer plugins, themes, users, or site settings.
- Required-field errors prevent invalid job publication and identify the exact missing fields.
- French, English, and Dutch translations can be linked and published independently.

### Jobs

- The jobs list shows only active jobs for the selected language.
- All five controls work together and are represented in the URL.
- Filtering 100 local summaries feels immediate on a representative mobile device.
- Closed and expired jobs leave the listing automatically.
- A closed job detail page contains no Apply CTA or `JobPosting` structured data.
- Active job structured data matches the visible page content.
- Every Apply CTA resolves to the job’s configured approved destination.

### Articles

- Published articles render all allowed blocks consistently at mobile and desktop widths.
- Unsupported blocks cannot be added by normal editors.
- Article categories, pagination, metadata, social images, and reading time are correct.
- The article feed returns valid XML and public CGIC URLs.

### Integration

- Publishing or updating content is visible on the public site within 60 seconds under normal operation.
- Missing webhooks self-correct within five minutes.
- Draft preview renders the exact signed WordPress revision/autosave securely and is never publicly indexed.
- Invalid webhook signatures, expired preview links, and malformed REST payloads are rejected.
- A temporary WordPress outage does not remove cached public content.
- The sitemap reflects publication, translation, closure, and deletion events.

### SEO and accessibility

- Canonical, Open Graph, sitemap, structured-data, and alternate-language URLs use `www.cgic.be`.
- `hreflang` never points to a missing translation.
- Filter controls, result counts, empty states, pagination, and Apply actions are keyboard and screen-reader accessible.
- Featured images have meaningful alternative text or are explicitly decorative.
- Job and article pages pass the agreed automated accessibility and structured-data checks with no critical issues.

## 22. Testing strategy

### Automated

- Unit tests for Zod schemas and WordPress-to-domain normalization.
- Contract fixtures for jobs, articles, taxonomies, media, translations, missing optional fields, and malformed responses.
- Filter behavior and URL-state tests.
- Expiry boundary tests in `Europe/Brussels`, including daylight-saving transitions.
- Metadata and structured-data snapshot/semantic tests.
- Webhook signature, replay-window, and tag-selection tests.
- Preview signature and expiry tests.
- Sitemap and RSS generation tests.

### Integration

- Staging WordPress REST API against the actual installed plugin versions.
- Publish, update, schedule, translate, close, restore, trash, and delete workflows.
- Featured-media replacement and missing-media behavior.
- WordPress outage, timeout, invalid JSON, and partial record behavior.

### Manual

- Editor walkthrough with a non-technical client representative.
- Mobile and desktop responsive review.
- Keyboard-only and screen-reader smoke test.
- Search-engine structured-data validation for representative jobs and articles.
- Social-sharing preview validation.
- Backup restoration rehearsal in staging.

## 23. Required client decisions

The architecture is implementable as written. The following decisions must be confirmed before production launch:

1. Is the public editorial section called **Insights**, **Articles**, or **News**?
2. Which platform receives job applications?
3. Who can publish immediately, and who must submit for review?
4. Are all jobs expected in all three languages, or are partial translations acceptable?
5. Is the default 90-day closed-job retention acceptable?
6. Should article author names identify individuals or always use `CGIC Editorial Team`?
7. Which managed WordPress host and maintenance owner are approved?

## 24. Definition of done

The content platform is done when:

- WordPress production and staging are reproducible from documented configuration and the version-controlled CGIC plugin.
- A trained non-technical editor can publish and preview a job and article in each language.
- Next.js renders, filters, caches, invalidates, previews, and indexes the content according to this specification.
- Applications leave CGIC through an approved external destination without CGIC storing candidate files.
- Security, accessibility, SEO, structured-data, failure-mode, and backup acceptance criteria pass.
- Operational ownership, plugin licences, credentials, update cadence, and incident contacts are documented and handed over.
