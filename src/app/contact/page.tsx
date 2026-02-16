import type { Metadata } from "next";
import ContactClient from "./client";

export const metadata: Metadata = {
  title: "Contact Us - Get Support",
  description:
    "Get in touch with the EzyMemo team. Reach us by email at hello@ezymemo.com, phone, or through our contact form. We respond within 24 hours.",
  keywords: [
    "contact ezymemo",
    "ezymemo support email",
    "ezymemo customer service",
  ],
  alternates: {
    canonical: "https://ezymemo.com/contact",
  },
  openGraph: {
    title: "Contact Us - Get Support | EzyMemo",
    description:
      "Get in touch with the EzyMemo team. Email, phone, or contact form. We respond within 24 hours.",
    url: "https://ezymemo.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
