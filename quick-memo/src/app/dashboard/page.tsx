'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Settings,
    FileText,
    Palette,
    Save,
    Calendar,
    CreditCard,
    Crown,
    LogOut,
    Home
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string;
    mobile?: string;
    profile?: {
        id: string;
        shopName: string;
        isPro: boolean;
        proExpiry?: string;
        theme: string;
    };
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState({
        totalMemos: 0,
        thisMonth: 0,
        lastMonth: 0,
        totalRevenue: 0
    });
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/auth/login');
            return;
        }

        setUser(JSON.parse(userData));

        // Load demo stats from localStorage
        const savedStats = localStorage.getItem('userStats');
        if (savedStats) {
            setStats(JSON.parse(savedStats));
        } else {
            // Set demo stats
            const demoStats = {
                totalMemos: 42,
                thisMonth: 15,
                lastMonth: 27,
                totalRevenue: 125000
            };
            setStats(demoStats);
            localStorage.setItem('userStats', JSON.stringify(demoStats));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/');
        toast.success('Logged out successfully');
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const isPro = user.profile?.isPro;
    const proExpiry = user.profile?.proExpiry ? new Date(user.profile.proExpiry) : null;
    const isExpired = proExpiry && proExpiry < new Date();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isPro && !isExpired && (
                                <Badge className="bg-green-100 text-green-800">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Pro Active
                                </Badge>
                            )}
                            {isPro && isExpired && (
                                <Badge className="bg-red-100 text-red-800">
                                    Expired
                                </Badge>
                            )}
                            <Link href="/">
                                <Button variant="outline" size="sm">
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Memos</span>
                                    <span className="text-2xl font-bold">{stats.totalMemos}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">This Month</span>
                                    <span className="text-xl font-bold text-green-600">{stats.thisMonth}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Month</span>
                                    <span className="text-xl font-bold">{stats.lastMonth}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Revenue</span>
                                    <span className="text-xl font-bold text-blue-600">৳{stats.totalRevenue.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Create New Memo
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Profile Settings
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <Palette className="w-4 h-4 mr-2" />
                                    Themes & Colors
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <Save className="w-4 h-4 mr-2" />
                                    Memo Presets
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Order History
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="memos">Recent Memos</TabsTrigger>
                                <TabsTrigger value="themes">Themes</TabsTrigger>
                                <TabsTrigger value="billing">Billing</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="font-semibold mb-2">Profile Information</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Name:</strong> {user.name}</p>
                                                    <p><strong>Email:</strong> {user.email}</p>
                                                    <p><strong>Mobile:</strong> {user.mobile || 'Not set'}</p>
                                                    {user.profile && (
                                                        <>
                                                            <p><strong>Shop:</strong> {user.profile.shopName}</p>
                                                            <p><strong>Theme:</strong> {user.profile.theme}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2">Subscription Status</h3>
                                                <div className="space-y-2 text-sm">
                                                    {isPro && !isExpired && (
                                                        <>
                                                            <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                                                            {proExpiry && (
                                                                <p><strong>Expires:</strong> {proExpiry.toLocaleDateString()}</p>
                                                            )}
                                                        </>
                                                    )}
                                                    {isPro && isExpired && (
                                                        <>
                                                            <p><strong>Status:</strong> <span className="text-red-600">Expired</span></p>
                                                            <p><strong>Expired:</strong> {proExpiry?.toLocaleDateString()}</p>
                                                        </>
                                                    )}
                                                    {!isPro && (
                                                        <p><strong>Status:</strong> <span className="text-gray-600">Free Plan</span></p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Getting Started Guide */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Getting Started</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                                <div>
                                                    <p className="font-medium">Create your first memo</p>
                                                    <p className="text-sm text-gray-600">Go to the home page and fill in your shop and customer details</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                                <div>
                                                    <p className="font-medium">Customize your theme</p>
                                                    <p className="text-sm text-gray-600">Choose from multiple color themes to match your brand</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                                <div>
                                                    <p className="font-medium">Upgrade to Pro</p>
                                                    <p className="text-sm text-gray-600">Unlock premium features like logo upload and saved products</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Recent Memos Tab */}
                            <TabsContent value="memos">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Memos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 text-center py-8">
                                            Your recent memos will appear here... (Demo mode)
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Themes Tab */}
                            <TabsContent value="themes">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme Selection</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['default', 'blue', 'green', 'purple'].map((theme) => (
                                                <div key={theme} className="border rounded-lg p-4 text-center hover:border-primary cursor-pointer transition-colors">
                                                    <div className={`w-full h-20 rounded mb-2 ${theme === 'default' ? 'bg-slate-800' :
                                                            theme === 'blue' ? 'bg-blue-600' :
                                                                theme === 'green' ? 'bg-green-600' :
                                                                    'bg-purple-600'
                                                        }`}></div>
                                                    <p className="text-sm font-medium capitalize">{theme}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Billing & Subscription</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-semibold">Current Plan</p>
                                                    <p className="text-sm text-gray-600">
                                                        {isPro && !isExpired ? 'Pro Plan - ৳200/month' : 'Free Plan'}
                                                    </p>
                                                </div>
                                                {!isPro && (
                                                    <Button>
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Upgrade to Pro
                                                    </Button>
                                                )}
                                            </div>
                                            {isPro && proExpiry && (
                                                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                                                    <p>Next billing date: {proExpiry.toLocaleDateString()}</p>
                                                    <p className="mt-2">You can cancel anytime from your account settings.</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
