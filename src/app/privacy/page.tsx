"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    content:
      "When you use CETCounsel AI, we may collect information you provide directly, such as your MHT-CET percentile, category, gender, preferred city, branch interests, and other preferences used for college predictions. We also collect anonymous usage data to improve our prediction engine and user experience.",
  },
  {
    title: "How We Use Your Information",
    content:
      "The information you provide is used solely to generate accurate college predictions and comparisons. We do not sell, rent, or share your personal data with third parties. Aggregated and anonymized data may be used for research and platform improvement.",
  },
  {
    title: "Data Storage & Security",
    content:
      "We implement industry-standard security measures to protect your data. All data is stored securely and access is restricted to essential platform operations. While we strive to protect your information, no method of electronic storage is 100% secure.",
  },
  {
    title: "Cookies & Tracking",
    content:
      "CETCounsel AI may use essential cookies to ensure the platform functions properly. We do not use tracking cookies for advertising purposes. You can configure your browser to reject cookies, though this may affect certain functionality.",
  },
  {
    title: "Third-Party Services",
    content:
      "We may use third-party services for hosting, analytics, and infrastructure. These providers are contractually bound to protect your data and use it only for the services they provide to us.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your information only as long as necessary to provide our services. You may request deletion of your data by contacting us. Usage logs and anonymized data may be retained longer for analytical purposes.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also object to or restrict certain processing activities. To exercise these rights, please contact us using the information below.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.",
  },
  {
    title: "Contact Us",
    content:
      "If you have questions or concerns about this Privacy Policy or your data, please reach out to our support team through the platform or contact us at shivamprajapati8451@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh]">
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-terracotta-500/5 blur-[100px]" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="eyebrow justify-center mx-auto w-fit mb-6">
              <ShieldCheck className="h-3 w-3 text-terracotta-500 fill-current" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-nut-900">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-nut-400 max-w-xl mx-auto">
              How we collect, use, and protect your information on CETCounsel AI.
            </p>
            <div className="mt-3 text-sm text-nut-300">
              Last updated: June 11, 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="doppel-outer">
              <div className="doppel-inner p-8 sm:p-10">
                <p className="text-sm text-nut-500 leading-relaxed">
                  CETCounsel AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you use our platform. By using CETCounsel AI, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </div>
            </div>

            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                className="doppel-outer"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <div className="doppel-inner p-8 sm:p-10">
                  <h2 className="text-lg font-semibold text-nut-900 mb-3">
                    {section.title}
                  </h2>
                  <p className="text-sm text-nut-500 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* ── Back CTA ── */}
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link href="/">
                <span className="btn-ghost inline-flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Home
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Ad Unit ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <AdUnit adSlot="5019828315" format="horizontal" />
        </div>
      </section>
    </div>
  );
}
