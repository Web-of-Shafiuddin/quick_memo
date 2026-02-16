import type { Metadata } from "next";
import MarketplaceClient from "./client";

export const metadata: Metadata = {
  title: "Marketplace - Shop Products from Verified Sellers",
  description:
    "Discover and shop products from verified sellers on the EzyMemo Marketplace. Browse electronics, fashion, home goods, and more with secure checkout.",
  keywords: [
    "ezymemo marketplace",
    "online shopping",
    "verified sellers marketplace",
    "buy products online",
  ],
  alternates: {
    canonical: "https://ezymemo.com/marketplace",
  },
  openGraph: {
    title: "Marketplace - Shop Products from Verified Sellers | EzyMemo",
    description:
      "Discover products from verified sellers on the EzyMemo Marketplace. Browse electronics, fashion, home goods, and more.",
    url: "https://ezymemo.com/marketplace",
    type: "website",
  },
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
