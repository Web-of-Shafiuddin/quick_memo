'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import OrderForm from './_components/OrderForm';
import OrderList from './_components/OrderList';

interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const result = await response.json();
      if (result.success) {
        setOrders(result.orders);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      toast.error('An error occurred while fetching orders');
    }
  };

  const handleFormOpen = (order: Order | null = null) => {
    setSelectedOrder(order);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderSaved = () => {
    fetchOrders();
    handleFormClose();
  };

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Button onClick={() => handleFormOpen()}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderList
            orders={orders}
            onEdit={handleFormOpen}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <OrderForm
          order={selectedOrder}
          onClose={handleFormClose}
          onSaved={handleOrderSaved}
        />
      )}
    </div>
  );
}
