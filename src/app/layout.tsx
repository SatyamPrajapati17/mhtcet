import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XRGBLK7FR5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XRGBLK7FR5');
          `}
        </Script>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8538444055043811"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
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
