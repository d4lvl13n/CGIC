"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

export function AboutPreview() {
  const t = useTranslations("about");

  return (
    <section className="relative bg-white py-32 sm:py-40">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
              {t("sectionTitle")}
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-navy-950 sm:text-5xl lg:text-6xl">
              {t("previewTitle")}
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-gray-400">
              {t("previewText")}
            </p>
            <div className="mt-10">
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-lg font-medium text-navy-950 transition-colors hover:text-accent"
              >
                {t("learnMore")}
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Corporate office"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Accent block */}
            <div className="absolute -bottom-6 -left-6 h-24 w-24 bg-accent sm:-bottom-8 sm:-left-8 sm:h-32 sm:w-32" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
