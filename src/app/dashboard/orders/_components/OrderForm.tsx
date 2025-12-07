'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  status: string;
}

interface OrderFormProps {
  order: Order | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function OrderForm({ order, onClose, onSaved }: OrderFormProps) {
  const [formData, setFormData] = useState({
    customerName: order?.customerName || '',
    customerMobile: order?.customerMobile || '',
    totalAmount: order?.totalAmount || '',
    status: order?.status || 'pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = order ? `/api/orders/${order.id}` : '/api/orders';
      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Order ${order ? 'updated' : 'created'} successfully`);
        onSaved();
      } else {
        toast.error(`Failed to ${order ? 'update' : 'create'} order`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${order ? 'updating' : 'creating'} the order`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Order' : 'Add New Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="customerMobile">Customer Mobile</Label>
            <Input id="customerMobile" name="customerMobile" value={formData.customerMobile} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="totalAmount">Total Amount</Label>
            <Input id="totalAmount" name="totalAmount" type="number" value={formData.totalAmount} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
