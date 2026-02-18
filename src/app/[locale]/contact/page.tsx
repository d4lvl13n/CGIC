import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";
import { ContactContent } from "./ContactContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("contactTitle");
  const description = t("contactDescription");

  return {
    title,
    description,
    alternates: getAlternates(locale, "/contact"),
    openGraph: getOpenGraph(locale, title, description, "/contact"),
    twitter: { title, description },
  };
}

export default function ContactPage() {
  return <ContactContent />;
}
