'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Check,
    Crown,
    Zap,
    ArrowRight,
    FileText,
    Home,
    LayoutDashboard,
    Sparkles
} from 'lucide-react';
import api from '@/lib/api';

interface Plan {
    plan_id: number;
    name: string;
    description: string;
    monthly_price: number;
    half_yearly_price: number;
    yearly_price: number;
    max_categories: number;
    max_products: number;
    max_orders_per_month: number;
    max_customers: number;
    can_upload_images: boolean;
    features: string[];
    badge_text: string | null;
    badge_color: string | null;
    is_popular: boolean;
}

type BillingCycle = 'monthly' | 'half_yearly' | 'yearly';

const BILLING_LABELS: Record<BillingCycle, string> = {
    monthly: 'Monthly',
    half_yearly: '6 Months',
    yearly: 'Yearly',
};

const DURATION_MONTHS: Record<BillingCycle, number> = {
    monthly: 1,
    half_yearly: 6,
    yearly: 12,
};

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPlans();
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/subscriptions/plans');
            const plansData = response.data.data || [];
            // Parse features if they're stored as JSON string
            const parsedPlans = plansData.map((plan: any) => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []
            }));
            setPlans(parsedPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPrice = (plan: Plan): number => {
        switch (billingCycle) {
            case 'half_yearly':
                return plan.half_yearly_price || plan.monthly_price * 6;
            case 'yearly':
                return plan.yearly_price || plan.monthly_price * 12;
            default:
                return plan.monthly_price;
        }
    };

    const getMonthlyEquivalent = (plan: Plan): number => {
        const price = getPrice(plan);
        return price / DURATION_MONTHS[billingCycle];
    };

    const getSavingsPercent = (plan: Plan): number => {
        if (billingCycle === 'monthly') return 0;
        const monthlyTotal = plan.monthly_price * DURATION_MONTHS[billingCycle];
        const actualPrice = getPrice(plan);
        if (monthlyTotal === 0) return 0;
        return Math.round(((monthlyTotal - actualPrice) / monthlyTotal) * 100);
    };

    const formatLimit = (value: number): string => {
        return value === -1 ? 'Unlimited' : value.toLocaleString();
    };

    const handleSelectPlan = (plan: Plan) => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            router.push(`/auth/login?redirect=/subscription&plan=${plan.plan_id}&billing=${billingCycle}`);
            return;
        }
        // Redirect to subscription page with selected plan
        router.push(`/subscription?plan=${plan.plan_id}&billing=${billingCycle}`);
    };

    const getBadgeColor = (color: string | null): string => {
        switch (color) {
            case 'blue': return 'bg-blue-500';
            case 'green': return 'bg-green-500';
            case 'purple': return 'bg-purple-500';
            case 'yellow': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-gray-600">Loading plans...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-lg">
                                <FileText className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">EzyMemo</h1>
                                <p className="text-sm text-gray-600">Pricing Plans</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="outline" size="sm">
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </Button>
                            </Link>
                            {isAuthenticated ? (
                                <Link href="/dashboard">
                                    <Button variant="default" size="sm">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/auth/login">
                                    <Button variant="default" size="sm">
                                        Login / Sign Up
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white/10 rounded-full">
                            <Crown className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Simple, Affordable Pricing
                    </h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Choose the perfect plan for your business. All plans include core features with no hidden fees.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-lg p-1">
                        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                            <TabsList className="bg-transparent">
                                <TabsTrigger
                                    value="monthly"
                                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white"
                                >
                                    Monthly
                                </TabsTrigger>
                                <TabsTrigger
                                    value="half_yearly"
                                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white"
                                >
                                    6 Months
                                    <Badge className="ml-2 bg-green-500 text-xs">Save 15%</Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="yearly"
                                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white"
                                >
                                    Yearly
                                    <Badge className="ml-2 bg-green-500 text-xs">Save 25%</Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 -mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => {
                            const price = getPrice(plan);
                            const monthlyEquiv = getMonthlyEquivalent(plan);
                            const savings = getSavingsPercent(plan);
                            const isFree = plan.monthly_price === 0;

                            return (
                                <Card
                                    key={plan.plan_id}
                                    className={`relative overflow-hidden transition-all hover:shadow-xl ${
                                        plan.is_popular ? 'border-2 border-green-500 shadow-lg scale-105' : ''
                                    }`}
                                >
                                    {/* Badge */}
                                    {plan.badge_text && (
                                        <div className={`absolute top-0 right-0 ${getBadgeColor(plan.badge_color)} text-white text-xs font-semibold px-3 py-1 rounded-bl-lg`}>
                                            {plan.badge_text}
                                        </div>
                                    )}

                                    {plan.is_popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center text-xs font-semibold py-1">
                                            <Sparkles className="inline w-3 h-3 mr-1" />
                                            Most Popular
                                        </div>
                                    )}

                                    <CardHeader className={plan.is_popular ? 'pt-8' : ''}>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="text-xl">{plan.name}</span>
                                        </CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        {/* Price */}
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold">
                                                    {isFree ? 'Free' : `$${price.toLocaleString()}`}
                                                </span>
                                                {!isFree && (
                                                    <span className="text-gray-500">
                                                        /{BILLING_LABELS[billingCycle].toLowerCase()}
                                                    </span>
                                                )}
                                            </div>
                                            {!isFree && billingCycle !== 'monthly' && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    ${monthlyEquiv.toFixed(0)}/month
                                                    {savings > 0 && (
                                                        <Badge className="ml-2 bg-green-100 text-green-700">
                                                            Save {savings}%
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Limits */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">Products</span>
                                                <span className="font-medium">{formatLimit(plan.max_products)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">Orders/Month</span>
                                                <span className="font-medium">{formatLimit(plan.max_orders_per_month)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">Customers</span>
                                                <span className="font-medium">{formatLimit(plan.max_customers)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="text-gray-600">Categories</span>
                                                <span className="font-medium">{formatLimit(plan.max_categories)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-600">Image Upload</span>
                                                <span className="font-medium">{plan.can_upload_images ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <div key={index} className="flex items-start gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-600">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <Button
                                            className={`w-full ${plan.is_popular ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                            variant={isFree ? 'outline' : 'default'}
                                            onClick={() => handleSelectPlan(plan)}
                                        >
                                            {isFree ? 'Get Started Free' : 'Choose Plan'}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ or Trust Section */}
            <section className="bg-white py-16 border-t">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Payment Methods</h3>
                    <p className="text-gray-600 mb-8">
                        We accept multiple payment methods worldwide
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                P
                            </div>
                            <span className="font-medium">PayPal</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                S
                            </div>
                            <span className="font-medium">Stripe</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                C
                            </div>
                            <span className="font-medium">Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                B
                            </div>
                            <span className="font-medium">Bank Transfer</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-6">
                        Secure payments processed instantly. All prices in USD.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} EzyMemo. Made with love for entrepreneurs worldwide.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
