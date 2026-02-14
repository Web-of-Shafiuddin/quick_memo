import type { Metadata } from "next";
import PublicInvoiceCreator from "@/components/public-invoice-creator";
import Link from "next/link";
import { getTemplateBySlug, getAllTemplateSlugs } from "@/lib/templates";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return { title: "Template Not Found" };
  }

  return {
    title: `Create ${template.title} Online Free | EzyMemo`,
    description: `Use our free ${template.title.toLowerCase()} to create professional invoices and receipts for ${template.profession.toLowerCase()}. No sign-up required. Download PDF instantly.`,
    alternates: {
      canonical: `https://ezymemo.com/templates/${slug}/create`,
    },
    openGraph: {
      title: `Create ${template.title} - Free Invoice Maker`,
      description: `Generate professional ${template.profession.toLowerCase()} invoices with our free template. No sign-up required.`,
      url: `https://ezymemo.com/templates/${slug}/create`,
      type: "website",
    },
  };
}

export default async function TemplateCreatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

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
                All Templates
              </Link>
              <Link
                href={`/templates/${slug}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {template.title}
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
      <div className="text-center py-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {template.heroHeading}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {template.heroSubheading}
        </p>
      </div>

      {/* Creator */}
      <PublicInvoiceCreator defaultTemplateSlug={slug} />

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
