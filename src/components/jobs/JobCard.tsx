import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { Job, Locale } from "@/lib/content";

type Labels = {
  featured: string;
  closing: string;
  viewRole: string;
};

export function JobCard({ job, locale, labels }: { job: Job; locale: Locale; labels: Labels }) {
  return (
    <article className="group relative grid overflow-hidden border-t border-navy-950/10 py-8 transition-colors md:grid-cols-[1fr_auto] md:gap-12 md:py-10">
      <div className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100" />
      <div className="transition-transform duration-500 group-hover:translate-x-3">
        <div className="flex flex-wrap items-center gap-2">
          {job.featured && (
            <span className="bg-navy-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              {labels.featured}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-dark">
            {job.expertise.label}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            {job.reference}
          </span>
        </div>

        <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-navy-950 transition-colors group-hover:text-navy-700 sm:text-3xl">
          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-500 sm:text-lg">
          {job.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <span>{job.location.label}</span>
          <span>{job.contractType.label}</span>
          <span>{job.workMode.label}</span>
          {job.closingDate && <span className="text-gray-400">{labels.closing} {formatDate(job.closingDate, locale)}</span>}
        </div>
      </div>

      <div className="mt-6 flex items-center md:mt-0">
        <Link
          href={`/jobs/${job.slug}`}
          aria-label={`${labels.viewRole}: ${job.title}`}
          className="inline-flex items-center gap-3 text-sm font-semibold text-navy-950"
        >
          <span className="md:sr-only">{labels.viewRole}</span>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-navy-950/15 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </Link>
      </div>
    </article>
  );
}
