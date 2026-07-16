import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";
import { JobsExplorer } from "@/components/jobs/JobsExplorer";
import { getJobs, type Locale } from "@/lib/content";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("jobsTitle");
  const description = t("jobsDescription");
  return {
    title,
    description,
    alternates: getAlternates(locale, "/jobs"),
    openGraph: getOpenGraph(locale, title, description, "/jobs"),
    twitter: { title, description },
  };
}

export default async function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, jobs] = await Promise.all([
    getTranslations({ locale, namespace: "jobs" }),
    getJobs(locale as Locale),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 pt-40 text-white sm:pt-48">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -right-28 top-16 h-[520px] w-[520px] rounded-full border border-white/10" />
          <div className="absolute -right-2 top-44 h-[280px] w-[280px] rounded-full border border-accent/30" />
          <div className="absolute bottom-0 left-[8%] h-px w-[84%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-1/3 h-40 w-px bg-gradient-to-b from-transparent to-accent/70" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-6 pb-24 lg:px-12 lg:pb-32">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-light">{t("eyebrow")}</p>
              <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
                {t("title")}
              </h1>
            </div>
            <div className="border-l border-white/15 pl-6 lg:pb-2">
              <p className="text-lg leading-relaxed text-white/65">{t("subtitle")}</p>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent-light">{t("nativeExperience")}</p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-accent via-accent-light to-transparent" />
      </section>

      <Suspense fallback={<div className="min-h-[520px] bg-white" />}>
        <JobsExplorer jobs={jobs} locale={locale as Locale} />
      </Suspense>
    </>
  );
}
