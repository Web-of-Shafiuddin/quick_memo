import type { Metadata } from "next";
import ReviewsClient from "./client";

interface ReviewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ReviewsPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const response = await fetch(`${baseUrl}/shop/${slug}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const shop = await response.json();
      if (shop.success && shop.data) {
        const shopName = shop.data.shop_name || "Shop";
        return {
          title: `Reviews - ${shopName}`,
          description: `Read customer reviews and ratings for ${shopName} on EzyMemo. See what other customers are saying about their shopping experience.`,
          alternates: {
            canonical: `https://ezymemo.com/shop/${slug}/reviews`,
          },
          openGraph: {
            title: `Reviews - ${shopName} | EzyMemo`,
            description: `Customer reviews and ratings for ${shopName} on EzyMemo.`,
            url: `https://ezymemo.com/shop/${slug}/reviews`,
            type: "website",
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating reviews metadata:", error);
  }

  return {
    title: "Shop Reviews",
    description:
      "Read customer reviews and ratings on EzyMemo. See what other customers are saying.",
  };
}

export default function ReviewsPage() {
  return <ReviewsClient />;
}
