'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Wallet, Copy, Check, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface PayoutRequest {
    payout_id: number;
    user_id: number;
    seller_name: string;
    seller_email: string;
    seller_mobile: string;
    payout_period_start: string;
    payout_period_end: string;
    total_orders: number;
    total_gross_sales: number;
    total_commission: number;
    total_net_payout: number;
    payout_method: string;
    payout_reference: string | null;
    payout_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'COMPLETED':
            return { variant: 'default' as const, label: 'Completed', icon: Check };
        case 'PROCESSING':
            return { variant: 'secondary' as const, label: 'Processing', icon: Clock };
        case 'PENDING':
            return { variant: 'outline' as const, label: 'Pending', icon: AlertCircle };
        case 'FAILED':
            return { variant: 'destructive' as const, label: 'Failed', icon: AlertCircle };
        default:
            return { variant: 'outline' as const, label: status, icon: AlertCircle };
    }
};

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
    const [processDialog, setProcessDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [copiedMethod, setCopiedMethod] = useState(false);

    const [processFormData, setProcessFormData] = useState({
        payout_status: 'PROCESSING' as 'PROCESSING' | 'COMPLETED' | 'FAILED',
        payout_reference: '',
        notes: '',
    });

    useEffect(() => {
        fetchPayouts();
    }, [filterStatus]);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus && filterStatus !== 'all') {
                params.append('status', filterStatus);
            }

            const response = await adminApi.get(`/admin/payouts?${params.toString()}`);
            setPayouts(response.data.data || []);
        } catch (error: any) {
            console.error('Error fetching payouts:', error);
            toast.error(error.response?.data?.error || 'Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    };

    const openProcessDialog = (payout: PayoutRequest) => {
        setSelectedPayout(payout);
        setProcessFormData({
            payout_status: payout.payout_status === 'PENDING' ? 'PROCESSING' : payout.payout_status,
            payout_reference: payout.payout_reference || '',
            notes: payout.notes || '',
        });
        setCopiedMethod(false);
        setProcessDialog(true);
    };

    const copyPaymentMethod = () => {
        if (selectedPayout?.payout_method) {
            navigator.clipboard.writeText(selectedPayout.payout_method);
            setCopiedMethod(true);
            toast.success('Payment details copied to clipboard');
            setTimeout(() => setCopiedMethod(false), 2000);
        }
    };

    const handleUpdatePayout = async () => {
        if (!selectedPayout) return;

        if (processFormData.payout_status === 'COMPLETED' && !processFormData.payout_reference) {
            toast.error('Please enter the transaction reference ID');
            return;
        }

        try {
            setProcessing(true);
            await adminApi.put(`/admin/payouts/${selectedPayout.payout_id}`, {
                payout_status: processFormData.payout_status,
                payout_reference: processFormData.payout_reference || null,
                notes: processFormData.notes || null,
            });

            toast.success('Payout updated successfully');
            setProcessDialog(false);
            fetchPayouts();
        } catch (error: any) {
            console.error('Error updating payout:', error);
            toast.error(error.response?.data?.error || 'Failed to update payout');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Payout Management</h1>
                        <p className="text-slate-400">Process seller payout requests</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Total Requests</p>
                                    <p className="text-2xl font-bold text-white">{payouts.length}</p>
                                </div>
                                <Wallet className="h-8 w-8 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-500">
                                        {payouts.filter(p => p.payout_status === 'PENDING').length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Processing</p>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {payouts.filter(p => p.payout_status === 'PROCESSING').length}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Completed</p>
                                    <p className="text-2xl font-bold text-green-500">
                                        {payouts.filter(p => p.payout_status === 'COMPLETED').length}
                                    </p>
                                </div>
                                <Check className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <div className="flex gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payouts Table */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Payout Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : payouts.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No payout requests found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-slate-400">ID</TableHead>
                                            <TableHead className="text-slate-400">Seller</TableHead>
                                            <TableHead className="text-slate-400">Period</TableHead>
                                            <TableHead className="text-slate-400">Orders</TableHead>
                                            <TableHead className="text-slate-400">Gross Sales</TableHead>
                                            <TableHead className="text-slate-400">Commission</TableHead>
                                            <TableHead className="text-slate-400">Net Payout</TableHead>
                                            <TableHead className="text-slate-400">Payment Method</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400">Date</TableHead>
                                            <TableHead className="text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payouts.map((payout) => {
                                            const statusInfo = getStatusBadge(payout.payout_status);
                                            const StatusIcon = statusInfo.icon;

                                            return (
                                                <TableRow key={payout.payout_id} className="border-slate-700">
                                                    <TableCell className="text-slate-300">
                                                        #{payout.payout_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-white font-medium">{payout.seller_name}</div>
                                                        <div className="text-xs text-slate-400">{payout.seller_email}</div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300 text-sm">
                                                        <div>{new Date(payout.payout_period_start).toLocaleDateString()}</div>
                                                        <div>to {new Date(payout.payout_period_end).toLocaleDateString()}</div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {payout.total_orders}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        ৳{payout.total_gross_sales.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-red-400">
                                                        -৳{payout.total_commission.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-green-400 font-semibold">
                                                        ৳{payout.total_net_payout.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300 font-mono text-sm">
                                                        {payout.payout_method}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300 text-sm">
                                                        {new Date(payout.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openProcessDialog(payout)}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            Process
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Process Payout Dialog */}
            <Dialog open={processDialog} onOpenChange={setProcessDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Process Payout #{selectedPayout?.payout_id}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Manually process seller payout via bKash/Nagad
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayout && (
                        <div className="space-y-6 py-4">
                            {/* Seller Information */}
                            <div className="bg-slate-700 p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold text-white mb-2">Seller Information</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-400">Name:</span>
                                        <span className="ml-2 text-white">{selectedPayout.seller_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Email:</span>
                                        <span className="ml-2 text-white">{selectedPayout.seller_email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Mobile:</span>
                                        <span className="ml-2 text-white">{selectedPayout.seller_mobile}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-white flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Payment Details
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-slate-700 p-3 rounded">
                                        <div>
                                            <p className="text-xs text-slate-400">Send money to:</p>
                                            <p className="text-lg font-mono font-semibold text-white">
                                                {selectedPayout.payout_method}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={copyPaymentMethod}
                                            className="border-slate-600"
                                        >
                                            {copiedMethod ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="bg-slate-700 p-3 rounded">
                                        <p className="text-xs text-slate-400">Amount to send:</p>
                                        <p className="text-2xl font-bold text-green-400">
                                            ৳{selectedPayout.total_net_payout.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Summary */}
                            <div className="bg-slate-700 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Payout Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Period:</span>
                                        <span className="text-white">
                                            {new Date(selectedPayout.payout_period_start).toLocaleDateString()} -{' '}
                                            {new Date(selectedPayout.payout_period_end).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Total Orders:</span>
                                        <span className="text-white">{selectedPayout.total_orders}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Gross Sales:</span>
                                        <span className="text-white">৳{selectedPayout.total_gross_sales.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Commission:</span>
                                        <span className="text-red-400">-৳{selectedPayout.total_commission.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-600 pt-2 font-semibold">
                                        <span className="text-white">Net Payout:</span>
                                        <span className="text-green-400">৳{selectedPayout.total_net_payout.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Process Form */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Payout Status</Label>
                                    <Select
                                        value={processFormData.payout_status}
                                        onValueChange={(value: any) =>
                                            setProcessFormData({ ...processFormData, payout_status: value })
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-700 border-slate-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROCESSING">Processing</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="FAILED">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">
                                        Transaction Reference (bKash/Nagad TrxID) *
                                    </Label>
                                    <Input
                                        value={processFormData.payout_reference}
                                        onChange={(e) =>
                                            setProcessFormData({ ...processFormData, payout_reference: e.target.value })
                                        }
                                        className="bg-slate-700 border-slate-600 font-mono"
                                        placeholder="e.g., BKH12345678"
                                    />
                                    <p className="text-xs text-slate-400">
                                        Enter the transaction ID from your bKash/Nagad payment confirmation
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Notes (Optional)</Label>
                                    <Textarea
                                        value={processFormData.notes}
                                        onChange={(e) =>
                                            setProcessFormData({ ...processFormData, notes: e.target.value })
                                        }
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="Add any notes about this payout"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
                                <p className="text-sm text-yellow-200">
                                    <strong>Instructions:</strong>
                                </p>
                                <ol className="list-decimal list-inside text-sm text-yellow-200 space-y-1 mt-2">
                                    <li>Open your bKash/Nagad app</li>
                                    <li>Send ৳{selectedPayout.total_net_payout.toLocaleString()} to the number above</li>
                                    <li>Copy the transaction reference ID</li>
                                    <li>Paste it in the field above</li>
                                    <li>Set status to "Completed"</li>
                                    <li>Click "Update Payout"</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setProcessDialog(false)}
                            className="border-slate-600"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePayout} disabled={processing}>
                            {processing ? 'Updating...' : 'Update Payout'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
