import { after, NextResponse } from "next/server";
import { parseJobApplication, validateResume } from "@/lib/applications/schema";
import { getJobBySlug, isJobActive, type Locale } from "@/lib/content";
import {
  applyRecruitCrmCandidate,
  attachRecruitCrmCandidateFile,
  createRecruitCrmCandidate,
  findRecruitCrmCandidateByEmail,
  isRecruitCrmConfigured,
  RecruitCrmApiError,
} from "@/lib/recruitcrm/client";
import { captureInTalentVault, isTalentVaultConfigured } from "@/lib/talent-vault/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function error(code: string, status: number, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, details } }, { status });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id");

  if (!isRecruitCrmConfigured()) return error("INTEGRATION_NOT_CONFIGURED", 503);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return error("INVALID_FORM", 400);
  }

  const parsed = parseJobApplication(formData);
  if (!parsed.success) return error("VALIDATION_ERROR", 400, parsed.error.flatten().fieldErrors);
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const resume = validateResume(formData.get("resume"));
  if (!resume.ok) return error(resume.code, 400);

  const job = await getJobBySlug(parsed.data.locale as Locale, parsed.data.jobSlug);
  if (!job || !job.recruitCrmSlug || !isJobActive(job)) return error("JOB_NOT_AVAILABLE", 404);

  let recruitCrmStage = "candidate_lookup";
  try {
    let candidate = await findRecruitCrmCandidateByEmail(parsed.data.email);
    if (candidate) {
      recruitCrmStage = "resume_attachment";
      await attachRecruitCrmCandidateFile(candidate.slug, resume.file);
    } else {
      recruitCrmStage = "candidate_creation";
      candidate = await createRecruitCrmCandidate({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        linkedinUrl: parsed.data.linkedinUrl,
        city: parsed.data.city,
        countryCode: parsed.data.countryCode,
        position: job.title,
        coverMessage: parsed.data.coverMessage,
        resume: resume.file,
      });
    }

    recruitCrmStage = "job_application";
    const application = await applyRecruitCrmCandidate(candidate.slug, job.recruitCrmSlug);

    // Optional sidecar only: RecruitCRM is the application system of record.
    // This task runs after the response and can never block or change the application result.
    if (isTalentVaultConfigured()) {
      after(async () => {
        try {
          await captureInTalentVault(parsed.data, resume.file, job, parsed.data.locale as Locale);
        } catch (cause) {
          console.error("Optional Talent Vault capture failed", cause);
        }
      });
    }

    console.log(JSON.stringify({
      level: "info",
      message: "Job application submitted",
      route: "/api/job-applications",
      requestId,
      status: application.alreadyApplied ? "already_applied" : "applied",
      durationMs: Date.now() - startedAt,
    }));

    return NextResponse.json({
      ok: true,
      application: { status: application.alreadyApplied ? "already_applied" : "applied" },
    });
  } catch (cause) {
    console.error(JSON.stringify({
      level: "error",
      message: "RecruitCRM application failed",
      route: "/api/job-applications",
      requestId,
      stage: recruitCrmStage,
      errorName: cause instanceof Error ? cause.name : "UnknownError",
      errorMessage: cause instanceof Error ? cause.message : String(cause),
      providerStatus: cause instanceof RecruitCrmApiError ? cause.status : undefined,
      durationMs: Date.now() - startedAt,
    }));
    return error("RECRUITCRM_SUBMISSION_FAILED", 502);
  }
}
