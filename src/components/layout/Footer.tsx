import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contact = useTranslations("contact");

  return (
    <footer className="bg-navy-950 text-white">
      {/* Top line accent */}
      <div className="h-px bg-white/10" />

      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Company info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold tracking-[0.2em] uppercase">CGIC</h3>
            <p className="mt-4 text-sm font-medium text-white/60">{t("companyName")}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              {t("description")}
            </p>
            <div className="mt-6 space-y-1 text-xs text-white/25">
              <p>{t("addressLine")}</p>
              <p>{t("lei")}</p>
              <p>{t("duns")}</p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              {t("navigation")}
            </h4>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/" className="text-sm text-white/50 transition-colors hover:text-white">
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/50 transition-colors hover:text-white">
                  {nav("about")}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-white/50 transition-colors hover:text-white">
                  {nav("services")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/50 transition-colors hover:text-white">
                  {nav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              {t("contactTitle")}
            </h4>
            <ul className="mt-6 space-y-4 text-sm text-white/50">
              <li>{contact("address")}</li>
              <li>
                <a href={`mailto:${contact("email")}`} className="transition-colors hover:text-white">
                  {contact("email")}
                </a>
              </li>
              <li>
                <a href={`tel:${contact("phone")}`} className="transition-colors hover:text-white">
                  {contact("phone")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              {t("legalTitle")}
            </h4>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/legal/privacy" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-white/50 transition-colors hover:text-white">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-white/30">
          {t("copyright", { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </footer>
  );
}
