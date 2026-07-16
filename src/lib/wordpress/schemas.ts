import { z } from "zod";

export const wpTermSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
  acf: z.record(z.string(), z.unknown()).optional(),
});

const wpMediaSchema = z.object({
  id: z.number(),
  source_url: z.string().url(),
  alt_text: z.string().optional().default(""),
  media_details: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
});

export const wpContentItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
  date_gmt: z.string(),
  modified_gmt: z.string(),
  title: z.object({ rendered: z.string() }),
  content: z.object({ rendered: z.string() }).optional(),
  excerpt: z.object({ rendered: z.string() }).optional(),
  acf: z.record(z.string(), z.unknown()).optional().default({}),
  lang: z.string().optional(),
  translations: z.record(z.string(), z.number()).optional().default({}),
  _embedded: z.object({
    "wp:featuredmedia": z.array(wpMediaSchema).optional(),
    "wp:term": z.array(z.array(wpTermSchema)).optional(),
  }).optional(),
});

export const wpContentListSchema = z.array(wpContentItemSchema);

export type WpContentItem = z.infer<typeof wpContentItemSchema>;
export type WpTerm = z.infer<typeof wpTermSchema>;
