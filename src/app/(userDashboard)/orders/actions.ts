"use server";

// Define a type for our Order and OrderItem
export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  totalAmount: number;
  createdAt: string; // Using ISO string for simplicity
};

// --- Mock Database ---
// In a real app, this would be a database.
let mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    status: "Shipped",
    items: [
      { productId: "SKU001", productName: "Wireless Mouse", quantity: 2, price: 25.00 },
      { productId: "SKU002", productName: "Mechanical Keyboard", quantity: 1, price: 120.00 },
    ],
    totalAmount: 170.00,
    createdAt: new Date('2023-10-26').toISOString(),
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    status: "Processing",
    items: [
      { productId: "SKU004", productName: "4K Monitor", quantity: 1, price: 450.00 },
    ],
    totalAmount: 450.00,
    createdAt: new Date('2023-10-27').toISOString(),
  },
];

// --- Server Action for GETTING all orders ---
export async function getOrders(): Promise<Order[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrders;
}

// --- Server Action for GETTING a single order by ID ---
export async function getOrderById(id: string): Promise<Order | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrders.find(order => order.id === id) || null;
}

// --- Server Action for CREATING an order ---
export async function createOrder(prevState: any, formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const status = formData.get('status') as Order['status'];
  
  // In a real app, you'd parse items from the form. For simplicity, we'll add a dummy item.
  const items: OrderItem[] = [{ productId: "NEW", productName: "New Product", quantity: 1, price: 100.00 }];
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const newOrder: Order = {
    id: `ORD${String(mockOrders.length + 1).padStart(3, '0')}`,
    customerName,
    customerEmail,
    status,
    items,
    totalAmount,
    createdAt: new Date().toISOString(),
  };

  mockOrders.push(newOrder);
  console.log("New order created:", newOrder);

  return { message: `Order ${newOrder.id} created successfully!`, redirect: "/orders" };
}

// --- Server Action for UPDATING an order ---
export async function updateOrder(prevState: any, formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const id = formData.get("id") as string;
  const orderIndex = mockOrders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return { error: `Order with ID ${id} not found.` };
  }

  const updatedOrder: Order = {
    ...mockOrders[orderIndex],
    customerName: formData.get("customerName") as string,
    customerEmail: formData.get("customerEmail") as string,
    status: formData.get("status") as Order['status'],
    // Note: In a real app, you'd also update items and totalAmount here.
  };

  mockOrders[orderIndex] = updatedOrder;
  console.log("Order updated:", updatedOrder);

  return { message: `Order ${updatedOrder.id} updated successfully!`, redirect: "/orders" };
}