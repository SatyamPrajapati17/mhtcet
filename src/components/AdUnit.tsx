"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  /** AdSense data-ad-slot from your AdSense dashboard */
  adSlot?: string;
  /** Display format */
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const FALLBACK_SLOT = "1234567890";

export default function AdUnit({
  adSlot = FALLBACK_SLOT,
  format = "auto",
  className = "",
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pushed.current) return;

    const timer = setTimeout(() => {
      try {
        // @ts-expect-error - Adsbygoogle is injected by the AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // Silently fail — AdSense script may not have loaded yet
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8538444055043811"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
