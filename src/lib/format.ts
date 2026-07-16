import type { Locale } from "@/lib/content";

const dateLocales: Record<Locale, string> = {
  fr: "fr-BE",
  en: "en-GB",
  nl: "nl-BE",
};

export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Brussels",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
}
