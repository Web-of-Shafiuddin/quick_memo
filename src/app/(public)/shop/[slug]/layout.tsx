"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Store, ShieldCheck, Flag, Star, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ReportShopModal } from "@/components/ReportShopModal";
import { MobileMenu } from "@/components/mobile/MobileMenu";
import Script from "next/script";
import AdBanner from "@/components/ads/AdBanner";

interface ShopProfile {
  user_id: number;
  shop_name: string;
  shop_logo_url: string | null;
  shop_address: string | null;
  shop_description: string | null;
  is_verified: boolean;
  has_badge: boolean;
  average_rating: number;
  review_count: number;
  is_active: boolean;
}

export default function PublicShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch shop details to display in header
    // We can also use a custom hook or context for this
    const fetchShop = async () => {
      try {
        const res = await api.get(`/shop/${slug}`); // Note: index.ts mounted publicShopRoutes at /api/shop
        setShop(res.data.data);
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    if (slug) fetchShop();

    // Listen for cart updates (custom event for simplicity across pages)
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("shop_cart") || "[]");
      const count = cart.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      );
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);

    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Shop-specific JSON-LD */}
      {shop && (
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: shop.shop_name,
              url: `https://ezymemo.com/shop/${slug}`,
              logo: shop.shop_logo_url || "https://ezymemo.com/logo.webp",
              description: shop.shop_description || `Shop at EzyMemo - Complete sales management platform`,
              foundingDate: "2024",
              address: shop.shop_address ? {
                "@type": "PostalAddress",
                addressCountry: "BD",
                streetAddress: shop.shop_address,
              } : undefined,
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Bengali"],
              },
            }),
          }}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Shop Menu"
        items={[
          { href: "/", label: "Back to Home", icon: Home },
          { href: `/shop/${slug}/reviews`, label: "Store Reviews", icon: Star },
        ]}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link
            href={`/shop/${slug}`}
            className="flex items-center gap-2 font-bold text-lg sm:text-xl min-w-0"
          >
            {shop?.shop_logo_url ? (
              <img
                src={shop.shop_logo_url}
                alt={shop.shop_name}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
            )}
            <span className="truncate">{shop?.shop_name || "Loading..."}</span>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            {shop?.has_badge && (
              <ShieldCheck
                className="w-5 h-5 text-green-500 hidden sm:block"
                aria-label="Verified by Ezymemo"
              />
            )}
            {shop && shop.average_rating > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-sm bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {Number(shop.average_rating).toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({shop.review_count})
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href={`/shop/${slug}/cart`}>
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs p-0"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Top Ad Banner */}
      <AdBanner slot="shop_top_banner" variant="banner" />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 bg-white mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {shop?.shop_name || "Shop"}. Powered by
            EzyMemo.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-report-modal"))
              }
              className="hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Flag className="w-4 h-4" />
              Report this Shop
            </button>
          </div>
        </div>
      </footer>
      <ReportShopModal slug={slug} />
    </div>
  );
}
