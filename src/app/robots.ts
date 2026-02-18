import type { MetadataRoute } from "next";

const baseUrl = "https://www.cgic.be";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/llms.txt", "/llms-full.txt"],
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/llms.txt", "/llms-full.txt"],
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/llms.txt", "/llms-full.txt"],
        disallow: "/",
      },
      {
        userAgent: "Claude-Web",
        allow: ["/llms.txt", "/llms-full.txt"],
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
