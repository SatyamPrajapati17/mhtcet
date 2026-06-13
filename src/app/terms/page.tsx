"use client";

import { motion } from "framer-motion";
import { Scale, ArrowRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import Link from "next/link";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using CETCounsel AI (&quot;the Platform&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you must not use the Platform. We reserve the right to update these terms at any time without prior notice.",
  },
  {
    title: "Description of Service",
    content:
      "CETCounsel AI provides AI-powered college prediction and counseling tools for MHT-CET students. The Platform analyzes cutoff data and user-provided inputs to generate personalized college recommendations. Predictions are based on historical data and should be used as a reference tool, not as guaranteed admission outcomes.",
  },
  {
    title: "User Responsibilities",
    content:
      "You agree to provide accurate and truthful information when using the Platform. You are responsible for maintaining the confidentiality of any account credentials. You must not use the Platform for any unlawful purpose or in violation of any applicable laws or regulations.",
  },
  {
    title: "Disclaimer of Predictions",
    content:
      "College predictions provided by CETCounsel AI are estimates based on historical cutoff data and should not be considered as guaranteed admission outcomes. Actual admissions depend on various factors including but not limited to seat availability, competition levels, and institutional policies. We recommend verifying all predictions with official counseling authorities.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, features, and functionality of the Platform — including text, graphics, logos, icons, and software — are owned by CETCounsel AI or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without prior written consent.",
  },
  {
    title: "Limitation of Liability",
    content:
      "CETCounsel AI and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use the Platform. This includes but is not limited to college admission decisions made based on predictions from our platform.",
  },
  {
    title: "Data Accuracy",
    content:
      "We strive to maintain accurate and up-to-date cutoff data sourced from official MHT-CET counseling results. However, we do not guarantee the completeness, accuracy, or timeliness of the data. Users are advised to cross-reference with official sources for critical admission decisions.",
  },
  {
    title: "Prohibited Activities",
    content:
      "You agree not to engage in any activity that interferes with or disrupts the Platform's services, including but not limited to scraping data, introducing malware, attempting unauthorized access, or engaging in any form of automated excessive querying of our systems.",
  },
  {
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate access to the Platform at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or the Platform itself.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.",
  },
  {
    title: "Contact",
    content:
      "For questions about these Terms &amp; Conditions, please contact us at shivamprajapati8451@gmail.com.",
  },
];

export default function TermsPage() {
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
              <Scale className="h-3 w-3 text-terracotta-500 fill-current" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-nut-900">
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 text-lg text-nut-400 max-w-xl mx-auto">
              The rules and guidelines governing your use of CETCounsel AI.
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
                  Welcome to CETCounsel AI. These Terms &amp; Conditions govern your use of our college
                  prediction and counseling platform. By accessing or using CETCounsel AI, you agree to
                  be bound by these terms. Please read them carefully before using the Platform.
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
