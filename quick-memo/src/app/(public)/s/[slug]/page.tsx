"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, ShoppingBag } from "lucide-react";
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
}

export default function ShopLandingPage() {
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
  }, [search]);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                href={`/s/${slug}/p/${product.sku}`}
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
