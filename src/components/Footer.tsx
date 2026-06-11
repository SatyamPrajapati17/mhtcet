import { GraduationCap } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { href: "/predict", label: "Predict" },
  { href: "/colleges", label: "Colleges" },
  { href: "/compare", label: "Compare" },
  { href: "/feedback", label: "Feedback" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta-500">
              <GraduationCap className="h-3.5 w-3.5 text-cream-50" />
            </div>
            <span className="text-sm font-medium text-nut-400">
              CETCounsel AI &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-nut-400 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-terracotta-500"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-cream-200 py-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-nut-400 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-terracotta-500"
            >
              {link.label}
            </Link>
          ))}
          <span className="text-xs text-nut-300">
            Built for MHT-CET students
          </span>
        </div>
      </div>
    </footer>
  );
}
