const baseUrl = "https://www.cgic.be";

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
      streetAddress: "523 Avenue Louise",
      postalCode: "1050",
      addressLocality: "Brussels",
      addressRegion: "Brussels-Capital",
      addressCountry: "BE",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+32-472-58-57-96",
        email: "cedric.grauwels@cgic.be",
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

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#localbusiness`,
    name: "CGIC",
    url: baseUrl,
    telephone: "+32-472-58-57-96",
    email: "cedric.grauwels@cgic.be",
    address: {
      "@type": "PostalAddress",
      streetAddress: "523 Avenue Louise",
      postalCode: "1050",
      addressLocality: "Brussels",
      addressRegion: "Brussels-Capital",
      addressCountry: "BE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 50.8503,
      longitude: 4.3517,
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
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 50.8503, longitude: 4.3517 },
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
