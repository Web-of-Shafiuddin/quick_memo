'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Admin {
    admin_id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export default function AdminDashboardPage() {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if admin is logged in
        const storedAdmin = localStorage.getItem('admin');
        const storedToken = localStorage.getItem('adminToken');

        if (!storedAdmin || !storedToken) {
            router.push('/admin/login');
            return;
        }

        try {
            setAdmin(JSON.parse(storedAdmin));
        } catch (error) {
            router.push('/admin/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        toast.success('Logged out successfully');
        router.push('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-sm text-slate-400">
                                    Welcome, {admin.name}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-slate-600 text-slate-200 hover:bg-slate-700"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">--</div>
                            <p className="text-xs text-slate-500">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">--</div>
                            <p className="text-xs text-slate-500">Across all users</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Total Orders
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">--</div>
                            <p className="text-xs text-slate-500">All time orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin Info */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Admin Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-400">Name</p>
                                <p className="text-white font-medium">{admin.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Email</p>
                                <p className="text-white font-medium">{admin.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Admin ID</p>
                                <p className="text-white font-medium">{admin.admin_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Member Since</p>
                                <p className="text-white font-medium">
                                    {new Date(admin.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
