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
import { authService } from '@/services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Check against backend if user exists (checking by fetching all and filtering - NOT SECURE for production)
            const response = await authService.userLogin({ email, password });
            const user = response.data;

            if (user) {
                // Mocking an auth token and structure since backend doesn't provide auth yet
                const userData = {
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    mobile: user.mobile || '',
                    profile: {
                        profile_id: 'profile-' + user.user_id,
                        shopName: 'My Shop',
                        isPro: false,
                        theme: 'default'
                    }
                };

                localStorage.setItem('authToken', 'mock-token-' + user.user_id);
                localStorage.setItem('user', JSON.stringify(userData));

                toast.success('Login successful!');
                router.push('/dashboard');
            } else {
                toast.error('Invalid email or user not found');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const regName = formData.get('name') as string;
        const regEmail = formData.get('email') as string;
        const regPassword = formData.get('password') as string;
        const regMobile = formData.get('mobile') as string;

        try {
            const response = await authService.userRegister({
                name: regName,
                email: regEmail.toLowerCase(),
                password: regPassword,
                mobile: regMobile
            });

            if (response.success) {
                toast.success('Registration successful! Please login.');
                setActiveTab('login');
                setEmail(regEmail.toLowerCase());
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.response ) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to register. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
