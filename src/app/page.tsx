"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  User,
  Share2,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

// Custom hook to check auth status without triggering re-renders in effects
function useAuthStatus() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("authToken");
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function HomePage() {
  const isAuthenticated = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Globe,
      title: "Public Shop & Live Store",
      description:
        "Create a professional online storefront. Share your shop link on social media. Customers browse products and place orders directly from your live site.",
      color: "bg-[#0096FF]",
      highlight: true,
    },
    {
      icon: ShoppingCart,
      title: "Manage All Orders",
      description:
        "Track orders from Facebook, Instagram, WhatsApp, and your public shop in one place. Update status, manage payments, and never miss an order.",
      color: "bg-green-500",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Build your customer database. Track purchase history, preferences, and contact info. Send follow-ups and get repeat orders from loyal customers.",
      color: "bg-[#003399]",
    },
    {
      icon: Package,
      title: "Product Catalog",
      description:
        "Organize products with images, variants, prices, and stock levels. Quick search and selection when creating orders. Auto-update inventory.",
      color: "bg-orange-500",
    },
    {
      icon: Receipt,
      title: "Digital Receipts & Invoices",
      description:
        "Generate professional digital receipts and invoices in seconds. Send via WhatsApp or email. Build trust with clean, branded documents.",
      color: "bg-pink-500",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description:
        "Showcase products professionally. Get more orders from social media and your live shop. Track sales and optimize for growth.",
      color: "bg-cyan-500",
    },
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Live Shop Website",
      description: "Customers browse & order directly from your site",
    },
    {
      icon: Zap,
      title: "All Orders in One Place",
      description: "Facebook, Instagram, WhatsApp - track everything",
    },
    {
      icon: Users,
      title: "Customer Database",
      description: "Track history and get repeat orders",
    },
    {
      icon: TrendingUp,
      title: "Increase Sales",
      description: "Professional showcase brings new customers",
    },
    {
      icon: Receipt,
      title: "Digital Receipts & Invoices",
      description: "Build trust with clean, branded documents",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Dedicated support for online sellers worldwide",
    },
  ];

  const testimonials = [
    {
      name: "Fatima R.",
      role: "Social Commerce Seller, Fashion & Apparel",
      content:
        "My online shop now gets 60% of my orders automatically. The order management system keeps everything organized. Professional digital receipts helped build trust with wholesale clients.",
      rating: 5,
      avatar: "FR",
    },
    {
      name: "Karim A.",
      role: "Social Commerce Electronics Seller",
      content:
        "I was overwhelmed with orders from Facebook and Instagram. EzyMemo brought everything to one place. Digital receipts and order management made my business so much easier. Sales increased 35%!",
      rating: 5,
      avatar: "KA",
    },
    {
      name: "Nusrat J.",
      role: "Handicrafts & Gifts Business",
      content:
        "Managing customers and tracking repeat orders was impossible before. Now I have complete customer history. My online storefront brought in new customers I never had before.",
      rating: 5,
      avatar: "NJ",
    },
  ];

  const stats = [
    { value: "5,000+", label: "Active Businesses" },
    { value: "1M+", label: "Invoices Generated" },
    { value: "$50M", label: "Transactions Processed" },
    { value: "4.8/5", label: "User Rating" },
  ];

  const integrations = [
    { name: "Stripe (Coming Soon)", color: "bg-indigo-100 text-indigo-700" },
    { name: "PayPal (Coming Soon)", color: "bg-blue-100 text-blue-700" },
    { name: "bKash", color: "bg-pink-100 text-pink-700" },
    { name: "Nagad", color: "bg-orange-100 text-orange-700" },
    { name: "Pathao", color: "bg-green-100 text-green-700" },
    { name: "RedX", color: "bg-red-100 text-red-700" },
    { name: "Steadfast", color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* FAQPage JSON-LD for Google Featured Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the best free digital receipt maker for social media sellers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "EzyMemo is a free digital receipt maker designed for social commerce sellers. Create professional invoices and receipts in seconds, manage orders from Facebook, Instagram, and WhatsApp, and track your customers — all from one dashboard. No credit card required to get started.",
                },
              },
              {
                "@type": "Question",
                name: "Can I use EzyMemo for my business outside of Bangladesh?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! EzyMemo is a global platform that works for social commerce sellers anywhere in the world. While we started in Bangladesh, our tools support multi-currency invoicing and work with international payment providers like Stripe and PayPal (coming soon), alongside local options like bKash.",
                },
              },
              {
                "@type": "Question",
                name: "How does a digital receipt help grow my social commerce business?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Digital receipts build trust with customers by providing professional, branded documentation for every transaction. This professionalism leads to more repeat orders, positive reviews, and referrals. EzyMemo also tracks customer history so you can follow up and grow relationships over time.",
                },
              },
              {
                "@type": "Question",
                name: "What social media platforms does EzyMemo support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "EzyMemo helps you manage orders from Facebook, Instagram, WhatsApp, and your own online storefront. All orders from every channel flow into one unified dashboard so you never miss a sale.",
                },
              },
              {
                "@type": "Question",
                name: "Is EzyMemo really free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Our free plan includes all essential features — digital receipt generation, order management, customer database, and your own online storefront. Premium plans with advanced features are available for growing businesses.",
                },
              },
            ],
          }),
        }}
      />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                alt="EzyMemo Logo || Easy memo"
                width={24}
                height={24}
                className="rounded-sm"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-[#0096FF] to-[#003399] bg-clip-text text-transparent">
                EzyMemo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="/templates"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Templates
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                FAQ
              </Link>
              <Link
                href="/free-invoice-maker"
                className="text-orange-600 hover:text-orange-700 text-sm font-semibold"
              >
                Free Invoice Maker
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
                  <Link href="/auth/login">
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
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">
            <Link
              href="#features"
              className="block text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link
              href="/templates"
              className="block text-gray-600 hover:text-gray-900"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="block text-gray-600 hover:text-gray-900"
            >
              Testimonials
            </Link>
            <Link
              href="/free-invoice-maker"
              className="block text-orange-600 hover:text-orange-700 font-semibold"
            >
              Free Invoice Maker
            </Link>
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button className="w-full">Start Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-slate-50 via-[#87CEFA]/10 to-[#0096FF]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            {/* <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1.5">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Ezy Memo - Complete Sales Platform for Online Sellers
            </Badge> */}

            {/* Main Heading - H1 for SEO */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Free Digital Receipt Maker & Order Management for Social Commerce
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create professional digital receipts and invoices in seconds. Manage orders from Facebook, Instagram, WhatsApp & your online store — all in one dashboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href={isAuthenticated ? "/dashboard" : "/auth/login"}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-orange-600 hover:bg-orange-700 cursor-pointer"
                >
                  Create Free Receipt Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/free-invoice-maker">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 cursor-pointer border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Try Without Signing Up
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

          {/* Hero Image/Dashboard Preview - Platform Overview */}
          <figure className="mt-16">
            <div className="bg-gradient-to-r from-[#0096FF] to-[#003399] rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-gray-400 text-sm">
                    ezymemo.com/dashboard
                  </span>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-[300px] md:min-h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                      <div className="w-10 h-10 bg-[#87CEFA]/25 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingCart className="w-5 h-5 text-[#0096FF]" />
                      </div>
                      <div className="text-2xl font-bold">1,420</div>
                      <div className="text-xs text-gray-500">Orders</div>
                      <div className="text-xs text-green-600 mt-1">
                        +12% this week
                      </div>
                    </Card>
                    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold">856</div>
                      <div className="text-xs text-gray-500">
                        From Public Shop
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        +25% growth
                      </div>
                    </Card>
                    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                      <div className="w-10 h-10 bg-[#87CEFA]/30 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-5 h-5 text-[#003399]" />
                      </div>
                      <div className="text-2xl font-bold">892</div>
                      <div className="text-xs text-gray-500">Customers</div>
                      <div className="text-xs text-green-600 mt-1">
                        +45 repeat
                      </div>
                    </Card>
                    <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold">248</div>
                      <div className="text-xs text-gray-500">Products</div>
                      <div className="text-xs text-[#0096FF] mt-1">
                        Stock tracking
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Facebook Orders
                        </div>
                        <div className="text-xs text-gray-500">
                          28 new today
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#87CEFA]/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#003399]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Instagram Orders
                        </div>
                        <div className="text-xs text-gray-500">
                          15 new today
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#87CEFA]/25 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-[#0096FF]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Public Shop Orders
                        </div>
                        <div className="text-xs text-gray-500">
                          42 new today
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0096FF] to-[#003399] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-[#87CEFA]/10 to-[#0096FF]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#87CEFA]/30 text-[#003399]">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 5 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start managing your online sales with ezy memo in minutes. No
              technical skills required. The easiest way to create order memos
              and manage your business.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-5 gap-6 list-none">
            {[
              {
                icon: Globe,
                title: "Create Your Shop",
                description: "Set up your online store with just a few clicks",
                step: 1,
              },
              {
                icon: User,
                title: "Setup Profile",
                description: "Customize your shop with your brand and details",
                step: 2,
              },
              {
                icon: Share2,
                title: "Share Your Link",
                description: "Post your shop link on Facebook and social media",
                step: 3,
              },
              {
                icon: ShoppingCart,
                title: "Receive Orders",
                description: "Get orders directly from your shop link",
                step: 4,
              },
              {
                icon: CheckCircle,
                title: "Confirm & Grow",
                description:
                  "Confirm orders, share memos & invoices, grow your business",
                step: 5,
              },
            ].map((item, index) => (
              <li key={index} className="relative">
                <article className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0096FF] to-[#87CEFA] rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#0095ffa3]">
                      <span className="text-sm font-bold text-[#0096FF]">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#87CEFA]/30 text-[#003399]">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Social Commerce Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              EzyMemo makes it easy to manage orders from social media and your
              online storefront. Track everything in one place. Build customer
              relationships. Create professional digital receipts. Grow your
              sales systematically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article
                key={index}
                className={`group hover:shadow-lg transition-all duration-300 border-0 bg-white ${feature.highlight ? "ring-2 ring-[#0096FF]" : ""}`}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div
                      className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Public Shop Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-[#87CEFA]/30 text-[#003399]">
                Live Shop Website
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get Orders Directly from Your Online Storefront
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create a professional e-commerce storefront with EzyMemo. Share
                your shop link on Facebook, Instagram, and WhatsApp. Customers
                browse products, view details, and place orders directly on your
                live site. All orders flow into your dashboard automatically.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Professional Online Storefront
                    </div>
                    <div className="text-sm text-gray-500">
                      Beautiful product catalog with images & prices
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Orders Flow to Dashboard
                    </div>
                    <div className="text-sm text-gray-500">
                      Automatic sync - no manual entry needed
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Share Anywhere
                    </div>
                    <div className="text-sm text-gray-500">
                      One link in bio, posts, groups, and chats
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      New Customer Acquisition
                    </div>
                    <div className="text-sm text-gray-500">
                      Discoverable by new customers searching online
                    </div>
                  </div>
                </div>
              </div>

              <Link href={isAuthenticated ? "/dashboard" : "/auth/login"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#0096FF] to-[#003399] hover:from-[#0080DD] hover:to-[#002277]"
                >
                  Launch Your Live Shop
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#87CEFA]/15 to-[#0096FF]/15 rounded-2xl p-6">
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0096FF] to-[#003399] px-6 py-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          Fashion House
                        </div>
                        <div className="text-blue-100 text-sm">
                          ezymemo.com/shop/fashion-house
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-400 text-green-900 absolute top-2 right-2">
                      Live Store
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-full h-32 bg-gradient-to-br from-[#87CEFA]/20 to-[#0096FF]/20 rounded mb-3 flex items-center justify-center">
                          <Package className="w-12 h-12 text-[#0096FF]" />
                        </div>
                        <div className="font-medium text-gray-900">
                          Kurti Collection
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          $850
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          In Stock: 45
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-full h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded mb-3 flex items-center justify-center">
                          <Package className="w-12 h-12 text-green-600" />
                        </div>
                        <div className="font-medium text-gray-900">
                          Saree Set
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          $1,200
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          In Stock: 28
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-full h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded mb-2 flex items-center justify-center">
                          <Package className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="text-sm font-medium">Jewelry</div>
                        <div className="text-xs text-green-600">$350+</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-full h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded mb-2 flex items-center justify-center">
                          <Package className="w-8 h-8 text-pink-600" />
                        </div>
                        <div className="text-sm font-medium">Accessories</div>
                        <div className="text-xs text-green-600">$200+</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition-shadow">
                        <div className="w-full h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded mb-2 flex items-center justify-center">
                          <Package className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div className="text-sm font-medium">Shoes</div>
                        <div className="text-xs text-green-600">$850+</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-[#87CEFA]/15 px-6 py-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">
                          Live Orders Today
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          12 Orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Revenue</div>
                        <div className="text-2xl font-bold text-gray-900">
                          $18,450
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700">
                Why EzyMemo?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built for Online Sellers Who Want to Grow
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Stop struggling with scattered orders on Facebook, Instagram,
                and WhatsApp. Bring everything to one place. Showcase products
                professionally. Get orders from your live shop. Manage customers
                and grow systematically.
              </p>
              <ul className="grid grid-cols-2 gap-6 list-none">
                {benefits.map((benefit, index) => (
                  <li key={index} className="text-center md:text-left flex flex-col items-center md:flex-row md:items-start gap-3">
                    <div className="w-10 h-10 bg-[#87CEFA]/25 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-[#0096FF]" />
                    </div>
                    <div>
                      <strong className="font-medium text-gray-900 block">
                        {benefit.title}
                      </strong>
                      <span className="text-sm text-gray-500">
                        {benefit.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#87CEFA]/25 to-[#0096FF]/20 rounded-2xl p-8">
                <div className="space-y-4">
                  {/* Public Shop Link Preview */}
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-6 h-6 text-[#0096FF]" />
                      <div>
                        <div className="font-medium">Your Public Shop</div>
                        <div className="text-xs text-gray-500">
                          ezymemo.com/shop/your-name
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 ml-auto">
                        Live
                      </Badge>
                    </div>
                    <div className="bg-white rounded p-3 text-center text-sm text-gray-600 border border-dashed border-gray-300">
                      📱 Share this link with customers
                    </div>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#87CEFA]/25 rounded-full flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-[#0096FF]" />
                        </div>
                        <span className="text-xs text-gray-500">
                          WhatsApp Shares
                        </span>
                      </div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-xs text-green-600">
                        +23% this week
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-xs text-gray-500">
                          From Shop Link
                        </span>
                      </div>
                      <div className="text-2xl font-bold">42</div>
                      <div className="text-xs text-green-600">
                        New customers
                      </div>
                    </Card>
                  </div>

                  {/* Trust Badge */}
                  <Card className="p-4 bg-gradient-to-r from-green-50 to-[#87CEFA]/15 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Professional Image
                        </div>
                        <div className="text-xs text-gray-600">
                          Customers trust you more = More sales
                        </div>
                      </div>
                    </div>
                  </Card>
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
            Supports global payments & delivery services
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {integrations.map((integration, index) => (
              <Badge
                key={index}
                className={`${integration.color} text-sm px-4 py-2`}
              >
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
            <Badge className="mb-4 bg-orange-100 text-orange-700">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Online Sellers Growing with EzyMemo
            </h2>
            <p className="text-lg text-gray-600">
              See how sellers manage orders, showcase products, and grow their
              sales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <article
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6">{testimonial.content}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0096FF] to-[#003399] rounded-full flex items-center justify-center text-white font-medium">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#87CEFA]/30 text-[#003399]">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions About Digital Receipts & Order Management
            </h2>
          </div>

          <dl className="space-y-4">
            {[
              {
                q: "What is the best free digital receipt maker for social media sellers?",
                a: "EzyMemo is a free digital receipt maker designed for social commerce sellers. Create professional invoices and receipts in seconds, manage orders from Facebook, Instagram, and WhatsApp, and track your customers — all from one dashboard. No credit card required to get started.",
              },
              {
                q: "Can I use EzyMemo for my business outside of Bangladesh?",
                a: "Yes! EzyMemo is a global platform that works for social commerce sellers anywhere in the world. While we started in Bangladesh, our tools support multi-currency invoicing and work with international payment providers like Stripe and PayPal (coming soon), alongside local options like bKash.",
              },
              {
                q: "How does a digital receipt help grow my social commerce business?",
                a: "Digital receipts build trust with customers by providing professional, branded documentation for every transaction. This professionalism leads to more repeat orders, positive reviews, and referrals. EzyMemo also tracks customer history so you can follow up and grow relationships over time.",
              },
              {
                q: "What social media platforms does EzyMemo support?",
                a: "EzyMemo helps you manage orders from Facebook, Instagram, WhatsApp, and your own online storefront. All orders from every channel flow into one unified dashboard so you never miss a sale.",
              },
              {
                q: "Is EzyMemo really free?",
                a: "Yes! Our free plan includes all essential features — digital receipt generation, order management, customer database, and your own online storefront. Premium plans with advanced features are available for growing businesses.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <dt className="font-semibold text-gray-900 mb-2">{faq.q}</dt>
                <dd className="text-gray-600">{faq.a}</dd>
              </Card>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0096FF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Social Commerce Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Manage orders from social media and your online storefront. Build
            customer relationships. Generate professional digital receipts.
            Track sales and grow systematically with the easiest order
            management platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isAuthenticated ? "/dashboard" : "/auth/login"}>
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 text-lg px-8 py-6"
              >
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
                <Image
                  src="/logo.webp"
                  alt="EzyMemo Logo"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="text-xl font-bold text-white">EzyMemo</span>
              </Link>
              <p className="text-sm">
                The free digital receipt maker and order management platform for
                social commerce sellers and small businesses worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-white">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="hover:text-white">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/free-invoice-maker" className="hover:text-white">
                    Free Invoice Maker
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <address className="not-italic">
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@ezymemo.com"
                    className="hover:text-white"
                  >
                    support@ezymemo.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com/ezymemo"
                    className="hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </li>
              </ul>
            </address>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} EzyMemo. All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <span>Trusted by 5,000+ Social Commerce Sellers</span>
              <span className="hidden md:inline">•</span>
              <span>Built in Bangladesh, Used Worldwide 🌍</span>
            </div>
            <p className="text-sm">
              Made with ❤️ for entrepreneurs everywhere
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
