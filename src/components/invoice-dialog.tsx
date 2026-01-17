'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    Loader2,
    Eye,
    ExternalLink,
    Plus,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { downloadInvoicePdf } from '@/components/invoice-pdf';
import { User } from '@/types/User';

interface InvoiceItem {
    order_item_id: number;
    name_snapshot: string;
    quantity: number;
    unit_price: number;
    item_discount: number;
    subtotal: number;
    product_sku: string;
}

interface PaymentRecord {
    payment_id: number;
    invoice_id: number;
    amount_paid: number;
    payment_date: string;
    payment_method: string | null;
    reference_number: string | null;
    notes: string | null;
}

interface PaymentMethod {
    payment_method_id: number;
    name: string;
    is_active: boolean;
}

interface InvoiceDetail {
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
    amount_paid: number;
    status: string;
    notes: string | null;
    items: InvoiceItem[];
    shipping_amount: number;
    tax_amount: number;
    payment_method_name: string;
    balance_remaining: number;
}

interface InvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoiceId: number;
    userProfile: User | null;
    user: User | null;
}

export const InvoiceDialog = ({ open, onOpenChange, invoiceId, userProfile, user }: InvoiceDialogProps) => {
    const { format: formatCurrency } = useCurrency();
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && invoiceId) {
            fetchInvoiceDetails();
            fetchPaymentMethods();
        }
    }, [open, invoiceId]);

    const fetchInvoiceDetails = async () => {
        try {
            const response = await api.get(`/invoices/${invoiceId}`);
            setSelectedInvoice(response.data.data);
            fetchPayments(invoiceId);
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            toast.error('Failed to fetch invoice details');
        }
    };

    const fetchPayments = async (id: number) => {
        try {
            const response = await api.get(`/payments/invoice/${id}`);
            setPayments(response.data.data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get('/payment-methods');
            setPaymentMethods(response.data.data || []);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedInvoice || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        try {
            setProcessing(true);
            await api.post('/payments', {
                invoice_id: selectedInvoice.invoice_id,
                amount_paid: parseFloat(paymentAmount),
                payment_method: paymentMethod || null,
                reference_number: paymentReference || null,
                notes: paymentNotes || null,
            });
            toast.success('Payment recorded successfully');
            setPaymentDialog(false);
            if (selectedInvoice) {
                fetchInvoiceDetails();
            }
        } catch (error: any) {
            console.error('Error recording payment:', error);
            toast.error(error.response?.data?.error || 'Failed to record payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeletePayment = async (paymentId: number) => {
        if (!confirm('Are you sure you want to delete this payment?')) return;

        try {
            await api.delete(`/payments/${paymentId}`);
            toast.success('Payment deleted successfully');
            if (selectedInvoice) {
                fetchPayments(selectedInvoice.invoice_id);
                fetchInvoiceDetails();
            }
        } catch (error: any) {
            console.error('Error deleting payment:', error);
            toast.error(error.response?.data?.error || 'Failed to delete payment');
        }
    };

    const openPaymentDialog = () => {
        setPaymentAmount('');
        setPaymentMethod('');
        setPaymentReference('');
        setPaymentNotes('');
        setPaymentDialog(true);
    };

    const printInvoice = async () => {
        if (!selectedInvoice) return;
        setDownloadingPdf(true);
        try {
            await downloadInvoicePdf(
                selectedInvoice,
                {
                    shopName: userProfile?.shop_name || user?.name || "Your Shop Name",
                    ownerName: userProfile?.shop_owner_name || user?.name || "Owner Name",
                    mobile: userProfile?.shop_mobile || user?.mobile || "01XXXXXXXXX",
                    email: userProfile?.shop_email || user?.email,
                    address: userProfile?.shop_address || undefined
                },
                payments,
                formatCurrency
            );
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (!selectedInvoice) return null;

    return (
        <>
            {/* Invoice Detail Dialog */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 border-b">
                        <div className="flex items-center justify-between w-full">
                            <DialogTitle className="text-xl">
                                Invoice {selectedInvoice.invoice_number}
                            </DialogTitle>
                            {getStatusBadge(selectedInvoice.status)}
                        </div>
                    </DialogHeader>

                    <div className="p-4 md:p-6 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-lg md:text-xl font-bold">{formatCurrency(selectedInvoice.total_amount)}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Paid Amount</p>
                                <p className="text-lg md:text-xl font-bold text-green-600">{formatCurrency(selectedInvoice.amount_paid || 0)}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground">Balance Remaining</p>
                                <p className={`text-lg md:text-xl font-bold ${selectedInvoice.balance_remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {formatCurrency(selectedInvoice.balance_remaining)}
                                </p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="text-right md:text-right">
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
                        <div className="overflow-x-auto">
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
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-64 space-y-2">
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
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <h4 className="font-semibold mb-2">Notes:</h4>
                                <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                            </div>
                        )}

                        {/* Payment History */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold">Payment History</h4>
                                {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'VOID' && (
                                    <Button size="sm" onClick={openPaymentDialog}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Record Payment
                                    </Button>
                                )}
                            </div>
                            {payments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Method</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Notes</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.payment_id}>
                                                    <TableCell>
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-green-600">
                                                        {formatCurrency(payment.amount_paid)}
                                                    </TableCell>
                                                    <TableCell>{payment.payment_method || '-'}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{payment.reference_number || '-'}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{payment.notes || '-'}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeletePayment(payment.payment_id)}
                                                        >
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t flex flex-col md:flex-row gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full md:w-auto">
                            Close
                        </Button>
                        {selectedInvoice?.transaction_id && (
                            <Button variant="outline" asChild className="w-full md:w-auto">
                                <a href={`/orders/edit/${selectedInvoice.transaction_id}`}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Order
                                </a>
                            </Button>
                        )}
                        <Button onClick={printInvoice} disabled={downloadingPdf} className="w-full md:w-auto">
                            {downloadingPdf ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            {downloadingPdf ? 'Generating...' : 'Download PDF'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Record a payment for invoice {selectedInvoice?.invoice_number}
                            <br />
                            <span className="text-orange-600">Balance remaining: {selectedInvoice ? formatCurrency(selectedInvoice.balance_remaining) : '-'}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Enter amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Method</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((pm) => (
                                        <SelectItem key={pm.payment_method_id} value={pm.name}>
                                            {pm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reference Number</label>
                            <input
                                placeholder="e.g., Transaction ID, Cheque number"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                                className="w-full min-h-[80px] p-2 border rounded-md"
                                placeholder="Additional notes..."
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRecordPayment} disabled={processing}>
                            {processing ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InvoiceDialog;
