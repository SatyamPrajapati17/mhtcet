import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentile(p: number): string {
  return p.toFixed(2);
}

export function formatRank(r: number): string {
  return r.toLocaleString("en-IN");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getYearLabel(year: number): string {
  return `${year}-${(year + 1) % 100}`;
}

export type PredictionLevel = "dream" | "moderate" | "safe" | "no-chance";

export function getPredictionColor(level: PredictionLevel): string {
  switch (level) {
    case "dream":
      return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    case "moderate":
      return "text-blue-500 border-blue-500/30 bg-blue-500/10";
    case "safe":
      return "text-green-500 border-green-500/30 bg-green-500/10";
    case "no-chance":
      return "text-red-500 border-red-500/30 bg-red-500/10";
  }
}

export function getPredictionLabel(level: PredictionLevel): string {
  switch (level) {
    case "dream":
      return "Dream College";
    case "moderate":
      return "Moderate College";
    case "safe":
      return "Safe College";
    case "no-chance":
      return "Unlikely";
  }
}
