import { NextResponse } from "next/server";
import { locales } from "@/lib/content/types";
import {
  isRecruitCrmConfigured,
  jobCustomFieldValues,
  listInternalRecruitCrmJobs,
  listRecruitCrmJobCustomFields,
  writeRecruitCrmJobCustomField,
} from "@/lib/recruitcrm/client";
import { isTranslationConfigured, translateJobDescription } from "@/lib/content/translate";

export const runtime = "nodejs";
export const maxDuration = 300;
/** Leave headroom under maxDuration so the run reports instead of being killed. */
const TIME_BUDGET_MS = 240_000;
export const dynamic = "force-dynamic";

/** `description_en`, `description_fr`, `description_nl` — one per locale. */
const fieldNameFor = (locale: string) => `description_${locale}`;

/**
 * Fills any empty per-locale description field on a job, then leaves it alone.
 *
 * A non-empty field is never overwritten, so a recruiter's correction survives every
 * subsequent run. To force a re-translation, clear the field in RecruitCRM and the
 * next run refills it.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const authorized =
    request.headers.get("authorization") === `Bearer ${secret}`
    // Vercel Cron signs its own invocations with this header.
    || Boolean(request.headers.get("x-vercel-cron"));
  if (secret && !authorized) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!isRecruitCrmConfigured()) {
    return NextResponse.json({ ok: false, error: "RECRUITCRM_NOT_CONFIGURED" }, { status: 503 });
  }
  if (!isTranslationConfigured()) {
    return NextResponse.json({ ok: false, error: "TRANSLATION_NOT_CONFIGURED" }, { status: 503 });
  }

  const startedAt = Date.now();
  const [jobs, definitions] = await Promise.all([
    listInternalRecruitCrmJobs({ fresh: true }),
    listRecruitCrmJobCustomFields(),
  ]);

  const fieldIds = new Map(definitions.map((field) => [field.field_name, field.field_id]));
  const missingFields = locales.filter((locale) => !fieldIds.has(fieldNameFor(locale)));
  if (missingFields.length) {
    return NextResponse.json(
      { ok: false, error: "MISSING_CUSTOM_FIELDS", details: missingFields.map(fieldNameFor) },
      { status: 503 },
    );
  }

  const limit = Number(new URL(request.url).searchParams.get("limit")) || Infinity;
  let budgetExhausted = false;

  const written: string[] = [];
  const skipped: string[] = [];
  const failed: { job: string; locale: string; error: string }[] = [];

  for (const job of jobs) {
    if (written.length >= limit || Date.now() - startedAt > TIME_BUDGET_MS) {
      budgetExhausted = true;
      break;
    }
    const source = job.job_description_text?.trim() || job.note_for_candidates?.trim();
    if (!source) {
      skipped.push(`${job.slug}:no-source`);
      continue;
    }

    const existing = jobCustomFieldValues(job);
    for (const locale of locales) {
      const fieldName = fieldNameFor(locale);
      if (written.length >= limit || Date.now() - startedAt > TIME_BUDGET_MS) {
        budgetExhausted = true;
        break;
      }
      if (existing[fieldName]) {
        skipped.push(`${job.slug}:${locale}`);
        continue;
      }

      try {
        const markdown = await translateJobDescription(source, locale);
        await writeRecruitCrmJobCustomField(job.slug, fieldIds.get(fieldName)!, markdown);
        written.push(`${job.slug}:${locale}`);
      } catch (cause) {
        failed.push({
          job: job.slug,
          locale,
          error: cause instanceof Error ? cause.message : String(cause),
        });
      }
    }
  }

  const summary = {
    ok: failed.length === 0,
    jobs: jobs.length,
    written: written.length,
    skipped: skipped.length,
    // Work is resumable: only empty fields are filled, so the next run continues.
    incomplete: budgetExhausted,
    failed,
    durationMs: Date.now() - startedAt,
  };
  console.log(JSON.stringify({ level: "info", route: "/api/cron/translate-jobs", ...summary }));
  return NextResponse.json(summary);
}
