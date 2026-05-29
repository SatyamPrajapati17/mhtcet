"use client";

import Link from "next/link";
import {
  Brain,
  Search,
  BarChart3,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI College Prediction",
    description:
      "Enter your percentile and get personalized college predictions classified as Safe, Moderate, or Dream colleges.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    href: "/predict",
  },
  {
    icon: Search,
    title: "College Database",
    description:
      "Search through all MHT-CET colleges with detailed cutoff history, branches, and key information.",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    href: "/colleges",
  },
  {
    icon: BarChart3,
    title: "College Comparison",
    description:
      "Compare colleges side by side to make an informed decision about your engineering future.",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    href: "/compare",
  },
];

const stats = [
  { label: "Colleges", value: "300+", icon: GraduationCap },
  { label: "Cutoff Records", value: "800K+", icon: TrendingUp },
  { label: "Years of Data", value: "2022-24", icon: Zap },
  { label: "CAP Rounds", value: "3 Rounds", icon: Shield },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
              AI-Powered MHT-CET Counseling Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Your AI Counselor for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                MHT-CET Admissions
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100/90">
              Predict colleges, analyze cutoffs, compare options, and get personalized
              AI counseling — all in one platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/predict">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
                  <Brain className="mr-2 h-5 w-5" />
                  Predict Your Colleges
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/colleges">
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300">
                  Browse Colleges
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
              >
                <stat.icon className="mx-auto h-6 w-6 text-blue-200" />
                <div className="mt-2 text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Everything you need for{" "}
            <span className="gradient-text">smart counseling</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Make confident decisions about your engineering future
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className={`inline-flex rounded-xl ${feature.bg} p-3`}
                  >
                    <Icon className={`h-6 w-6 text-${feature.color.split(" ")[0].replace("from-", "")}-600`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Enter Your Details",
                description: "Input your MHT-CET percentile, category, and preferences.",
              },
              {
                step: "02",
                title: "Get AI Predictions",
                description: "Receive personalized college lists with Safe, Moderate, and Dream classifications.",
              },
              {
                step: "03",
                title: "Make Smart Decisions",
                description: "Compare colleges side by side and make data-driven decisions.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-center sm:p-12">
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">
              Ready to find your perfect college?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Start your AI-powered counseling journey now
            </p>
            <Link href="/predict">
              <Button
                size="lg"
                className="mt-6 bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
              >
                <Brain className="mr-2 h-5 w-5" />
                Start Prediction
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
