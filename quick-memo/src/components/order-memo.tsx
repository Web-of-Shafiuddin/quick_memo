'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Order } from '@/services/orderService';

interface OrderMemoProps {
  order: Order;
  shopInfo: {
    shopName: string;
    ownerName: string;
    mobile: string;
    email?: string;
    address?: string;
  };
}

const OrderMemo: React.FC<OrderMemoProps> = ({ order, shopInfo }) => {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subtotal = (order.items || []).reduce((sum, item) =>
    sum + parseFloat(item.subtotal.toString()), 0
  );

  return (
    <div className="space-y-4">
      {/* Action Button */}
      <div className="flex justify-center no-print mb-4">
        <Button onClick={handlePrint} size="lg">
          <Printer className="w-4 h-4 mr-2" />
          Print / Download as PDF
        </Button>
      </div>

      {/* Memo Content */}
      <div
        id="memo-preview"
        className="bg-white rounded-lg overflow-hidden border border-gray-200 mx-auto"
        style={{ maxWidth: '800px' }}
      >
        {/* Header */}
        <div className="bg-slate-800 text-white p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{shopInfo?.shopName || 'Your Shop Name'}</h1>
          <p className="text-sm opacity-90">Owner: {shopInfo?.ownerName || 'Owner Name'}</p>
          <p className="text-sm opacity-90">Mobile: {shopInfo?.mobile || '01XXXXXXXXX'}</p>
          {shopInfo?.address && (
            <p className="text-sm opacity-90 mt-1">{shopInfo.address}</p>
          )}
        </div>

        {/* Memo Content */}
        <div className="p-8">
          {/* Customer Info & Date */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Bill To:</h3>
              <p className="text-gray-700 font-medium">{order.customer_name || 'Customer'}</p>
              <p className="text-gray-600 text-sm">{order.customer_mobile || '-'}</p>
              {order.customer_address && (
                <p className="text-gray-600 text-sm mt-1">{order.customer_address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Date: {currentDate}</p>
              <p className="text-sm text-gray-500">Memo #: {order.transaction_id}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 font-semibold text-gray-700">Product</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.order_item_id} className="border-b border-gray-200">
                    <td className="py-3 text-gray-700">{item.name_snapshot}</td>
                    <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700">৳{parseFloat(item.unit_price.toString()).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-gray-800">৳{parseFloat(item.subtotal.toString()).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">৳{subtotal.toFixed(2)}</span>
              </div>
              {parseFloat(order.shipping_amount.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">৳{parseFloat(order.shipping_amount.toString()).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.tax_amount.toString()) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">৳{parseFloat(order.tax_amount.toString()).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
                <span>Total Amount:</span>
                <span className="text-slate-800">৳{parseFloat(order.total_amount.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {shopInfo?.email && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <p className="text-center text-sm font-medium text-gray-700 mb-1">Contact Information</p>
              <p className="text-center text-sm text-gray-600">Email: {shopInfo.email}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-gray-600 italic">Thank you for your business!</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }

          body * {
            visibility: hidden;
          }

          #memo-preview,
          #memo-preview * {
            visibility: visible !important;
          }

          #memo-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderMemo;
