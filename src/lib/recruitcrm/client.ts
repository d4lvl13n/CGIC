import "server-only";

import {
  recruitCrmCandidateSchema,
  recruitCrmCandidateSearchResponseSchema,
  recruitCrmJobsResponseSchema,
  type RecruitCrmJob,
} from "./schemas";

const DEFAULT_API_URL = "https://api.recruitcrm.io";

export class RecruitCrmApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "RecruitCrmApiError";
  }
}

export function isRecruitCrmConfigured() {
  return Boolean(process.env.RECRUITCRM_API_TOKEN?.trim());
}

function apiUrl(path: string) {
  const base = (process.env.RECRUITCRM_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function recruitCrmFetch(
  path: string,
  init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
  acceptedStatuses: number[] = [],
) {
  const token = process.env.RECRUITCRM_API_TOKEN?.trim();
  if (!token) throw new Error("RECRUITCRM_API_TOKEN is not configured");

  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok && !acceptedStatuses.includes(response.status)) {
    const body = await response.text();
    let details: unknown = body;
    try {
      details = JSON.parse(body);
    } catch {
      // Keep the response text for operational logs.
    }
    throw new RecruitCrmApiError(
      `RecruitCRM request failed with status ${response.status}`,
      response.status,
      details,
    );
  }

  return response;
}

export async function listRecruitCrmJobs(): Promise<RecruitCrmJob[]> {
  const response = await recruitCrmFetch("/v1/jobs?limit=100&sort_by=updatedon&sort_order=desc", {
    next: { revalidate: 300, tags: ["recruitcrm-jobs"] },
  });
  return recruitCrmJobsResponseSchema.parse(await response.json()).data;
}

export async function findRecruitCrmCandidateByEmail(email: string) {
  const query = new URLSearchParams({ email, exact_search: "true" });
  const response = await recruitCrmFetch(`/v1/candidates/search?${query}`, { cache: "no-store" });
  return recruitCrmCandidateSearchResponseSchema.parse(await response.json()).data[0] ?? null;
}

type CandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  city: string;
  countryCode: string;
  position: string;
  coverMessage?: string;
  resume: File;
};

export async function createRecruitCrmCandidate(input: CandidateInput) {
  const form = new FormData();
  form.set("first_name", input.firstName);
  form.set("last_name", input.lastName);
  form.set("email", input.email);
  form.set("city", input.city);
  form.set("country", input.countryCode);
  form.set("position", input.position);
  form.set("source", "CGIC Website");
  form.set("resume", input.resume, input.resume.name);
  if (input.phone) form.set("contact_number", input.phone);
  if (input.linkedinUrl) form.set("linkedin", input.linkedinUrl);
  if (input.coverMessage) form.set("candidate_summary", input.coverMessage);

  const response = await recruitCrmFetch("/v1/candidates", {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  return recruitCrmCandidateSchema.parse(await response.json());
}

export async function attachRecruitCrmCandidateFile(candidateSlug: string, resume: File) {
  const form = new FormData();
  form.set("related_to", candidateSlug);
  form.set("related_to_type", "candidate");
  form.set("folder", "Resumes");
  form.append("files[]", resume, resume.name);

  await recruitCrmFetch("/v1/files", {
    method: "POST",
    body: form,
    cache: "no-store",
  });
}

async function hasRecruitCrmApplication(candidateSlug: string, jobSlug: string) {
  const response = await recruitCrmFetch(
    `/v1/candidates/${encodeURIComponent(candidateSlug)}/hiring-stages/${encodeURIComponent(jobSlug)}`,
    { cache: "no-store" },
    [404, 422],
  );
  return response.ok;
}

export async function applyRecruitCrmCandidate(candidateSlug: string, jobSlug: string) {
  if (await hasRecruitCrmApplication(candidateSlug, jobSlug)) {
    return { alreadyApplied: true };
  }

  const query = new URLSearchParams({ job_slug: jobSlug });
  await recruitCrmFetch(
    `/v1/candidates/${encodeURIComponent(candidateSlug)}/apply?${query}`,
    { method: "POST", cache: "no-store" },
  );
  return { alreadyApplied: false };
}
