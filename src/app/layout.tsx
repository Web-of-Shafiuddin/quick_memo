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
    default: "EzyMemo | Free Digital Receipt Maker & Order Management App",
    template: "%s | EzyMemo",
  },
  description:
    "EzyMemo is a free digital receipt maker and omnichannel order management app for social commerce sellers worldwide. Generate professional invoices, manage orders from Facebook, Instagram & WhatsApp, and track customers in one click.",
  keywords: [
    "free digital receipt maker",
    "invoice generator online",
    "receipt maker app",
    "order management for social commerce",
    "omnichannel order management",
    "free invoice creator",
    "social media order management",
    "digital memo maker",
    "billing software for small business",
    "social commerce tools",
    "Facebook shop invoice",
    "Instagram order management",
    "e-commerce receipt generator",
    "online seller tools",
    "small business invoice app",
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
    locale: "en_US",
    alternateLocale: ["en_GB", "en_BD"],
    url: "https://ezymemo.com",
    siteName: "EzyMemo",
    title: "EzyMemo - Free Digital Receipt Maker & Order Management App",
    description:
      "Instantly generate professional digital receipts and invoices for your online customers. The easiest way to manage social commerce orders from Facebook, Instagram & WhatsApp. Free to start!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EzyMemo - Digital Receipt Maker and Order Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzyMemo - Free Digital Receipt Maker & Order Management",
    description:
      "Generate digital receipts and invoices. Manage your social commerce orders from one dashboard. Grow your online business with EzyMemo.",
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
  alternateName: ["Easy Memo", "Ezy Memo", "Digital Receipt Maker"],
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Android, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available. Premium plans start at $4.99/month.",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
  description:
    "Free digital receipt maker and omnichannel order management platform for social commerce sellers. Create professional invoices, track orders from Facebook, Instagram & WhatsApp, and manage customers effortlessly.",
  featureList: [
    "Free Digital Receipt & Invoice Maker",
    "Omnichannel Order Management",
    "Live Shop & Online Storefront",
    "Customer Relationship Management",
    "Product Catalog & Inventory Tracking",
    "Sales Analytics & Reports",
    "Multi-Currency Support",
    "Global Payment Integration (Stripe, PayPal, bKash)",
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
    "EzyMemo provides free digital receipt generation and omnichannel order management tools for social commerce sellers worldwide. Create professional invoices and grow your online business.",
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
    email: "support@ezymemo.com",
  },
  sameAs: [
    "https://facebook.com/ezymemo",
    "https://instagram.com/ezymemo",
    "https://twitter.com/ezymemo",
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
        <link rel="alternate" href="https://ezymemo.com/" hrefLang="x-default" />
        <link rel="alternate" href="https://ezymemo.com/" hrefLang="en" />
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
