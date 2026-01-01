"use client";
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
import { Plus, Trash2, Edit2, X, Sparkles, Loader2 } from "lucide-react";
import {
  attributeService,
  AttributeDefinition,
} from "@/services/attributeService";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Single Variant Add
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantFormData>({
    name: "",
    price: "",
    discount: "0",
    stock: "0",
    attributes: [{ attribute_name: "", attribute_value: "" }],
  });

  // Bulk Generator
  const [globalAttributes, setGlobalAttributes] = useState<
    AttributeDefinition[]
  >([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkSelections, setBulkSelections] = useState<{
    [key: number]: string[];
  }>({});
  const [bulkBasePrice, setBulkBasePrice] = useState("");
  const [bulkBaseStock, setBulkBaseStock] = useState("0");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProduct(), fetchGlobalAttributes()]);
    };
    init();
  }, [id]);

  const fetchGlobalAttributes = async () => {
    try {
      const res = await attributeService.getAll();
      setGlobalAttributes(res.data);
    } catch (error) {
      console.error("Error fetching global attributes:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(parseInt(id));
      setProduct(response.data);

      if (!response.data.parent_product_id) {
        const variantsResponse = await productService.getVariants(parseInt(id));
        setVariants(variantsResponse.data);
      }
    } catch (error: unknown) {
      console.error("Error fetching product:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to fetch product";
      toast.error(message || "Failed to fetch product");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await productService.update(parseInt(id), data);
      toast.success("Product updated successfully");
      router.push("/products");
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to update product";
      throw new Error(message || "Failed to update product");
    }
  };

  const handleAddAttribute = () => {
    setVariantForm((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { attribute_name: "", attribute_value: "" },
      ],
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setVariantForm((prev) => {
      const newAttributes = prev.attributes.filter((_, i) => i !== index);
      return {
        ...prev,
        attributes: newAttributes.length
          ? newAttributes
          : [{ attribute_name: "", attribute_value: "" }],
      };
    });
  };

  const handleAttributeChange = (
    index: number,
    field: "attribute_name" | "attribute_value",
    value: string
  ) => {
    setVariantForm((prev) => {
      const newAttributes = [...prev.attributes];
      newAttributes[index][field] = value;
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleCreateVariant = async () => {
    try {
      setVariantLoading(true);
      const validAttributes = variantForm.attributes.filter(
        (attr) => attr.attribute_name.trim() && attr.attribute_value.trim()
      );

      await productService.createVariant(parseInt(id), {
        name: variantForm.name || undefined,
        price: parseFloat(variantForm.price),
        discount: parseFloat(variantForm.discount) || 0,
        stock: parseInt(variantForm.stock) || 0,
        attributes: validAttributes,
      });

      toast.success("Variant created successfully");
      setVariantDialogOpen(false);
      setVariantForm({
        name: "",
        price: "",
        discount: "0",
        stock: "0",
        attributes: [{ attribute_name: "", attribute_value: "" }],
      });
      fetchProduct();
    } catch (error: unknown) {
      console.error("Error creating variant:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to create variant";
      toast.error(message || "Failed to create variant");
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (
    variantId: number,
    variantName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete variant "${variantName}"?`
      )
    ) {
      return;
    }

    try {
      await productService.delete(variantId);
      toast.success("Variant deleted successfully");
      fetchProduct();
    } catch (error: unknown) {
      console.error("Error deleting variant:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to delete variant";
      toast.error(message || "Failed to delete variant");
    }
  };

  const toggleBulkSelection = (defId: number, value: string) => {
    setBulkSelections((prev) => {
      const current = prev[defId] || [];
      if (current.includes(value)) {
        return { ...prev, [defId]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [defId]: [...current, value] };
      }
    });
  };

  const handleBulkGenerate = async () => {
    if (!product) return;
    const selectedDefs = globalAttributes.filter(
      (ga) => (bulkSelections[ga.attribute_def_id]?.length || 0) > 0
    );

    if (selectedDefs.length === 0) {
      toast.error("Please select at least one attribute and its values.");
      return;
    }

    if (!bulkBasePrice) {
      toast.error("Please provide a base price for variants.");
      return;
    }

    setGenerating(true);
    try {
      const generateCombinations = (
        index: number,
        currentCombo: { attribute_name: string; attribute_value: string }[]
      ): any[] => {
        if (index === selectedDefs.length) return [currentCombo];
        const def = selectedDefs[index];
        const values = bulkSelections[def.attribute_def_id];
        let combos: any[] = [];
        for (const val of values) {
          combos = combos.concat(
            generateCombinations(index + 1, [
              ...currentCombo,
              { attribute_name: def.name, attribute_value: val },
            ])
          );
        }
        return combos;
      };

      const combinations = generateCombinations(0, []);
      const variantsToCreate = combinations.map((combo) => {
        const comboName = combo
          .map((c: { attribute_value: string }) => c.attribute_value)
          .join(" / ");
        return {
          name: `${product.name} - ${comboName}`,
          price: parseFloat(bulkBasePrice),
          stock: parseInt(bulkBaseStock) || 0,
          attributes: combo,
        };
      });

      await productService.bulkCreateVariants(parseInt(id), variantsToCreate);
      toast.success(
        `Generated ${variantsToCreate.length} variants successfully`
      );
      setBulkDialogOpen(false);
      setBulkSelections({});
      fetchProduct();
    } catch (error: unknown) {
      console.error("Bulk generation error:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Bulk generation failed";
      toast.error(message || "Bulk generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="container mx-auto py-10">Loading...</div>;
  if (!product)
    return <div className="container mx-auto py-10">Product not found</div>;

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

      {isParentProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Manage variants of this product
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Bulk Generator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> Bulk
                        Variant Generator
                      </DialogTitle>
                      <DialogDescription>
                        Select attributes and values for combinations.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50/50">
                        <div className="space-y-2">
                          <Label>Base Price</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={bulkBasePrice}
                            onChange={(e) => setBulkBasePrice(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Initial Stock</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={bulkBaseStock}
                            onChange={(e) => setBulkBaseStock(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base">
                          Select Attributes & Values
                        </Label>
                        {globalAttributes.length === 0 ? (
                          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                            No global attributes found.
                          </div>
                        ) : (
                          <div className="grid gap-6">
                            {globalAttributes.map((ga) => (
                              <div
                                key={ga.attribute_def_id}
                                className="space-y-3"
                              >
                                <div className="flex items-center gap-2 border-b pb-1">
                                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-semibold">
                                    {ga.name}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-4 px-2">
                                  {ga.values?.map((val) => (
                                    <div
                                      key={val.attribute_value_id}
                                      className="flex items-center space-x-2"
                                    >
                                      <Checkbox
                                        id={`bulk-${val.attribute_value_id}`}
                                        checked={(
                                          bulkSelections[ga.attribute_def_id] ||
                                          []
                                        ).includes(val.value)}
                                        onCheckedChange={() =>
                                          toggleBulkSelection(
                                            ga.attribute_def_id,
                                            val.value
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`bulk-${val.attribute_value_id}`}
                                        className="text-sm font-medium leading-none"
                                      >
                                        {val.value}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBulkDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkGenerate}
                        disabled={generating}
                      >
                        {generating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          "Generate Variants"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={variantDialogOpen}
                  onOpenChange={setVariantDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Add Variant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Variant</DialogTitle>
                      <DialogDescription>
                        Add a variant with specific attributes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="variant-name">Name (Optional)</Label>
                        <Input
                          id="variant-name"
                          placeholder={`${product.name} - Variant`}
                          value={variantForm.name}
                          onChange={(e) =>
                            setVariantForm({
                              ...variantForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <Label>Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variantForm.price}
                            onChange={(e) =>
                              setVariantForm({
                                ...variantForm,
                                price: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Disc %</Label>
                          <Input
                            type="number"
                            value={variantForm.discount}
                            onChange={(e) =>
                              setVariantForm({
                                ...variantForm,
                                discount: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variantForm.stock}
                            onChange={(e) =>
                              setVariantForm({
                                ...variantForm,
                                stock: e.target.value,
                              })
                            }
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
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {variantForm.attributes.map((attr, index) => {
                            const selectedDef = globalAttributes.find(
                              (ga) => ga.name === attr.attribute_name
                            );
                            return (
                              <div
                                key={index}
                                className="flex gap-2 items-start"
                              >
                                <div className="flex-1">
                                  <Select
                                    value={attr.attribute_name}
                                    onValueChange={(value) => {
                                      handleAttributeChange(
                                        index,
                                        "attribute_name",
                                        value
                                      );
                                      handleAttributeChange(
                                        index,
                                        "attribute_value",
                                        ""
                                      );
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Name" />
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
                                      {attr.attribute_name &&
                                        !globalAttributes.some(
                                          (ga) =>
                                            ga.name === attr.attribute_name
                                        ) && (
                                          <SelectItem
                                            value={attr.attribute_name}
                                          >
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
                                        handleAttributeChange(
                                          index,
                                          "attribute_value",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Value" />
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
                                      placeholder="Value"
                                      value={attr.attribute_value}
                                      onChange={(e) =>
                                        handleAttributeChange(
                                          index,
                                          "attribute_value",
                                          e.target.value
                                        )
                                      }
                                    />
                                  )}
                                </div>
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
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setVariantDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateVariant}
                        disabled={variantLoading || !variantForm.price}
                      >
                        {variantLoading ? "Creating..." : "Create Variant"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {variants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No variants yet.
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
                  {variants.map((v) => (
                    <TableRow key={v.product_id}>
                      <TableCell className="font-mono text-xs">
                        {v.sku}
                      </TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {v.attributes?.map((a) => (
                            <Badge key={a.attribute_id} variant="secondary">
                              {a.attribute_name}: {a.attribute_value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>${v.price.toFixed(2)}</TableCell>
                      <TableCell>{v.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            v.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/products/edit/${v.product_id}`)
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteVariant(v.product_id, v.name)
                            }
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

      {!isParentProduct && product.parent_product_id && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Info</CardTitle>
            <CardDescription>Variant of another product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.attributes && (
              <div className="flex flex-wrap gap-2">
                {product.attributes.map((a) => (
                  <Badge key={a.attribute_id} variant="secondary">
                    {a.attribute_name}: {a.attribute_value}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/products/edit/${product.parent_product_id}`)
              }
            >
              View Parent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
