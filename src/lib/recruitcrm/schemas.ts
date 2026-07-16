import { z } from "zod";

const idSchema = z.union([z.string(), z.number()]).transform(String);

export const recruitCrmJobSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().min(1),
  slug: idSchema,
  note_for_candidates: z.string().nullish(),
  number_of_openings: z.number().nullish(),
  minimum_experience: z.number().nullish(),
  maximum_experience: z.number().nullish(),
  min_annual_salary: z.number().nullish(),
  max_annual_salary: z.number().nullish(),
  job_status: z.object({
    id: z.union([z.number(), z.string()]).optional(),
    label: z.string(),
  }).nullish(),
  job_skill: z.string().nullish(),
  job_type: z.union([z.number(), z.string()]).nullish(),
  job_category: z.string().nullish(),
  city: z.string().nullish(),
  locality: z.string().nullish(),
  country: z.string().nullish(),
  state: z.string().nullish(),
  address: z.string().nullish(),
  postal_code: z.string().nullish(),
  enable_job_application_form: z.union([z.number(), z.string(), z.boolean()]).nullish(),
  job_code: z.string().nullish(),
  job_description_text: z.string().nullish(),
  job_location_type: z.union([z.number(), z.string()]).nullish(),
  // RecruitCRM's live payload currently returns an object here although the
  // published reference describes a string. This field is not used by CGIC.
  salary_type: z.unknown().optional(),
  // The live API uses 0/1 while older/reference payloads use string labels.
  job_posting_status: z.union([z.string(), z.number(), z.boolean()]).nullish(),
  application_form_url: z.string().nullish(),
  created_on: z.string().nullish(),
  updated_on: z.string().nullish(),
}).passthrough();

export const recruitCrmJobsResponseSchema = z.object({
  data: z.array(recruitCrmJobSchema),
}).passthrough();

export const recruitCrmCandidateSchema = z.object({
  slug: idSchema,
  email: z.string().nullish(),
}).passthrough();

export const recruitCrmCandidateSearchResponseSchema = z.object({
  data: z.array(recruitCrmCandidateSchema),
}).passthrough();

export type RecruitCrmJob = z.infer<typeof recruitCrmJobSchema>;
