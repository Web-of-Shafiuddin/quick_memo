import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  templates,
  getTemplateBySlug,
  getAllTemplateSlugs,
} from "@/lib/templates";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};

  return {
    title: template.metaTitle,
    description: template.metaDescription,
    keywords: template.keywords,
    alternates: {
      canonical: `https://ezymemo.com/templates/${template.slug}`,
    },
    openGraph: {
      title: template.metaTitle,
      description: template.metaDescription,
      url: `https://ezymemo.com/templates/${template.slug}`,
      type: "website",
    },
  };
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `EzyMemo - ${template.title}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: template.metaDescription,
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wide">
            Free Template for {template.profession}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {template.heroHeading}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {template.heroSubheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/templates/${template.slug}/create`}>
              <button className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-lg transition-colors cursor-pointer">
                Create Invoice Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition-colors cursor-pointer">
                {template.ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What You Get with This Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up Free",
                desc: "Create your EzyMemo account in under 2 minutes. No credit card required.",
              },
              {
                step: "2",
                title: "Customize Your Template",
                desc: "Add your business name, logo, and branding. Set your products and pricing.",
              },
              {
                step: "3",
                title: "Send Professional Invoices",
                desc: "Generate and send branded invoices and receipts to your clients instantly.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Creating Professional Invoices Today
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of {template.profession.toLowerCase()} who trust
            EzyMemo for their invoicing needs.
          </p>
          <Link href="/auth/login">
            <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg text-lg hover:bg-gray-100 transition-colors cursor-pointer">
              {template.ctaText}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </Link>
        </div>
      </section>

      {/* Browse Other Templates */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse Other Templates
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {templates
              .filter((t) => t.slug !== template.slug)
              .slice(0, 6)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={`/templates/${t.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  {t.title}
                </Link>
              ))}
          </div>
          <div className="mt-6">
            <Link
              href="/templates"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
