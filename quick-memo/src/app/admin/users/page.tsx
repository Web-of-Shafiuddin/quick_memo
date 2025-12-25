'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Eye,
    Search,
    Crown,
    Edit,
    Trash2,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface User {
    user_id: number;
    name: string;
    email: string;
    mobile: string | null;
    shop_name: string | null;
    subscription_status: string | null;
    plan_name: string | null;
    subscription_end: string | null;
    created_at: string;
}

interface UserDetails {
    user_id: number;
    name: string;
    email: string;
    mobile: string | null;
    shop_name: string | null;
    shop_owner_name: string | null;
    shop_mobile: string | null;
    shop_email: string | null;
    shop_address: string | null;
    created_at: string;
    subscription: {
        subscription_id: number;
        plan_name: string;
        status: string;
        start_date: string;
        end_date: string;
        monthly_price: number;
    } | null;
    subscription_requests: any[];
    stats: {
        total_products: number;
        total_customers: number;
        total_orders: number;
        total_categories: number;
    };
}

interface Plan {
    plan_id: number;
    name: string;
    monthly_price: number;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Dialog states
    const [viewDialog, setViewDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [subscriptionDialog, setSubscriptionDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [processing, setProcessing] = useState(false);

    // Edit form
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        mobile: '',
        shop_name: '',
    });

