import { getTranslations } from "next-intl/server";
import { getAlternates, getOpenGraph } from "@/lib/seo";
import { VideoHero } from "@/components/sections/VideoHero";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { CTABanner } from "@/components/sections/CTABanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("homeTitle");
  const description = t("homeDescription");

  return {
    title,
    description,
    alternates: getAlternates(locale),
    openGraph: getOpenGraph(locale, title, description),
    twitter: { title, description },
  };
}

export default function HomePage() {
  return (
    <>
      <VideoHero />
      <AboutPreview />
      <ServicesGrid />
      <ClientLogos />
      <CTABanner />
    </>
  );
}
