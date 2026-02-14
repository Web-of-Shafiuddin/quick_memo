import type { Metadata } from "next";
import Link from "next/link";
import { templates } from "@/lib/templates";
import { FileText, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Invoice & Receipt Templates for Every Business",
  description:
    "Browse free invoice templates, receipt makers, and order forms designed for photographers, freelancers, bakers, tutors, and more. Start creating professional invoices in seconds.",
  keywords: [
    "free invoice template",
    "receipt maker",
    "invoice generator",
    "order form template",
    "professional receipt template",
  ],
  alternates: {
    canonical: "https://ezymemo.com/templates",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header Nav */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              EzyMemo
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/free-invoice-maker"
                className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Free Invoice Maker
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Banner */}
        <div className="mb-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 md:p-8 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-6 h-6" />
            <h2 className="text-xl md:text-2xl font-bold">Want to create an invoice right now?</h2>
          </div>
          <p className="text-orange-100 mb-4">
            Try our <strong>Free Invoice Maker</strong> — no sign-up required. Pick a template, fill in your details, and download your PDF instantly.
          </p>
          <Link
            href="/free-invoice-maker"
            className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
          >
            Create Invoice Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Free Invoice & Receipt Templates
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional invoice and receipt templates designed for your
            industry. Choose your profession, customize your brand, and start
            invoicing in seconds.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div key={template.slug} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {template.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 flex-1">
                {template.metaDescription}
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/templates/${template.slug}/create`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href={`/templates/${template.slug}`}
                  className="inline-flex items-center justify-center text-blue-600 font-medium text-sm hover:text-blue-700"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
