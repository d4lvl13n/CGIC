"use client";

import { useEffect, useRef, useState } from "react";

const RECRUITCRM_JOBS_URL = "https://recruitcrm.io/jobs/Alsena_Ltd_jobs";

type RecruitCrmJobsEmbedProps = {
  title: string;
  openExternallyLabel: string;
  externalNote: string;
  expandLabel: string;
  closeLabel: string;
  mobileLaunchLabel: string;
};

export function RecruitCrmJobsEmbed({
  title,
  openExternallyLabel,
  externalNote,
  expandLabel,
  closeLabel,
  mobileLaunchLabel,
}: RecruitCrmJobsEmbedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      expandButtonRef.current?.focus();
    };
  }, [isExpanded]);

  return (
    <section className="bg-gray-100 py-16 sm:py-24" aria-labelledby="current-jobs-heading">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <div
          role={isExpanded ? "dialog" : undefined}
          aria-modal={isExpanded ? "true" : undefined}
          aria-label={isExpanded ? title : undefined}
          className={isExpanded
            ? "fixed inset-0 z-[100] flex flex-col bg-white"
            : "overflow-hidden border border-gray-200 bg-white shadow-[0_24px_70px_rgba(8,25,54,0.08)]"}
        >
          <div className={`flex min-h-20 shrink-0 items-center justify-between gap-4 border-b px-5 sm:px-7 ${isExpanded ? "border-white/10 bg-navy-950 text-white" : "border-gray-200"}`}>
            <div className="min-w-0 border-l-4 border-accent pl-4">
              <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isExpanded ? "text-accent-light" : "text-accent-dark"}`}>CGIC Careers</p>
              <h2 id="current-jobs-heading" className={`mt-1 text-sm font-bold leading-tight tracking-tight sm:truncate sm:text-xl ${isExpanded ? "text-white" : "text-navy-950"}`}>
                {title}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href={RECRUITCRM_JOBS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors sm:inline-flex ${isExpanded ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-navy-950"}`}
              >
                {openExternallyLabel}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>

              <button
                ref={expandButtonRef}
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                autoFocus={isExpanded}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors ${isExpanded ? "bg-white text-navy-950 hover:bg-gray-100" : "bg-navy-950 text-white hover:bg-navy-800"}`}
              >
                {isExpanded ? closeLabel : expandLabel}
                {isExpanded ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
                )}
              </button>
            </div>
          </div>

          {!isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="group flex min-h-52 w-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_50%_0%,rgba(34,170,255,0.12),transparent_58%)] px-8 text-center md:hidden"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-navy-950 shadow-[0_12px_30px_rgba(34,170,255,0.25)] transition-transform group-active:scale-95">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
              </span>
              <span className="max-w-xs text-base font-semibold text-navy-950">{mobileLaunchLabel}</span>
            </button>
          )}

          <iframe
            title={title}
            src={RECRUITCRM_JOBS_URL}
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className={isExpanded
              ? "block min-h-0 w-full flex-1 border-0"
              : "mx-auto hidden h-[min(900px,78dvh)] w-full max-w-[900px] border-0 md:block"}
          />
        </div>

        {!isExpanded && (
          <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">
            {externalNote}{" "}
            <a href={RECRUITCRM_JOBS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-950 underline underline-offset-2">
              {openExternallyLabel}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
