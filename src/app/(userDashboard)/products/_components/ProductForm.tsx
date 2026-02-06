"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { Product } from "@/services/productService";
import { categoryService, Category } from "@/services/categoryService";
import { Plus, X } from "lucide-react";
import { HierarchicalCategorySelect } from "@/components/categories/HierarchicalCategorySelect";
import { CategoryBreadcrumb } from "@/components/categories/CategoryBreadcrumb";
import { useCurrency } from "@/hooks/useCurrency";
import {
  attributeService,
  AttributeDefinition,
} from "@/services/attributeService";

interface Attribute {
  attribute_name: string;
  attribute_value: string;
}

export interface ProductFormSubmitData {
  sku?: string;
  name: string;
  category_id: number;
  price: number;
  discount: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  image: string | null;
  description: string | null;
  video_url: string | null;
  attributes: Attribute[];
  gallery_images: { image_url: string; attribute_value?: string }[];
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormSubmitData) => Promise<void>;
  title: string;
  description: string;
  submitButtonText: string;
}

const ProductForm = ({
  product,
  onSubmit,
  title,
  description,
  submitButtonText,
}: ProductFormProps) => {
  const router = useRouter();
  const { symbol } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>(
    product?.attributes?.map((a) => ({
      attribute_name: a.attribute_name,
      attribute_value: a.attribute_value,
    })) || []
  );
  const [galleryImages, setGalleryImages] = useState<
    { image_url: string; attribute_value: string }[]
  >(
    product?.gallery_images?.map((img) => ({
      image_url: img.image_url,
      attribute_value: img.attribute_value || "",
    })) || []
  );

  const [globalAttributes, setGlobalAttributes] = useState<
    AttributeDefinition[]
  >([]);
  const [formData, setFormData] = useState({
    sku: product?.sku || "",
    name: product?.name || "",
    category_id: product?.category_id?.toString() || "",
    price: product?.price?.toString() || "",
    discount: product?.discount?.toString() || "0",
    stock: product?.stock?.toString() || "0",
    status: product?.status || "ACTIVE",
    image: product?.image || "",
    description: product?.description || "",
    video_url: product?.video_url || "",
  });

  useEffect(() => {
    fetchCategories();
    fetchGlobalAttributes();
  }, []);

  const fetchGlobalAttributes = async () => {
    try {
      const res = await attributeService.getAll();
      setGlobalAttributes(res.data);
    } catch (error) {
      console.error("Error fetching global attributes:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData: ProductFormSubmitData = {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock) || 0,
        status: formData.status as "ACTIVE" | "INACTIVE" | "DISCONTINUED",
        image: formData.image || null,
        description: formData.description || null,
        video_url: formData.video_url || null,
        attributes: attributes.filter(
          (a) => a.attribute_name.trim() && a.attribute_value.trim()
        ),
        gallery_images: galleryImages.map((img) => ({
          image_url: img.image_url,
          attribute_value: img.attribute_value || undefined, // Send undefined if empty string
        })),
        sku:
          formData.sku && formData.sku.trim() ? formData.sku.trim() : undefined,
      };

      await onSubmit(submitData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { attribute_name: "", attribute_value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    field: keyof Attribute,
    value: string
  ) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const addGalleryImage = (url: string) => {
    if (url) {
      setGalleryImages([
        ...galleryImages,
        { image_url: url, attribute_value: "" },
      ]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const updateGalleryImageAttribute = (index: number, value: string) => {
    const updated = [...galleryImages];
    updated[index].attribute_value = value;
    setGalleryImages(updated);
  };

  // Get distinct attribute values from the product's attributes for the gallery dropdown
  const availableAttributeValues = attributes
    .filter((a) => a.attribute_value.trim() !== "")
    .map((a) => a.attribute_value);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU (Optional - Auto-generated if empty)
              </Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                readOnly={!!product}
                placeholder="Leave empty for auto-generation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Wireless Mouse"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Main Product Image</Label>
                <div className="mt-2">
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => handleChange("image", url)}
                    type="product"
                    label=""
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Product details, features, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL (Optional)</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange("video_url", e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <HierarchicalCategorySelect
                categories={categories}
                value={formData.category_id ? parseInt(formData.category_id) : null}
                onValueChange={(value) =>
                  handleChange("category_id", value?.toString() || "")
                }
                placeholder="Select category"
                allowClear
              />
              {formData.category_id && (() => {
                const selectedCategory = categories.find(
                  (c) => c.category_id === parseInt(formData.category_id)
                );
                return selectedCategory ? (
                  <CategoryBreadcrumb
                    category={selectedCategory}
                    categories={categories}
                    className="text-xs text-muted-foreground"
                  />
                ) : null;
              })()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{`Price (${symbol})`}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Product Attributes
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Attribute
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add attributes like Size, Color, Material, etc. These can be
              linked to gallery images.
            </p>
            {attributes.length > 0 && (
              <div className="space-y-3">
                {attributes.map((attr, index) => {
                  const selectedDef = globalAttributes.find(
                    (ga) => ga.name === attr.attribute_name
                  );

                  return (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select
                          value={attr.attribute_name}
                          onValueChange={(value) => {
                            updateAttribute(index, "attribute_name", value);
                            updateAttribute(index, "attribute_value", ""); // Reset value when name changes
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Attribute (e.g. Size)" />
                          </SelectTrigger>
                          <SelectContent>
                            {globalAttributes.map((ga) => (
                              <SelectItem
                                key={ga.attribute_def_id}
                                value={ga.name}
                              >
                                {ga.name}
                              </SelectItem>
                            ))}
                            {/* Allow custom if not found but primarily encourage global */}
                            {!globalAttributes.some(
                              (ga) => ga.name === attr.attribute_name
                            ) &&
                              attr.attribute_name && (
                                <SelectItem value={attr.attribute_name}>
                                  {attr.attribute_name}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        {selectedDef &&
                        (selectedDef.values?.length ?? 0) > 0 ? (
                          <Select
                            value={attr.attribute_value}
                            onValueChange={(value) =>
                              updateAttribute(index, "attribute_value", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Value (e.g. Large)" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedDef.values?.map((val) => (
                                <SelectItem
                                  key={val.attribute_value_id}
                                  value={val.value}
                                >
                                  {val.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Value (e.g., Large)"
                            value={attr.attribute_value}
                            onChange={(e) =>
                              updateAttribute(
                                index,
                                "attribute_value",
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttribute(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gallery Images */}
          {product?.parent_product_id === null && <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Product Gallery</Label>
              <div className="w-40">
                {/* Invisible uploader used via trigger, or simply separate button? 
                    Reusing ImageUpload is easiest if we treat it as "Add Image"
                */}
                <ImageUpload
                  value="" // Always empty to allow new uploads
                  onChange={addGalleryImage}
                  type="product"
                  label=""
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  Upload New Image
                </p>
              </div>
            </div>

            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {galleryImages.map((img, index) => (
                  <Card key={index} className="relative group overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={img.image_url}
                        alt={`Gallery ${index}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-2 bg-muted/50">
                      <Select
                        value={img.attribute_value}
                        onValueChange={(val) =>
                          updateGalleryImageAttribute(index, val)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Link to Attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            CheckAll (Default)
                          </SelectItem>
                          {availableAttributeValues.map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No gallery images added yet.
              </p>
            )}
          </div>}

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
