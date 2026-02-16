import type { Metadata } from "next";
import HelpCenterClient from "./client";

export const metadata: Metadata = {
  title: "Help Center - Guides & Support",
  description:
    "Find answers to common questions about EzyMemo. Browse help articles on getting started, managing orders, creating receipts, billing, and troubleshooting.",
  keywords: [
    "ezymemo help",
    "ezymemo support",
    "order management help",
    "receipt maker guide",
    "ezymemo FAQ",
  ],
  alternates: {
    canonical: "https://ezymemo.com/help",
  },
  openGraph: {
    title: "Help Center - Guides & Support | EzyMemo",
    description:
      "Find answers to common questions about EzyMemo. Browse guides on orders, receipts, billing, and more.",
    url: "https://ezymemo.com/help",
    type: "website",
  },
};

export default function HelpPage() {
  return <HelpCenterClient />;
}
