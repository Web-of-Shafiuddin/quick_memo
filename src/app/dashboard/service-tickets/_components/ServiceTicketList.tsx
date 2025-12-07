'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface ServiceTicket {
  id: string;
  customerName: string;
  customerMobile: string;
  serviceDetails: string;
  status: string;
}

interface ServiceTicketListProps {
  tickets: ServiceTicket[];
  onEdit: (ticket: ServiceTicket) => void;
  onDelete: (ticketId: string) => void;
}

export default function ServiceTicketList({ tickets, onEdit, onDelete }: ServiceTicketListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Customer Mobile</TableHead>
          <TableHead>Service Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>{ticket.customerName}</TableCell>
            <TableCell>{ticket.customerMobile}</TableCell>
            <TableCell>{ticket.serviceDetails}</TableCell>
            <TableCell>{ticket.status}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(ticket)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(ticket.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
