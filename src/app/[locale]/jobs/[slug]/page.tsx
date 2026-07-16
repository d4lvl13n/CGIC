import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CmsHtml } from "@/components/content/CmsHtml";
import { BreadcrumbJsonLd, JobPostingJsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/jobs/JobCard";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { getJobBySlug, getJobs, isJobActive, type Locale } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { baseUrl, getOpenGraph } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

export const revalidate = 300;

function jobAlternates(job: NonNullable<Awaited<ReturnType<typeof getJobBySlug>>>) {
  const languages: Record<string, string> = {};
  for (const [locale, slug] of Object.entries(job.alternates)) {
    if (slug) languages[locale] = `${baseUrl}/${locale}/jobs/${slug}`;
  }
  if (job.alternates.fr) languages["x-default"] = `${baseUrl}/fr/jobs/${job.alternates.fr}`;
  return languages;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(locale, slug);
  if (!job) return {};
  const title = job.seo.title ?? `${job.title} — CGIC`;
  const description = job.seo.description ?? job.summary;
  const path = `/jobs/${job.slug}`;
  const active = isJobActive(job);
  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/${locale}${path}`, languages: jobAlternates(job) },
    openGraph: getOpenGraph(locale, title, description, path),
    twitter: { title, description, images: ["/og-image.png"] },
    robots: active ? undefined : { index: false, follow: true },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const [job, t] = await Promise.all([
    getJobBySlug(locale, slug),
    getTranslations({ locale, namespace: "jobs" }),
  ]);
  if (!job) notFound();
  const active = isJobActive(job);
  const related = (await getJobs(locale)).filter((candidate) => candidate.id !== job.id && (candidate.expertise.slug === job.expertise.slug || candidate.location.slug === job.location.slug)).slice(0, 3);
  const publicUrl = `${baseUrl}/${locale}/jobs/${job.slug}`;
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "CGIC", url: `${baseUrl}/${locale}` },
        { name: t("back"), url: `${baseUrl}/${locale}/jobs` },
        { name: job.title, url: publicUrl },
      ]} />
      {active && (
        <JobPostingJsonLd
          title={job.title}
          description={job.responsibilitiesHtml}
          reference={job.reference}
          publishedAt={job.publishedAt}
          closingDate={job.closingDate}
          contractSlug={job.contractType.slug}
          location={job.location}
          workModeSlug={job.workMode.slug}
          applicantCountries={job.applicantCountries}
          url={publicUrl}
        />
      )}

      <section className="relative overflow-hidden bg-navy-950 pb-20 pt-36 text-white sm:pb-28 sm:pt-44">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(135deg,transparent_0%,rgba(34,170,255,.22)_100%)]" />
          <div className="absolute right-[12%] top-24 h-72 w-72 rounded-full border border-white/10" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            {t("back")}
          </Link>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_310px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-light">
                <span>{job.expertise.label}</span><span className="text-white/25">/</span><span className="text-white/45">{job.reference}</span>
              </div>
              <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl">{job.title}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-white/65 sm:text-xl">{job.summary}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-l border-white/15 pl-6 text-sm lg:grid-cols-1">
              {[
                [t("location"), job.location.label],
                [t("contractType"), job.contractType.label],
                [t("workMode"), job.workMode.label],
                ...(job.closingDate ? [[t("closing"), formatDate(job.closingDate, locale)]] : []),
              ].map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</dt><dd className="mt-1.5 font-medium text-white">{value}</dd></div>)}
            </dl>
          </div>
        </div>
      </section>

      {!active && (
        <section className="border-b border-amber-200 bg-amber-50 py-6">
          <div className="mx-auto flex max-w-[1400px] items-start gap-4 px-6 lg:px-12">
            <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-amber-500" />
            <div><h2 className="font-bold text-navy-950">{t("closed")}</h2><p className="mt-1 text-sm text-gray-600">{t("closedText")}</p></div>
          </div>
        </section>
      )}

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 lg:grid-cols-[1fr_330px] lg:px-12">
          <div className="space-y-20">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">01</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{t("description")}</h2><CmsHtml html={job.responsibilitiesHtml} className="mt-8" /></div>
            {job.candidateProfileHtml && <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">02</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{t("candidateProfile")}</h2><CmsHtml html={job.candidateProfileHtml} className="mt-8" /></div>}
            {job.offerHtml && <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">03</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{t("offer")}</h2><CmsHtml html={job.offerHtml} className="mt-8" /></div>}
          </div>

          <aside>
            <div className="sticky top-28 border-t-4 border-accent bg-gray-100 p-7 sm:p-8">
              <h2 className="text-xl font-bold text-navy-950">{t("roleDetails")}</h2>
              <dl className="mt-7 space-y-5 text-sm">
                <div><dt className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("reference")}</dt><dd className="mt-1 font-semibold text-navy-950">{job.reference}</dd></div>
                {job.startDate && <div><dt className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("startDate")}</dt><dd className="mt-1 font-semibold text-navy-950">{formatDate(job.startDate, locale)}</dd></div>}
                <div><dt className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("skills")}</dt><dd className="mt-2 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill.slug} className="bg-white px-2.5 py-1 text-xs text-gray-600">{skill.label}</span>)}</dd></div>
              </dl>
              {active && <><a href="#apply" className="mt-8 flex w-full items-center justify-between bg-navy-950 px-5 py-4 font-semibold text-white transition-colors hover:bg-navy-800"><span>{t("apply")}</span><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a><p className="mt-4 text-xs leading-relaxed text-gray-500">{t("applyNote")}</p></>}
            </div>
          </aside>
        </div>
      </section>

      {active && (
        <section id="apply" className="scroll-mt-24 bg-white pb-24 sm:pb-32" aria-labelledby="application-title">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid overflow-hidden border border-navy-950/10 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="relative overflow-hidden bg-navy-950 p-8 text-white sm:p-12">
                <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{t("application.eyebrow")}</p>
                  <h2 id="application-title" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t("application.title")}</h2>
                  <p className="mt-6 text-lg leading-relaxed text-white/65">{t("application.intro", { role: job.title })}</p>
                  <ol className="mt-10 space-y-5 text-sm text-white/70">
                    {[t("application.stepProfile"), t("application.stepReview"), t("application.stepRecruiter")].map((step, index) => (
                      <li key={step} className="flex gap-4"><span className="font-semibold text-accent-light">0{index + 1}</span><span>{step}</span></li>
                    ))}
                  </ol>
                </div>
              </div>
              <JobApplicationForm job={job} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-gray-100 py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-dark">{t("related")}</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-navy-950 sm:text-5xl">{t("relatedTitle")}</h2>
            <div className="mt-12">{related.map((candidate) => <JobCard key={candidate.id} job={candidate} locale={locale} labels={{ featured: t("featured"), closing: t("closing"), viewRole: t("viewRole") }} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
