"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}

const inputStyles =
  "mt-2 w-full border-b border-gray-200 bg-transparent pb-3 text-gray-700 placeholder:text-gray-300 transition-colors focus:border-accent focus:outline-none";

export function ContactContent() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  async function onSubmit(data: ContactFormData) {
    // TODO: integrate with API endpoint
    console.log("Form data:", data);
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero — full-width image, bottom-left text */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
            alt="Corporate skyline"
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
            {t("pageTitle")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            {t("pageSubtitle")}
          </motion.h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-light to-transparent" />
      </section>

      {/* Form + Info — two-column layout */}
      <section className="bg-white py-32 sm:py-40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-20 lg:grid-cols-5">
            {/* Form — takes 3 cols */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                {t("formTitle")}
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-12 border border-green-200 bg-green-50/50 p-12"
                >
                  <h3 className="text-2xl font-bold text-navy-950">
                    {t("successTitle")}
                  </h3>
                  <p className="mt-3 text-gray-500">{t("successText")}</p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-12 space-y-8"
                >
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                        {t("nameLabel")} *
                      </label>
                      <input
                        {...register("name", { required: true })}
                        placeholder={t("namePlaceholder")}
                        className={inputStyles}
                      />
                      {errors.name && (
                        <p className="mt-2 text-xs text-red-500">
                          {t("errorRequired")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                        {t("emailLabel")} *
                      </label>
                      <input
                        {...register("email", {
                          required: true,
                          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        })}
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className={inputStyles}
                      />
                      {errors.email && (
                        <p className="mt-2 text-xs text-red-500">
                          {errors.email.type === "pattern"
                            ? t("errorEmail")
                            : t("errorRequired")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                        {t("companyLabel")}
                      </label>
                      <input
                        {...register("company")}
                        placeholder={t("companyPlaceholder")}
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                        {t("phoneLabel")}
                      </label>
                      <input
                        {...register("phone")}
                        placeholder={t("phonePlaceholder")}
                        className={inputStyles}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                      {t("messageLabel")} *
                    </label>
                    <textarea
                      {...register("message", { required: true })}
                      rows={4}
                      placeholder={t("messagePlaceholder")}
                      className={`${inputStyles} resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-2 text-xs text-red-500">
                        {t("errorRequired")}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex cursor-pointer items-center gap-3 text-lg font-medium text-navy-950 transition-colors hover:text-accent disabled:opacity-50"
                  >
                    {isSubmitting ? t("sending") : t("submit")}
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-950/20 transition-all group-hover:border-accent group-hover:bg-accent/5">
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
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact info — takes 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                {t("infoTitle")}
              </p>

              <div className="mt-12 space-y-10">
                <div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                      Address
                    </h3>
                  </div>
                  <p className="mt-3 text-lg text-navy-950">
                    {t("address")}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                      Email
                    </h3>
                  </div>
                  <a
                    href={`mailto:${t("email")}`}
                    className="mt-3 block text-lg text-navy-950 transition-colors hover:text-accent"
                  >
                    {t("email")}
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400">
                      Phone
                    </h3>
                  </div>
                  <a
                    href={`tel:${t("phone")}`}
                    className="mt-3 block text-lg text-navy-950 transition-colors hover:text-accent"
                  >
                    {t("phone")}
                  </a>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-16 aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm uppercase tracking-[0.15em] text-gray-300">
                    Map
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
