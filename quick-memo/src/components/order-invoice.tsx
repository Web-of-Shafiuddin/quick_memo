'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Order } from '@/services/orderService';
import { useCurrency } from '@/hooks/useCurrency';

interface OrderInvoiceProps {
  order: Order;
  shopInfo?: {
    name: string;
    owner: string;
    mobile: string;
    address?: string;
  };
  formatPrice?: (amount: number) => string;
}

const OrderInvoice = React.forwardRef<HTMLDivElement, OrderInvoiceProps>(
  ({ order, shopInfo, formatPrice }, ref) => {
    const { format: currencyFormat } = useCurrency();
    const format = formatPrice || currencyFormat;

    const handlePrint = () => {
      window.print();
    };

    const handleDownload = async () => {
      // Simple approach: use browser's print to PDF functionality
      const printStyles = `
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `;

      const styleSheet = document.createElement("style");
      styleSheet.innerText = printStyles;
      document.head.appendChild(styleSheet);

      window.print();

      setTimeout(() => {
        document.head.removeChild(styleSheet);
      }, 100);
    };

    const invoiceDate = new Date(order.order_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="space-y-4">
        {/* Action Buttons - Hidden when printing */}
        <div className="flex gap-2 justify-end no-print">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Button onClick={handleDownload} variant="default">
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </Button>
        </div>

        {/* Invoice Content */}
        <div
          id="invoice-content"
          ref={ref}
          className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {shopInfo?.name || 'Invoice'}
                </h1>
                {shopInfo?.owner && (
                  <p className="text-gray-600 mt-1">Owner: {shopInfo.owner}</p>
                )}
                {shopInfo?.mobile && (
                  <p className="text-gray-600">Mobile: {shopInfo.mobile}</p>
                )}
                {shopInfo?.address && (
                  <p className="text-gray-600">{shopInfo.address}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">INVOICE</p>
                <p className="text-gray-600 mt-2">Invoice #{order.transaction_id}</p>
                <p className="text-gray-600">Date: {invoiceDate}</p>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
              <p className="text-gray-700 font-medium">{order.customer_name}</p>
              {order.customer_mobile && (
                <p className="text-gray-600">Mobile: {order.customer_mobile}</p>
              )}
              {order.customer_email && (
                <p className="text-gray-600">Email: {order.customer_email}</p>
              )}
              {order.customer_address && (
                <p className="text-gray-600 mt-1">{order.customer_address}</p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">Order Source:</span> {order.order_source}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment Method:</span> {order.payment_method_name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`font-semibold ${
                    order.order_status === 'DELIVERED' ? 'text-green-600' :
                    order.order_status === 'CANCELLED' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {order.order_status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Discount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={item.order_item_id} className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-700">{item.name_snapshot}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{item.product_sku || '-'}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {format(parseFloat(item.unit_price.toString()))}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {format(parseFloat(item.item_discount.toString()))}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {format(parseFloat(item.subtotal.toString()))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{format(order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal.toString()), 0) || 0)}</span>
                </div>
                {parseFloat(order.shipping_amount.toString()) > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span>{format(parseFloat(order.shipping_amount.toString()))}</span>
                  </div>
                )}
                {parseFloat(order.tax_amount.toString()) > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>{format(parseFloat(order.tax_amount.toString()))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-800 border-t-2 border-gray-300 pt-2">
                  <span>Total Amount:</span>
                  <span>{format(parseFloat(order.total_amount.toString()))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-gray-600 italic">Thank you for your business!</p>
            <p className="text-gray-500 text-sm mt-2">
              This is a computer-generated invoice
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-content,
            #invoice-content * {
              visibility: visible;
            }
            #invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>
      </div>
    );
  }
);

OrderInvoice.displayName = 'OrderInvoice';

export default OrderInvoice;
