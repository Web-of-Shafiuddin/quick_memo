import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/AuthInitializer";

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
    default: "EzyMemo - #1 E-commerce Management Platform for Bangladesh | Invoice, Inventory & Order Management",
    template: "%s | EzyMemo",
  },
  description:
    "EzyMemo is Bangladesh's leading e-commerce management platform for F-commerce sellers, online shops & small businesses. Generate professional invoices, manage inventory, track orders, handle customers & grow your business. Supports bKash, Nagad, Pathao, RedX. Free to start!",
  keywords: [
    "e-commerce management Bangladesh",
    "F-commerce platform",
    "invoice generator Bangladesh",
    "cash memo generator",
    "inventory management software",
    "order management system",
    "Facebook seller tools",
    "online business Bangladesh",
    "small business software",
    "POS system Bangladesh",
    "bKash merchant",
    "Pathao merchant",
    "RedX integration",
    "product management",
    "customer management",
    "sales tracking",
    "বাংলাদেশ ই-কমার্স",
    "অনলাইন বিজনেস সফটওয়্যার",
    "ক্যাশ মেমো",
    "ইনভয়েস জেনারেটর",
  ],
  authors: [{ name: "EzyMemo", url: "https://ezymemo.com" }],
  creator: "EzyMemo",
  publisher: "EzyMemo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_BD",
    alternateLocale: "bn_BD",
    url: "https://ezymemo.com",
    siteName: "EzyMemo",
    title: "EzyMemo - E-commerce Management Platform for Bangladesh",
    description:
      "Bangladesh's #1 platform for F-commerce sellers & online businesses. Professional invoices, inventory management, order tracking & more. Free to start!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EzyMemo - E-commerce Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzyMemo - E-commerce Platform for Bangladesh",
    description:
      "Manage your online business with ease. Invoices, inventory, orders & customers - all in one place. Perfect for F-commerce sellers!",
    images: ["/twitter-image.png"],
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
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "EzyMemo",
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
    "Complete e-commerce management platform for Bangladeshi businesses. Invoice generation, inventory management, order tracking, and customer management.",
  featureList: [
    "Professional Invoice Generation",
    "Inventory Management",
    "Order Tracking",
    "Customer Management",
    "Product Variants Support",
    "Multiple Payment Methods",
    "Mobile Responsive",
    "Bengali Language Support",
  ],
  softwareVersion: "2.0",
  author: {
    "@type": "Organization",
    name: "EzyMemo",
    url: "https://ezymemo.com",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EzyMemo",
  url: "https://ezymemo.com",
  logo: "https://ezymemo.com/logo.png",
  description:
    "Bangladesh's leading e-commerce management platform for online sellers and small businesses.",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster />
      </body>
    </html>
  );
}
