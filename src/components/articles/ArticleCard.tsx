import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { estimateReadingMinutes, type Article, type Locale } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Labels = { read: string; minRead: string };

export function ArticleCard({ article, locale, labels, featured = false }: { article: Article; locale: Locale; labels: Labels; featured?: boolean }) {
  if (featured) {
    return (
      <article className="group grid overflow-hidden bg-navy-950 lg:grid-cols-2">
        <Link href={`/insights/${article.slug}`} className="relative min-h-[340px] overflow-hidden lg:min-h-[520px]">
          {article.featuredImage && (
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent lg:bg-gradient-to-r" />
        </Link>
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-light">
            <span>{article.category.label}</span>
            <span className="text-white/30">/</span>
            <span className="text-white/50">{formatDate(article.publishedAt, locale)}</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            <Link href={`/insights/${article.slug}`}>{article.title}</Link>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">{article.excerpt}</p>
          <Link href={`/insights/${article.slug}`} className="mt-9 inline-flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-accent-light">
            {labels.read}
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group border-t border-navy-950/10 pt-6">
      <Link href={`/insights/${article.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        {article.featuredImage && (
          <Image src={article.featuredImage.url} alt={article.featuredImage.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <span className="absolute bottom-0 right-0 flex h-12 w-12 translate-y-full items-center justify-center bg-accent text-white transition-transform duration-300 group-hover:translate-y-0">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent-dark">
        <span>{article.category.label}</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-400">{estimateReadingMinutes(article.contentHtml)} {labels.minRead}</span>
      </div>
      <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-navy-950 transition-colors group-hover:text-navy-700">
        <Link href={`/insights/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="mt-4 line-clamp-3 leading-relaxed text-gray-500">{article.excerpt}</p>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">{formatDate(article.publishedAt, locale)}</p>
    </article>
  );
}
