import { Metadata } from "next";

interface ShopMetadataParams {
  params: {
    slug: string;
  };
}

export async function generateShopMetadata({
  params,
}: ShopMetadataParams): Promise<Metadata> {
  const slug = params.slug;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const response = await fetch(`${baseUrl}/shop/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shop data");
    }

    const shop = await response.json();

    if (!shop.success || !shop.data) {
      throw new Error("Shop not found");
    }

    const shopData = shop.data;
    const shopName = shopData.shop_name || "Shop";
    const shopLogo = shopData.shop_logo_url;

    const logoUrl = shopLogo || "https://ezymemo.com/logo.webp";
    const siteUrl = `https://ezymemo.com/shop/${slug}`;

    const shopDescription = shopData.shop_description
      ? `${shopData.shop_description} - Shop at EzyMemo. Browse products, view reviews, and place orders directly.`
      : `Shop at EzyMemo. Browse products, view reviews, and place orders directly.`;

    const organizationJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: shopName,
      url: siteUrl,
      logo: logoUrl,
      description: shopData.shop_description || `Shop at EzyMemo - Complete sales management platform`,
      foundingDate: "2024",
      address: shopData.shop_address ? {
        "@type": "PostalAddress",
        addressCountry: "BD",
        streetAddress: shopData.shop_address,
      } : undefined,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["English", "Bengali"],
      },
    };

    return {
      metadataBase: new URL("https://ezymemo.com"),
      title: {
        default: `${shopName} - Shop at EzyMemo`,
        template: "%s | EzyMemo",
      },
      description: shopDescription,
      icons: {
        icon: shopLogo || "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
      },
      manifest: "/site.webmanifest",
      openGraph: {
        type: "website",
        locale: "en_BD",
        url: siteUrl,
        siteName: "EzyMemo",
        title: `${shopName} - Shop at EzyMemo`,
        description: shopDescription,
        images: shopLogo
          ? [
              {
                url: shopLogo,
                width: 400,
                height: 400,
                alt: `${shopName} Logo`,
              },
              {
                url: "https://ezymemo.com/logo.webp",
                width: 512,
                height: 512,
                alt: "Powered by EzyMemo",
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
        title: `${shopName} - Shop at EzyMemo`,
        description: shopDescription,
        images: shopLogo ? [shopLogo] : ["https://ezymemo.com/logo.webp"],
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
      alternates: {
        canonical: siteUrl,
      },
    };
  } catch (error) {
    console.error("Error generating shop metadata:", error);

    return {
      metadataBase: new URL("https://ezymemo.com"),
      title: "Shop | EzyMemo",
      description: "Shop at EzyMemo - Browse products, view reviews, and place orders.",
      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
      },
      manifest: "/site.webmanifest",
      openGraph: {
        type: "website",
        url: `https://ezymemo.com/shop/${slug}`,
        siteName: "EzyMemo",
        title: "Shop | EzyMemo",
        images: [
          {
            url: "https://ezymemo.com/logo.webp",
            width: 512,
            height: 512,
            alt: "EzyMemo",
          },
        ],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}