    // Subscription form
    const [subForm, setSubForm] = useState({
        plan_id: '',
        duration_months: '1',
    });

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await adminApi.get(`/admin/users?${params}`);
            setUsers(response.data.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await adminApi.get('/subscriptions/plans');
            setPlans(response.data.data || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const fetchUserDetails = async (userId: number) => {
        try {
            const response = await adminApi.get(`/admin/users/${userId}`);
            setSelectedUser(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to fetch user details');
            return null;
        }
    };

    const handleViewUser = async (userId: number) => {
        const user = await fetchUserDetails(userId);
        if (user) {
            setViewDialog(true);
        }
    };

    const handleEditUser = async (userId: number) => {
        const user = await fetchUserDetails(userId);
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                shop_name: user.shop_name || '',
            });
            setEditDialog(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedUser) return;

        try {
            setProcessing(true);
            await adminApi.put(`/admin/users/${selectedUser.user_id}`, editForm);
            toast.success('User updated successfully');
            setEditDialog(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast.error(error.response?.data?.error || 'Failed to update user');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteClick = (userId: number) => {
        setSelectedUserId(userId);
        setDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUserId) return;

        try {
            setProcessing(true);
            await adminApi.delete(`/admin/users/${selectedUserId}`);
            toast.success('User deleted successfully');
            setDeleteDialog(false);
            setSelectedUserId(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.error || 'Failed to delete user');
        } finally {
            setProcessing(false);
        }
    };

    const handleManageSubscription = async (userId: number) => {
        const user = await fetchUserDetails(userId);
        if (user) {
            setSubForm({
                plan_id: '',
                duration_months: '1',
            });
            setSubscriptionDialog(true);
        }
    };

    const handleSetSubscription = async () => {
        if (!selectedUser || !subForm.plan_id) {
            toast.error('Please select a plan');
            return;
        }

        try {
            setProcessing(true);
            await adminApi.post(`/admin/users/${selectedUser.user_id}/subscription`, {
                plan_id: parseInt(subForm.plan_id),
                duration_months: parseInt(subForm.duration_months),
            });
            toast.success('Subscription updated successfully');
            setSubscriptionDialog(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error setting subscription:', error);
            toast.error(error.response?.data?.error || 'Failed to set subscription');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!selectedUser) return;

        try {
            setProcessing(true);
            await adminApi.delete(`/admin/users/${selectedUser.user_id}/subscription`);
            toast.success('Subscription canceled');
            setSubscriptionDialog(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error canceling subscription:', error);
            toast.error(error.response?.data?.error || 'Failed to cancel subscription');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline" className="border-slate-600 text-slate-400">No Plan</Badge>;

        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-600">Active</Badge>;
            case 'EXPIRED':
                return <Badge className="bg-gray-600">Expired</Badge>;
            case 'CANCELED':
                return <Badge className="bg-red-600">Canceled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">View and manage all registered users</p>
                </div>

                {/* Search */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">
                            Users {pagination && <span className="text-slate-400 font-normal">({pagination.total} total)</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No users found</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-slate-400">User</TableHead>
                                                <TableHead className="text-slate-400">Shop</TableHead>
                                                <TableHead className="text-slate-400">Plan</TableHead>
                                                <TableHead className="text-slate-400">Status</TableHead>
                                                <TableHead className="text-slate-400">Joined</TableHead>
                                                <TableHead className="text-slate-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.user_id} className="border-slate-700">
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-white">{user.name}</div>
                                                            <div className="text-sm text-slate-400">{user.email}</div>
                                                            {user.mobile && (
                                                                <div className="text-sm text-slate-500">{user.mobile}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {user.shop_name || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {user.plan_name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(user.subscription_status)}
                                                    </TableCell>
                                                    <TableCell className="text-slate-400">
                                                        {formatDate(user.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                                onClick={() => handleViewUser(user.user_id)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                                onClick={() => handleEditUser(user.user_id)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-yellow-500 hover:text-yellow-400 hover:bg-slate-700"
                                                                onClick={() => handleManageSubscription(user.user_id)}
                                                            >
                                                                <Crown className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-500 hover:text-red-400 hover:bg-slate-700"
                                                                onClick={() => handleDeleteClick(user.user_id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-slate-400">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-slate-600"
                                                disabled={page === 1}
                                                onClick={() => setPage(page - 1)}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-slate-600"
                                                disabled={page === pagination.totalPages}
                                                onClick={() => setPage(page + 1)}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View User Dialog */}
            <Dialog open={viewDialog} onOpenChange={setViewDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Name:</span>
                                        <span className="ml-2 text-white">{selectedUser.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Email:</span>
                                        <span className="ml-2 text-white">{selectedUser.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Mobile:</span>
                                        <span className="ml-2 text-white">{selectedUser.mobile || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Joined:</span>
                                        <span className="ml-2 text-white">{formatDate(selectedUser.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Shop Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Shop Name:</span>
                                        <span className="ml-2 text-white">{selectedUser.shop_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Owner Name:</span>
                                        <span className="ml-2 text-white">{selectedUser.shop_owner_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Shop Mobile:</span>
                                        <span className="ml-2 text-white">{selectedUser.shop_mobile || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Shop Email:</span>
                                        <span className="ml-2 text-white">{selectedUser.shop_email || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-400">Address:</span>
                                        <span className="ml-2 text-white">{selectedUser.shop_address || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Info */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Subscription</h3>
                                {selectedUser.subscription ? (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-400">Plan:</span>
                                            <span className="ml-2 text-white">{selectedUser.subscription.plan_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Status:</span>
                                            <span className="ml-2">{getStatusBadge(selectedUser.subscription.status)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Start Date:</span>
                                            <span className="ml-2 text-white">{formatDate(selectedUser.subscription.start_date)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">End Date:</span>
                                            <span className="ml-2 text-white">{formatDate(selectedUser.subscription.end_date)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-400">No active subscription</p>
                                )}
                            </div>

                            {/* Stats */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Usage Statistics</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-slate-700 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-white">{selectedUser.stats.total_categories}</div>
                                        <div className="text-xs text-slate-400">Categories</div>
                                    </div>
                                    <div className="bg-slate-700 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-white">{selectedUser.stats.total_products}</div>
                                        <div className="text-xs text-slate-400">Products</div>
                                    </div>
                                    <div className="bg-slate-700 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-white">{selectedUser.stats.total_customers}</div>
                                        <div className="text-xs text-slate-400">Customers</div>
                                    </div>
                                    <div className="bg-slate-700 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-white">{selectedUser.stats.total_orders}</div>
                                        <div className="text-xs text-slate-400">Orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Update user information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Name</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Email</Label>
                            <Input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Mobile</Label>
                            <Input
                                value={editForm.mobile}
                                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Shop Name</Label>
                            <Input
                                value={editForm.shop_name}
                                onChange={(e) => setEditForm({ ...editForm, shop_name: e.target.value })}
                                className="bg-slate-700 border-slate-600"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to delete this user? This action cannot be undone.
                            All user data including products, orders, and customers will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} disabled={processing} variant="destructive">
                            {processing ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Subscription Dialog */}
            <Dialog open={subscriptionDialog} onOpenChange={setSubscriptionDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Manage Subscription</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Set or cancel subscription for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 py-4">
                            {selectedUser.subscription && (
                                <div className="p-3 bg-slate-700 rounded-lg">
                                    <div className="text-sm text-slate-400 mb-1">Current Plan</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{selectedUser.subscription.plan_name}</span>
                                        {getStatusBadge(selectedUser.subscription.status)}
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1">
                                        Expires: {formatDate(selectedUser.subscription.end_date)}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-300">Select Plan</Label>
                                <Select value={subForm.plan_id} onValueChange={(v) => setSubForm({ ...subForm, plan_id: v })}>
                                    <SelectTrigger className="bg-slate-700 border-slate-600">
                                        <SelectValue placeholder="Choose a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.filter(p => p.monthly_price > 0).map((plan) => (
                                            <SelectItem key={plan.plan_id} value={plan.plan_id.toString()}>
                                                {plan.name} - ৳{plan.monthly_price}/mo
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Duration</Label>
                                <Select value={subForm.duration_months} onValueChange={(v) => setSubForm({ ...subForm, duration_months: v })}>
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
                        </div>
                    )}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {selectedUser?.subscription && (
                            <Button
                                variant="outline"
                                onClick={handleCancelSubscription}
                                disabled={processing}
                                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Subscription
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="outline" onClick={() => setSubscriptionDialog(false)} className="border-slate-600">
                                Close
                            </Button>
                            <Button onClick={handleSetSubscription} disabled={processing || !subForm.plan_id}>
                                <Crown className="w-4 h-4 mr-2" />
                                {processing ? 'Processing...' : 'Set Subscription'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
