"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, ShoppingBag } from "lucide-react";
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
}

export default function ShopLandingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { format: formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Using existing dashboard product fetch or public specific?
        // We created /api/shop/:slug/products
        const res = await api.get(`/shop/${slug}/products`);
        setProducts(res.data.data);
        setFilteredProducts(res.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProducts();
  }, [slug]);

  useEffect(() => {
    // Client-side simple search filtering for now
    const lower = search.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower) ||
        p.category_name?.toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
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
        {/* <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button> */}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.product_id} href={`/s/${slug}/p/${product.sku}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-0 shadow-sm bg-white group">
                <div className="aspect-square relative bg-gray-100 overflow-hidden">
                  {product.image ? (
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
                  <div className="font-bold text-lg text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
