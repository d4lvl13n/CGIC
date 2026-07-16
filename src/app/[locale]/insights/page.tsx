import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { getAllArticles, type Locale } from "@/lib/content";
import { getAlternates, getOpenGraph } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("insightsTitle");
  const description = t("insightsDescription");
  return {
    title,
    description,
    alternates: getAlternates(locale, "/insights"),
    openGraph: getOpenGraph(locale, title, description, "/insights"),
    twitter: { title, description, images: ["/og-image.png"] },
  };
}

export default async function InsightsPage({ params, searchParams }: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const [articles, t] = await Promise.all([
    getAllArticles(locale),
    getTranslations({ locale, namespace: "insights" }),
  ]);
  const categories = [...new Map(articles.map((article) => [article.category.slug, article.category])).values()];
  const selectedCategory = query.category ?? "";
  const matching = selectedCategory ? articles.filter((article) => article.category.slug === selectedCategory) : articles;
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(matching.length / perPage));
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const page = Math.min(requestedPage, totalPages);
  const pageItems = matching.slice((page - 1) * perPage, page * perPage);
  const featured = page === 1 && !selectedCategory ? pageItems.find((article) => article.featured) : undefined;
  const gridItems = featured ? pageItems.filter((article) => article.id !== featured.id) : pageItems;
  const labels = { read: t("read"), minRead: t("minRead") };

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const suffix = params.toString();
    return suffix ? `/insights?${suffix}` : "/insights";
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gray-100 pb-24 pt-40 sm:pb-32 sm:pt-48">
        <div className="absolute right-[-12rem] top-[-8rem] h-[36rem] w-[36rem] rounded-full border border-navy-950/10" aria-hidden="true" />
        <div className="absolute right-12 top-40 h-32 w-32 bg-accent/10" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-dark">{t("eyebrow")}</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <h1 className="max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-navy-950 sm:text-6xl md:text-7xl lg:text-8xl">{t("title")}</h1>
            <p className="border-l border-navy-950/15 pl-6 text-lg leading-relaxed text-gray-600">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-col gap-7 border-b border-navy-950/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">Journal / {String(page).padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">{t("latest")}</h2>
            </div>
            <nav aria-label={t("latest")} className="flex flex-wrap gap-2">
              <Link href="/insights" className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${!selectedCategory ? "bg-navy-950 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t("all")}</Link>
              {categories.map((category) => (
                <Link key={category.slug} href={`/insights?category=${encodeURIComponent(category.slug)}`} className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${selectedCategory === category.slug ? "bg-navy-950 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{category.label}</Link>
              ))}
            </nav>
          </div>

          {featured && <div className="mt-12"><ArticleCard article={featured} locale={locale} labels={labels} featured /></div>}

          <div className={`grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3 ${featured ? "mt-20" : "mt-12"}`}>
            {gridItems.map((article) => <ArticleCard key={article.id} article={article} locale={locale} labels={labels} />)}
          </div>

          {totalPages > 1 && (
            <nav className="mt-20 flex items-center justify-between border-t border-navy-950/10 pt-8" aria-label={t("page", { page, total: totalPages })}>
              {page > 1 ? <Link href={pageHref(page - 1)} className="text-sm font-semibold text-navy-950 hover:text-accent-dark">← {t("previousPage")}</Link> : <span />}
              <span className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("page", { page, total: totalPages })}</span>
              {page < totalPages ? <Link href={pageHref(page + 1)} className="text-sm font-semibold text-navy-950 hover:text-accent-dark">{t("nextPage")} →</Link> : <span />}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
