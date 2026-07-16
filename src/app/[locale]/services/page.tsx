import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";
import { ServicesContent } from "./ServicesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("servicesTitle");
  const description = t("servicesDescription");

  return {
    title,
    description,
    alternates: getAlternates(locale, "/services"),
    openGraph: getOpenGraph(locale, title, description, "/services"),
    twitter: { title, description, images: ["/og-image.png"] },
  };
}

export default function ServicesPage() {
  return <ServicesContent />;
}
