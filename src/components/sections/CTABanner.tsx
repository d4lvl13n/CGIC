"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

export function CTABanner() {
  const t = useTranslations("cta");

  return (
    <section className="relative overflow-hidden bg-navy-900 py-32 sm:py-40">
      {/* Background accent shape */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg text-white/70"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 text-xl font-medium text-white transition-colors hover:text-accent-light"
            >
              {t("button")}
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-all group-hover:border-accent-light group-hover:bg-accent-light/10">
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
