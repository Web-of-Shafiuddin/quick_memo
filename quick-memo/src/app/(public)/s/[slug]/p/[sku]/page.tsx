"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Attribute {
  attribute_name: string;
  attribute_value: string;
}

interface Product {
  product_id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category_name: string;
  attributes?: Attribute[];
}

interface ProductDetail extends Product {
  variants?: Product[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const sku = params.sku as string;
  const router = useRouter();
  const { format: formatPrice } = useCurrency();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shop/${slug}/products/${sku}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
        router.push(`/s/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    if (slug && sku) fetchProduct();
  }, [slug, sku, router]);

  const addToCart = () => {
    if (!product) return;

    let itemToAdd: Product;

    // Check if variants exist and one must be selected
    if (product.variants && product.variants.length > 0) {
      if (!selectedVariantId) {
        toast.error("Please select an option");
        return;
      }
      itemToAdd =
        product.variants.find(
          (v) => v.product_id.toString() === selectedVariantId
        ) || product;
    } else {
      itemToAdd = product;
    }

    // Get current cart from local storage
    const currentCart = JSON.parse(localStorage.getItem("shop_cart") || "[]");

    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.product_id === itemToAdd.product_id
    );

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        product_id: itemToAdd.product_id,
        name: itemToAdd.name,
        price: itemToAdd.price,
        image: itemToAdd.image || product.image, // Fallback to parent image
        quantity: 1,
        sku: itemToAdd.sku,
        variant_info: itemToAdd.attributes
          ?.map((a) => a.attribute_value)
          .join(" / "),
      });
    }

    localStorage.setItem("shop_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Added to cart");
  };

  const buyNow = () => {
    addToCart();
    router.push(`/s/${slug}/cart`);
  };

  if (loading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!product) return null;

  const currentPrice = selectedVariantId
    ? product.variants?.find(
        (v) => v.product_id.toString() === selectedVariantId
      )?.price
    : product.price;

  const currentStock = selectedVariantId
    ? product.variants?.find(
        (v) => v.product_id.toString() === selectedVariantId
      )?.stock
    : product.stock;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 pl-0 hover:pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category_name}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              SKU: {product.sku}
            </p>
          </div>

          <div className="text-3xl font-bold text-primary">
            {formatPrice(currentPrice || 0)}
          </div>

          <div className="prose prose-sm text-gray-600">
            <p>{product.description}</p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <label className="text-sm font-medium text-gray-900">
                Select Variation
              </label>
              <Select onValueChange={setSelectedVariantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((v) => (
                    <SelectItem
                      key={v.product_id}
                      value={v.product_id.toString()}
                      disabled={(v.stock || 0) <= 0}
                    >
                      {v.attributes
                        ?.map((a) => a.attribute_value)
                        .join(" / ") || v.name}
                      {(v.stock || 0) <= 0
                        ? " (Out of Stock)"
                        : ` - ${formatPrice(v.price)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6 border-t">
            <Button
              size="lg"
              className="w-full text-lg h-12"
              onClick={buyNow}
              disabled={!currentStock || currentStock <= 0}
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg h-12"
              onClick={addToCart}
              disabled={!currentStock || currentStock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            {(!currentStock || currentStock <= 0) && (
              <p className="text-destructive text-center text-sm font-medium">
                Currently Out of Stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
