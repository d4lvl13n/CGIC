const baseUrl = "https://www.cgic.be";

function JsonLdScript({ value }: { value: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "CGIC",
    legalName: "CG International Consulting SRL",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
    },
    description:
      "CG International Consulting SRL — Staffing & Consulting partner based in Brussels, Belgium. IT staffing, strategic consulting, project management and recruitment.",
    leiCode: "875500UBAMWWIUVFT022",
    duns: "37-199-0796",
    address: {
      "@type": "PostalAddress",
      streetAddress: "35 Square de Meeûs",
      postalCode: "1000",
      addressLocality: "Brussels",
      addressRegion: "Brussels-Capital",
      addressCountry: "BE",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "info@cgic.be",
        contactType: "customer service",
        availableLanguage: ["French", "English", "Dutch"],
        areaServed: ["BE", "EU"],
      },
    ],
    sameAs: [],
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 50,
      maxValue: 200,
    },
    knowsAbout: [
      "IT Staffing",
      "Strategic Consulting",
      "Project Management",
      "Recruitment",
      "Digital Transformation",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd({ locale }: { locale: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: `${baseUrl}/${locale}`,
    name: "CGIC — Staffing & Consulting",
    publisher: { "@id": `${baseUrl}/#organization` },
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/${locale}/services`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

type JobPostingProps = {
  title: string;
  description: string;
  reference: string;
  publishedAt: string;
  closingDate: string;
  contractSlug: string;
  location: {
    label: string;
    city?: string;
    region?: string;
    countryCode: string;
    postalCode?: string;
    streetAddress?: string;
  };
  workModeSlug: string;
  applicantCountries?: string[];
  url: string;
};

const employmentTypeMap: Record<string, string> = {
  permanent: "FULL_TIME",
  freelance: "CONTRACTOR",
  temporary: "TEMPORARY",
  internship: "INTERN",
};

export function JobPostingJsonLd(props: JobPostingProps) {
  const remote = props.workModeSlug === "remote";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: props.title,
    description: props.description,
    identifier: {
      "@type": "PropertyValue",
      name: "CGIC",
      value: props.reference,
    },
    datePosted: props.publishedAt,
    validThrough: props.closingDate,
    employmentType: employmentTypeMap[props.contractSlug] ?? "OTHER",
    hiringOrganization: { "@id": `${baseUrl}/#organization` },
    url: props.url,
    directApply: false,
    ...(remote ? {
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: props.applicantCountries?.map((country) => ({
        "@type": "Country",
        name: country,
      })),
    } : {
      jobLocation: {
        "@type": "Place",
        name: props.location.label,
        address: {
          "@type": "PostalAddress",
          streetAddress: props.location.streetAddress,
          postalCode: props.location.postalCode,
          addressLocality: props.location.city,
          addressRegion: props.location.region,
          addressCountry: props.location.countryCode,
        },
      },
    }),
  };

  return <JsonLdScript value={jsonLd} />;
}

export function ArticleJsonLd({
  title,
  description,
  image,
  byline,
  publishedAt,
  updatedAt,
  url,
  locale,
}: {
  title: string;
  description: string;
  image?: string;
  byline: string;
  publishedAt: string;
  updatedAt: string;
  url: string;
  locale: string;
}) {
  return (
    <JsonLdScript value={{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: image ? [image] : undefined,
      author: { "@type": "Organization", name: byline },
      publisher: { "@id": `${baseUrl}/#organization` },
      datePublished: publishedAt,
      dateModified: updatedAt,
      mainEntityOfPage: url,
      inLanguage: locale,
    }} />
  );
}

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#localbusiness`,
    name: "CGIC",
    url: baseUrl,
    email: "info@cgic.be",
    address: {
      "@type": "PostalAddress",
      streetAddress: "35 Square de Meeûs",
      postalCode: "1000",
      addressLocality: "Brussels",
      addressRegion: "Brussels-Capital",
      addressCountry: "BE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 50.8394,
      longitude: 4.3668,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "$$",
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 50.8394, longitude: 4.3668 },
      geoRadius: "500000",
    },
    parentOrganization: { "@id": `${baseUrl}/#organization` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
