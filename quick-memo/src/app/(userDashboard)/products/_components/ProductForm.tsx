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

interface Attribute {
  attribute_name: string;
  attribute_value: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  description: string;
  submitButtonText: string;
}

const ProductForm = ({ product, onSubmit, title, description, submitButtonText }: ProductFormProps) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>(
    product?.attributes?.map(a => ({
      attribute_name: a.attribute_name,
      attribute_value: a.attribute_value
    })) || []
  );
  const [formData, setFormData] = useState({
    sku: product?.sku || "",
    name: product?.name || "",
    category_id: product?.category_id?.toString() || "",
    price: product?.price?.toString() || "",
    discount: product?.discount?.toString() || "0",
    stock: product?.stock?.toString() || "0",
    status: product?.status || "ACTIVE",
    image: product?.image || "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData: any = {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock) || 0,
        status: formData.status as 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED',
        image: formData.image || null,
        attributes: attributes.filter(a => a.attribute_name.trim() && a.attribute_value.trim()),
      };

      // Only include SKU if it's provided
      if (formData.sku && formData.sku.trim()) {
        submitData.sku = formData.sku.trim();
      }

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addAttribute = () => {
    setAttributes([...attributes, { attribute_name: "", attribute_value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof Attribute, value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Optional - Auto-generated if empty)</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
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
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Wireless Mouse"
                required
              />
            </div>
          </div>

          <ImageUpload
            value={formData.image}
            onChange={(url) => handleChange('image', url)}
            type="product"
            label="Product Image"
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                name="category_id"
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
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
                onChange={(e) => handleChange('discount', e.target.value)}
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
                onChange={(e) => handleChange('stock', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
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
              <Label className="text-base font-medium">Product Attributes</Label>
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
              Add attributes like Size, Color, Material, etc.
            </p>
            {attributes.length > 0 && (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Attribute name (e.g., Size)"
                        value={attr.attribute_name}
                        onChange={(e) => updateAttribute(index, 'attribute_name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Value (e.g., Large)"
                        value={attr.attribute_value}
                        onChange={(e) => updateAttribute(index, 'attribute_value', e.target.value)}
                      />
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
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
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
