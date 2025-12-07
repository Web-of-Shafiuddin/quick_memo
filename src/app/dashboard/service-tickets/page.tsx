'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import ServiceTicketForm from './_components/ServiceTicketForm';
import ServiceTicketList from './_components/ServiceTicketList';

interface ServiceTicket {
  id: string;
  customerName: string;
  customerMobile: string;
  serviceDetails: string;
  status: string;
}

export default function ServiceTicketsPage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/service-tickets');
      const result = await response.json();
      if (result.success) {
        setTickets(result.tickets);
      } else {
        toast.error('Failed to fetch service tickets');
      }
    } catch (error) {
      toast.error('An error occurred while fetching service tickets');
    }
  };

  const handleFormOpen = (ticket: ServiceTicket | null = null) => {
    setSelectedTicket(ticket);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTicket(null);
  };

  const handleTicketSaved = () => {
    fetchTickets();
    handleFormClose();
  };

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/service-tickets/${ticketId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Service ticket deleted successfully');
        fetchTickets();
      } else {
        toast.error('Failed to delete service ticket');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the service ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Ticket Management</h1>
        <Button onClick={() => handleFormOpen()}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Service Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceTicketList
            tickets={tickets}
            onEdit={handleFormOpen}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <ServiceTicketForm
          ticket={selectedTicket}
          onClose={handleFormClose}
          onSaved={handleTicketSaved}
        />
      )}
    </div>
  );
}
