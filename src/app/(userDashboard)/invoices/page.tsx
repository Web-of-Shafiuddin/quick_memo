'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FileText,
    Search,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { userService } from '@/services/userService';
import { User } from '@/types/User';
import useAuthStore from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { InvoiceDialog } from '@/components/invoice-dialog';

interface InvoiceStats {
    total_invoices: number;
    due_invoices: number;
    paid_invoices: number;
    overdue_invoices: number;
    void_invoices: number;
    partial_invoices: number;
    total_due: number;
    total_paid: number;
    total_overdue: number;
    total_balance_remaining: number;
}

interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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
    amount_paid: number;
    status: string;
    notes: string | null;
    order_status: string;
    order_source: string;
    created_at: string;
}

export default function InvoicesPage() {
    const { format: formatCurrency } = useCurrency();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState<PaginationState | null>(null);

    const { user } = useAuthStore(
        useShallow((state) => ({
            user: state.user,
        }))
    );

    useEffect(() => {
        if (user?.user_id) {
            fetchUserProfile();
        }
    }, [user]);

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [statusFilter, page]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params: { status?: string; page: number; limit: number } = {
                page,
                limit,
            };
            if (statusFilter && statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await api.get('/invoices', { params });
            setInvoices(response.data.data || []);
            setPagination(response.data.pagination || null);
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

    const fetchUserProfile = async () => {
        if (!user?.user_id) return;
        try {
            const response = await userService.getById(user.user_id.toString());
            setUserProfile(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
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

    const openInvoiceDialog = (invoice: Invoice) => {
        setSelectedInvoiceId(invoice.invoice_id);
        setViewDialog(true);
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Balance</TableHead>
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
                                            <TableCell className="text-green-600">
                                                {formatCurrency(invoice.amount_paid || 0)}
                                            </TableCell>
                                            <TableCell className={invoice.amount_paid >= invoice.total_amount ? 'text-green-600' : 'text-orange-600'}>
                                                {formatCurrency(invoice.total_amount - (invoice.amount_paid || 0))}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openInvoiceDialog(invoice)}
                                                    >
                                                        <Eye className="w-4 h-4" />
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {Math.min((page - 1) * limit + 1, pagination.total)} to {Math.min(page * limit, pagination.total)} of {pagination.total} invoices
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>
                        <span className="flex items-center px-4">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Invoice Dialog */}
            <InvoiceDialog
                open={viewDialog}
                onOpenChange={setViewDialog}
                invoiceId={selectedInvoiceId || 0}
                userProfile={userProfile}
                user={user}
            />
        </div>
    );
}
