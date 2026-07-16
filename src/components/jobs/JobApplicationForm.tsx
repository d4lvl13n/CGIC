"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Job, Locale } from "@/lib/content";
import { MAX_RESUME_BYTES } from "@/lib/applications/schema";

type SubmissionState = "idle" | "uploading" | "processing" | "success" | "error";

type ApplicationResponse = { error?: { code?: string } } | null;

function submitApplication(
  data: FormData,
  onProgress: (progress: number) => void,
  onUploaded: () => void,
) {
  return new Promise<{ status: number; body: ApplicationResponse }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/job-applications");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.upload.addEventListener("load", onUploaded);
    request.addEventListener("load", () => resolve({ status: request.status, body: request.response as ApplicationResponse }));
    request.addEventListener("error", () => reject(new Error("NETWORK_ERROR")));
    request.addEventListener("abort", () => reject(new Error("REQUEST_ABORTED")));
    request.send(data);
  });
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function JobApplicationForm({ job, locale }: { job: Job; locale: Locale }) {
  const t = useTranslations("jobs.application");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isSubmitting = state === "uploading" || state === "processing";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("uploading");
    setErrorMessage("");
    setUploadProgress(0);

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
      const response = await submitApplication(
        data,
        setUploadProgress,
        () => {
          setUploadProgress(100);
          setState("processing");
        },
      );
      if (response.status < 200 || response.status >= 300) {
        const code = response.body?.error?.code;
        if (code === "JOB_NOT_AVAILABLE") throw new Error(t("errors.jobUnavailable"));
        if (code === "INTEGRATION_NOT_CONFIGURED") throw new Error(t("errors.notConfigured"));
        throw new Error(t("errors.generic"));
      }
      setState("success");
      setSelectedFile(null);
      formRef.current?.reset();
    } catch (cause) {
      setState("error");
      setErrorMessage(cause instanceof Error ? cause.message : t("errors.generic"));
    }
  }

  if (state === "success") {
    return (
      <div className="relative overflow-hidden border border-navy-950/10 bg-navy-950 px-7 py-14 text-white sm:px-12 sm:py-20 lg:px-20" role="status">
        <div className="absolute -right-20 -top-36 h-96 w-96 rounded-full border border-accent/25" aria-hidden="true" />
        <div className="absolute -bottom-52 right-24 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white sm:h-20 sm:w-20">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          </span>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{t("successEyebrow")}</p>
            <h2 id="application-title" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t("successTitle")}</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">{t("successBody", { role: job.title })}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/50">{t("successThanks")}</p>
            <Link href="/jobs" className="mt-9 inline-flex items-center gap-3 font-semibold text-accent-light transition-colors hover:text-white">
              {t("backToJobs")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "mt-2 w-full border border-navy-950/15 bg-white px-4 py-3.5 text-sm text-navy-950 outline-none transition-colors placeholder:text-gray-400 focus:border-accent";
  const labelClass = "text-xs font-semibold uppercase tracking-[0.14em] text-navy-950";

  return (
    <div className="grid overflow-hidden border border-navy-950/10 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="relative overflow-hidden bg-navy-950 p-8 text-white sm:p-12">
        <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{t("eyebrow")}</p>
          <h2 id="application-title" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h2>
          <p className="mt-6 text-lg leading-relaxed text-white/65">{t("intro", { role: job.title })}</p>
          <ol className="mt-10 space-y-5 text-sm text-white/70">
            {[t("stepProfile"), t("stepReview"), t("stepRecruiter")].map((step, index) => (
              <li key={step} className="flex gap-4"><span className="font-semibold text-accent-light">0{index + 1}</span><span>{step}</span></li>
            ))}
          </ol>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-gray-100 p-6 sm:p-10 lg:p-12" noValidate={false} aria-busy={isSubmitting}>
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
          <label htmlFor="application-resume" className={`mt-2 flex cursor-pointer items-center gap-5 border border-dashed bg-white p-5 transition-colors hover:border-accent ${selectedFile ? "border-accent" : "border-navy-950/25"}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${selectedFile ? "bg-accent" : "bg-navy-950"}`}>
              {selectedFile ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" /></svg>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy-950">{selectedFile?.name ?? t("resumeAction")}</span>
              <span className="mt-1 block text-xs text-gray-500">{selectedFile ? t("resumeSelected", { size: formatFileSize(selectedFile.size) }) : t("resumeHint")}</span>
            </span>
            <input
              id="application-resume"
              name="resume"
              type="file"
              accept="application/pdf,.pdf"
              required
              disabled={isSubmitting}
              className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;
                setSelectedFile(file);
                setErrorMessage("");
                setState("idle");
              }}
            />
          </label>
        </div>
      </div>

      <label className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-gray-600">
        <input name="consent" type="checkbox" value="true" required className="mt-1 h-4 w-4 shrink-0 accent-navy-950" />
        <span>{t.rich("consent", { privacy: (chunks) => <Link href="/legal/privacy" className="font-semibold text-navy-950 underline decoration-accent underline-offset-2">{chunks}</Link> })}</span>
      </label>

      {state === "error" && <p className="mt-6 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700" role="alert">{errorMessage}</p>}

      {isSubmitting && (
        <div className="mt-6 border border-accent/30 bg-white p-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-navy-950">{state === "uploading" ? t("uploading") : t("processing")}</span>
            <span className="tabular-nums text-gray-500">{state === "uploading" ? `${uploadProgress}%` : t("uploaded")}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full bg-accent transition-[width] duration-300 ${state === "processing" ? "animate-pulse" : ""}`}
              style={{ width: `${state === "processing" ? 100 : uploadProgress}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">{state === "uploading" ? t("uploadingHint") : t("processingHint")}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="mt-8 inline-flex min-h-14 w-full items-center justify-between bg-navy-950 px-6 font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-64">
        <span>{state === "uploading" ? t("uploadingButton", { progress: uploadProgress }) : state === "processing" ? t("processingButton") : t("submit")}</span>
        {isSubmitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        )}
      </button>
      </form>
    </div>
  );
}
