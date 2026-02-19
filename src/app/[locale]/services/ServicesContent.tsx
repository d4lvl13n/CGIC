"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CTABanner } from "@/components/sections/CTABanner";

const serviceKeys = [
  "service1",
  "service2",
  "service3",
  "service4",
  "service5",
  "service6",
] as const;

const serviceIcons = [
  <svg key="1" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>,
  <svg key="2" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>,
  <svg key="3" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" /></svg>,
  <svg key="4" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  <svg key="5" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
  <svg key="6" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
];

export function ServicesContent() {
  const t = useTranslations("services");

  return (
    <>
      {/* Hero — full-width image with bottom-left text like homepage */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&q=80"
            alt="Team collaboration"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-28">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-accent-light"
          >
            {t("sectionTitle")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            {t("subtitle")}
          </motion.h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-transparent" />
      </section>

      {/* Services detail — alternating layout */}
      <section className="bg-white py-32 sm:py-40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="space-y-0">
            {serviceKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="group grid items-center gap-8 border-b border-gray-100 py-12 first:pt-0 last:border-b-0 md:grid-cols-12 md:gap-12 md:py-16"
              >
                {/* Number + Icon */}
                <div className="flex items-center gap-6 md:col-span-1">
                  <span className="text-sm font-medium text-gray-300">
                    0{i + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="hidden md:col-span-1 md:flex">
                  <div className="text-accent transition-colors group-hover:text-accent-dark">
                    {serviceIcons[i]}
                  </div>
                </div>

                {/* Title */}
                <div className="md:col-span-4">
                  <div className="flex items-center gap-4 md:block">
                    <div className="text-accent md:hidden">
                      {serviceIcons[i]}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-navy-950 transition-colors group-hover:text-accent sm:text-3xl">
                      {t(`${key}Title`)}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-6">
                  <p className="text-lg leading-relaxed text-gray-500">
                    {t(`${key}Text`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / trust bar */}
      <section className="bg-navy-950 py-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "150+", label: "Consultants" },
              { value: "50+", label: "Clients" },
              { value: "12", label: "Years" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.15em] text-white/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
