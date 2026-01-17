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
    default: "EzyMemo - Sales Management Platform | Live Shop, Orders & Customer Database for Online Sellers",
    template: "%s | EzyMemo",
  },
  description:
    "Complete sales platform for online sellers in Bangladesh. Get orders from Facebook, Instagram, WhatsApp, and your live shop. Manage everything in one dashboard. Track orders, customers, products. Grow your sales. Free to start!",
  keywords: [
    "online sales management platform",
    "live shop website",
    "Facebook order management",
    "Instagram order tracking",
    "customer database for online sellers",
    "product catalog management",
    "public shop link",
    "e-commerce platform Bangladesh",
    "online business growth",
    "F-commerce tools",
    "social media order tracking",
    "online seller dashboard",
    "Bangladesh e-commerce software",
    "অনলাইন সেলস প্ল্যাটফর্ম",
    "লাইভ শপ ওয়েবসাইট",
    "ফেসবুক অর্ডার ম্যানেজমেন্ট",
    "কাস্টমার ডেটাবেস",
    "পাবলিক শপ লিংক",
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
    canonical: "https://ezymemo.com/sitemap.xml",
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
    title: "EzyMemo - Complete Sales Management Platform for Online Sellers",
    description:
      "Get orders from social media and your live shop. Track everything in one dashboard. Manage products, customers, and grow your sales. Perfect for online sellers in Bangladesh. Free to start!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EzyMemo - Sales Management Platform for Online Sellers",
      },
      {
        url: "/logo.webp",
        width: 512,
        height: 512,
        alt: "EzyMemo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzyMemo - Sales Management Platform for Online Sellers",
    description:
      "Get orders from Facebook, Instagram, WhatsApp, and your live shop. Manage everything in one place. Track orders, customers, products. Grow your online business.",
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
    "Complete sales management platform for online sellers in Bangladesh. Get orders from social media and live shop. Track orders, manage customers, showcase products, and grow sales.",
  featureList: [
    "Live Shop Website",
    "Order Management",
    "Customer Database",
    "Product Catalog",
    "Social Media Integration",
    "Professional Memos",
    "Sales Tracking",
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
  logo: "https://ezymemo.com/logo.webp",
  description:
    "Complete sales management platform for online sellers in Bangladesh. Live shop website, order management, customer database, and sales tracking to grow your online business.",
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
