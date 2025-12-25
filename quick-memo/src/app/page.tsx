'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Receipt,
  BarChart3,
  Smartphone,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Play,
  Menu,
  X,
  Globe,
  Clock,
  HeadphonesIcon,
  Layers,
} from 'lucide-react';

// Custom hook to check auth status without triggering re-renders in effects
function useAuthStatus() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function HomePage() {
  const isAuthenticated = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Package,
      title: 'Product Management',
      description: 'Organize products with categories, variants (size, color), SKU tracking, and real-time inventory management.',
      color: 'bg-blue-500',
    },
    {
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Track orders from multiple channels - Facebook, Instagram, Website. Manage status, shipping, and payments.',
      color: 'bg-green-500',
    },
    {
      icon: Users,
      title: 'Customer Database',
      description: 'Build your customer base with detailed profiles, order history, and contact management for repeat sales.',
      color: 'bg-purple-500',
    },
    {
      icon: Receipt,
      title: 'Invoice & Memo',
      description: 'Generate professional invoices and cash memos instantly. Multiple templates, auto-calculations, and PDF export.',
      color: 'bg-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description: 'Track your business performance with detailed reports on sales, revenue, top products, and growth trends.',
      color: 'bg-pink-500',
    },
    {
      icon: Layers,
      title: 'Product Variants',
      description: 'Support for product variations like size, color, and style. Each variant tracks its own price and stock.',
      color: 'bg-cyan-500',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Create invoices in under 30 seconds',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is safe with bank-grade security',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Manage your business from anywhere',
    },
    {
      icon: Globe,
      title: 'Bengali Support',
      description: 'Designed for Bangladeshi businesses',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Automate repetitive business tasks',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Get help whenever you need it',
    },
  ];

  const testimonials = [
    {
      name: 'Fatima Rahman',
      role: 'Owner, Fashion House BD',
      content: 'QuickMemo transformed how I manage my online clothing business. Creating invoices used to take 15 minutes, now it takes 30 seconds!',
      rating: 5,
      avatar: 'FR',
    },
    {
      name: 'Karim Ahmed',
      role: 'F-Commerce Seller',
      content: 'The inventory management feature alone is worth it. I never run out of stock anymore and my customers are happier.',
      rating: 5,
      avatar: 'KA',
    },
    {
      name: 'Nusrat Jahan',
      role: 'Handicrafts Business',
      content: 'As a small business owner, I needed something simple yet powerful. QuickMemo is exactly that. Highly recommended!',
      rating: 5,
      avatar: 'NJ',
    },
  ];

  const stats = [
    { value: '5,000+', label: 'Active Businesses' },
    { value: '1M+', label: 'Invoices Generated' },
    { value: '৳50Cr+', label: 'Transactions Processed' },
    { value: '4.8/5', label: 'User Rating' },
  ];

  const integrations = [
    { name: 'bKash', color: 'bg-pink-100 text-pink-700' },
    { name: 'Nagad', color: 'bg-orange-100 text-orange-700' },
    { name: 'Rocket', color: 'bg-purple-100 text-purple-700' },
    { name: 'Pathao', color: 'bg-green-100 text-green-700' },
    { name: 'RedX', color: 'bg-red-100 text-red-700' },
    { name: 'Steadfast', color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickMemo BD
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Testimonials
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                FAQ
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>
                      Start Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">
            <Link href="#features" className="block text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/pricing" className="block text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="#testimonials" className="block text-gray-600 hover:text-gray-900">
              Testimonials
            </Link>
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full">Start Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5">
              <Star className="w-3 h-3 mr-1 fill-current" />
              #1 E-commerce Platform in Bangladesh
            </Badge>

            {/* Main Heading - H1 for SEO */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Manage Your Online Business{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The all-in-one platform for F-commerce sellers and small businesses in Bangladesh.
              Products, orders, customers, invoices - everything you need to grow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-gray-400 text-sm">quickmemo.bd/dashboard</span>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                    <Card className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">248</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">1,420</div>
                      <div className="text-xs text-gray-500">Orders</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">892</div>
                      <div className="text-xs text-gray-500">Customers</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold">৳12.5L</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -left-4 top-1/4 hidden lg:block">
              <Card className="p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Order Confirmed</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
              </Card>
            </div>
            <div className="absolute -right-4 bottom-1/4 hidden lg:block">
              <Card className="p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Invoice #1234</div>
                    <div className="text-xs text-gray-500">৳2,500</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From product management to invoicing, QuickMemo has all the tools to help you
              manage and grow your online business efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700">Why QuickMemo?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for Bangladeshi Entrepreneurs
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We understand the unique challenges of running an online business in Bangladesh.
                That&apos;s why we&apos;ve built features specifically for F-commerce sellers, clothing shops,
                and small businesses.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{benefit.title}</div>
                      <div className="text-sm text-gray-500">{benefit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="space-y-4">
                  {/* Mini Dashboard Preview */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Today's Sales</span>
                      <Badge className="bg-green-100 text-green-700">+12%</Badge>
                    </div>
                    <div className="text-3xl font-bold">৳45,230</div>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                  </Card>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <ShoppingCart className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold">28</div>
                      <div className="text-sm text-gray-500">New Orders</div>
                    </Card>
                    <Card className="p-4">
                      <Users className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold">15</div>
                      <div className="text-sm text-gray-500">New Customers</div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Works with your favorite payment & delivery services
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {integrations.map((integration, index) => (
              <Badge key={index} className={`${integration.color} text-sm px-4 py-2`}>
                {integration.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-700">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands of Businesses
            </h2>
            <p className="text-lg text-gray-600">
              See what our users are saying about QuickMemo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Is QuickMemo really free to use?',
                a: 'Yes! We offer a generous free plan that includes core features. You can create invoices, manage products, and track orders without paying anything. Upgrade anytime for more features.',
              },
              {
                q: 'Do I need technical knowledge to use QuickMemo?',
                a: 'Not at all! QuickMemo is designed for non-technical users. If you can use Facebook, you can use QuickMemo. Our intuitive interface makes business management simple.',
              },
              {
                q: 'Can I use QuickMemo on my phone?',
                a: 'Absolutely! QuickMemo is fully responsive and works great on mobile devices. Manage your business from anywhere, anytime.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept bKash, Nagad, Rocket, and bank transfers. After payment, submit your transaction ID and we will activate your plan within 24 hours.',
              },
              {
                q: 'Is my business data secure?',
                a: 'Yes, your data is completely secure. We use industry-standard encryption and never share your information with third parties.',
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Bangladeshi entrepreneurs who trust QuickMemo to manage their online business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isAuthenticated ? '/dashboard' : '/auth/register'}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-blue-200 text-sm">
            No credit card required. Free plan available forever.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">QuickMemo BD</span>
              </Link>
              <p className="text-sm">
                Bangladesh&apos;s leading e-commerce management platform for online sellers and small businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#testimonials" className="hover:text-white">Testimonials</Link></li>
                <li><Link href="#faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><a href="mailto:support@quickmemo.bd" className="hover:text-white">support@quickmemo.bd</a></li>
                <li><a href="https://facebook.com/quickmemobd" className="hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} QuickMemo BD. All rights reserved.
            </p>
            <p className="text-sm">
              Made with ❤️ for Bangladeshi entrepreneurs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
