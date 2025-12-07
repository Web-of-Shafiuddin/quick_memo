'use client';

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import CashMemoForm from '@/components/cash-memo-form';
import MemoPreview from '@/components/memo-preview';
import ProFeaturesModal from '@/components/pro-features-modal';
import SubscriptionStatus from '@/components/subscription-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Crown, Zap, Shield, Users, Box, Truck, CreditCard, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ShopProfile {
  id?: string;
  shopName: string;
  ownerName: string;
  mobile: string;
  address?: string;
  logoUrl?: string;
  theme: string;
  isPro: boolean;
  proExpiry: string;
  bkashNumber?: string;
}

interface CustomerInfo {
  name: string;
  mobile: string;
  address: string;
  note: string;
}

interface MemoData {
  shopProfile: ShopProfile;
  customer: CustomerInfo;
  products: Product[];
  deliveryCharge: number;
  discount: number;
  paymentMethod: 'cod' | 'paid';
  subtotal: number;
  totalAmount: number;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [memoData, setMemoData] = useState<MemoData>({
    shopProfile: {
      shopName: '',
      ownerName: '',
      mobile: '',
      address: '',
      proExpiry: '',
      theme: 'default',
      isPro: false
    },
    customer: {
      name: '',
      mobile: '',
      address: '',
      note: ''
    },
    products: [
      { id: '1', name: '', quantity: 1, price: 0, total: 0 }
    ],
    deliveryCharge: 0,
    discount: 0,
    paymentMethod: 'cod',
    subtotal: 0,
    totalAmount: 0
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const [activeTab, setActiveTab] = useState('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const memoPreviewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!memoPreviewRef.current) {
      toast.error('Preview not ready');
      return;
    }

    setIsGenerating(true);

    try {
      // Check if form has required data
      if (!memoData.shopProfile.shopName || !memoData.customer.name) {
        toast.error('Please fill in shop name and customer name');
        setIsGenerating(false);
        return;
      }

      const element = memoPreviewRef.current.querySelector('#memo-preview') as HTMLElement;
      if (!element) {
        toast.error('Memo preview not found');
        setIsGenerating(false);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `memo-${memoData.customer.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Memo downloaded successfully!');

    } catch (error) {
      console.error('Error generating memo:', error);
      toast.error('Failed to generate memo. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateMemoData = (newData: Partial<MemoData>) => {
    setMemoData(prev => ({ ...prev, ...newData }));
  };

  // Frontend-only upgrade handler
  const handleUpgrade = async (profileId: string, transactionId: string) => {
    toast.info('This is a demo version. No actual payment is processed.');
  };

  // Frontend-only logo upload handler
  const handleLogoUpload = async (file: File) => {
    toast.info('This is a demo version. Logo upload is simulated.');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QuickMemo BD</h1>
                <p className="text-sm text-gray-600">
                  {!isAuthenticated ? 'Free Demo Mode' : 'Professional Cash Memo Generator'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              {!isAuthenticated && (
                <Link href="/auth/login">
                  <Button variant="default" size="sm">
                    Login / Sign Up
                  </Button>
                </Link>
              )}
              <ProFeaturesModal
                shopProfile={memoData.shopProfile}
                onUpgrade={handleUpgrade}
                onLogoUpload={handleLogoUpload}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Create Professional Cash Memos in Seconds
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            The perfect tool for Bangladeshi Facebook sellers, clothing shops, and small businesses
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Professional Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>1000+ Sellers Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="form" className="text-base">
              Create Memo
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-base">
              Preview & Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            {/* Subscription Status */}
            <SubscriptionStatus
              profileId={memoData.shopProfile.id}
              isPro={memoData.shopProfile.isPro}
              proExpiry={memoData.shopProfile.proExpiry}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <CashMemoForm
                  memoData={memoData}
                  onUpdate={updateMemoData}
                />
              </div>

              {/* Quick Preview Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Preview</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Shop:</span>
                        <p className="text-gray-600">{memoData.shopProfile.shopName || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span>
                        <p className="text-gray-600">{memoData.customer.name || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Products:</span>
                        <p className="text-gray-600">
                          {memoData.products.filter(p => p.name).length} items
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>
                        <p className="text-lg font-bold text-primary">
                          ৳{memoData.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab('preview')}
                      className="w-full mt-4"
                      disabled={!memoData.shopProfile.shopName || !memoData.customer.name}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View Full Preview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="max-w-4xl mx-auto">
              <MemoPreview
                ref={memoPreviewRef}
                memoData={memoData}
                onDownload={handleDownload}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Affiliate Banner Section */}
      {!memoData.shopProfile.isPro && (
        <section className="bg-yellow-50 border-y border-yellow-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended for Your Business</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-yellow-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Box className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h4 className="font-medium mb-2">Quality Packaging Materials</h4>
                    <p className="text-sm text-gray-600 mb-3">Professional packaging for your products</p>
                    <Button size="sm" variant="outline" className="w-full">
                      View Deals
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h4 className="font-medium mb-2">Pathao Merchant Account</h4>
                    <p className="text-sm text-gray-600 mb-3">Fast delivery service nationwide</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h4 className="font-medium mb-2">Bkash Business Account</h4>
                    <p className="text-sm text-gray-600 mb-3">Accept payments easily</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose QuickMemo BD?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Professional Templates</h3>
                <p className="text-gray-600 text-sm">
                  Multiple color themes and professional layouts that make your business look credible
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Create and download professional memos in under 30 seconds
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Pro Features</h3>
                <p className="text-gray-600 text-sm">
                  Save products, upload logo, remove watermark, and access premium themes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 QuickMemo BD. Made with ❤️ for Bangladeshi entrepreneurs
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Supporting F-commerce sellers, clothing shops, and small businesses nationwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
