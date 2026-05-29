import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CETCounsel AI - MHT-CET College Predictor & Counseling Platform",
  description:
    "AI-powered college prediction and counseling platform for MHT-CET students. Predict colleges, analyze cutoffs, compare options, and get AI counseling.",
  keywords: [
    "MHT-CET",
    "college predictor",
    "engineering admission",
    "Maharashtra CET",
    "college counseling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
