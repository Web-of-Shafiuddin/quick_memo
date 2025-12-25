'use client'
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "../../_components/ProductForm";
import { productService, Product } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, X } from "lucide-react";

interface VariantFormData {
  name: string;
  price: string;
  discount: string;
  stock: string;
  attributes: { attribute_name: string; attribute_value: string }[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.sku as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantFormData>({
    name: '',
    price: '',
    discount: '0',
    stock: '0',
    attributes: [{ attribute_name: '', attribute_value: '' }],
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(parseInt(id));
      setProduct(response.data);

      // Only fetch variants if this is a parent product (no parent_product_id)
      if (!response.data.parent_product_id) {
        const variantsResponse = await productService.getVariants(parseInt(id));
        setVariants(variantsResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      alert(error.response?.data?.error || 'Failed to fetch product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await productService.update(parseInt(id), data);
      alert('Product updated successfully');
      router.push('/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  };

  const handleAddAttribute = () => {
    setVariantForm({
      ...variantForm,
      attributes: [...variantForm.attributes, { attribute_name: '', attribute_value: '' }],
    });
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = variantForm.attributes.filter((_, i) => i !== index);
    setVariantForm({ ...variantForm, attributes: newAttributes.length ? newAttributes : [{ attribute_name: '', attribute_value: '' }] });
  };

  const handleAttributeChange = (index: number, field: 'attribute_name' | 'attribute_value', value: string) => {
    const newAttributes = [...variantForm.attributes];
    newAttributes[index][field] = value;
    setVariantForm({ ...variantForm, attributes: newAttributes });
  };

  const handleCreateVariant = async () => {
    try {
      setVariantLoading(true);
      const validAttributes = variantForm.attributes.filter(
        attr => attr.attribute_name.trim() && attr.attribute_value.trim()
      );

      await productService.createVariant(parseInt(id), {
        name: variantForm.name || undefined,
        price: parseFloat(variantForm.price),
        discount: parseFloat(variantForm.discount) || 0,
        stock: parseInt(variantForm.stock) || 0,
        attributes: validAttributes,
      });

      alert('Variant created successfully');
      setVariantDialogOpen(false);
      setVariantForm({
        name: '',
        price: '',
        discount: '0',
        stock: '0',
        attributes: [{ attribute_name: '', attribute_value: '' }],
      });
      fetchProduct();
    } catch (error: any) {
      console.error('Error creating variant:', error);
      alert(error.response?.data?.error || 'Failed to create variant');
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: number, variantName: string) => {
    if (!window.confirm(`Are you sure you want to delete variant "${variantName}"?`)) {
      return;
    }

    try {
      await productService.delete(variantId);
      alert('Variant deleted successfully');
      fetchProduct();
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      alert(error.response?.data?.error || 'Failed to delete variant');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto py-10">Product not found</div>;
  }

  const isParentProduct = !product.parent_product_id;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <ProductForm
        product={product}
        onSubmit={handleUpdate}
        title="Edit Product"
        description="Update the details for your product."
        submitButtonText="Update Product"
      />

      {/* Variant Management - Only show for parent products */}
      {isParentProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Manage variants of this product (e.g., different sizes, colors)
                </CardDescription>
              </div>
              <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Variant</DialogTitle>
                    <DialogDescription>
                      Add a variant with specific attributes like size or color.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="variant-name">Variant Name (Optional)</Label>
                      <Input
                        id="variant-name"
                        placeholder={`${product.name} - Variant`}
                        value={variantForm.name}
                        onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="variant-price">Price *</Label>
                        <Input
                          id="variant-price"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={variantForm.price}
                          onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-discount">Discount %</Label>
                        <Input
                          id="variant-discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={variantForm.discount}
                          onChange={(e) => setVariantForm({ ...variantForm, discount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-stock">Stock</Label>
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={variantForm.stock}
                          onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Attributes</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddAttribute}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {variantForm.attributes.map((attr, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="e.g., Size"
                              value={attr.attribute_name}
                              onChange={(e) => handleAttributeChange(index, 'attribute_name', e.target.value)}
                            />
                            <Input
                              placeholder="e.g., Large"
                              value={attr.attribute_value}
                              onChange={(e) => handleAttributeChange(index, 'attribute_value', e.target.value)}
                            />
                            {variantForm.attributes.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAttribute(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateVariant}
                      disabled={variantLoading || !variantForm.price}
                    >
                      {variantLoading ? 'Creating...' : 'Create Variant'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No variants yet. Click "Add Variant" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Attributes</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.product_id}>
                      <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {variant.attributes && variant.attributes.length > 0 ? (
                            variant.attributes.map((attr) => (
                              <Badge key={attr.attribute_id} variant="secondary">
                                {attr.attribute_name}: {attr.attribute_value}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No attributes</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${variant.price.toFixed(2)}</TableCell>
                      <TableCell>{variant.stock}</TableCell>
                      <TableCell>
                        <Badge variant={variant.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {variant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/products/edit/${variant.product_id}`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.product_id, variant.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show parent product link for variants */}
      {!isParentProduct && product.parent_product_id && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Information</CardTitle>
            <CardDescription>
              This product is a variant of another product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.attributes && product.attributes.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Attributes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.attributes.map((attr) => (
                    <Badge key={attr.attribute_id} variant="secondary">
                      {attr.attribute_name}: {attr.attribute_value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/products/edit/${product.parent_product_id}`)}
            >
              View Parent Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
