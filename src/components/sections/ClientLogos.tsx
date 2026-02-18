"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const placeholderLogos = [
  "Deloitte",
  "Accenture",
  "Proximus",
  "BNP Paribas",
  "Solvay",
  "UCB",
];

export function ClientLogos() {
  const t = useTranslations("clients");

  return (
    <section className="bg-gray-100 py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-sm font-medium uppercase tracking-[0.2em] text-gray-400"
        >
          {t("title")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-16 gap-y-8"
        >
          {placeholderLogos.map((name) => (
            <div
              key={name}
              className="text-xl font-semibold tracking-wide text-gray-300 transition-colors hover:text-navy-950"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
