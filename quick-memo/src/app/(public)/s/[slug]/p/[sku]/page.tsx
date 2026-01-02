"use client";

import { useState, useEffect, useMemo } from "react";
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
  description: string | null;
  price: number;
  discount: number;
  stock: number;
  image: string | null;
  video_url: string | null;
  category_name: string;
  attributes?: Attribute[];
  gallery_images?: { image_url: string; attribute_value?: string }[];
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
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Helper to extract all available attributes from variants
  const getProductOptions = (variants: Product[]) => {
    const options: Record<string, Set<string>> = {};
    variants.forEach((v) => {
      v.attributes?.forEach((a) => {
        if (!options[a.attribute_name]) {
          options[a.attribute_name] = new Set();
        }
        options[a.attribute_name].add(a.attribute_value);
      });
    });
    return Object.entries(options).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  };

  const productOptions = useMemo(() => {
    if (!product) return [];
    // Include parent in the options calculation
    const allItems = [product, ...(product.variants || [])];
    return getProductOptions(allItems);
  }, [product]);

  // Determine the currently selected variant based on options
  const currentVariant = useMemo(() => {
    if (!product) return null;
    const allItems = [product, ...(product.variants || [])];

    return (
      allItems.find((v) => {
        if (!v.attributes || v.attributes.length === 0) return false;

        // Group variant attributes by name
        const variantAttrMap: Record<string, string[]> = {};
        v.attributes.forEach((a) => {
          if (!variantAttrMap[a.attribute_name])
            variantAttrMap[a.attribute_name] = [];
          variantAttrMap[a.attribute_name].push(a.attribute_value);
        });

        const variantAttrNames = Object.keys(variantAttrMap);
        const selectedAttrNames = Object.keys(selectedOptions);

        // 1. Every selected option must be supported by the variant
        const allSelectedItemsMatch = selectedAttrNames.every((name) =>
          variantAttrMap[name]?.includes(selectedOptions[name])
        );
        if (!allSelectedItemsMatch) return false;

        // 2. Every attribute type defined in the variant must be present in the selection
        // This prevents a variant with ONLY "Storage: 1TB" from matching "Storage: 1TB + Color: Red"
        const allVariantTypesPresent = variantAttrNames.every(
          (name) => selectedOptions[name] !== undefined
        );
        if (!allVariantTypesPresent) return false;

        return true;
      }) || null
    );
  }, [product, selectedOptions]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shop/${slug}/products/${sku}`);
        const productData = res.data.data;
        setProduct(productData);
        setActiveImage(productData.image);

        // Initialize options with the first variant's attributes if available
        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          const initialOptions: Record<string, string> = {};
          firstVariant.attributes?.forEach((a: Attribute) => {
            initialOptions[a.attribute_name] = a.attribute_value;
          });
          setSelectedOptions(initialOptions);
        }
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

  // Update image when variant changes or manually selected
  useEffect(() => {
    // 1. Try to match based on currentVariant (full match)
    if (currentVariant) {
      if (product && product.gallery_images) {
        const variantAttributes =
          currentVariant.attributes?.map((a) => a.attribute_value) || [];
        const matchingGalleryImage = product.gallery_images?.find(
          (img) =>
            img.attribute_value &&
            variantAttributes.includes(img.attribute_value)
        );
        if (matchingGalleryImage) {
          setActiveImage(matchingGalleryImage.image_url);
          return;
        }
      }
      if (currentVariant.image) {
        setActiveImage(currentVariant.image);
        return;
      }
    }

    // 2. Fallback: Try to match based on selectedOptions (partial match)
    // Useful when user selects "Color: Red" but hasn't selected "Size" yet.
    if (product && product.gallery_images) {
      // Iterate over selected option values to find a matching image
      // Priority: maybe the last selected option? Or just any.
      const selectedValues = Object.values(selectedOptions);
      const matchingGalleryImage = product.gallery_images.find(
        (img) =>
          img.attribute_value && selectedValues.includes(img.attribute_value)
      );
      if (matchingGalleryImage) {
        setActiveImage(matchingGalleryImage.image_url);
        return;
      }
    }

    // 3. Fallback to main product image if nothing else matches (and no active manual selectionOverride?)
    // relying on state persistence for manual clicks, but validation reset might be needed
    // If we want to strictly show "Red" image if "Red" is selected, we should probably stick to the above.
  }, [currentVariant, product, selectedOptions]);

  const addToCart = () => {
    if (!product) return;

    // Check if variants exist
    if (product.variants && product.variants.length > 0) {
      if (!currentVariant) {
        toast.error("Please select all options");
        return;
      }
    }

    const itemToAdd = currentVariant || product;

    // Get current cart from local storage
    const currentCart = JSON.parse(localStorage.getItem("shop_cart") || "[]");

    const existingItemIndex = currentCart.findIndex(
      (item: Product) => item.product_id === itemToAdd.product_id
    );

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({
        product_id: itemToAdd.product_id,
        name: itemToAdd.name,
        price: itemToAdd.price * (1 - (itemToAdd.discount || 0) / 100),
        image: itemToAdd.image || product.image,
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

  // const currentVariant is derived above
  const currentProduct = currentVariant || product;
  const originalPrice = currentProduct.price;
  const discount = currentProduct.discount || 0;
  const price = originalPrice * (1 - discount / 100);
  const stock = currentProduct.stock;

  // Filter gallery images
  const relevantGalleryImages =
    product.gallery_images?.filter((img) => {
      if (!img.attribute_value) return true;
      if (!currentVariant) return true;
      return currentVariant.attributes?.some(
        (attr) => attr.attribute_value === img.attribute_value
      );
    }) || [];

  const allImages = [
    ...(relevantGalleryImages.some((g) => g.image_url === product.image)
      ? []
      : [{ image_url: product.image || "", attribute_value: null }]),
    ...relevantGalleryImages,
  ].filter((img) => img.image_url);

  const handleOptionChange = (attributeName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

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
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square relative border">
            {activeImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No Image
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow-sm">
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-20 shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 items-center justify-center bg-gray-50 ${
                    activeImage === img.image_url
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={`Gallery ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
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
              SKU: {currentProduct.sku}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(price)}
            </div>
            {discount > 0 && (
              <div className="text-lg text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>

          {product.video_url && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Product Video
              </h3>
              <a
                href={product.video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  Watch Video
                </Button>
              </a>
            </div>
          )}

          {/* Variant Selector */}
          {/* Variant Selector - Multi Attribute */}
          {productOptions.length > 0 && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border mt-6">
              {productOptions.map((option) => (
                <div key={option.name} className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    {option.name}
                  </label>
                  <Select
                    value={selectedOptions[option.name]}
                    onValueChange={(val) =>
                      handleOptionChange(option.name, val)
                    }
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder={`Select ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.values.map((val) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {!currentVariant &&
                Object.keys(selectedOptions).length ===
                  productOptions.length && (
                  <p className="text-destructive text-sm font-medium">
                    This combination is not available.
                  </p>
                )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-6 border-t mt-8">
            <Button
              size="lg"
              className="w-full text-lg h-12"
              onClick={buyNow}
              disabled={!stock || stock <= 0}
            >
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg h-12"
              onClick={addToCart}
              disabled={!stock || stock <= 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            {(!stock || stock <= 0) && (
              <p className="text-destructive text-center text-sm font-medium">
                Currently Out of Stock
              </p>
            )}
          </div>
        </div>

        {product.description && (
          <div className="prose prose-sm text-gray-600 max-w-none mt-6">
            <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
