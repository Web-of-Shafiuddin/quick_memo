'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Download, Loader2, Layout } from 'lucide-react';
import { toast } from 'sonner';
import TemplateMemoPreview from './template-memo-preview';
import { downloadTemplateInvoicePdf } from './template-invoice-pdf';
import type { TemplateConfig } from './template-memo-preview';
import Link from 'next/link';

interface TemplateOption {
    template_id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    layout_type: string;
    config: TemplateConfig;
    preset_data: {
        profession?: string;
        invoiceTitle?: string;
        itemsHeader?: string;
        defaultNotes?: string;
        defaultItems?: Array<{ name: string; price: number }>;
    };
    is_default: boolean;
}

interface ProductItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

interface PublicInvoiceCreatorProps {
    defaultTemplateSlug?: string;
}

const defaultTemplateConfig: TemplateConfig = {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#f59e0b',
    headerStyle: 'modern',
    borderStyle: 'rounded',
    tableStyle: 'striped',
    showLogo: true,
    showFooter: true,
    showWatermark: true,
};

export default function PublicInvoiceCreator({ defaultTemplateSlug }: PublicInvoiceCreatorProps) {
    const [templates, setTemplates] = useState<TemplateOption[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Shop info (saved to localStorage)
    const [shopName, setShopName] = useState('');
    const [shopMobile, setShopMobile] = useState('');
    const [shopAddress, setShopAddress] = useState('');

    // Customer info
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    // Products
    const [products, setProducts] = useState<ProductItem[]>([
        { id: '1', name: '', quantity: 1, price: 0, total: 0 },
    ]);

    // Payment & delivery
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'paid'>('cod');
    const [notes, setNotes] = useState('');

    // Load templates from API
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await fetch(`${apiUrl}/invoice-templates`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.data)) {
                        const fetchedTemplates = data.data.map((t: any) => ({
                            ...t,
                            config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config,
                            preset_data: typeof t.preset_data === 'string' ? JSON.parse(t.preset_data) : t.preset_data,
                        }));
                        setTemplates(fetchedTemplates);

                        // Select the default template or the one specified by slug
                        const target = defaultTemplateSlug
                            ? fetchedTemplates.find((t: TemplateOption) => t.slug === defaultTemplateSlug)
                            : fetchedTemplates.find((t: TemplateOption) => t.is_default) || fetchedTemplates[0];

                        if (target) {
                            applyTemplate(target);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            } finally {
                setLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, [defaultTemplateSlug]);

    // Load saved shop info from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('publicShopInfo');
            if (saved) {
                const parsed = JSON.parse(saved);
                setShopName(parsed.shopName || '');
                setShopMobile(parsed.shopMobile || '');
                setShopAddress(parsed.shopAddress || '');
            }
        } catch {
            // ignore
        }
    }, []);

    const applyTemplate = (template: TemplateOption) => {
        setSelectedTemplate(template);
        const preset = template.preset_data;
        if (preset?.defaultNotes) setNotes(preset.defaultNotes);
        if (preset?.defaultItems?.length) {
            setProducts(
                preset.defaultItems.map((item, index) => ({
                    id: Date.now().toString() + index,
                    name: item.name,
                    quantity: 1,
                    price: item.price,
                    total: item.price,
                }))
            );
        }
    };

    const saveShopInfo = () => {
        try {
            localStorage.setItem('publicShopInfo', JSON.stringify({
                shopName, shopMobile, shopAddress,
            }));
            toast.success('Business info saved locally!');
        } catch {
            toast.error('Failed to save');
        }
    };

    // Product operations
    const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updated.total = updated.quantity * updated.price;
                }
                return updated;
            }
            return p;
        }));
    };

    const addProduct = () => {
        setProducts(prev => [...prev, {
            id: Date.now().toString(),
            name: '',
            quantity: 1,
            price: 0,
            total: 0,
        }]);
    };

    const removeProduct = (id: string) => {
        if (products.length > 1) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const subtotal = products.reduce((sum, p) => sum + p.total, 0);
    const totalAmount = subtotal + deliveryCharge - discount;

    const templateConfig = selectedTemplate
        ? { layout_type: selectedTemplate.layout_type, config: { ...defaultTemplateConfig, ...selectedTemplate.config } }
        : { layout_type: 'classic', config: defaultTemplateConfig };

    const memoData = {
        shopName,
        shopMobile,
        shopAddress,
        customerName,
        customerMobile,
        customerAddress,
        items: products,
        subtotal,
        deliveryCharge,
        discount,
        totalAmount,
        paymentMethod,
        notes,
        invoiceTitle: selectedTemplate?.preset_data?.invoiceTitle,
        itemsHeader: selectedTemplate?.preset_data?.itemsHeader,
    };

    const handleDownload = async () => {
        if (!customerName.trim()) {
            toast.error('Please enter a customer name');
            return;
        }
        if (products.every(p => !p.name.trim() || p.price <= 0)) {
            toast.error('Please add at least one item');
            return;
        }

        setDownloading(true);
        try {
            await downloadTemplateInvoicePdf(templateConfig, memoData);
            toast.success('Invoice downloaded!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    {/* Template Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layout className="w-5 h-5" />
                                Choose Template
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingTemplates ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading templates...
                                </div>
                            ) : templates.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No templates available. Using default design.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {templates.map((t) => (
                                        <button
                                            key={t.template_id}
                                            onClick={() => applyTemplate(t)}
                                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[100px] ${
                                                selectedTemplate?.template_id === t.template_id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            {t.thumbnail_url ? (
                                                <img src={t.thumbnail_url} alt={t.name} className="w-16 h-16 rounded object-cover mb-2" />
                                            ) : (
                                                <div
                                                    className="w-16 h-16 rounded mb-2 flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ backgroundColor: (t.config as any)?.primaryColor || '#2563eb' }}
                                                >
                                                    {t.layout_type?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{t.name}</span>
                                            {t.is_default && (
                                                <Badge variant="secondary" className="mt-1 text-xs px-1.5 py-0">Default</Badge>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Business Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Your Business Info</CardTitle>
                                <Button onClick={saveShopInfo} size="sm" variant="outline">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="shopName">Business Name</Label>
                                    <Input
                                        id="shopName"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        placeholder="Your business name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="shopMobile">Phone Number</Label>
                                    <Input
                                        id="shopMobile"
                                        value={shopMobile}
                                        onChange={(e) => setShopMobile(e.target.value)}
                                        placeholder="+1 234-567-8900"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="shopAddress">Business Address</Label>
                                <Input
                                    id="shopAddress"
                                    value={shopAddress}
                                    onChange={(e) => setShopAddress(e.target.value)}
                                    placeholder="Your business address"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Customer name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customerMobile">Customer Phone</Label>
                                    <Input
                                        id="customerMobile"
                                        value={customerMobile}
                                        onChange={(e) => setCustomerMobile(e.target.value)}
                                        placeholder="+1 234-567-8900"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="customerAddress">Delivery Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Customer delivery address"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    {selectedTemplate?.preset_data?.itemsHeader || 'Items & Services'}
                                </CardTitle>
                                <Button onClick={addProduct} size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {products.map((product) => (
                                    <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-12 md:col-span-5">
                                            <Input
                                                value={product.name}
                                                onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                                placeholder="Item name"
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-2">
                                            <Input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                                                placeholder="Qty"
                                                min="1"
                                            />
                                        </div>
                                        <div className="col-span-3 md:col-span-2">
                                            <Input
                                                type="number"
                                                value={product.price}
                                                onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                                placeholder="Price"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2">
                                            <span className="text-sm font-medium">${product.total.toFixed(2)}</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeProduct(product.id)}
                                                disabled={products.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment & Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payment & Delivery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                                    <Input
                                        id="deliveryCharge"
                                        type="number"
                                        value={deliveryCharge}
                                        onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discount">Discount</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={(v: 'cod' | 'paid') => setPaymentMethod(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                                            <SelectItem value="paid">Already Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions or notes"
                                    rows={2}
                                />
                            </div>

                            {/* Summary */}
                            <div className="border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery:</span>
                                        <span className="font-medium">${deliveryCharge.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount:</span>
                                        <span className="font-medium text-red-600">-${discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Download Button */}
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        size="lg"
                        className="w-full"
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Invoice PDF
                            </>
                        )}
                    </Button>

                    {/* Sign-up CTA */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-blue-900">Save your invoices in the cloud</p>
                                    <p className="text-sm text-blue-700">
                                        Create a free account to save, manage, and track all your invoices.
                                    </p>
                                </div>
                                <Link href="/auth/login">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        Sign Up Free
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Preview */}
                <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <TemplateMemoPreview template={templateConfig} data={memoData} />
                </div>
            </div>
        </div>
    );
}
