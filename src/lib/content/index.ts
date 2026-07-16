import { getFixtureArticles, getFixtureJobs } from "./fixtures";
import type { Article, CmsImage, Job, Locale, Paginated, TaxonomyValue } from "./types";
import { plainTextFromHtml, sanitizeCmsHtml } from "./sanitize";
import { isWordPressConfigured, wpFetch } from "@/lib/wordpress/client";
import { wpContentItemSchema, wpContentListSchema, type WpContentItem, type WpTerm } from "@/lib/wordpress/schemas";
import { isRecruitCrmConfigured, listRecruitCrmJobs } from "@/lib/recruitcrm/client";
import type { RecruitCrmJob } from "@/lib/recruitcrm/schemas";

function todayInBrussels() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function isJobActive(job: Job) {
  return job.state === "open" && (!job.closingDate || job.closingDate >= todayInBrussels());
}

function stableNumber(value: string) {
  let hash = 0;
  for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function localizedJobLabels(locale: Locale) {
  return {
    contract: {
      1: locale === "fr" ? "Temps partiel" : locale === "nl" ? "Deeltijds" : "Part time",
      2: locale === "fr" ? "Temps plein" : locale === "nl" ? "Voltijds" : "Full time",
      3: locale === "fr" ? "Freelance" : locale === "nl" ? "Freelance" : "Contract",
      4: locale === "fr" ? "Contrat vers CDI" : locale === "nl" ? "Contract met optie vast" : "Contract to permanent",
    },
    mode: {
      0: locale === "fr" ? "Sur site" : locale === "nl" ? "Op locatie" : "On-site",
      1: locale === "fr" ? "À distance" : locale === "nl" ? "Op afstand" : "Remote",
      2: locale === "fr" ? "Hybride" : locale === "nl" ? "Hybride" : "Hybrid",
    },
  } as const;
}

function countryCode(value?: string | null) {
  if (!value) return "BE";
  if (/^[a-z]{2}$/i.test(value)) return value.toUpperCase();
  const codes: Record<string, string> = {
    belgium: "BE",
    belgique: "BE",
    belgie: "BE",
    france: "FR",
    netherlands: "NL",
    nederland: "NL",
    luxembourg: "LU",
    germany: "DE",
    deutschland: "DE",
  };
  return codes[value.trim().toLowerCase()] ?? "BE";
}

function isTruthyFlag(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function isRecruitCrmJobPublic(job: RecruitCrmJob) {
  const status = job.job_status?.label.trim().toLowerCase();
  const posting = job.job_posting_status?.trim().toLowerCase();
  const published = posting
    ? ["publish", "posted", "live"].some((marker) => posting.includes(marker))
    : isTruthyFlag(job.enable_job_application_form);
  return status === "open" && published && isTruthyFlag(job.enable_job_application_form);
}

function recruiterDescription(job: RecruitCrmJob) {
  const source = job.job_description_text?.trim() || job.note_for_candidates?.trim();
  if (!source) return "<p>Contact the CGIC talent team to learn more about this opportunity.</p>";
  if (/<[a-z][\s\S]*>/i.test(source)) return sanitizeCmsHtml(source);
  const paragraphs = source.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`).join("");
  return sanitizeCmsHtml(paragraphs);
}

function normalizeRecruitCrmJob(job: RecruitCrmJob, locale: Locale): Job {
  const labels = localizedJobLabels(locale);
  const jobType = Number(job.job_type) as 1 | 2 | 3 | 4;
  const locationType = Number(job.job_location_type) as 0 | 1 | 2;
  const descriptionHtml = recruiterDescription(job);
  const summarySource = job.note_for_candidates?.trim() || plainTextFromHtml(descriptionHtml);
  const summary = summarySource.length > 240 ? `${summarySource.slice(0, 237).trimEnd()}…` : summarySource;
  const publicSlug = `${slugify(job.name) || "opportunity"}-${job.slug}`;
  const locationLabel = [job.city, job.country].filter(Boolean).join(", ") || labels.mode[locationType] || "Belgium";
  const expertiseLabel = job.job_category?.trim() || "Consulting";
  const contractLabel = labels.contract[jobType] || (locale === "fr" ? "À convenir" : locale === "nl" ? "Te bespreken" : "To be discussed");
  const contractSlug = jobType === 3 ? "freelance" : jobType === 2 ? "permanent" : jobType === 1 ? "part-time" : "contract-to-permanent";
  const modeLabel = labels.mode[locationType] || labels.mode[0];
  const modeSlug = locationType === 1 ? "remote" : locationType === 2 ? "hybrid" : "onsite";
  const skills = (job.job_skill ?? "").split(",").map((skill) => skill.trim()).filter(Boolean);

  return {
    id: typeof job.id === "number" ? job.id : stableNumber(String(job.id)),
    recruitCrmSlug: job.slug,
    reference: job.job_code?.trim() || `RCRM-${job.slug}`,
    locale,
    slug: publicSlug,
    title: job.name,
    summary,
    responsibilitiesHtml: descriptionHtml,
    candidateProfileHtml: "",
    location: {
      id: stableNumber(`location:${locationLabel}`),
      slug: slugify(locationLabel),
      label: locationLabel,
      city: job.city ?? undefined,
      region: job.state ?? undefined,
      countryCode: countryCode(job.country),
      postalCode: job.postal_code ?? undefined,
      streetAddress: job.address ?? undefined,
    },
    expertise: { id: stableNumber(`expertise:${expertiseLabel}`), slug: slugify(expertiseLabel), label: expertiseLabel },
    contractType: { id: jobType || 0, slug: contractSlug, label: contractLabel },
    workMode: { id: locationType + 1, slug: modeSlug, label: modeLabel },
    skills: skills.map((skill) => ({ id: stableNumber(`skill:${skill}`), slug: slugify(skill), label: skill })),
    publishedAt: job.created_on || job.updated_on || "2026-01-01T00:00:00.000Z",
    state: "open",
    featured: false,
    applicationUrl: `#apply`,
    contactName: "CGIC Talent Team",
    seo: { title: job.name, description: summary },
    alternates: { fr: publicSlug, en: publicSlug, nl: publicSlug },
  };
}

function flattenTerms(item: WpContentItem): WpTerm[] {
  return item._embedded?.["wp:term"]?.flat() ?? [];
}

function requiredTerm(item: WpContentItem, taxonomy: string): WpTerm {
  const value = flattenTerms(item).find((candidate) => candidate.taxonomy === taxonomy);
  if (!value) {
    throw new Error(`WordPress item ${item.id} is missing taxonomy ${taxonomy}`);
  }
  return value;
}

function taxonomyValue(value: WpTerm): TaxonomyValue {
  return { id: value.id, slug: value.slug, label: plainTextFromHtml(value.name) };
}

function imageFrom(item: WpContentItem): CmsImage | undefined {
  const image = item._embedded?.["wp:featuredmedia"]?.[0];
  if (!image) return undefined;
  return {
    url: image.source_url,
    alt: image.alt_text,
    width: image.media_details?.width ?? 1600,
    height: image.media_details?.height ?? 900,
  };
}

function imageField(item: WpContentItem, key: string): CmsImage | undefined {
  const value = item.acf[key];
  if (!value || typeof value !== "object") return undefined;
  const image = value as Record<string, unknown>;
  if (typeof image.url !== "string") return undefined;
  return {
    url: image.url,
    alt: typeof image.alt === "string" ? image.alt : "",
    width: typeof image.width === "number" ? image.width : 1600,
    height: typeof image.height === "number" ? image.height : 900,
  };
}

function stringField(item: WpContentItem, key: string, required = false) {
  const value = item.acf[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (required) throw new Error(`WordPress item ${item.id} is missing ACF field ${key}`);
  return undefined;
}

function booleanField(item: WpContentItem, key: string) {
  const value = item.acf[key];
  return value === true || value === 1 || value === "1";
}

function localeFrom(item: WpContentItem, fallback: Locale): Locale {
  return item.lang === "fr" || item.lang === "en" || item.lang === "nl" ? item.lang : fallback;
}

function normalizeJob(item: WpContentItem, locale: Locale): Job {
  const location = requiredTerm(item, "job_location");
  const locationAcf = location.acf ?? {};
  const applicantCountries = item.acf.applicant_countries;

  return {
    id: item.id,
    reference: stringField(item, "reference", true)!,
    locale: localeFrom(item, locale),
    slug: item.slug,
    title: plainTextFromHtml(item.title.rendered),
    summary: stringField(item, "summary", true)!,
    responsibilitiesHtml: sanitizeCmsHtml(stringField(item, "responsibilities", true)!),
    candidateProfileHtml: sanitizeCmsHtml(stringField(item, "candidate_profile", true)!),
    offerHtml: stringField(item, "offer") ? sanitizeCmsHtml(stringField(item, "offer")!) : undefined,
    location: {
      ...taxonomyValue(location),
      city: typeof locationAcf.city === "string" ? locationAcf.city : undefined,
      region: typeof locationAcf.region === "string" ? locationAcf.region : undefined,
      countryCode: typeof locationAcf.country_code === "string" ? locationAcf.country_code : "BE",
      postalCode: typeof locationAcf.postal_code === "string" ? locationAcf.postal_code : undefined,
      streetAddress: typeof locationAcf.street_address === "string" ? locationAcf.street_address : undefined,
    },
    expertise: taxonomyValue(requiredTerm(item, "job_expertise")),
    contractType: taxonomyValue(requiredTerm(item, "job_contract_type")),
    workMode: taxonomyValue(requiredTerm(item, "job_work_mode")),
    skills: flattenTerms(item).filter((term) => term.taxonomy === "job_skill").map(taxonomyValue),
    publishedAt: `${item.date_gmt}Z`,
    startDate: stringField(item, "start_date"),
    closingDate: stringField(item, "closing_date", true)!,
    state: stringField(item, "job_state") === "closed" ? "closed" : "open",
    featured: booleanField(item, "featured"),
    applicationUrl: stringField(item, "application_url", true)!,
    applicantCountries: Array.isArray(applicantCountries) ? applicantCountries.filter((value): value is string => typeof value === "string") : undefined,
    contactName: stringField(item, "contact_name"),
    featuredImage: imageFrom(item),
    seo: {
      title: stringField(item, "seo_title"),
      description: stringField(item, "seo_description"),
    },
    alternates: {},
  };
}

function normalizeArticle(item: WpContentItem, locale: Locale): Article {
  const category = flattenTerms(item).find((term) => term.taxonomy === "category");
  if (!category) throw new Error(`WordPress article ${item.id} is missing a category`);
  const featuredImage = imageFrom(item);
  const socialImage = imageField(item, "social_image") ?? featuredImage;

  return {
    id: item.id,
    locale: localeFrom(item, locale),
    slug: item.slug,
    title: plainTextFromHtml(item.title.rendered),
    excerpt: plainTextFromHtml(item.excerpt?.rendered ?? ""),
    contentHtml: sanitizeCmsHtml(item.content?.rendered ?? ""),
    category: taxonomyValue(category),
    publishedAt: `${item.date_gmt}Z`,
    updatedAt: `${item.modified_gmt}Z`,
    byline: stringField(item, "byline") ?? "CGIC Editorial Team",
    featured: booleanField(item, "featured"),
    featuredImage,
    seo: {
      title: stringField(item, "seo_title"),
      description: stringField(item, "seo_description"),
      socialImage,
    },
    alternates: {},
  };
}

async function resolveAlternates(
  item: WpContentItem,
  restBase: "jobs" | "posts",
): Promise<Partial<Record<Locale, string>>> {
  const translations = Object.entries(item.translations).filter(
    ([locale]) => locale === "fr" || locale === "en" || locale === "nl",
  ) as [Locale, number][];
  const entries = await Promise.all(
    translations.map(async ([locale, id]) => {
        const response = await wpFetch(`/wp-json/wp/v2/${restBase}/${id}?context=view`, [restBase, `${restBase}:${id}`]);
        const translated = wpContentItemSchema.parse(await response.json());
        return [locale, translated.slug] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function getJobs(locale: Locale): Promise<Job[]> {
  if (isRecruitCrmConfigured()) {
    return (await listRecruitCrmJobs()).filter(isRecruitCrmJobPublic).map((job) => normalizeRecruitCrmJob(job, locale));
  }
  return process.env.NODE_ENV === "production" && process.env.RECRUITCRM_USE_FIXTURES !== "true"
    ? []
    : getFixtureJobs(locale).filter(isJobActive);
}

export async function getJobBySlug(locale: Locale, slug: string): Promise<Job | null> {
  if (isRecruitCrmConfigured()) {
    return (await getJobs(locale)).find((job) => job.slug === slug) ?? null;
  }
  const fixtures = process.env.NODE_ENV === "production" && process.env.RECRUITCRM_USE_FIXTURES !== "true" ? [] : getFixtureJobs(locale);
  return fixtures.find((job) => job.slug === slug) ?? null;
}

export async function getArticles(locale: Locale, page = 1, perPage = 12): Promise<Paginated<Article>> {
  if (!isWordPressConfigured()) {
    const all = getFixtureArticles(locale);
    return {
      items: all.slice((page - 1) * perPage, page * perPage),
      page,
      totalPages: Math.max(1, Math.ceil(all.length / perPage)),
      totalItems: all.length,
    };
  }

  const query = new URLSearchParams({ lang: locale, status: "publish", page: String(page), per_page: String(perPage), _embed: "wp:featuredmedia,wp:term" });
  const response = await wpFetch(`/wp-json/wp/v2/posts?${query}`, ["articles"]);
  const items = wpContentListSchema.parse(await response.json()).map((item) => normalizeArticle(item, locale));
  return {
    items,
    page,
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? 1),
    totalItems: Number(response.headers.get("X-WP-Total") ?? items.length),
  };
}

export async function getArticleBySlug(locale: Locale, slug: string): Promise<Article | null> {
  if (!isWordPressConfigured()) {
    return getFixtureArticles(locale).find((article) => article.slug === slug) ?? null;
  }

  const query = new URLSearchParams({ lang: locale, slug, status: "publish", _embed: "wp:featuredmedia,wp:term" });
  const response = await wpFetch(`/wp-json/wp/v2/posts?${query}`, ["articles", `article-slug:${slug}`]);
  const item = wpContentListSchema.parse(await response.json())[0];
  if (!item) return null;
  return { ...normalizeArticle(item, locale), alternates: await resolveAlternates(item, "posts") };
}

export async function getAllArticles(locale: Locale) {
  return (await getArticles(locale, 1, 100)).items;
}

export function estimateReadingMinutes(html: string) {
  const words = plainTextFromHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export type { Article, Job, Locale, Paginated, TaxonomyValue } from "./types";
