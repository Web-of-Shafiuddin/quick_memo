'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, CreditCard, Users, TrendingUp, Search } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface SubscriptionRequest {
    request_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    plan_id: number;
    plan_name: string;
    payment_method: string;
    transaction_id: string;
    amount: number;
    phone_number: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    total_revenue: number;
}

export default function AdminSubscriptionsPage() {
    const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog states
    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
    const [durationMonths, setDurationMonths] = useState('1');
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsRes, statsRes] = await Promise.all([
                adminApi.get(`/subscriptions/admin/requests?status=${statusFilter}`),
                adminApi.get('/subscriptions/admin/stats'),
            ]);

            setRequests(requestsRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch subscription requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            await adminApi.post(`/subscriptions/admin/requests/${selectedRequest.request_id}/approve`, {
                duration_months: parseInt(durationMonths),
                admin_notes: adminNotes || 'Approved',
            });

            toast.success('Request approved successfully');
            setApproveDialog(false);
            setSelectedRequest(null);
            setDurationMonths('1');
            setAdminNotes('');
            fetchData();
        } catch (error: any) {
            console.error('Error approving request:', error);
            toast.error(error.response?.data?.error || 'Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        if (!adminNotes.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setProcessing(true);
            await adminApi.post(`/subscriptions/admin/requests/${selectedRequest.request_id}/reject`, {
                admin_notes: adminNotes,
            });

            toast.success('Request rejected');
            setRejectDialog(false);
            setSelectedRequest(null);
            setAdminNotes('');
            fetchData();
        } catch (error: any) {
            console.error('Error rejecting request:', error);
            toast.error(error.response?.data?.error || 'Failed to reject request');
        } finally {
            setProcessing(false);
        }
    };

    const openApproveDialog = (request: SubscriptionRequest) => {
        setSelectedRequest(request);
        setDurationMonths('1');
        setAdminNotes('');
        setApproveDialog(true);
    };

    const openRejectDialog = (request: SubscriptionRequest) => {
        setSelectedRequest(request);
        setAdminNotes('');
        setRejectDialog(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'APPROVED':
                return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredRequests = requests.filter(req =>
        req.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Subscription Requests</h1>
                    <p className="text-slate-400">Manage user subscription payment requests</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.pending}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Approved</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.approved}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Rejected</CardTitle>
                                <XCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{stats.rejected}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">${stats.total_revenue}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, email, or transaction ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="ALL">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No requests found</div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRequests.map((request) => (
                                    <div
                                        key={request.request_id}
                                        className="p-4 bg-slate-700 rounded-lg"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{request.user_name}</span>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {request.user_email}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <span className="text-slate-300">
                                                        <CreditCard className="inline w-4 h-4 mr-1" />
                                                        {request.plan_name}
                                                    </span>
                                                    <span className="text-slate-300">
                                                        {request.payment_method}
                                                    </span>
                                                    <span className="text-slate-300 font-mono">
                                                        TxID: {request.transaction_id}
                                                    </span>
                                                    <span className="text-green-400 font-semibold">
                                                        ${request.amount}
                                                    </span>
                                                </div>
                                                {request.phone_number && (
                                                    <div className="text-sm text-slate-400">
                                                        Phone: {request.phone_number}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500">
                                                    Submitted: {formatDate(request.created_at)}
                                                </div>
                                                {request.admin_notes && (
                                                    <div className="text-sm text-slate-300 bg-slate-600 p-2 rounded mt-2">
                                                        Admin Notes: {request.admin_notes}
                                                    </div>
                                                )}
                                            </div>

                                            {request.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => openApproveDialog(request)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => openRejectDialog(request)}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Approve Subscription Request</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Confirm payment and activate subscription for {selectedRequest?.user_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Subscription Duration</Label>
                            <Select value={durationMonths} onValueChange={setDurationMonths}>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Month</SelectItem>
                                    <SelectItem value="3">3 Months</SelectItem>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">12 Months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Admin Notes (optional)</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes..."
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? 'Processing...' : 'Approve & Activate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Reject Subscription Request</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Reject payment request from {selectedRequest?.user_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Reason for Rejection *</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="e.g., Transaction ID not found, Invalid payment amount..."
                                className="bg-slate-700 border-slate-600"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleReject} disabled={processing} variant="destructive">
                            {processing ? 'Processing...' : 'Reject Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
