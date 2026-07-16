"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Job, Locale, TaxonomyValue } from "@/lib/content";
import { JobCard } from "./JobCard";

type FilterKey = "location" | "expertise" | "contract" | "mode";

function uniqueTerms(jobs: Job[], getter: (job: Job) => TaxonomyValue) {
  return [...new Map(jobs.map((job) => {
    const value = getter(job);
    return [value.slug, value] as const;
  })).values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function JobsExplorer({ jobs, locale }: { jobs: Job[]; locale: Locale }) {
  const t = useTranslations("jobs");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase(locale));

  const selections: Record<FilterKey, string> = {
    location: searchParams.get("location") ?? "",
    expertise: searchParams.get("expertise") ?? "",
    contract: searchParams.get("contract") ?? "",
    mode: searchParams.get("mode") ?? "",
  };

  const options = useMemo(() => ({
    location: uniqueTerms(jobs, (job) => job.location),
    expertise: uniqueTerms(jobs, (job) => job.expertise),
    contract: uniqueTerms(jobs, (job) => job.contractType),
    mode: uniqueTerms(jobs, (job) => job.workMode),
  }), [jobs]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const haystack = [job.title, job.summary, job.location.label, job.expertise.label, ...job.skills.map((skill) => skill.label)].join(" ").toLocaleLowerCase(locale);
    return (!deferredQuery || haystack.includes(deferredQuery))
      && (!selections.location || job.location.slug === selections.location)
      && (!selections.expertise || job.expertise.slug === selections.expertise)
      && (!selections.contract || job.contractType.slug === selections.contract)
      && (!selections.mode || job.workMode.slug === selections.mode);
  }), [deferredQuery, jobs, locale, selections.contract, selections.expertise, selections.location, selections.mode]);

  function updateUrl(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  function updateQuery(value: string) {
    setQuery(value);
    updateUrl("q", value.trim());
  }

  function reset() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  const hasFilters = Boolean(query || Object.values(selections).some(Boolean));

  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="jobs-results-heading">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[310px_1fr] lg:gap-20">
          <aside>
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <h2 id="jobs-results-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-950">
                  {t("filters")}
                </h2>
                {hasFilters && (
                  <button onClick={reset} className="cursor-pointer text-xs font-semibold text-accent-dark hover:text-navy-950">
                    {t("clear")}
                  </button>
                )}
              </div>

              <div className="mt-8">
                <label htmlFor="job-search" className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                  {t("searchLabel")}
                </label>
                <div className="relative mt-3 border-b border-navy-950/20 pb-3 focus-within:border-accent">
                  <svg className="absolute left-0 top-0.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
                  </svg>
                  <input
                    id="job-search"
                    type="search"
                    value={query}
                    onChange={(event) => updateQuery(event.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-transparent pl-8 text-sm text-navy-950 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {([
                  ["location", t("location"), t("allLocations")],
                  ["expertise", t("expertise"), t("allExpertise")],
                  ["contract", t("contractType"), t("allContracts")],
                  ["mode", t("workMode"), t("allModes")],
                ] as const).map(([key, label, allLabel]) => (
                  <div key={key}>
                    <label htmlFor={`filter-${key}`} className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                      {label}
                    </label>
                    <select
                      id={`filter-${key}`}
                      value={selections[key]}
                      onChange={(event) => updateUrl(key, event.target.value)}
                      className="mt-2 w-full cursor-pointer border-b border-navy-950/20 bg-white py-3 text-sm text-navy-950 outline-none focus:border-accent"
                    >
                      <option value="">{allLabel}</option>
                      {options[key].map((option) => <option key={option.slug} value={option.slug}>{option.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="flex items-end justify-between border-b border-navy-950/10 pb-6">
              <p className="text-sm text-gray-500" aria-live="polite">
                {t("resultCount", { count: filtered.length })}
              </p>
              <span className="hidden text-xs font-medium uppercase tracking-[0.15em] text-gray-400 sm:block">CGIC / Careers</span>
            </div>

            {filtered.length > 0 ? (
              <div>
                {filtered.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    locale={locale}
                    labels={{ featured: t("featured"), closing: t("closing"), viewRole: t("viewRole") }}
                  />
                ))}
              </div>
            ) : (
              <div className="border-b border-navy-950/10 py-24 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-navy-950">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9.5 4h5M9 4h6l1 3H8l1-3Zm-2 3h10v13H7V7Z" /></svg>
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-navy-950">{t("noResultsTitle")}</h3>
                <p className="mx-auto mt-3 max-w-md text-gray-500">{t("noResultsBody")}</p>
                <button onClick={reset} className="mt-8 cursor-pointer text-sm font-semibold text-accent-dark hover:text-navy-950">
                  {t("reset")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
