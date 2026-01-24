'use client'
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { customerService, Customer } from "@/services/customerService";
import { productService, Product } from "@/services/productService";
import { orderService, Order, OrderItem } from "@/services/orderService";
import { getActivePaymentMethods } from "@/services/paymentMethodService";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCurrency } from "@/hooks/useCurrency";
import { InvoiceDialog } from "@/components/invoice-dialog";
import { User } from "@/types/User";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import api from "@/lib/api";

interface ExtendedOrderItem extends OrderItem {
  product?: Product;
}

const EditOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
  const { format: formatPrice, symbol } = useCurrency();

  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ payment_method_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [orderSource, setOrderSource] = useState("OFFLINE");
  const [orderStatus, setOrderStatus] = useState<Order['order_status']>("PENDING");
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([]);

  // Item form state
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);

  useEffect(() => {
    fetchInitialData();
    fetchInvoiceData();
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [orderRes, customersRes, productsRes] = await Promise.all([
        orderService.getById(orderId),
        customerService.getAll(),
        productService.getAll(),
      ]);

      const orderData = orderRes.data;
      setOrder(orderData);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);

      // Set form data from order
      setSelectedCustomerId(orderData.customer_id);
      setOrderSource(orderData.order_source);
      setOrderStatus(orderData.order_status);
      setPaymentMethodId(orderData.payment_method_id);
      setShippingAmount(parseFloat(orderData.shipping_amount.toString()));
      setTaxAmount(parseFloat(orderData.tax_amount.toString()));

      // Convert order items to extended format with product info
      const extendedItems: ExtendedOrderItem[] = (orderData.items || []).map(item => {
        const product = productsRes.data.find(p => p.product_id === item.product_id);
        return {
          ...item,
          product,
        };
      });
      setOrderItems(extendedItems);

      // Fetch payment methods from API
      const paymentMethodsRes = await getActivePaymentMethods();
      setPaymentMethods(paymentMethodsRes);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert('Failed to load order data');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceData = async () => {
    try {
      const response = await api.get(`/invoices`, { params: { transaction_id: orderId } });
      if (response.data.data && response.data.data.length > 0) {
        setInvoiceData(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user?.user_id) return;
    try {
      const response = await api.get(`/users/${user.user_id}`);
      setUserProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      updatedItems[existingItemIndex].item_discount = parseFloat(itemDiscount.toString());
      setOrderItems(updatedItems);
    } else {
      // Add new item - create a temporary ID for new items
      const newItem: ExtendedOrderItem = {
        order_item_id: Date.now(), // Temporary ID for new items
        transaction_id: orderId,
        product_id: selectedProductId,
        name_snapshot: product.name,
        quantity: itemQuantity,
        unit_price: parseFloat(product.price.toString()),
        item_discount: parseFloat(itemDiscount.toString()),
        subtotal: 0, // Will be calculated
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Reset item form
    setSelectedProductId(null);
    setItemQuantity(1);
    setItemDiscount(0);
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems(orderItems.filter(item => item.order_item_id !== itemId));
  };

  const calculateSubtotal = (item: ExtendedOrderItem) => {
    return (item.quantity * parseFloat(item.unit_price.toString())) - parseFloat(item.item_discount.toString());
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

      // Update order status, shipping, and tax
      await orderService.update(orderId, {
        order_status: orderStatus,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
      });

      alert('Order updated successfully');
      router.push('/orders');
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.error || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading order...</div>;
  }

  if (!order) {
    return <div className="container mx-auto py-10">Order not found</div>;
  }

  const selectedCustomer = customers.find(c => c.customer_id === selectedCustomerId);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Order #{orderId}</CardTitle>
              <CardDescription>Update order details, status, and amounts</CardDescription>
            </div>
            <Badge variant={orderStatus === 'DELIVERED' ? 'default' : orderStatus === 'CANCELLED' ? 'destructive' : 'secondary'}>
              {orderStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={(value) => setSelectedCustomerId(parseInt(value))}
                  disabled
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
                <p className="text-sm text-muted-foreground">Customer cannot be changed after order creation</p>
              </div>

              {selectedCustomer && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-background p-3 rounded">
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
                  <Label htmlFor="orderStatus">Order Status *</Label>
                  <Select value={orderStatus} onValueChange={(value) => setOrderStatus(value as Order['order_status'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                      <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="RETURNED">RETURNED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderSource">Order Source</Label>
                  <Select value={orderSource} onValueChange={setOrderSource} disabled>
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
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentMethodId?.toString() || ""}
                    onValueChange={(value) => setPaymentMethodId(parseInt(value))}
                    disabled
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
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p><strong>Note:</strong> Order Date: {new Date(order.order_date).toLocaleString()}</p>
              </div>
            </div>

            {/* Order Items - View Only */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Badge variant="outline">{orderItems.length} item(s)</Badge>
              </div>

              {orderItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.order_item_id}>
                        <TableCell>{item.name_snapshot}</TableCell>
                        <TableCell>{item.product_sku || item.product?.sku || '-'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(parseFloat(item.unit_price.toString()))}</TableCell>
                        <TableCell className="text-right">{formatPrice(parseFloat(item.item_discount.toString()))}</TableCell>
                        <TableCell className="text-right">{formatPrice(calculateSubtotal(item))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
                <p><strong>Note:</strong> Order items cannot be modified after order creation. To change items, you need to cancel this order and create a new one.</p>
              </div>
            </div>

            {/* Additional Charges - Editable */}
            <div className="space-y-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h3 className="text-lg font-semibold">Additional Charges (Editable)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAmount">{`Shipping Amount (${symbol}) *`}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxAmount">{`Tax Amount (${symbol}) *`}</Label>
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
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
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

            {/* Payment Summary */}
            {invoiceData && (
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Payment Summary</h3>
                  <Badge className={
                    invoiceData.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoiceData.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {invoiceData.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold">{formatPrice(invoiceData.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(invoiceData.amount_paid || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className={`text-lg font-bold ${(invoiceData.total_amount - (invoiceData.amount_paid || 0)) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatPrice(invoiceData.total_amount - (invoiceData.amount_paid || 0))}
                    </p>
                  </div>
                </div>

                {invoiceData.status !== 'PAID' && (
                  <Button type="button" onClick={() => setPaymentDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating Order...' : 'Update Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invoice Dialog for Payment Recording */}
      <InvoiceDialog
        open={paymentDialog}
        onOpenChange={setPaymentDialog}
        invoiceId={invoiceData?.invoice_id || 0}
        userProfile={userProfile}
        user={user}
        onInvoiceUpdated={() => {
          fetchInvoiceData();
        }}
      />
    </div>
  );
};

export default EditOrderPage;
