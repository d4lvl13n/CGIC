export const locales = ["fr", "en", "nl"] as const;
export type Locale = (typeof locales)[number];

export type TaxonomyValue = {
  id: number;
  slug: string;
  label: string;
};

export type CmsImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type SeoFields = {
  title?: string;
  description?: string;
  socialImage?: CmsImage;
};

export type JobState = "open" | "closed";

export type Job = {
  id: number;
  recruitCrmSlug?: string;
  reference: string;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  responsibilitiesHtml: string;
  candidateProfileHtml: string;
  offerHtml?: string;
  location: TaxonomyValue & {
    city?: string;
    region?: string;
    countryCode: string;
    postalCode?: string;
    streetAddress?: string;
  };
  expertise: TaxonomyValue;
  contractType: TaxonomyValue;
  workMode: TaxonomyValue;
  skills: TaxonomyValue[];
  publishedAt: string;
  startDate?: string;
  closingDate?: string;
  state: JobState;
  featured: boolean;
  applicationUrl: string;
  applicantCountries?: string[];
  contactName?: string;
  featuredImage?: CmsImage;
  seo: SeoFields;
  alternates: Partial<Record<Locale, string>>;
};

export type Article = {
  id: number;
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  category: TaxonomyValue;
  publishedAt: string;
  updatedAt: string;
  byline: string;
  featured: boolean;
  featuredImage?: CmsImage;
  seo: SeoFields;
  alternates: Partial<Record<Locale, string>>;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};
