import "server-only";

import {
  recruitCrmAssignedCandidatesResponseSchema,
  recruitCrmCandidateSchema,
  recruitCrmCandidateCreateResponseSchema,
  recruitCrmCandidateJobAssociationResponseSchema,
  recruitCrmCandidateSearchResponseSchema,
  recruitCrmJobsResponseSchema,
  recruitCrmPublicJobsResponseSchema,
  type RecruitCrmJob,
  type RecruitCrmPublicJob,
} from "./schemas";

const DEFAULT_API_URL = "https://api.recruitcrm.io";
const PUBLIC_JOBS_API_URL = "https://albatross.recruitcrm.io/v1/external-pages/jobs-by-account/get";
const DEFAULT_JOBS_PAGE = "Alsena_Ltd_jobs";

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

function normalizePublicJob(job: RecruitCrmPublicJob): RecruitCrmJob {
  return {
    id: job.srno ?? job.slug,
    name: job.name,
    slug: job.slug,
    note_for_candidates: job.description,
    job_status: { id: 1, label: "Open" },
    city: job.city,
    locality: job.locality,
    postal_code: job.postalcode,
    enable_job_application_form: 1,
    job_code: job.jobcode,
    job_description_text: job.jdtext || job.description,
    job_location_type: job.remote === true || job.remote === 1 || job.remote === "1" ? 1 : 0,
    job_posting_status: 1,
  };
}

export async function listRecruitCrmJobs(): Promise<RecruitCrmJob[]> {
  const jobsPage = process.env.RECRUITCRM_JOBS_PAGE?.trim() || DEFAULT_JOBS_PAGE;
  const query = new URLSearchParams({ account: jobsPage, batch: "true" });
  const response = await fetch(`${PUBLIC_JOBS_API_URL}?${query}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://recruitcrm.io",
    },
    body: JSON.stringify({ limit: 100, offset: 0, search_data: "", onlyJobs: true }),
    next: { revalidate: 300, tags: ["recruitcrm-jobs"] },
  });
  if (!response.ok) throw new RecruitCrmApiError("RecruitCRM public jobs request failed", response.status);

  const payload = recruitCrmPublicJobsResponseSchema.parse(await response.json());
  if (payload.status !== "success" || !payload.data) {
    throw new RecruitCrmApiError(payload.message || "RecruitCRM public jobs request failed", 502, payload);
  }
  return payload.data.jobs.map(normalizePublicJob);
}

type RecruitCrmJobIdentity = {
  publicSlug: string;
  name: string;
  city?: string;
  jobCode?: string;
};

function comparable(value?: string | null) {
  return value?.trim().toLocaleLowerCase("en") ?? "";
}

export async function resolveRecruitCrmJobSlug(identity: RecruitCrmJobIdentity) {
  const response = await recruitCrmFetch(
    "/v1/jobs?limit=100&sort_by=updatedon&sort_order=desc",
    { cache: "no-store" },
  );
  const jobs = recruitCrmJobsResponseSchema.parse(await response.json()).data;

  const directMatch = jobs.find((job) => job.slug === identity.publicSlug);
  if (directMatch) return directMatch.slug;

  let matches = jobs.filter((job) => comparable(job.name) === comparable(identity.name));
  if (identity.jobCode) {
    const codeMatches = matches.filter(
      (job) => comparable(job.job_code) === comparable(identity.jobCode),
    );
    if (codeMatches.length) matches = codeMatches;
  }
  if (matches.length > 1 && identity.city) {
    const cityMatches = matches.filter(
      (job) => comparable(job.city) === comparable(identity.city),
    );
    if (cityMatches.length) matches = cityMatches;
  }

  if (matches.length !== 1) {
    throw new RecruitCrmApiError(
      matches.length
        ? "RecruitCRM job mapping is ambiguous"
        : "RecruitCRM job could not be mapped to its internal record",
      502,
      { publicSlug: identity.publicSlug, matchCount: matches.length },
    );
  }
  return matches[0].slug;
}

export async function findRecruitCrmCandidateByEmail(email: string) {
  const query = new URLSearchParams({ email, exact_search: "true" });
  const response = await recruitCrmFetch(`/v1/candidates/search?${query}`, { cache: "no-store" });
  const payload = recruitCrmCandidateSearchResponseSchema.parse(await response.json());
  const candidates = Array.isArray(payload) ? payload : payload.data;
  return candidates[0] ?? null;
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
  const payload = recruitCrmCandidateCreateResponseSchema.parse(await response.json());
  if (Array.isArray(payload)) {
    const candidate = payload[0];
    if (!candidate) throw new RecruitCrmApiError("RecruitCRM returned no candidate after creation", 502, payload);
    return candidate;
  }
  if ("data" in payload) {
    const candidate = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    if (!candidate) throw new RecruitCrmApiError("RecruitCRM returned no candidate after creation", 502, payload);
    return candidate;
  }
  return recruitCrmCandidateSchema.parse(payload);
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

function matchesRecruitCrmApplication(
  application: { candidate_slug: string; job_slug: string },
  candidateSlug: string,
  jobSlug: string,
) {
  return application.candidate_slug === candidateSlug && application.job_slug === jobSlug;
}

async function isRecruitCrmCandidateAssignedToJob(candidateSlug: string, jobSlug: string) {
  let page = 1;
  do {
    const query = new URLSearchParams({ limit: "100", page: String(page) });
    const response = await recruitCrmFetch(
      `/v1/jobs/${encodeURIComponent(jobSlug)}/assigned-candidates?${query}`,
      { cache: "no-store" },
    );
    const payload = recruitCrmAssignedCandidatesResponseSchema.parse(await response.json());
    if (payload.data.some((entry) => entry.candidate.slug === candidateSlug)) return true;

    const lastPage = Number(payload.last_page ?? payload.current_page ?? page);
    if (page >= lastPage || payload.data.length === 0) return false;
    page += 1;
  } while (page <= 20);

  throw new RecruitCrmApiError("RecruitCRM candidate assignment lookup exceeded 20 pages", 502);
}

export async function applyRecruitCrmCandidate(candidateSlug: string, jobSlug: string) {
  if (await isRecruitCrmCandidateAssignedToJob(candidateSlug, jobSlug)) {
    return { alreadyApplied: true };
  }

  const query = new URLSearchParams({ job_slug: jobSlug });
  const response = await recruitCrmFetch(
    `/v1/candidates/${encodeURIComponent(candidateSlug)}/apply?${query}`,
    { method: "POST", cache: "no-store" },
  );

  const payload: unknown = await response.json().catch(() => null);
  const parsed = recruitCrmCandidateJobAssociationResponseSchema.safeParse(payload);
  if (parsed.success && !matchesRecruitCrmApplication(parsed.data, candidateSlug, jobSlug)) {
    throw new RecruitCrmApiError(
      "RecruitCRM did not confirm the requested candidate/job application",
      502,
      payload,
    );
  }

  for (const delayMs of [0, 250, 750]) {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (await isRecruitCrmCandidateAssignedToJob(candidateSlug, jobSlug)) {
      return { alreadyApplied: false };
    }
  }

  throw new RecruitCrmApiError(
    "RecruitCRM application could not be verified in the job candidate list",
    502,
    { candidateSlug, jobSlug },
  );
}
