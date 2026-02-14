'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

export interface TemplateConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headerStyle: string;
    borderStyle: string;
    tableStyle: string;
    showLogo: boolean;
    showFooter: boolean;
    showWatermark: boolean;
}

export interface TemplateMemoData {
    shopName?: string;
    shopMobile?: string;
    shopAddress?: string;
    shopLogo?: string;
    customerName: string;
    customerMobile?: string;
    customerAddress?: string;
    items: Array<{ name: string; quantity: number; price: number; total: number }>;
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
    invoiceTitle?: string;
    itemsHeader?: string;
}

interface TemplateMemoPreviewProps {
    template: {
        layout_type: string;
        config: TemplateConfig;
    };
    data: TemplateMemoData;
}

const TemplateMemoPreview: React.FC<TemplateMemoPreviewProps> = ({ template, data }) => {
    const { config, layout_type } = template;
    const borderRadius = config.borderStyle === 'rounded' ? '0.75rem' : config.borderStyle === 'sharp' ? '0' : '0.25rem';

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const memoNumber = Date.now().toString().slice(-6);

    const filteredItems = data.items.filter(p => p.name && p.price > 0);

    const renderHeader = () => {
        switch (layout_type) {
            case 'modern':
                return (
                    <div
                        className="p-6 text-white"
                        style={{ backgroundColor: config.primaryColor, borderRadius: `${borderRadius} ${borderRadius} 0 0` }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{data.shopName || 'Your Shop Name'}</h1>
                                <p className="text-sm opacity-90">Mobile: {data.shopMobile || 'N/A'}</p>
                                {data.shopAddress && <p className="text-sm opacity-90">{data.shopAddress}</p>}
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold">{data.invoiceTitle || 'INVOICE'}</h2>
                                <p className="text-sm opacity-90">Date: {currentDate}</p>
                                <p className="text-sm opacity-90">Memo #: {memoNumber}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'minimal':
                return (
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-lg font-medium text-gray-900">{data.shopName || 'Your Shop Name'}</h1>
                        <p className="text-sm text-gray-500">
                            {data.shopMobile || ''} {data.shopAddress ? `| ${data.shopAddress}` : ''}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                            {data.invoiceTitle || 'Invoice'} #{memoNumber} | {currentDate}
                        </p>
                    </div>
                );
            case 'bold':
                return (
                    <div
                        className="p-8 text-white text-center"
                        style={{
                            backgroundColor: config.primaryColor,
                            borderBottom: `4px solid ${config.accentColor}`,
                            borderRadius: `${borderRadius} ${borderRadius} 0 0`,
                        }}
                    >
                        <h1 className="text-3xl font-extrabold mb-1">{data.shopName || 'YOUR SHOP NAME'}</h1>
                        <p className="text-sm opacity-90">
                            {data.shopMobile || ''} {data.shopAddress ? `| ${data.shopAddress}` : ''}
                        </p>
                        <h2 className="text-xl font-bold mt-3" style={{ color: config.accentColor }}>
                            {data.invoiceTitle || 'INVOICE'}
                        </h2>
                        <p className="text-sm opacity-90">Date: {currentDate} | Memo #: {memoNumber}</p>
                    </div>
                );
            default: // classic
                return (
                    <div className="p-6" style={{ borderBottom: `2px solid ${config.primaryColor}` }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.shopName || 'Your Shop Name'}</h1>
                                <p className="text-sm text-gray-500">Mobile: {data.shopMobile || 'N/A'}</p>
                                {data.shopAddress && <p className="text-sm text-gray-500">{data.shopAddress}</p>}
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold" style={{ color: config.primaryColor }}>
                                    {data.invoiceTitle || 'INVOICE'}
                                </h2>
                                <p className="text-sm text-gray-500">Date: {currentDate}</p>
                                <p className="text-sm text-gray-500">Memo #: {memoNumber}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="bg-white shadow-lg overflow-hidden border border-gray-200"
            style={{ borderRadius, width: '100%', maxWidth: '600px', margin: '0 auto' }}
        >
            {renderHeader()}

            <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3
                                className="font-semibold text-sm mb-1"
                                style={{
                                    color: layout_type === 'minimal' ? '#6b7280' : config.primaryColor,
                                    textTransform: layout_type === 'minimal' ? 'uppercase' : 'none',
                                    letterSpacing: layout_type === 'minimal' ? '0.05em' : 'normal',
                                }}
                            >
                                Bill To:
                            </h3>
                            <p className="text-gray-700 font-medium">{data.customerName || 'Customer Name'}</p>
                            {data.customerMobile && <p className="text-gray-500 text-sm">{data.customerMobile}</p>}
                            {data.customerAddress && <p className="text-gray-500 text-sm mt-1">{data.customerAddress}</p>}
                        </div>
                    </div>
                </div>

                {/* Items Header */}
                {data.itemsHeader && (
                    <h4 className="text-sm font-bold text-gray-700 mb-2">{data.itemsHeader}</h4>
                )}

                {/* Products Table */}
                <div className="mb-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr
                                style={
                                    layout_type === 'minimal'
                                        ? { borderBottom: '2px solid #e5e7eb' }
                                        : { backgroundColor: config.primaryColor }
                                }
                            >
                                <th
                                    className="text-left py-2 px-2 text-sm font-semibold"
                                    style={{ color: layout_type === 'minimal' ? '#374151' : '#ffffff' }}
                                >
                                    Product
                                </th>
                                <th
                                    className="text-center py-2 px-2 text-sm font-semibold"
                                    style={{ color: layout_type === 'minimal' ? '#374151' : '#ffffff' }}
                                >
                                    Qty
                                </th>
                                <th
                                    className="text-right py-2 px-2 text-sm font-semibold"
                                    style={{ color: layout_type === 'minimal' ? '#374151' : '#ffffff' }}
                                >
                                    Price
                                </th>
                                <th
                                    className="text-right py-2 px-2 text-sm font-semibold"
                                    style={{ color: layout_type === 'minimal' ? '#374151' : '#ffffff' }}
                                >
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100"
                                        style={
                                            config.tableStyle === 'striped' && index % 2 === 1
                                                ? { backgroundColor: '#f9fafb' }
                                                : {}
                                        }
                                    >
                                        <td className="py-3 px-2 text-sm text-gray-700">{item.name}</td>
                                        <td className="py-3 px-2 text-sm text-center text-gray-700">{item.quantity}</td>
                                        <td className="py-3 px-2 text-sm text-right text-gray-700">${item.price.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-sm text-right font-medium text-gray-800">${item.total.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-gray-400 text-sm">
                                        Add items to see them here
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {data.notes && (
                    <div className="mb-6 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{data.notes}</p>
                    </div>
                )}

                {/* Payment Status */}
                <div className="mb-4">
                    {data.paymentMethod === 'cod' ? (
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
                <div className="border-t-2 pt-4" style={{ borderColor: config.primaryColor }}>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">${data.subtotal.toFixed(2)}</span>
                        </div>
                        {data.deliveryCharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery:</span>
                                <span className="font-medium">${data.deliveryCharge.toFixed(2)}</span>
                            </div>
                        )}
                        {data.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-medium text-red-600">-${data.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total Amount:</span>
                            <span style={{ color: config.primaryColor }}>${data.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {config.showFooter && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 italic">Thank you for your business!</p>
                        <p className="text-xs text-gray-500 mt-2">This is a computer-generated document</p>
                    </div>
                )}

                {/* Watermark */}
                {config.showWatermark && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-center text-xs text-gray-400">
                            Created with EzyMemo - ezymemo.com
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateMemoPreview;
