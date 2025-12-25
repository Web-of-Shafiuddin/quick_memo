'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    Search,
    Eye,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Plus,
    Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface Invoice {
    invoice_id: number;
    invoice_number: string;
    transaction_id: number;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_mobile: string;
    customer_address: string;
    issue_date: string;
    due_date: string | null;
    total_amount: number;
    status: string;
    notes: string | null;
    order_status: string;
    order_source: string;
    created_at: string;
}

interface InvoiceStats {
    total_invoices: number;
    due_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    void_invoices: number;
    total_due: number;
    total_paid: number;
    total_overdue: number;
}

interface InvoiceItem {
    order_item_id: number;
    name_snapshot: string;
    quantity: number;
    unit_price: number;
    item_discount: number;
    subtotal: number;
    product_sku: string;
}

interface InvoiceDetail extends Invoice {
    items: InvoiceItem[];
    shipping_amount: number;
    tax_amount: number;
    payment_method_name: string;
}

export default function InvoicesPage() {
    const { format: formatCurrency } = useCurrency();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = '/invoices';
            if (statusFilter && statusFilter !== 'all') {
                url += `?status=${statusFilter}`;
            }
            const response = await api.get(url);
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/invoices/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching invoice stats:', error);
        }
    };

    const fetchInvoiceDetails = async (invoiceId: number) => {
        try {
            const response = await api.get(`/invoices/${invoiceId}`);
            setSelectedInvoice(response.data.data);
            setViewDialog(true);
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            toast.error('Failed to fetch invoice details');
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedInvoice || !newStatus) return;

        try {
            setProcessing(true);
            await api.patch(`/invoices/${selectedInvoice.invoice_id}/status`, {
                status: newStatus,
            });
            toast.success('Invoice status updated');
            setStatusDialog(false);
            fetchInvoices();
            fetchStats();
        } catch (error: any) {
            console.error('Error updating invoice status:', error);
            toast.error(error.response?.data?.error || 'Failed to update status');
        } finally {
            setProcessing(false);
        }
    };

    const openStatusDialog = (invoice: Invoice) => {
        setSelectedInvoice(invoice as InvoiceDetail);
        setNewStatus(invoice.status);
        setStatusDialog(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DUE':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Due</Badge>;
            case 'PAID':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
            case 'OVERDUE':
                return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
            case 'VOID':
                return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Void</Badge>;
            case 'PARTIAL':
                return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const printInvoice = () => {
        if (!selectedInvoice) return;
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage your invoices and track payments</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total_invoices}</div>
                            <p className="text-sm text-muted-foreground">Total Invoices</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.total_due)}</div>
                            <p className="text-sm text-muted-foreground">{stats.due_invoices} Due</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid)}</div>
                            <p className="text-sm text-muted-foreground">{stats.paid_invoices} Paid</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_overdue)}</div>
                            <p className="text-sm text-muted-foreground">{stats.overdue_invoices} Overdue</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by invoice number or customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="DUE">Due</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                                <SelectItem value="VOID">Void</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice List</CardTitle>
                    <CardDescription>
                        {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No invoices found</p>
                            <p className="text-sm mt-2">Invoices are automatically created when orders are placed</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Issue Date</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((invoice) => (
                                        <TableRow key={invoice.invoice_id}>
                                            <TableCell className="font-mono font-medium">
                                                {invoice.invoice_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{invoice.customer_name}</div>
                                                    {invoice.customer_email && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {invoice.customer_email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                                            <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(invoice.total_amount)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => fetchInvoiceDetails(invoice.invoice_id)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openStatusDialog(invoice)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Invoice Dialog */}
            <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Invoice {selectedInvoice?.invoice_number}</span>
                            {selectedInvoice && getStatusBadge(selectedInvoice.status)}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <div className="space-y-6" id="invoice-print">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Bill To:</h4>
                                    <p className="font-medium">{selectedInvoice.customer_name}</p>
                                    {selectedInvoice.customer_email && (
                                        <p className="text-sm text-muted-foreground">{selectedInvoice.customer_email}</p>
                                    )}
                                    {selectedInvoice.customer_mobile && (
                                        <p className="text-sm text-muted-foreground">{selectedInvoice.customer_mobile}</p>
                                    )}
                                    {selectedInvoice.customer_address && (
                                        <p className="text-sm text-muted-foreground">{selectedInvoice.customer_address}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Issue Date: </span>
                                        {formatDate(selectedInvoice.issue_date)}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Due Date: </span>
                                        {formatDate(selectedInvoice.due_date)}
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Order #: </span>
                                        {selectedInvoice.transaction_id}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Discount</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedInvoice.items?.map((item) => (
                                        <TableRow key={item.order_item_id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.name_snapshot}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        SKU: {item.product_sku}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">
                                                {item.item_discount > 0 ? `-${formatCurrency(item.item_discount)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    {selectedInvoice.shipping_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>{formatCurrency(selectedInvoice.shipping_amount)}</span>
                                        </div>
                                    )}
                                    {selectedInvoice.tax_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Tax:</span>
                                            <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedInvoice.notes && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Notes:</h4>
                                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={printInvoice}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Invoice Status</DialogTitle>
                        <DialogDescription>
                            Change the status of invoice {selectedInvoice?.invoice_number}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DUE">Due</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                                <SelectItem value="PARTIAL">Partial Payment</SelectItem>
                                <SelectItem value="VOID">Void</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusUpdate} disabled={processing}>
                            {processing ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
