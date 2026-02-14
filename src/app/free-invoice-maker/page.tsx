import type { Metadata } from "next";
import PublicInvoiceCreator from "@/components/public-invoice-creator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Invoice Maker | Create Professional Invoices Without Signing Up",
  description:
    "Create and download professional invoices and receipts for free. No sign-up required. Choose from multiple templates designed for photographers, freelancers, bakers, and more.",
  keywords: [
    "free invoice maker",
    "invoice generator online",
    "free receipt maker",
    "create invoice without sign up",
    "professional invoice template",
    "download invoice PDF free",
  ],
  alternates: {
    canonical: "https://ezymemo.com/free-invoice-maker",
  },
  openGraph: {
    title: "Free Invoice Maker - Create Professional Invoices Instantly",
    description:
      "Generate professional invoices and receipts for free. No sign-up required. Choose from templates for photographers, freelancers, bakers, and more.",
    url: "https://ezymemo.com/free-invoice-maker",
    type: "website",
  },
};

export default function FreeInvoiceMakerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              EzyMemo
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/templates"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Templates
              </Link>
              <Link
                href="/auth/login"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Free Invoice & Receipt Maker
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create professional invoices and receipts in seconds. No sign-up
          required. Choose a template, fill in your details, and download your
          PDF.
        </p>
      </div>

      {/* Creator */}
      <PublicInvoiceCreator />

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <Link href="/" className="text-blue-600 font-medium">
                EzyMemo
              </Link>{" "}
              - Free Digital Receipt Maker & Order Management App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
