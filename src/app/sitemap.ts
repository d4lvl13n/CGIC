import type { MetadataRoute } from "next";
import { getAllArticles, getJobs } from "@/lib/content";

const baseUrl = "https://www.cgic.be";
const locales = ["fr", "en", "nl"] as const;
const defaultLocale = "fr";

interface PageConfig {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}

const pages: PageConfig[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
  { path: "/insights", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const languages: Record<string, string> = {};
      for (const altLocale of locales) {
        languages[altLocale] = `${baseUrl}/${altLocale}${page.path}`;
      }
      languages["x-default"] = `${baseUrl}/${defaultLocale}${page.path}`;

      entries.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  const content = await Promise.all(locales.map(async (locale) => ({
    locale,
    articles: await getAllArticles(locale),
    jobs: await getJobs(locale),
  })));

  for (const { locale, articles, jobs } of content) {
    for (const job of jobs) {
      const languages = Object.fromEntries(Object.entries(job.alternates).map(([lang, slug]) => [lang, `${baseUrl}/${lang}/jobs/${slug}`]));
      if (job.alternates.fr) languages["x-default"] = `${baseUrl}/fr/jobs/${job.alternates.fr}`;
      entries.push({
        url: `${baseUrl}/${locale}/jobs/${job.slug}`,
        lastModified: new Date(job.publishedAt),
        changeFrequency: "daily",
        priority: 0.8,
        alternates: Object.keys(languages).length ? { languages } : undefined,
      });
    }

    for (const article of articles) {
      const languages = Object.fromEntries(Object.entries(article.alternates).map(([lang, slug]) => [lang, `${baseUrl}/${lang}/insights/${slug}`]));
      if (article.alternates.fr) languages["x-default"] = `${baseUrl}/fr/insights/${article.alternates.fr}`;
      entries.push({
        url: `${baseUrl}/${locale}/insights/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: Object.keys(languages).length ? { languages } : undefined,
      });
    }
  }

  return entries;
}
