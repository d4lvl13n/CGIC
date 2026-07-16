"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Job, Locale } from "@/lib/content";
import { MAX_RESUME_BYTES } from "@/lib/applications/schema";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function JobApplicationForm({ job, locale }: { job: Job; locale: Locale }) {
  const t = useTranslations("jobs.application");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage("");

    const data = new FormData(event.currentTarget);
    const resume = data.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      setState("error");
      setErrorMessage(t("errors.resumeRequired"));
      return;
    }
    if (resume.type !== "application/pdf") {
      setState("error");
      setErrorMessage(t("errors.resumeType"));
      return;
    }
    if (resume.size > MAX_RESUME_BYTES) {
      setState("error");
      setErrorMessage(t("errors.resumeSize"));
      return;
    }

    try {
      const response = await fetch("/api/job-applications", { method: "POST", body: data });
      const result = await response.json().catch(() => null) as { error?: { code?: string } } | null;
      if (!response.ok) {
        const code = result?.error?.code;
        if (code === "JOB_NOT_AVAILABLE") throw new Error(t("errors.jobUnavailable"));
        if (code === "INTEGRATION_NOT_CONFIGURED") throw new Error(t("errors.notConfigured"));
        throw new Error(t("errors.generic"));
      }
      setState("success");
      formRef.current?.reset();
    } catch (cause) {
      setState("error");
      setErrorMessage(cause instanceof Error ? cause.message : t("errors.generic"));
    }
  }

  if (state === "success") {
    return (
      <div className="relative overflow-hidden bg-navy-950 px-7 py-12 text-white sm:px-12 sm:py-16" role="status">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-accent/30" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{t("successEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("successTitle")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/65">{t("successBody")}</p>
          <Link href="/jobs" className="mt-8 inline-flex items-center gap-2 font-semibold text-accent-light hover:text-white">
            {t("backToJobs")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "mt-2 w-full border border-navy-950/15 bg-white px-4 py-3.5 text-sm text-navy-950 outline-none transition-colors placeholder:text-gray-400 focus:border-accent";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.14em] text-navy-950";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-gray-100 p-6 sm:p-10 lg:p-12" noValidate={false}>
      <input type="hidden" name="jobSlug" value={job.slug} />
      <input type="hidden" name="locale" value={locale} />
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="application-website">Website</label>
        <input id="application-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <div>
          <label htmlFor="application-first-name" className={labelClass}>{t("firstName")}</label>
          <input id="application-first-name" name="firstName" autoComplete="given-name" required maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="application-last-name" className={labelClass}>{t("lastName")}</label>
          <input id="application-last-name" name="lastName" autoComplete="family-name" required maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="application-email" className={labelClass}>{t("email")}</label>
          <input id="application-email" name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} />
        </div>
        <div>
          <label htmlFor="application-phone" className={labelClass}>{t("phone")}</label>
          <input id="application-phone" name="phone" type="tel" autoComplete="tel" maxLength={50} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="application-linkedin" className={labelClass}>{t("linkedin")}</label>
          <input id="application-linkedin" name="linkedinUrl" type="url" inputMode="url" placeholder="https://linkedin.com/in/..." maxLength={500} className={inputClass} />
        </div>
        <div>
          <label htmlFor="application-city" className={labelClass}>{t("city")}</label>
          <input id="application-city" name="city" autoComplete="address-level2" required maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="application-country" className={labelClass}>{t("country")}</label>
          <input id="application-country" name="countryCode" defaultValue="BE" autoComplete="country" required minLength={2} maxLength={2} className={`${inputClass} uppercase`} />
          <p className="mt-2 text-xs text-gray-500">{t("countryHint")}</p>
        </div>
        <div>
          <label htmlFor="application-seniority" className={labelClass}>{t("seniority")}</label>
          <select id="application-seniority" name="seniority" defaultValue="senior" required className={inputClass}>
            <option value="junior">{t("seniorityOptions.junior")}</option>
            <option value="mid">{t("seniorityOptions.mid")}</option>
            <option value="senior">{t("seniorityOptions.senior")}</option>
            <option value="lead">{t("seniorityOptions.lead")}</option>
            <option value="principal">{t("seniorityOptions.principal")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="application-availability" className={labelClass}>{t("availability")}</label>
          <select id="application-availability" name="availability" defaultValue="available" required className={inputClass}>
            <option value="available">{t("availabilityOptions.available")}</option>
            <option value="soon">{t("availabilityOptions.soon")}</option>
            <option value="not_available">{t("availabilityOptions.later")}</option>
          </select>
        </div>
        <div className="sm:col-span-2 sm:max-w-[calc(50%-0.75rem)]">
          <label htmlFor="application-language" className={labelClass}>{t("language")}</label>
          <select id="application-language" name="language" defaultValue={locale} required className={inputClass}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="application-message" className={labelClass}>{t("message")}</label>
          <textarea id="application-message" name="coverMessage" rows={5} maxLength={3000} placeholder={t("messagePlaceholder")} className={`${inputClass} resize-y`} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="application-resume" className={labelClass}>{t("resume")}</label>
          <label htmlFor="application-resume" className="mt-2 flex cursor-pointer items-center gap-5 border border-dashed border-navy-950/25 bg-white p-5 transition-colors hover:border-accent">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-950 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" /></svg>
            </span>
            <span><span className="block text-sm font-semibold text-navy-950">{t("resumeAction")}</span><span className="mt-1 block text-xs text-gray-500">{t("resumeHint")}</span></span>
            <input id="application-resume" name="resume" type="file" accept="application/pdf,.pdf" required className="sr-only" />
          </label>
        </div>
      </div>

      <label className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-gray-600">
        <input name="consent" type="checkbox" value="true" required className="mt-1 h-4 w-4 shrink-0 accent-navy-950" />
        <span>{t.rich("consent", { privacy: (chunks) => <Link href="/legal/privacy" className="font-semibold text-navy-950 underline decoration-accent underline-offset-2">{chunks}</Link> })}</span>
      </label>

      {state === "error" && <p className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700" role="alert">{errorMessage}</p>}

      <button type="submit" disabled={state === "submitting"} className="mt-8 inline-flex min-h-14 w-full items-center justify-between bg-navy-950 px-6 font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-64">
        <span>{state === "submitting" ? t("submitting") : t("submit")}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
  );
}
