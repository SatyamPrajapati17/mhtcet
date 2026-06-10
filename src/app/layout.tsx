import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "CETCounsel AI — Smart MHT-CET College Predictor",
  description:
    "AI-powered college prediction and counseling for MHT-CET students. Predict colleges by percentile, compare cutoffs across years, and make data-driven admission decisions.",
  keywords: [
    "MHT-CET",
    "college predictor",
    "engineering admission",
    "Maharashtra CET",
    "college counseling",
    "cutoff analysis",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-[100dvh] flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
