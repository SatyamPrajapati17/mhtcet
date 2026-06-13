"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Brain, Search, GitCompareArrows, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/predict", label: "Predict", desc: "AI College Predictions", icon: Brain },
  { href: "/colleges", label: "Colleges", desc: "Browse All Colleges", icon: Search },
  { href: "/compare", label: "Compare", desc: "Side-by-Side Analysis", icon: GitCompareArrows },
  { href: "/feedback", label: "Feedback", desc: "Share Your Thoughts", icon: MessageSquareText },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Fluid Island Nav ── */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-32px)] px-0">
        <nav className="fluid-island rounded-full px-2 sm:px-3 h-12 flex items-center gap-0.5 sm:gap-1">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pr-3 pl-1 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta-500 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
              <GraduationCap className="h-3.5 w-3.5 text-cream-50" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold tracking-tight text-nut-900">
              CET<span className="text-terracotta-500">Counsel</span>
              <span className="ml-0.5 text-[10px] font-normal text-nut-400">AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "hidden md:flex items-center gap-1.5 rounded-full px-3.5 h-8 text-xs font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  isActive
                    ? "bg-terracotta-500/10 text-terracotta-600"
                    : "text-nut-400 hover:text-nut-700 hover:bg-cream-100"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}

          {/* Hamburger → X morph */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative h-8 w-8 rounded-full flex items-center justify-center text-nut-500 hover:bg-cream-100 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            aria-label="Toggle menu"
          >
            <div className="relative w-4 h-3.5">
              <span
                className={cn(
                  "absolute left-0 top-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileOpen && "top-1/2 -translate-y-1/2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] w-full rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileOpen && "opacity-0 scale-x-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 bottom-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileOpen && "top-1/2 -translate-y-1/2 -rotate-45"
                )}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* ── Full-screen Menu Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-cream-50/95 backdrop-blur-3xl animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex flex-col items-center justify-center h-full gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link, i) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="group text-center"
                  style={{
                    animation: `fade-up 0.6s cubic-bezier(0.32, 0.72, 0, 1) ${i * 0.1 + 0.1}s forwards`,
                    opacity: 0,
                    transform: "translateY(48px)",
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-3 px-8 py-4 rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                      isActive ? "bg-terracotta-500/10" : "hover:bg-cream-100"
                    )}
                  >
                    <Icon
                      className={cn("h-6 w-6 text-terracotta-500", isActive && "fill-current")}
                    />
                    <div className="text-left">
                      <p className="text-lg font-semibold text-nut-900">{link.label}</p>
                      <p className="text-xs text-nut-400">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
