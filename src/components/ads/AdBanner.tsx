"use client";

import AdUnit from "./AdUnit";

interface AdBannerProps {
  slot: string;
  variant?: "banner" | "sidebar" | "inline";
  className?: string;
}

export default function AdBanner({ slot, variant = "banner", className = "" }: AdBannerProps) {
  const variantStyles: Record<string, string> = {
    banner: "w-full max-w-4xl mx-auto my-4",
    sidebar: "w-full max-w-xs my-4",
    inline: "w-full my-3",
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <AdUnit slotName={slot} />
    </div>
  );
}
