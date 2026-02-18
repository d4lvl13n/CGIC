const baseUrl = "https://www.cgic.be";
const locales = ["fr", "en", "nl"] as const;

export function getAlternates(locale: string, path: string = "") {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages["x-default"] = `${baseUrl}/fr${path}`;

  return {
    canonical: `${baseUrl}/${locale}${path}`,
    languages,
  };
}

export function getOpenGraph(
  locale: string,
  title: string,
  description: string,
  path: string = ""
) {
  const ogLocaleMap: Record<string, string> = {
    fr: "fr_BE",
    en: "en_GB",
    nl: "nl_BE",
  };

  return {
    title,
    description,
    url: `${baseUrl}/${locale}${path}`,
    siteName: "CGIC",
    locale: ogLocaleMap[locale] || "fr_BE",
    alternateLocale: locales
      .filter((l) => l !== locale)
      .map((l) => ogLocaleMap[l]),
    type: "website" as const,
  };
}

export { baseUrl };
