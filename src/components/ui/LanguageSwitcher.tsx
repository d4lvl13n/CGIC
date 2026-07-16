"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  fr: "FR",
  en: "EN",
  nl: "NL",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(newLocale: string) {
    const alternate = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${newLocale}"]`,
    );
    if (alternate?.href) {
      const url = new URL(alternate.href);
      const localizedPath = url.pathname.replace(/^\/(fr|en|nl)(?=\/|$)/, "") || "/";
      router.replace(`${localizedPath}${url.search}`, { locale: newLocale });
      return;
    }

    const fallback = pathname.startsWith("/jobs/")
      ? "/jobs"
      : pathname.startsWith("/insights/")
        ? "/insights"
        : pathname;
    router.replace(fallback, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={cn(
            "px-2 py-1 text-sm font-medium rounded transition-colors cursor-pointer",
            loc === locale
              ? "bg-white/20 text-white"
              : "text-white/80 hover:text-white"
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
