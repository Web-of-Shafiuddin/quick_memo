'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, CreditCard, Clock, TrendingUp } from 'lucide-react';
import adminApi from '@/lib/adminApi';

interface DashboardStats {
    total_users: number;
    new_users_30d: number;
    active_subscriptions: number;
    pending_requests: number;
    total_orders: number;
    total_products: number;
    total_revenue: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminApi.get('/admin/dashboard/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Overview of your platform</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {loading ? '--' : stats?.total_users || 0}
                            </div>
                            <p className="text-xs text-slate-500">
                                +{loading ? '--' : stats?.new_users_30d || 0} in last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Active Subscriptions
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {loading ? '--' : stats?.active_subscriptions || 0}
                            </div>
                            <p className="text-xs text-slate-500">Paying customers</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Pending Requests
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {loading ? '--' : stats?.pending_requests || 0}
                            </div>
                            <p className="text-xs text-slate-500">Awaiting verification</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Revenue
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ${loading ? '--' : stats?.total_revenue || 0}
                            </div>
                            <p className="text-xs text-slate-500">From subscriptions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {loading ? '--' : stats?.total_products || 0}
                            </div>
                            <p className="text-xs text-slate-500">Across all users</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-pink-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {loading ? '--' : stats?.total_orders || 0}
                            </div>
                            <p className="text-xs text-slate-500">All time orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/admin/subscriptions"
                                className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-600 rounded-lg">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Review Requests</div>
                                        <div className="text-sm text-slate-400">
                                            {stats?.pending_requests || 0} pending
                                        </div>
                                    </div>
                                </div>
                            </a>
                            <a
                                href="/admin/users"
                                className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Manage Users</div>
                                        <div className="text-sm text-slate-400">
                                            {stats?.total_users || 0} total
                                        </div>
                                    </div>
                                </div>
                            </a>
                            <a
                                href="/admin/subscriptions"
                                className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-600 rounded-lg">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Subscriptions</div>
                                        <div className="text-sm text-slate-400">
                                            {stats?.active_subscriptions || 0} active
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
