import type { Metadata } from "next";
import { generateProductMetadata } from "./metadata";
import ProductClient from "./client";

interface ProductPageProps {
  params: Promise<{ slug: string; sku: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { sku } = await params;
  return generateProductMetadata({ params: { sku } });
}

export default function ProductPage() {
  return <ProductClient />;
}
