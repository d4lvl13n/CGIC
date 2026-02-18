"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

export function VideoHero() {
  const t = useTranslations("hero");

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/4170/4170-1080.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Gradient overlay — darker at bottom like GE Aerospace */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content — bottom-left aligned like GE */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-24 sm:pb-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t("title")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-8 flex items-center gap-6"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 text-2xl font-light text-white transition-colors hover:text-accent-light sm:text-3xl"
            >
              {t("cta")}
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/40 transition-all group-hover:border-accent-light group-hover:bg-accent-light/10">
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line like GE */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-transparent" />
    </section>
  );
}
