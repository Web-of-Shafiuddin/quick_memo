'use client'
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
import { customerService, Customer } from "@/services/customerService";
import { productService, Product } from "@/services/productService";
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
  const [paymentMethods, setPaymentMethods] = useState<{ payment_method_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [orderSource, setOrderSource] = useState("OFFLINE");
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Item form state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);

      // Mock payment methods (in real app, would fetch from API)
      setPaymentMethods([
        { payment_method_id: 1, name: 'CASH' },
        { payment_method_id: 2, name: 'CARD' },
        { payment_method_id: 3, name: 'UPI' },
        { payment_method_id: 4, name: 'ONLINE TRANSFER' },
      ]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert('Please select a product');
      return;
    }

    const product = products.find(p => p.product_id === selectedProductId);
    if (!product) return;

    const existingItemIndex = orderItems.findIndex(item => item.product_id === selectedProductId);

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += itemQuantity;
      updatedItems[existingItemIndex].item_discount = itemDiscount;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        product_id: selectedProductId,
        quantity: itemQuantity,
        unit_price: product.price,
        item_discount: itemDiscount,
        product,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset item form
    setSelectedProductId(null);
    setItemQuantity(1);
    setItemDiscount(0);
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = (item: OrderItem) => {
    return (item.quantity * item.unit_price) - (item.item_discount || 0);
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    return itemsTotal + shippingAmount + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    if (!paymentMethodId) {
      alert('Please select a payment method');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
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
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_discount: item.item_discount,
        })),
      };

      await orderService.create(orderData);
      alert('Order created successfully');
      router.push('/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>Select customer, add products, and complete the order details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer *</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={(value) => setSelectedCustomerId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                        {customer.name} {customer.mobile && `(${customer.mobile})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-3 rounded">
                  <div><span className="font-medium">Email:</span> {selectedCustomer.email || '-'}</div>
                  <div><span className="font-medium">Mobile:</span> {selectedCustomer.mobile || '-'}</div>
                  <div className="col-span-2"><span className="font-medium">Address:</span> {selectedCustomer.address || '-'}</div>
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
                    onValueChange={(value) => setPaymentMethodId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.payment_method_id} value={method.payment_method_id.toString()}>
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
                  <Select
                    value={selectedProductId?.toString() || ""}
                    onValueChange={(value) => setSelectedProductId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.product_id} value={product.product_id.toString()}>
                          {product.name} - {formatPrice(product.price)} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemDiscount">{`Item Discount (${symbol})`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <Button type="button" onClick={handleAddItem} className="w-full">
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
                        <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.item_discount || 0)}</TableCell>
                        <TableCell className="text-right">{formatPrice(calculateSubtotal(item))}</TableCell>
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
                    onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxAmount">{`Tax Amount (${symbol})`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items Total:</span>
                  <span>{formatPrice(orderItems.reduce((sum, item) => sum + calculateSubtotal(item), 0))}</span>
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
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating Order...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOrderPage;
