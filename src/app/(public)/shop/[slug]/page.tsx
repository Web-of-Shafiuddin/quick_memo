import type { Metadata } from "next";
import { generateShopMetadata } from "./metadata";
import ShopClient from "./client";

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateShopMetadata({ params: { slug } });
}

export default function ShopPage() {
  return <ShopClient />;
}
