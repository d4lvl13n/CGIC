import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CGIC — Staffing & Consulting",
    short_name: "CGIC",
    description:
      "CGIC, your strategic partner in staffing and consulting in Brussels.",
    start_url: "/fr",
    display: "standalone",
    background_color: "#000850",
    theme_color: "#000850",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
