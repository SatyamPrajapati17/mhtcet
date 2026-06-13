"use client";

import { motion } from "framer-motion";
import { MessageSquareText, ExternalLink, ArrowRight } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import Link from "next/link";

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScgvxTRKSDiSlapychYzBN-Mpw3Z6mDaszVWRT6w5n7M5j25Q/viewform?usp=dialog";

export default function FeedbackPage() {
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
              <MessageSquareText className="h-3 w-3 text-terracotta-500 fill-current" />
              Feedback
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-nut-900">
              Share Your Feedback
            </h1>
            <p className="mt-4 text-lg text-nut-400 max-w-xl mx-auto">
              Help us improve CETCounsel AI with your valuable input.
            </p>
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
              <div className="doppel-inner p-8 sm:p-10 text-center">
                <div className="inline-flex rounded-2xl bg-terracotta-500/10 p-4 mb-6">
                  <MessageSquareText className="h-8 w-8 text-terracotta-500" />
                </div>
                <h2 className="text-xl font-semibold text-nut-900 mb-3">
                  We&apos;d Love to Hear From You
                </h2>
                <p className="text-sm text-nut-500 leading-relaxed max-w-lg mx-auto">
                  Your feedback helps us make CETCounsel AI better for everyone. Whether
                  it&apos;s a suggestion, a bug report, or just a thought — we&apos;re all ears.
                  Click the button below to open our feedback form.
                </p>

                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                >
                  <a
                    href={FEEDBACK_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <motion.span
                      className="btn-terracotta"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <MessageSquareText className="h-4 w-4" />
                      Open Feedback Form
                      <span className="btn-icon-wrap">
                        <ExternalLink className="h-3.5 w-3.5 text-cream-50" />
                      </span>
                    </motion.span>
                  </a>
                </motion.div>
              </div>
            </div>

            {/* ── Info Cards ── */}
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Suggestions",
                  desc: "Have an idea for a new feature? Let us know what would make your counseling experience better.",
                },
                {
                  title: "Bug Reports",
                  desc: "Found something not working right? Tell us about it so we can fix it quickly.",
                },
                {
                  title: "General Feedback",
                  desc: "Anything else on your mind? We appreciate all kinds of input from our users.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="doppel-outer"
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <div className="doppel-inner p-6">
                    <h3 className="text-sm font-semibold text-nut-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-nut-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

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
