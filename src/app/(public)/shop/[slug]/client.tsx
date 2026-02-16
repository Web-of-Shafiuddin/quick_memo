"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Search,
  ShoppingBag,
  Facebook,
  Instagram,
  Send,
  Star,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import { useCurrency } from "@/hooks/useCurrency";

// Reuse Product interface from service logic or define simple one here
interface Product {
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  sku: string;
  variant_count: number;
  category_name?: string;
  stock: number;
  discount: number;
  average_rating?: number;
  review_count?: number;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ShopInfo {
  shop_name: string;
  shop_description: string | null;
  social_links: SocialLink[];
  average_rating: number;
  review_count: number;
  is_active: boolean;
}

export default function ShopClient() {
  const params = useParams();
  const slug = params.slug as string;
  const { format: formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Search is now backend supported if we want, but let's stick to simple or use backend search
  // Using backend search is better with pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  const fetchShopInfo = useCallback(async () => {
    try {
      const res = await api.get(`/shop/${slug}`);
      setShopInfo(res.data.data);
    } catch (error) {
      console.error("Error fetching shop info:", error);
    }
  }, [slug]);

  useEffect(() => {
    fetchShopInfo();
  }, [fetchShopInfo]);

  const fetchProducts = useCallback(
    async (currentPage: number, searchTerm: string) => {
      try {
        setLoading(true);
        const res = await api.get(`/shop/${slug}/products`, {
          params: {
            page: currentPage,
            search: searchTerm,
            limit: 12,
          },
        });
        setProducts(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    fetchProducts(page, search);
  }, [fetchProducts, page, search]);

  // Debounce logic could be added here, simplified for now
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, search); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shopInfo && !shopInfo.is_active) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Shop Suspended</h1>
        <p className="text-muted-foreground">
          This shop is currently unavailable for safety reasons or
          investigation. Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "telegram":
        return <Send className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Shop Info Header */}
      {shopInfo && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {shopInfo.shop_name}
                  </h1>
                  {shopInfo.shop_description && (
                    <p className="text-gray-600 max-w-2xl leading-relaxed">
                      {shopInfo.shop_description}
                    </p>
                  )}
                </div>

                {shopInfo.social_links && shopInfo.social_links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {shopInfo.social_links.map(
                      (link: SocialLink, i: number) => (
                        <a
                          key={i}
                          href={
                            link.url.startsWith("http")
                              ? link.url
                              : `https://${link.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                        >
                          {getSocialIcon(link.platform)}
                          <span className="capitalize">{link.platform}</span>
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50/50 flex flex-col items-center text-center">
                  <span className="text-sm font-medium text-yellow-800 mb-1">
                    Store Rating
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {Number(shopInfo.average_rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    Based on {shopInfo.review_count} reviews
                  </span>
                  <Link href={`/shop/${slug}/reviews`} className="w-full">
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Write Shop Review
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Search using backend now */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.product_id}
                href={`/shop/${slug}/p/${product.sku}`}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-0 shadow-sm bg-white group">
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    {product.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-50">
                        <ShoppingBag className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold px-3 py-1 border border-white rounded">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      {product.category_name || "General"}
                    </div>
                    <h3 className="font-semibold truncate text-lg text-gray-900 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.variant_count > 0 && (
                      <div className="text-xs text-blue-600 mt-1 font-medium">
                        {product.variant_count} options available
                      </div>
                    )}
                    {product.review_count !== undefined &&
                      product.review_count > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(product.average_rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground pt-0.5">
                            ({product.review_count})
                          </span>
                        </div>
                      )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg text-gray-900">
                        {product.discount > 0
                          ? formatPrice(
                              product.price * (1 - product.discount / 100)
                            )
                          : formatPrice(product.price)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
