'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, FileText } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  status: string;
}

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderList({ orders, onEdit, onDelete }: OrderListProps) {
  const handleGenerateMemo = (order: Order) => {
    // Logic to generate memo from order will go here
    console.log('Generating memo for order:', order);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Customer Mobile</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.customerName}</TableCell>
            <TableCell>{order.customerMobile}</TableCell>
            <TableCell>৳{order.totalAmount}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(order)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(order.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleGenerateMemo(order)}>
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
