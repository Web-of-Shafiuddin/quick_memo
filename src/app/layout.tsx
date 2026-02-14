import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/AuthInitializer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ezymemo.com"),
  title: {
    default: "EzyMemo | Easy Memo Generator & Professional Invoice Maker for Sellers",
    template: "%s | EzyMemo",
  },
  description:
    "EzyMemo is the #1 easy memo generator and invoice maker for Facebook sellers in Bangladesh. Generate professional cash memos, manage orders, and track customers in one click. Free to start!",
  keywords: [
    "easy memo generator",
    "invoice generator Bangladesh",
    "cash memo maker online",
    "generate memo for facebook shop",
    "free invoice creator",
    "online memo printing software",
    "facebook order management",
    "digital memo for online business",
    "billing software for small business",
    "F-commerce tools",
    "অর্ডার মেমো জেনারেটর",
    "ক্যাশ মেমো তৈরির সফটওয়্যার",
    "ইনভয়েস জেনারেটর",
    "অনলাইন সেলস প্ল্যাটফর্ম",
    "ফেসবুক অর্ডার ম্যানেজমেন্ট",
    "পাবলিক শপ লিংক",
    "কাস্টমার ডেটাবেস",
  ],
  authors: [{ name: "EzyMemo", url: "https://ezymemo.com" }],
  creator: "EzyMemo",
  publisher: "EzyMemo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://ezymemo.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_BD",
    alternateLocale: "bn_BD",
    url: "https://ezymemo.com",
    siteName: "EzyMemo",
    title: "EzyMemo - Professional Memo Generator & Order Management",
    description:
      "Instantly generate professional invoices and memos for your online customers. The easiest way to manage Facebook and Instagram orders in Bangladesh. Start for free today!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EzyMemo - Memo Generator and Order Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzyMemo - Easy Memo Maker for Online Sellers",
    description:
      "Generate digital invoices and manage your social media orders from one dashboard. Grow your F-commerce business with EzyMemo.",
    images: ["/logo.webp"],
    creator: "@ezymemo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Business Software",
};

// JSON-LD structured data for SEO
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "EzyMemo",
  alternateName: ["Easy Memo", "Ezy Memo", "Memo Generator"],
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BDT",
    description: "Free plan available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
  description:
    "The easiest memo generator and sales management platform for online sellers in Bangladesh. Create digital invoices, track orders, and manage customers effortlessly.",
  featureList: [
    "Professional Memo Generation",
    "Digital Invoice Maker",
    "Live Shop Website",
    "Order Management",
    "Customer Database",
    "Product Catalog Management",
    "Sales Analytics",
    "Bengali & English Support",
  ],
  softwareVersion: "2.0",
  author: {
    "@type": "Organization",
    name: "EzyMemo",
    url: "https://ezymemo.com",
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EzyMemo",
  alternateName: ["Easy Memo", "Ezy Memo"],
  url: "https://ezymemo.com",
  logo: "https://ezymemo.com/logo-square.png",
  description:
    "EzyMemo provides the easiest memo maker and order management tools for F-Commerce sellers in Bangladesh. Generate professional invoices and showcase products on your live shop.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
    addressLocality: "Dhaka",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Bengali"],
  },
  sameAs: [
    "https://facebook.com/ezymemo",
    "https://instagram.com/ezymemo",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <meta name="facebook-domain-verification" content="wqrf5prnorqdpnsx2q3vjtfhq46lu9" />
        <meta name="msvalidate.01" content="CCA7EA71B32801698A86F1B47CFAC5DC" />
      </head>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster />
      </body>
    </html>
  );
}
