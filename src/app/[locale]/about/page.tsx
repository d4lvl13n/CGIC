import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";
import { AboutContent } from "./AboutContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("aboutTitle");
  const description = t("aboutDescription");

  return {
    title,
    description,
    alternates: getAlternates(locale, "/about"),
    openGraph: getOpenGraph(locale, title, description, "/about"),
    twitter: { title, description, images: ["/og-image.png"] },
  };
}

export default function AboutPage() {
  return <AboutContent />;
}
