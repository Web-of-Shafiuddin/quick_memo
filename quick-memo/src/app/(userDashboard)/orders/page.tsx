import { getOrders, type Order } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: Order['status']) => {
  switch (status) {
    case "Delivered":
      return "default"; // Green
    case "Shipped":
    case "Processing":
      return "secondary"; // Blue/Yellow
    case "Pending":
      return "outline"; // Gray
    case "Cancelled":
      return "destructive"; // Red
    default:
      return "outline";
  }
};

const OrdersPage = async () => {
  const orders = await getOrders();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Link href="/orders/add">
          <Button>Add New Order</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.customerEmail}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Link href={`/orders/edit/${order.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersPage;