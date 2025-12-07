'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ServiceTicket {
  id: string;
  customerName: string;
  customerMobile: string;
  serviceDetails: string;
  status: string;
}

interface ServiceTicketFormProps {
  ticket: ServiceTicket | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ServiceTicketForm({ ticket, onClose, onSaved }: ServiceTicketFormProps) {
  const [formData, setFormData] = useState({
    customerName: ticket?.customerName || '',
    customerMobile: ticket?.customerMobile || '',
    serviceDetails: ticket?.serviceDetails || '',
    status: ticket?.status || 'pending',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = ticket ? `/api/service-tickets/${ticket.id}` : '/api/service-tickets';
      const method = ticket ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Service ticket ${ticket ? 'updated' : 'created'} successfully`);
        onSaved();
      } else {
        toast.error(`Failed to ${ticket ? 'update' : 'create'} service ticket`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${ticket ? 'updating' : 'creating'} the service ticket`);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ticket ? 'Edit Service Ticket' : 'Add New Service Ticket'}</DialogTitle>
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
            <Label htmlFor="serviceDetails">Service Details</Label>
            <Input id="serviceDetails" name="serviceDetails" value={formData.serviceDetails} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_parts">Waiting for Parts</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
