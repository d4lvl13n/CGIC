import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CmsHtml } from "@/components/content/CmsHtml";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { estimateReadingMinutes, getAllArticles, getArticleBySlug, type Locale } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { baseUrl, getOpenGraph } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

function articleLanguages(article: NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>) {
  const languages: Record<string, string> = {};
  for (const [locale, slug] of Object.entries(article.alternates)) {
    if (slug) languages[locale] = `${baseUrl}/${locale}/insights/${slug}`;
  }
  if (article.alternates.fr) languages["x-default"] = `${baseUrl}/fr/insights/${article.alternates.fr}`;
  return languages;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(locale, slug);
  if (!article) return {};
  const title = article.seo.title ?? `${article.title} — CGIC`;
  const description = article.seo.description ?? article.excerpt;
  const socialImage = article.seo.socialImage ?? article.featuredImage;
  const path = `/insights/${article.slug}`;
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/${locale}${path}`, languages: articleLanguages(article) },
    openGraph: {
      ...getOpenGraph(locale, title, description, path),
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: socialImage ? [{ url: socialImage.url }] : undefined,
    },
    twitter: { title, description, images: socialImage ? [socialImage.url] : undefined },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const [article, t] = await Promise.all([
    getArticleBySlug(locale, slug),
    getTranslations({ locale, namespace: "insights" }),
  ]);
  if (!article) notFound();
  const related = (await getAllArticles(locale)).filter((candidate) => candidate.id !== article.id).sort((a, b) => Number(b.category.slug === article.category.slug) - Number(a.category.slug === article.category.slug)).slice(0, 3);
  const publicUrl = `${baseUrl}/${locale}/insights/${article.slug}`;
  const readingTime = estimateReadingMinutes(article.contentHtml);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "CGIC", url: `${baseUrl}/${locale}` },
        { name: t("back"), url: `${baseUrl}/${locale}/insights` },
        { name: article.title, url: publicUrl },
      ]} />
      <ArticleJsonLd title={article.title} description={article.excerpt} image={article.featuredImage?.url} byline={article.byline} publishedAt={article.publishedAt} updatedAt={article.updatedAt} url={publicUrl} locale={locale} />

      <article>
        <header className="relative overflow-hidden bg-navy-950 pt-36 text-white sm:pt-44">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <Link href="/insights" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>{t("back")}</Link>
            <div className="mt-14 max-w-5xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-light">
                <span>{article.category.label}</span><span className="text-white/25">/</span><span className="text-white/45">{readingTime} {t("minRead")}</span>
              </div>
              <h1 className="mt-7 text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl md:text-7xl">{article.title}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-white/65 sm:text-xl">{article.excerpt}</p>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 py-6 text-xs uppercase tracking-[0.13em] text-white/45">
                <span>{t("by")} <strong className="font-semibold text-white/80">{article.byline}</strong></span>
                <span>{t("published")} <strong className="font-semibold text-white/80">{formatDate(article.publishedAt, locale)}</strong></span>
                {article.updatedAt !== article.publishedAt && <span>{t("updated")} <strong className="font-semibold text-white/80">{formatDate(article.updatedAt, locale)}</strong></span>}
              </div>
            </div>
          </div>
          {article.featuredImage && (
            <div className="relative mx-auto mt-8 aspect-[16/7] max-w-[1600px] overflow-hidden">
              <Image src={article.featuredImage.url} alt={article.featuredImage.alt} fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
        </header>

        <div className="bg-white py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1100px] gap-12 px-6 lg:grid-cols-[160px_1fr] lg:px-12">
            <aside className="hidden lg:block">
              <div className="sticky top-28 border-t border-navy-950/15 pt-4 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                <span className="block text-3xl font-bold tracking-tight text-navy-950">{String(readingTime).padStart(2, "0")}</span>
                <span className="mt-1 block">{t("minRead")}</span>
              </div>
            </aside>
            <CmsHtml html={article.contentHtml} className="article-prose" />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-gray-100 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-dark">{t("related")}</p>
            <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">{related.map((candidate) => <ArticleCard key={candidate.id} article={candidate} locale={locale} labels={{ read: t("read"), minRead: t("minRead") }} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
