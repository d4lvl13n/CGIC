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
    router.replace(pathname, { locale: newLocale });
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
              : "text-white/60 hover:text-white"
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
