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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { customerService, Customer } from "@/services/customerService";
import { productService, Product } from "@/services/productService";
import { getActivePaymentMethods } from "@/services/paymentMethodService";
import { orderService, CreateOrderItemInput } from "@/services/orderService";
import { Plus, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface OrderItem extends CreateOrderItemInput {
  product?: Product;
}

const AddOrderPage = () => {
  const router = useRouter();
  const { format: formatPrice, symbol } = useCurrency();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<
    { payment_method_id: number; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [orderSource, setOrderSource] = useState("OFFLINE");
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Item form state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [variants, setVariants] = useState<Product[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Helper to extract options
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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);

      // Fetch payment methods from API
      const paymentMethodsRes = await getActivePaymentMethods();
      setPaymentMethods(paymentMethodsRes);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      alert("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (productId: number) => {
    setSelectedProductId(productId);
    setSelectedOptions({});
    setVariants([]);

    try {
      setLoading(true);
      // Fetch full product details (to get attributes of parent) and simple variant list
      // Note: productService.getVariants returns Product[] (which are children)
      const [productRes, variantsRes] = await Promise.all([
        productService.getById(productId),
        // We only try to fetch variants if the initial listing suggested so,
        // but calling it anyway for safety or we can check productRes first.
        // Optimistically fetching both is faster.
        productService.getVariants(productId).catch(() => ({ data: [] })),
      ]);

      const fullProduct = productRes.data;
      const variantsData = variantsRes.data || [];

      // Determine if we should show selectors
      const hasVariants =
        (fullProduct.variant_count || 0) > 0 || variantsData.length > 0;

      if (hasVariants) {
        // Combine parent with children variants to form the complete option set
        // Public shop logic: const allItems = [product, ...(product.variants || [])];
        // Here `fullProduct` has `attributes` and so do `variantsData`.
        const allVariants = [fullProduct, ...variantsData];
        setVariants(allVariants);

        // Auto-select defaults from the first available item (usually parent or first variant)
        if (allVariants.length > 0) {
          const first = allVariants[0];
          const defaults: Record<string, string> = {};
          first.attributes?.forEach(
            (a) => (defaults[a.attribute_name] = a.attribute_value)
          );
          setSelectedOptions(defaults);
        }
      } else {
        // Even if no children, check if the product itself has attributes (single variant case)
        if (fullProduct.attributes && fullProduct.attributes.length > 0) {
          setVariants([fullProduct]);
          const defaults: Record<string, string> = {};
          fullProduct.attributes.forEach(
            (a) => (defaults[a.attribute_name] = a.attribute_value)
          );
          setSelectedOptions(defaults);
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert("Please select a product");
      return;
    }

    const product = products.find((p) => p.product_id === selectedProductId);
    if (!product) return;

    let productToAdd: Product | undefined = product;

    // Check if we have variants and need resolution
    if (variants.length > 0) {
      // Find matching variant
      const matchedVariant = variants.find((v) => {
        if (!v.attributes || v.attributes.length === 0) return false;

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
        const allVariantTypesPresent = variantAttrNames.every(
          (name) => selectedOptions[name] !== undefined
        );
        if (!allVariantTypesPresent) return false;

        return true;
      });

      // If we have variants but no match found (and options are selected), user might have selected invalid combo
      // But we pre-filled options.
      // If user hasn't selected anything yet?

      if (matchedVariant) {
        productToAdd = matchedVariant;
      } else if (Object.keys(selectedOptions).length > 0) {
        // Try to see if this combination is valid. If not, alert.
        // But wait, if `variants` include the parent attributes, it might be the parent.
        // If we didn't fetch parent attributes, we can't match it.
        // Assumption: `variants` covers all selectable items.
        alert("Please select a valid variation combination.");
        return;
      } else {
        alert("Please select variation options.");
        return;
      }
    }

    if (!productToAdd) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.product_id === productToAdd!.product_id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].item_discount = itemDiscount;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        product_id: productToAdd.product_id,
        quantity: itemQuantity,
        unit_price: productToAdd.price,
        item_discount: itemDiscount,
        product: productToAdd,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset item form
    setSelectedProductId(null);
    setSelectedOptions({});
    setVariants([]);
    setItemQuantity(1);
    setItemDiscount(0);
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = (item: OrderItem) => {
    return item.quantity * item.unit_price - (item.item_discount || 0);
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + calculateSubtotal(item),
      0
    );
    return itemsTotal + shippingAmount + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert("Please select a customer");
      return;
    }

    if (!paymentMethodId) {
      alert("Please select a payment method");
      return;
    }

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        customer_id: selectedCustomerId,
        order_source: orderSource,
        payment_method_id: paymentMethodId,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        items: orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_discount: item.item_discount,
        })),
      };

      await orderService.create(orderData);
      alert("Order created successfully");
      router.push("/orders");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      const message =
        error instanceof Error
          ? (error as any).response?.data?.error
          : "Failed to create order";
      alert(message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  const selectedCustomer = customers.find(
    (c) => c.customer_id === selectedCustomerId
  );

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>
            Select customer, add products, and complete the order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer *</Label>
                <SearchableSelect
                  options={customers.map((customer) => ({
                    value: customer.customer_id.toString(),
                    label: customer.name,
                    description: customer.mobile || customer.email || undefined,
                  }))}
                  value={selectedCustomerId?.toString() || null}
                  onValueChange={(value) =>
                    setSelectedCustomerId(parseInt(value))
                  }
                  placeholder="Choose a customer"
                  searchPlaceholder="Search customers..."
                  emptyMessage="No customers found."
                />
              </div>

              {selectedCustomer && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.email || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Mobile:</span>{" "}
                    {selectedCustomer.mobile || "-"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span>{" "}
                    {selectedCustomer.address || "-"}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderSource">Order Source *</Label>
                  <Select value={orderSource} onValueChange={setOrderSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                      <SelectItem value="FACEBOOK">FACEBOOK</SelectItem>
                      <SelectItem value="INSTAGRAM">INSTAGRAM</SelectItem>
                      <SelectItem value="WEBSITE">WEBSITE</SelectItem>
                      <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={paymentMethodId?.toString() || ""}
                    onValueChange={(value) =>
                      setPaymentMethodId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem
                          key={method.payment_method_id}
                          value={method.payment_method_id.toString()}
                        >
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Add Items */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Add Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product">Product</Label>
                  <SearchableSelect
                    options={products.map((product) => ({
                      value: product.product_id.toString(),
                      label: product.name,
                      description: `${formatPrice(product.price)} | Stock: ${
                        product.stock
                      } | Variants: ${product.variant_count || 0}`,
                    }))}
                    value={selectedProductId?.toString() || null}
                    onValueChange={(value) =>
                      handleProductSelect(parseInt(value))
                    }
                    placeholder="Choose a product"
                    searchPlaceholder="Search products..."
                    emptyMessage="No products found."
                  />

                  {variants.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {getProductOptions(variants).map((option) => (
                        <div key={option.name}>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            {option.name}
                          </Label>
                          <Select
                            value={selectedOptions[option.name] || ""}
                            onValueChange={(val) =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.name]: val,
                              }))
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue
                                placeholder={`Select ${option.name}`}
                              />
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

                      {/* Show resolved variant price/stock if available */}
                      {(() => {
                        const matched = variants.find((v) =>
                          v.attributes?.every(
                            (a) =>
                              selectedOptions[a.attribute_name] ===
                              a.attribute_value
                          )
                        );
                        if (matched) {
                          return (
                            <div className="text-xs text-muted-foreground mt-2">
                              Price: {formatPrice(matched.price)} | Stock:{" "}
                              {matched.stock}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) =>
                      setItemQuantity(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDiscount">{`Item Discount (${symbol})`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemDiscount}
                    onChange={(e) =>
                      setItemDiscount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Order Items Table */}
              {orderItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell>{item.product?.sku}</TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.item_discount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(calculateSubtotal(item))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Additional Charges */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Additional Charges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAmount">{`Shipping Amount (${symbol})`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingAmount}
                    onChange={(e) =>
                      setShippingAmount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxAmount">{`Tax Amount (${symbol})`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxAmount}
                    onChange={(e) =>
                      setTaxAmount(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items Total:</span>
                  <span>
                    {formatPrice(
                      orderItems.reduce(
                        (sum, item) => sum + calculateSubtotal(item),
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{formatPrice(shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating Order..." : "Create Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOrderPage;
