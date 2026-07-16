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

const recruitCrmPublicJobSchema = z.object({
  slug: idSchema,
  srno: z.union([z.string(), z.number()]).nullish(),
  name: z.string().min(1),
  companyname: z.string().nullish(),
  jobcode: z.string().nullish(),
  description: z.string().nullish(),
  details: z.unknown().optional(),
  detailfilename: z.string().nullish(),
  city: z.string().nullish(),
  locality: z.string().nullish(),
  jdtext: z.string().nullish(),
  remote: z.union([z.string(), z.number(), z.boolean()]).nullish(),
  postalcode: z.string().nullish(),
}).passthrough();

export const recruitCrmPublicJobsResponseSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
  data: z.object({
    jobs: z.array(recruitCrmPublicJobSchema),
  }).optional(),
}).passthrough();

export const recruitCrmCandidateSchema = z.object({
  slug: idSchema,
  email: z.string().nullish(),
}).passthrough();

const recruitCrmCandidateListSchema = z.array(recruitCrmCandidateSchema);

export const recruitCrmCandidateSearchResponseSchema = z.union([
  recruitCrmCandidateListSchema,
  z.object({ data: recruitCrmCandidateListSchema }).passthrough(),
]);

export const recruitCrmCandidateCreateResponseSchema = z.union([
  recruitCrmCandidateSchema,
  recruitCrmCandidateListSchema,
  z.object({ data: recruitCrmCandidateSchema }).passthrough(),
  z.object({ data: recruitCrmCandidateListSchema }).passthrough(),
]);

export const recruitCrmCandidateJobAssociationSchema = z.object({
  candidate_slug: idSchema,
  job_slug: idSchema,
  status: z.object({
    status_id: z.union([z.string(), z.number()]).optional(),
    label: z.string().optional(),
  }).passthrough().nullish(),
}).passthrough();

const recruitCrmCandidateJobAssociationListSchema = z.array(
  recruitCrmCandidateJobAssociationSchema,
).min(1);

export const recruitCrmCandidateJobAssociationResponseSchema = z.union([
  recruitCrmCandidateJobAssociationSchema,
  recruitCrmCandidateJobAssociationListSchema,
  z.object({ data: recruitCrmCandidateJobAssociationSchema }).passthrough(),
  z.object({ data: recruitCrmCandidateJobAssociationListSchema }).passthrough(),
]).transform((payload) => {
  if (Array.isArray(payload)) return payload[0];
  if ("data" in payload) return Array.isArray(payload.data) ? payload.data[0] : payload.data;
  return payload;
});

export type RecruitCrmJob = z.infer<typeof recruitCrmJobSchema>;
export type RecruitCrmPublicJob = z.infer<typeof recruitCrmPublicJobSchema>;
