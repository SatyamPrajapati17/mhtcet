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
  other: {
    "google-adsense-account": "ca-pub-8538444055043811",
  },
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-54LPTCXD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-54LPTCXD');
          `}
        </Script>
        {/* End Google Tag Manager */}

        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8538444055043811"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />

        {/* Popunder ad */}
        <Script
          src="https://pl29843597.effectivecpmnetwork.com/23/8c/36/238c3631e0e8b9ad509e6ffe8805b742.js"
          strategy="beforeInteractive"
        />

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
        <Providers>
          <div className="min-h-[100dvh] flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>

        {/* Social bar */}
        <script src="https://pl29843784.effectivecpmnetwork.com/53/a0/b1/53a0b1263417bec51582fc951fd6e493.js"></script>
      </body>
    </html>
  );
}
