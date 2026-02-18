import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("termsTitle");

  return {
    title,
    robots: { index: false, follow: true },
    alternates: getAlternates(locale, "/legal/terms"),
    openGraph: getOpenGraph(locale, title, "", "/legal/terms"),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <>
      <section className="bg-navy-950 pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t("termsTitle")}
          </h1>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm text-gray-400">
            {t("lastUpdated", { date: "2026-01-01" })}
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-sm border border-gray-100 bg-gray-50 p-6">
              <p className="text-sm font-semibold text-navy-950">{t("companyInfo")}</p>
              <p className="mt-1 text-sm text-gray-500">{t("registeredAddress")}</p>
              <p className="mt-1 text-sm text-gray-400">{t("lei")}</p>
              <p className="text-sm text-gray-400">{t("duns")}</p>
            </div>

            <p className="text-gray-500 leading-relaxed">
              {t("termsContent")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
