"use client";

import { useEffect, useRef } from "react";
import { useAdPlacement, useShowAds } from "@/hooks/useAds";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slotName: string;
  className?: string;
}

export default function AdUnit({ slotName, className = "" }: AdUnitProps) {
  const { placement, loading: placementLoading } = useAdPlacement(slotName);
  const { showAds, loading: adsLoading } = useShowAds();
  const adRef = useRef<HTMLDivElement>(null);
  const adPushed = useRef(false);

  useEffect(() => {
    if (
      placement?.ad_type === "ADSENSE" &&
      placement.ad_client &&
      placement.ad_slot &&
      showAds &&
      !adPushed.current
    ) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [placement, showAds]);

  if (placementLoading || adsLoading) return null;
  if (!showAds || !placement) return null;

  // AdSense
  if (placement.ad_type === "ADSENSE") {
    if (!placement.ad_client || !placement.ad_slot) return null;
    return (
      <div className={`ad-unit ${className}`} ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={placement.ad_client}
          data-ad-slot={placement.ad_slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Custom Banner
  if (placement.ad_type === "CUSTOM_BANNER" && placement.custom_image_url) {
    const content = (
      <img
        src={placement.custom_image_url}
        alt="Advertisement"
        className="w-full h-auto rounded"
      />
    );

    return (
      <div className={`ad-unit ${className}`}>
        {placement.custom_link_url ? (
          <a
            href={placement.custom_link_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    );
  }

  // Custom HTML
  if (placement.ad_type === "CUSTOM_HTML" && placement.custom_html) {
    return (
      <div
        className={`ad-unit ${className}`}
        dangerouslySetInnerHTML={{ __html: placement.custom_html }}
      />
    );
  }

  return null;
}
