import { z } from "zod";

export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

const optionalUrl = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().url().max(500).optional(),
);

export const jobApplicationSchema = z.object({
  jobSlug: z.string().min(1).max(160),
  locale: z.enum(["fr", "en", "nl"]),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(50).optional().default(""),
  linkedinUrl: optionalUrl,
  city: z.string().trim().min(1).max(100),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  seniority: z.enum(["junior", "mid", "senior", "lead", "principal"]),
  availability: z.enum(["available", "soon", "not_available"]),
  language: z.string().trim().min(2).max(5),
  coverMessage: z.string().trim().max(3000).optional().default(""),
  consent: z.literal("true"),
  website: z.string().max(0).optional().default(""),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export function parseJobApplication(formData: FormData) {
  const raw = Object.fromEntries(
    [
      "jobSlug",
      "locale",
      "firstName",
      "lastName",
      "email",
      "phone",
      "linkedinUrl",
      "city",
      "countryCode",
      "seniority",
      "availability",
      "language",
      "coverMessage",
      "consent",
      "website",
    ].map((key) => [key, formData.get(key)]),
  );
  return jobApplicationSchema.safeParse(raw);
}

export function validateResume(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return { ok: false as const, code: "RESUME_REQUIRED" };
  if (value.type !== "application/pdf") return { ok: false as const, code: "RESUME_TYPE" };
  if (value.size > MAX_RESUME_BYTES) return { ok: false as const, code: "RESUME_SIZE" };
  return { ok: true as const, file: value };
}
