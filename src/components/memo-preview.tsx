'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
type MemoData = {
  shopProfile: {
    shopName: string;
    ownerName: string;
    mobile: string;
    address?: string;
    logoUrl?: string;
    theme: string;
    isPro: boolean;
    bkashNumber?: string;
  };
  customer: {
    name: string;
    mobile: string;
    address: string;
    note: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  deliveryCharge: number;
  discount: number;
  paymentMethod: 'cod' | 'paid';
  subtotal: number;
  totalAmount: number;
};

interface MemoPreviewProps {
  memoData: MemoData;
  onDownload: () => void;
  isGenerating?: boolean;
}

const MemoPreview: React.FC<MemoPreviewProps> = ({ memoData, onDownload, isGenerating = false }) => {
  const {
    shopProfile,
    customer,
    products,
    deliveryCharge,
    discount,
    paymentMethod,
    subtotal,
    totalAmount
  } = memoData;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const themeStyles = {
    default: {
      header: 'bg-slate-800 text-white',
      accent: 'text-slate-800',
      border: 'border-slate-200'
    },
    blue: {
      header: 'bg-blue-600 text-white',
      accent: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      header: 'bg-green-600 text-white',
      accent: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      header: 'bg-purple-600 text-white',
      accent: 'text-purple-600',
      border: 'border-purple-200'
    }
  };

  const currentTheme = themeStyles[shopProfile.theme as keyof typeof themeStyles] || themeStyles.default;

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <button
              onClick={onDownload}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Memo
                </>
              )}
            </button>
          </div>

          {/* Memo Preview */}
          <div
            id="memo-preview"
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
          >
            {/* Header */}
            <div className={`${currentTheme.header} p-6 text-center`}>
              {shopProfile.logoUrl && shopProfile.isPro && (
                <div className="mb-3">
                  <img
                    src={shopProfile.logoUrl}
                    alt={shopProfile.shopName}
                    className="w-16 h-16 mx-auto rounded-full border-2 border-white"
                  />
                </div>
              )}
              <h1 className="text-2xl font-bold mb-2">{shopProfile.shopName || 'Your Shop Name'}</h1>
              <p className="text-sm opacity-90">Owner: {shopProfile.ownerName || 'Owner Name'}</p>
              <p className="text-sm opacity-90">Mobile: {shopProfile.mobile || '01xxxxxxxxx'}</p>
              {shopProfile.address && (
                <p className="text-sm opacity-90 mt-1">{shopProfile.address}</p>
              )}
            </div>

            {/* Memo Content */}
            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Bill To:</h3>
                    <p className="text-gray-700">{customer.name || 'Customer Name'}</p>
                    <p className="text-gray-600 text-sm">{customer.mobile || '01xxxxxxxxx'}</p>
                    {customer.address && (
                      <p className="text-gray-600 text-sm mt-1">{customer.address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Date: {currentDate}</p>
                    <p className="text-sm text-gray-500">Memo #: {Date.now().toString().slice(-6)}</p>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-center py-2 text-sm font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.name && p.price > 0).map((product, index) => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-3 text-sm text-gray-700">{product.name}</td>
                        <td className="py-3 text-sm text-center text-gray-700">{product.quantity}</td>
                        <td className="py-3 text-sm text-right text-gray-700">৳{product.price.toFixed(2)}</td>
                        <td className="py-3 text-sm text-right font-medium text-gray-800">৳{product.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Note */}
              {customer.note && (
                <div className="mb-6 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">Order Note:</p>
                  <p className="text-sm text-gray-600">{customer.note}</p>
                </div>
              )}

              {/* Payment Status Badge */}
              <div className="mb-4">
                {paymentMethod === 'cod' ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Cash on Delivery
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Already Paid
                  </Badge>
                )}
              </div>

              {/* Summary */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge:</span>
                      <span className="font-medium">৳{deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-৳{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Amount:</span>
                    <span className={currentTheme.accent}>৳{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <p className="text-center text-sm font-medium text-gray-700 mb-2">Payment Information</p>
                {shopProfile.bkashNumber ? (
                  <p className="text-center text-sm text-gray-600">
                    Bkash: {shopProfile.bkashNumber}
                  </p>
                ) : (
                  <p className="text-center text-sm text-gray-500">
                    Add Bkash number in shop settings
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 italic">Thank you for your business!</p>
                <p className="text-xs text-gray-500 mt-2">This is a computer-generated memo</p>
              </div>

              {/* Watermark for free users */}
              {!shopProfile.isPro && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-center text-xs text-gray-400">
                    Create your own free memo at QuickMemo BD
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoPreview;