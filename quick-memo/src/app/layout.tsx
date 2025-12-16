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
  title: "QuickMemo BD - Free Cash Memo Generator for F-Commerce",
  description: "Create professional cash memos and invoices for your Facebook business in Bangladesh. Download free image receipts. Supports Bkash, Pathao, RedX formats.",
  keywords: ["cash memo", "invoice generator", "Bangladesh", "F-commerce", "Facebook business", "online memo", "digital receipt", "Bkash", "Pathao"],
  authors: [{ name: "QuickMemo BD Team" }],
  icons: {
    icon: "https://z-ai-web-dev-sdk.zetion.cloud/logo.png",
  },
  openGraph: {
    title: "QuickMemo BD - Professional Cash Memo Generator",
    description: "Create professional cash memos for your Bangladeshi F-commerce business in seconds. Free to use!",
    url: "https://quickmemo-bd.vercel.app",
    siteName: "QuickMemo BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickMemo BD - Cash Memo Generator",
    description: "Professional cash memos for Bangladeshi Facebook sellers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthInitializer>
          {children}
        </AuthInitializer>
        <Toaster />
      </body>
    </html>
  );
}
