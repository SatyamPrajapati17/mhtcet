"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Search,
  GitCompareArrows,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

const stats = [
  { label: "Colleges", value: "300+", icon: GraduationCap },
  { label: "Cutoff Records", value: "138K+", icon: TrendingUp },
  { label: "Years of Data", value: "2022-24", icon: Zap },
  { label: "CAP Rounds", value: "3 Rounds", icon: ShieldCheck },
];

const features = [
  {
    icon: Brain,
    title: "AI College Prediction",
    description:
      "Enter your MHT-CET percentile and get personalized predictions classified as Safe, Moderate, or Dream colleges.",
    href: "/predict",
  },
  {
    icon: Search,
    title: "College Database",
    description:
      "Browse 300+ engineering colleges with detailed cutoff history, branch information, and key stats.",
    href: "/colleges",
  },
  {
    icon: GitCompareArrows,
    title: "College Comparison",
    description:
      "Compare colleges side by side across cutoffs, location, and rankings to make informed decisions.",
    href: "/compare",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter Your Details",
    description: "Input your MHT-CET percentile, category, and preferences including city and branch.",
  },
  {
    number: "02",
    title: "Get AI Predictions",
    description: "Receive personalized college lists with Safe, Moderate, and Dream classifications.",
  },
  {
    number: "03",
    title: "Make Smart Decisions",
    description: "Compare colleges side by side and make data-driven admission decisions.",
  },
];

function GrainOverlay() {
  return <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.025]" 
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '256px 256px'
    }}
  />;
}

export default function Home() {
  return (
    <div className="min-h-[100dvh]">
      {/* ── Hero: Editorial Split ── */}
      <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-terracotta-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-terracotta-400/5 blur-[100px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-2 lg:gap-20 items-center section-cream">
          {/* ── Left: Content ── */}
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -40, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="eyebrow mb-8">
              <Sparkles className="h-3 w-3 text-terracotta-500 fill-current" />
              AI-Powered MHT-CET Counseling
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95] text-nut-900">
              Your AI Counselor
              <br />
              <span className="gradient-text-terracotta">for Engineering</span>
              <br />
              Admissions
            </h1>

            <p className="mt-6 text-base sm:text-lg text-nut-400 leading-relaxed max-w-md">
              Predict colleges, analyze cutoffs, compare options, and get
              personalized AI counseling — all in one platform.
            </p>

            {/* ── Button-in-Button CTAs ── */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              <Link href="/predict">
                <motion.div
                  className="btn-terracotta"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >                    <Brain className="h-4 w-4" />
                    Predict Your Colleges
                  <span className="btn-icon-wrap">
                    <ArrowRight className="h-3.5 w-3.5 text-cream-50" />
                  </span>
                </motion.div>
              </Link>
              <Link href="/colleges">
                <motion.div
                  className="btn-ghost"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Search className="h-4 w-4" />
                  Browse Colleges
                </motion.div>
              </Link>
            </motion.div>

            {/* ── Stats ── */}
            <motion.div
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold tracking-tight text-nut-900">
                      {stat.value}
                    </div>
                    <div className="text-xs text-nut-400 mt-1 flex items-center gap-1">
                      <Icon className="h-3 w-3 text-terracotta-500" />
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ── Right: Decorative Double-Bezel Stack ── */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="relative">
              {/* Card 1 */}
              <div className="doppel-outer w-64 absolute -top-12 -left-12 rotate-[-3deg]">
                <div className="doppel-inner p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-terracotta-300" />
                    <div className="w-2 h-2 rounded-full bg-terracotta-200" />
                    <div className="w-2 h-2 rounded-full bg-terracotta-100" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-cream-300 w-full" />
                    <div className="h-2 rounded-full bg-cream-300 w-3/4" />
                    <div className="h-2 rounded-full bg-cream-300 w-5/6" />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="doppel-outer w-64 absolute -bottom-8 -right-8 rotate-[2deg]">
                <div className="doppel-inner p-6">
                  <div className="inline-flex rounded-2xl bg-terracotta-500/10 p-3 mb-4">
                    <Brain className="h-8 w-8 text-terracotta-500" />
                  </div>
                  <p className="text-sm font-medium text-nut-900">Your Predicted Colleges</p>
                  <p className="mt-2 text-xs text-nut-400">Based on 95.50 percentile</p>
                </div>
              </div>

              {/* Card 3 - hero */}
              <div className="doppel-outer w-72">
                <div className="doppel-inner p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-terracotta-500 flex items-center justify-center mb-4">
                    <GraduationCap className="h-7 w-7 text-cream-50" />
                  </div>
                  <p className="text-sm font-semibold text-nut-900">CET Counsel AI</p>
                  <p className="text-xs text-nut-400 mt-1">Smart Predictions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
        >
          <ChevronDown className="h-5 w-5 text-nut-300" />
        </motion.div>
      </section>

      {/* ── Features: Double-Bezel Bento ── */}
      <section className="bg-cream-50/50 border-t border-cream-200">
        <div className="section-container section-cream">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-20"
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="eyebrow justify-center mx-auto w-fit mb-4">
              <Sparkles className="h-3 w-3 text-terracotta-500 fill-current" />
              Platform Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-nut-900">
              Everything you need for
              <span className="gradient-text-terracotta"> smart counseling</span>
            </h2>
            <p className="mt-4 text-nut-400 max-w-md mx-auto">
              Make confident decisions about your engineering future with data-driven insights
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <motion.div
                    className="doppel-outer group cursor-pointer h-full"
                    initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.15,
                      duration: 0.8,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="doppel-inner p-8 h-full flex flex-col">
                      <div className="inline-flex rounded-2xl bg-terracotta-500/10 p-3.5 w-fit transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-terracotta-500/15">
                        <Icon className="h-6 w-6 text-terracotta-500" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-nut-900 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-sm text-nut-400 flex-1 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-6 flex items-center gap-1 text-sm font-medium text-terracotta-500 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        Get started
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <div className="section-container section-cream">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="eyebrow justify-center mx-auto w-fit mb-4">
            <Zap className="h-3 w-3 text-terracotta-500 fill-current" />
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-nut-900">
            Three simple steps
          </h2>
          <p className="mt-4 text-nut-400">
            Get started in minutes
          </p>
        </motion.div>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                duration: 0.8,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-cream-300" />
              )}

              <div className="doppel-outer w-16 h-16 mx-auto">
                <div className="doppel-inner w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold text-terracotta-500">{step.number}</span>
                </div>
              </div>

              <h3 className="mt-8 text-xl font-semibold text-nut-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-nut-400 max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Ad Unit ── */}
      <div className="section-cream border-t border-cream-200">
        <div className="section-container">
          <AdUnit adSlot="1234567890" format="horizontal" className="max-w-3xl mx-auto" />
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="section-container section-cream">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-terracotta-600 via-terracotta-600 to-terracotta-800 p-14 sm:p-20 text-center"
          initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-cream-50">
              Ready to find your perfect college?
            </h2>
            <p className="mt-4 text-terracotta-100 text-lg max-w-lg mx-auto">
              Start your AI-powered counseling journey now
            </p>
            <Link href="/predict">
              <motion.div
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-medium text-terracotta-700 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cream-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Brain className="h-4 w-4" />
                Start Prediction
                <span className="btn-icon-wrap !bg-terracotta-500/10">                    <ArrowRight className="h-3.5 w-3.5 text-terracotta-600" />
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
