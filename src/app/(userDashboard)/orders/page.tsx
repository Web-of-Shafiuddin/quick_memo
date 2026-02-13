'use client'
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { orderService, Order, OrderListParams } from "@/services/orderService";
import { userService } from "@/services/userService";
import { Plus, Eye, Edit, Printer, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import OrderMemo from "@/components/order-memo";
import { InvoiceDialog } from "@/components/invoice-dialog";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import { User } from "@/types/User";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: Order['order_status']) => {
  switch (status) {
    case "DELIVERED":
      return "default"; // Green
    case "SHIPPED":
    case "CONFIRMED":
      return "secondary"; // Blue/Yellow
    case "PENDING":
      return "outline"; // Gray
    case "CANCELLED":
    case "RETURNED":
      return "destructive"; // Red
    default:
      return "outline";
  }
};

// Helper function to get channel badge display
const getChannelBadge = (channel?: string) => {
  switch (channel) {
    case "MARKETPLACE":
      return { label: "Marketplace", variant: "default" as const };
    case "DIRECT_SHOP":
    default:
      return { label: "Direct Shop", variant: "outline" as const };
  }
};

const OrdersPage = () => {
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );
  const { format: formatPrice, symbol } = useCurrency();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [sortBy, setSortBy] = useState("order_date");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterChannel, setFilterChannel] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isMemoDialogOpen, setIsMemoDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<{
    order_status: Order['order_status'];
    shipping_amount: number;
    tax_amount: number;
  }>({
    order_status: 'PENDING',
    shipping_amount: 0,
    tax_amount: 0,
  });

  useEffect(() => {
    if (user?.user_id) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, filterChannel, sortBy, sortOrder]);

  const fetchUserProfile = async () => {
    if (!user?.user_id) return;
    try {
      const response = await userService.getById(user.user_id.toString());
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: OrderListParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...(filterStatus && filterStatus !== "all" && { status: filterStatus }),
        ...(filterChannel && filterChannel !== "all" && { order_channel: filterChannel }),
      };
      const response = await orderService.getAll(params);
      setOrders(response.data);
      setPagination(response.pagination || null);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      alert(error.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleChannelFilter = (channel: string) => {
    setFilterChannel(channel);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "ASC" | "DESC");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await orderService.getById(orderId);
      setSelectedOrder(response.data);
      setIsDetailDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      alert(error.response?.data?.error || 'Failed to fetch order details');
    }
  };

  const handleQuickEdit = (order: Order) => {
    setEditingOrder(order);
    setEditFormData({
      order_status: order.order_status,
      shipping_amount: parseFloat(order.shipping_amount.toString()),
      tax_amount: parseFloat(order.tax_amount.toString()),
    });
    setIsEditDialogOpen(true);
  };

  const handlePrintMemo = async (orderId: number) => {
    try {
      const response = await orderService.getById(orderId);
      setSelectedOrder(response.data);
      setIsMemoDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching order for memo:', error);
      alert(error.response?.data?.error || 'Failed to load memo');
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      await orderService.update(editingOrder.transaction_id, editFormData);
      alert('Order updated successfully');
      setIsEditDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.error || 'Failed to update order');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your orders and transactions</p>
        </div>
        <Link href="/orders/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Order
          </Button>
        </Link>
      </div>

      {/* Filter by status, channel, and sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={filterStatus || "all"} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterChannel || "all"} onValueChange={handleChannelFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="DIRECT_SHOP">Direct Shop</SelectItem>
            <SelectItem value="MARKETPLACE">Marketplace</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_date">Date</SelectItem>
              <SelectItem value="total_amount">Total</SelectItem>
              <SelectItem value="order_status">Status</SelectItem>
              <SelectItem value="customer_name">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Desc</SelectItem>
              <SelectItem value="ASC">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableCaption>A list of all your orders with customer and payment details.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Balance Due</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={15} className="text-center text-muted-foreground">
                No orders found. Create your first order to get started.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.transaction_id}>
                <TableCell className="font-medium">#{order.transaction_id}</TableCell>
                <TableCell className="font-mono text-sm">
                  {order.invoice_number ? (
                    <span className="font-medium">{order.invoice_number}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{order.customer_name || '-'}</TableCell>
                <TableCell>{order.customer_mobile || '-'}</TableCell>
                <TableCell>{order.customer_email || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{order.customer_address || '-'}</TableCell>
                <TableCell>{order.payment_method_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getChannelBadge(order.order_channel).variant}>
                    {getChannelBadge(order.order_channel).label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatPrice(parseFloat(order.total_amount.toString()))}</TableCell>
                <TableCell className="text-right">
                  {order.commission_applied && order.commission_amount ? (
                    <span className="text-red-600 font-medium">
                      -{formatPrice(parseFloat(order.commission_amount.toString()))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.invoice_status === 'PAID' ? (
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  ) : order.invoice_status === 'PARTIAL' ? (
                    <Badge className="bg-blue-100 text-blue-800">Partial</Badge>
                  ) : order.invoice_status === 'DUE' ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Due</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={`text-right ${(order.balance_remaining || 0) > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                  {order.balance_remaining !== undefined ? formatPrice(order.balance_remaining) : '-'}
                </TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order.transaction_id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.invoice_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (order.invoice_id) {
                            setSelectedInvoiceId(order.invoice_id);
                            setInvoiceDialogOpen(true);
                          } else {
                            toast.error('Invoice not yet created for this order');
                          }
                        }}
                        title="View Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintMemo(order.transaction_id)}
                      title="Print/Download Memo"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickEdit(order)}
                      title="Quick Edit"
                    >
                      Quick
                    </Button>
                    <Link href={`/orders/edit/${order.transaction_id}`}>
                      <Button
                        variant="default"
                        size="sm"
                        title="Full Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.transaction_id}</DialogTitle>
            <DialogDescription>
              Complete order information including customer details and items
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedOrder.customer_name}
                  </div>
                  <div>
                    <span className="font-medium">Mobile:</span> {selectedOrder.customer_mobile || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedOrder.customer_email || '-'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Address:</span> {selectedOrder.customer_address || '-'}
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Order Date:</span> {new Date(selectedOrder.order_date).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Source:</span> {selectedOrder.order_source}
                  </div>
                  <div>
                    <span className="font-medium">Channel:</span>{' '}
                    <Badge variant={getChannelBadge(selectedOrder.order_channel).variant}>
                      {getChannelBadge(selectedOrder.order_channel).label}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Payment Method:</span> {selectedOrder.payment_method_name}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <Badge variant={getStatusBadgeVariant(selectedOrder.order_status)}>
                      {selectedOrder.order_status}
                    </Badge>
                  </div>
                  {selectedOrder.commission_applied && selectedOrder.commission_amount && (
                    <div>
                      <span className="font-medium">Commission:</span>{' '}
                      <span className="text-red-600 font-semibold">
                        -{formatPrice(parseFloat(selectedOrder.commission_amount.toString()))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
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
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.order_item_id}>
                        <TableCell>{item.name_snapshot}</TableCell>
                        <TableCell>{item.product_sku || '-'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(parseFloat(item.unit_price.toString()))}</TableCell>
                        <TableCell className="text-right">{formatPrice(parseFloat(item.item_discount.toString()))}</TableCell>
                        <TableCell className="text-right">{formatPrice(parseFloat(item.subtotal.toString()))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Shipping Amount:</span>
                    <span>{formatPrice(parseFloat(selectedOrder.shipping_amount.toString()))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>{formatPrice(parseFloat(selectedOrder.tax_amount.toString()))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>{formatPrice(parseFloat(selectedOrder.total_amount.toString()))}</span>
                  </div>
                  {selectedOrder.commission_applied && selectedOrder.commission_amount && (
                    <>
                      <div className="flex justify-between text-red-600">
                        <span>Platform Commission:</span>
                        <span>-{formatPrice(parseFloat(selectedOrder.commission_amount.toString()))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-green-600 border-t pt-2">
                        <span>Net Earnings:</span>
                        <span>
                          {formatPrice(
                            parseFloat(selectedOrder.total_amount.toString()) -
                            parseFloat(selectedOrder.commission_amount.toString())
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Edit Order - #{editingOrder?.transaction_id}</DialogTitle>
            <DialogDescription>
              Update order status, shipping amount, and tax amount
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order_status">Order Status</Label>
                <Select
                  value={editFormData.order_status}
                  onValueChange={(value) => setEditFormData({...editFormData, order_status: value as Order['order_status']})}
                >
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
                <Label htmlFor="shipping_amount">{`Shipping Amount (${symbol})`}</Label>
                <Input
                  id="shipping_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.shipping_amount}
                  onChange={(e) => setEditFormData({...editFormData, shipping_amount: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_amount">{`Tax Amount (${symbol})`}</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.tax_amount}
                  onChange={(e) => setEditFormData({...editFormData, tax_amount: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p><strong>Note:</strong> Total amount will be automatically recalculated based on order items, shipping, and tax.</p>
                <p className="mt-2">For more detailed edits, click the <strong>Edit</strong> button to go to the full edit page.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder}>
              Update Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print/Download Memo Dialog */}
      <Dialog open={isMemoDialogOpen} onOpenChange={setIsMemoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Memo/Invoice - #{selectedOrder?.transaction_id}</DialogTitle>
            <DialogDescription>
              Print or download the order memo as PDF
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <OrderMemo
              order={selectedOrder}
              shopInfo={{
                shopName: userProfile?.shop_name || user?.name || "Your Shop Name",
                ownerName: userProfile?.shop_owner_name || user?.name || "Owner Name",
                mobile: userProfile?.shop_mobile || user?.mobile || "01XXXXXXXXX",
                email: userProfile?.shop_email || user?.email,
                address: userProfile?.shop_address || undefined
              }}
              formatPrice={formatPrice}
            />
          )}
        </DialogContent>
      </Dialog>

      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoiceId={selectedInvoiceId || 0}
        userProfile={userProfile}
        user={user}
        onInvoiceUpdated={() => {
          fetchOrders();
        }}
      />
    </div>
  );
};

export default OrdersPage;