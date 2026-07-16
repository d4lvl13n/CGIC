import { getAllArticles, type Locale } from "@/lib/content";
import { baseUrl } from "@/lib/seo";

function xml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  if (requestedLocale !== "fr" && requestedLocale !== "en" && requestedLocale !== "nl") {
    return new Response("Not found", { status: 404 });
  }
  const locale: Locale = requestedLocale;
  const articles = (await getAllArticles(locale)).slice(0, 20);
  const items = articles.map((article) => {
    const url = `${baseUrl}/${locale}/insights/${article.slug}`;
    return `<item><title>${xml(article.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(article.excerpt)}</description><pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate></item>`;
  }).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CGIC Insights</title><link>${baseUrl}/${locale}/insights</link><description>CGIC perspectives on talent, transformation and delivery.</description><language>${locale}</language>${items}</channel></rss>`;
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
