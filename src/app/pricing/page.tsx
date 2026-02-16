import type { Metadata } from "next";
import PricingClient from "./client";

export const metadata: Metadata = {
  title: "Pricing Plans - Free & Premium",
  description:
    "Compare EzyMemo pricing plans. Start free with up to 50 products and 200 orders/month. Upgrade to premium for unlimited products, customers, and advanced features. No hidden fees.",
  keywords: [
    "ezymemo pricing",
    "free invoice software pricing",
    "order management plans",
    "social commerce tools pricing",
    "free receipt maker plan",
  ],
  alternates: {
    canonical: "https://ezymemo.com/pricing",
  },
  openGraph: {
    title: "Pricing Plans - Free & Premium | EzyMemo",
    description:
      "Compare EzyMemo pricing plans. Start free with essential features. Upgrade for unlimited access. No hidden fees.",
    url: "https://ezymemo.com/pricing",
    type: "website",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
