'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Frontend-only demo authentication
        setTimeout(() => {
            if (email && password) {
                const demoUser = {
                    id: 'demo-user-1',
                    email: email,
                    name: email.split('@')[0],
                    mobile: '01712345678',
                    profile: {
                        id: 'demo-profile-1',
                        shopName: 'Demo Shop',
                        isPro: false,
                        theme: 'default'
                    }
                };

                localStorage.setItem('authToken', 'demo-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify(demoUser));

                toast.success('Login successful! (Demo mode)');
                router.push('/dashboard');
            } else {
                toast.error('Please enter email and password');
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const regEmail = formData.get('email') as string;
        const regPassword = formData.get('password') as string;
        const mobile = formData.get('mobile') as string;

        // Frontend-only demo registration
        setTimeout(() => {
            if (name && regEmail && regPassword) {
                toast.success('Registration successful! Please login. (Demo mode)');
                setActiveTab('login');
                setEmail(regEmail);
            } else {
                toast.error('Please fill in all required fields');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">QuickMemo BD</h1>
                    <p className="text-gray-600">Your Professional Memo Generator</p>
                    <p className="text-sm text-blue-600 mt-2">(Demo Mode - No Backend)</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Welcome Back</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                            </TabsList>

                            {/* Login Tab */}
                            <TabsContent value="login" className="space-y-4">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter any email"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter any password"
                                            required
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                                        💡 Demo Mode: Enter any email and password to login
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Register Tab */}
                            <TabsContent value="register" className="space-y-4">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <Label htmlFor="reg-name">Full Name</Label>
                                        <Input
                                            id="reg-name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reg-email">Email</Label>
                                        <Input
                                            id="reg-email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reg-mobile">Mobile (Optional)</Label>
                                        <Input
                                            id="reg-mobile"
                                            name="mobile"
                                            type="tel"
                                            placeholder="01xxxxxxxxx"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reg-password">Password</Label>
                                        <Input
                                            id="reg-password"
                                            name="password"
                                            type="password"
                                            placeholder="Create a password"
                                            required
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                                        💡 Demo Mode: Registration is simulated locally
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="text-center mt-6 space-y-2">
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors block"
                    >
                        ← Back to Home
                    </Link>
                    <div className="text-xs text-gray-500">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    );
}
