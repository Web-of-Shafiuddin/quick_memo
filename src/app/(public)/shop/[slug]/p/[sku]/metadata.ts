import { Metadata } from "next";

interface ProductMetadataParams {
  params: {
    sku: string;
  };
}

interface Product {
  product_id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  category_name: string;
  status: 'in_stock' | 'out_of_stock' | 'unavailable';
  average_rating?: number | null;
  review_count?: number | null;
  images: Array<{
    image_url: string;
    display_order: number;
  }>;
  created_at: string;
  updated_at: string;
}

export async function generateProductMetadata({
  params,
}: ProductMetadataParams): Promise<Metadata> {
  const { sku } = params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    const response = await fetch(`${baseUrl}/product/by-sku/${sku}`, {
      cache: "no-store",
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product data");
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Product not found");
    }

    const product = result.data as Product;

    const primaryImage = product.images?.find(img => img.display_order === 1)?.image_url;

    const description = product.description
      ? product.description.substring(0, 160)
      : `Shop ${product.name} at EzyMemo. Browse and purchase from our catalog.`;

    const availability = product.status === 'in_stock';

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: description,
      image: primaryImage || "https://ezymemo.com/logo.webp",
      sku: product.sku,
      offers: {
        "@type": "Offer",
        price: product.price.toString(),
        priceCurrency: product.currency,
        availability: availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "EzyMemo",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.average_rating || 0,
        reviewCount: product.review_count || 0,
        bestRating: "5",
        worstRating: "1",
      },
    };

    const siteUrl = `https://ezymemo.com/s`;

    return {
      metadataBase: new URL("https://ezymemo.com"),
      title: {
        default: product.name,
        template: "%s | Shop at EzyMemo",
      },
      description: description,
      keywords: [
        product.name,
        product.sku,
        product.category_name || "product",
        "shop",
        "buy online",
        "price",
        product.currency,
      ],
      alternates: {
        canonical: `${siteUrl}${sku}`,
      },
      openGraph: {
        type: "website",
        locale: "en_BD",
        url: `${siteUrl}${sku}`,
        siteName: "EzyMemo",
        title: product.name,
        description: description,
        images: primaryImage
          ? [
                {
                  url: primaryImage,
                  width: 800,
                  height: 800,
                  alt: product.name,
                },
              ]
          : [
                {
                  url: "https://ezymemo.com/logo.webp",
                  width: 512,
                  height: 512,
                  alt: "EzyMemo",
                },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: description,
        images: primaryImage ? [primaryImage] : ["https://ezymemo.com/logo.webp"],
        creator: "@ezymemo",
      },
      robots: {
        index: true,
        follow: true,
      },
      other: {
        "product:rating": product.average_rating?.toString() || "0",
        "product:reviewCount": product.review_count?.toString() || "0",
        "product:availability": availability ? "InStock" : "OutOfStock",
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);

    return {
      metadataBase: new URL("https://ezymemo.com"),
      title: "Product | Shop at EzyMemo",
      description: "Shop at EzyMemo - Browse our catalog",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}
