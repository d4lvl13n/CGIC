import "server-only";

import type { Job, Locale } from "@/lib/content";
import type { JobApplicationInput } from "@/lib/applications/schema";

export type TalentVaultCaptureResult = {
  status: "captured" | "duplicate" | "skipped";
  candidateId?: string;
  assessmentStatus?: "queued";
};

export function isTalentVaultConfigured() {
  return Boolean(process.env.TALENT_VAULT_API_URL?.trim());
}

function url(path: string) {
  const base = process.env.TALENT_VAULT_API_URL?.trim().replace(/\/$/, "");
  if (!base) throw new Error("TALENT_VAULT_API_URL is not configured");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function talentVaultFetch(path: string, init: RequestInit) {
  const response = await fetch(url(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
  return response;
}

function inferRole(job: Job) {
  const value = `${job.title} ${job.expertise.label}`.toLowerCase();
  const mappings = [
    [/project manager|programme manager/, "project_manager"],
    [/business analyst/, "business_analyst"],
    [/product owner/, "product_owner"],
    [/product manager/, "product_manager"],
    [/data engineer/, "data_engineer"],
    [/data analyst/, "data_analyst"],
    [/data scientist/, "data_scientist"],
    [/devops/, "devops_engineer"],
    [/cloud architect/, "cloud_architect"],
    [/solution.*architect/, "solutions_architect"],
    [/enterprise architect/, "enterprise_architect"],
    [/front.?end/, "frontend_developer"],
    [/back.?end/, "backend_developer"],
    [/full.?stack/, "fullstack_developer"],
    [/security/, "security_engineer"],
    [/scrum master/, "scrum_master"],
    [/agile coach/, "agile_coach"],
    [/qa|quality assurance/, "qa_engineer"],
  ] as const;
  return mappings.find(([pattern]) => pattern.test(value))?.[1] ?? "other";
}

function contractPreference(job: Job) {
  if (job.contractType.slug === "permanent") return "perm";
  if (["freelance", "temporary", "contract-to-permanent"].includes(job.contractType.slug)) return "contract";
  return null;
}

function workMode(job: Job) {
  return job.workMode.slug === "remote" ? "remote" : job.workMode.slug === "hybrid" ? "hybrid" : "onsite";
}

export async function captureInTalentVault(
  application: JobApplicationInput,
  resume: File,
  job: Job,
  locale: Locale,
): Promise<TalentVaultCaptureResult> {
  if (!isTalentVaultConfigured()) return { status: "skipped" };

  const response = await talentVaultFetch("/candidates/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone || null,
      linkedinUrl: application.linkedinUrl || null,
      locationCity: application.city,
      locationCountry: application.countryCode,
      workMode: workMode(job),
      rolePrimary: inferRole(job),
      roleSecondary: [],
      seniority: application.seniority,
      availabilityStatus: application.availability,
      availabilityDate: null,
      contractPreference: contractPreference(job),
      languages: [{ code: application.language || locale, level: "professional" }],
      rateBand: null,
      willUploadCv: true,
      consentGiven: true,
    }),
  });

  if (response.status === 409) return { status: "duplicate" };
  if (!response.ok) throw new Error(`Talent Vault candidate capture failed with status ${response.status}`);

  const created = await response.json() as { candidateId?: string };
  if (!created.candidateId) throw new Error("Talent Vault did not return a candidateId");

  const uploadResponse = await talentVaultFetch(`/candidates/${encodeURIComponent(created.candidateId)}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: resume.name, mimeType: "application/pdf", fileSize: resume.size }),
  });
  if (!uploadResponse.ok) throw new Error(`Talent Vault upload preparation failed with status ${uploadResponse.status}`);

  const upload = await uploadResponse.json() as { uploadUrl?: string; artifactId?: string };
  if (!upload.uploadUrl || !upload.artifactId) throw new Error("Talent Vault returned an invalid upload response");

  const fileUpload = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: resume,
  });
  if (!fileUpload.ok) throw new Error(`Talent Vault CV upload failed with status ${fileUpload.status}`);

  const complete = await talentVaultFetch(`/candidates/${encodeURIComponent(created.candidateId)}/upload-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artifactId: upload.artifactId }),
  });
  if (!complete.ok) throw new Error(`Talent Vault upload completion failed with status ${complete.status}`);

  return { status: "captured", candidateId: created.candidateId, assessmentStatus: "queued" };
}
