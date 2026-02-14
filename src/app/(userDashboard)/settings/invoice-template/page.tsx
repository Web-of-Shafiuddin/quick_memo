'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import useAuthStore from '@/store/authStore';
import TemplateMemoPreview from '@/components/template-memo-preview';
import type { TemplateConfig } from '@/components/template-memo-preview';

interface TemplateOption {
    template_id: number;
    name: string;
    slug: string;
    description: string | null;
    layout_type: string;
    config: TemplateConfig;
    preset_data: any;
    is_default: boolean;
}

const defaultConfig: TemplateConfig = {
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#f59e0b',
    headerStyle: 'modern',
    borderStyle: 'rounded',
    tableStyle: 'striped',
    showLogo: true,
    showFooter: true,
    showWatermark: false,
};

export default function InvoiceTemplateSettingsPage() {
    const [templates, setTemplates] = useState<TemplateOption[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [currentSavedId, setCurrentSavedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            // Fetch templates and user profile in parallel
            const [templatesRes, profileRes] = await Promise.all([
                fetch(`${apiUrl}/invoice-templates`),
                user ? userService.getById(user.user_id.toString()) : null,
            ]);

            if (templatesRes.ok) {
                const data = await templatesRes.json();
                if (data.success && Array.isArray(data.data)) {
                    const parsed = data.data.map((t: any) => ({
                        ...t,
                        config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config,
                        preset_data: typeof t.preset_data === 'string' ? JSON.parse(t.preset_data) : t.preset_data,
                    }));
                    setTemplates(parsed);
                }
            }

            if (profileRes?.data) {
                const prefId = profileRes.data.preferred_template_id || null;
                setSelectedId(prefId);
                setCurrentSavedId(prefId);
            }
        } catch (error) {
            console.error('Error loading template settings:', error);
            toast.error('Failed to load template settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        try {
            setSaving(true);
            await userService.update(user.user_id.toString(), {
                preferred_template_id: selectedId,
            });
            setCurrentSavedId(selectedId);
            toast.success('Template preference saved!');
        } catch (error) {
            console.error('Error saving template preference:', error);
            toast.error('Failed to save preference');
        } finally {
            setSaving(false);
        }
    };

    const selectedTemplate = templates.find(t => t.template_id === selectedId);
    const hasChanges = selectedId !== currentSavedId;

    const previewData = {
        shopName: user?.shop_name || user?.name || 'Your Business',
        shopMobile: user?.shop_mobile || user?.mobile || '+1 234-567-8900',
        shopAddress: user?.shop_address || '',
        customerName: 'John Smith',
        customerMobile: '+1 555-0123',
        customerAddress: '123 Main Street, City',
        items: selectedTemplate?.preset_data?.defaultItems?.length
            ? selectedTemplate.preset_data.defaultItems.map((item: any, i: number) => ({
                name: item.name,
                quantity: 1,
                price: item.price,
                total: item.price,
            }))
            : [
                { name: 'Sample Item', quantity: 1, price: 25, total: 25 },
                { name: 'Another Item', quantity: 2, price: 15, total: 30 },
            ],
        subtotal: 0,
        deliveryCharge: 5,
        discount: 0,
        totalAmount: 0,
        paymentMethod: 'cod',
        notes: selectedTemplate?.preset_data?.defaultNotes || 'Thank you for your business!',
        invoiceTitle: selectedTemplate?.preset_data?.invoiceTitle,
        itemsHeader: selectedTemplate?.preset_data?.itemsHeader,
    };

    // Calculate totals
    previewData.subtotal = previewData.items.reduce((sum: number, item: any) => sum + item.total, 0);
    previewData.totalAmount = previewData.subtotal + previewData.deliveryCharge - previewData.discount;

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="space-y-4">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                    <div className="h-64 bg-muted animate-pulse rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Layout className="h-8 w-8" />
                    Invoice Template
                </h1>
                <p className="text-muted-foreground mt-2">
                    Choose a template design for your invoices and order memos
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Template Selection */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Choose Template</CardTitle>
                            <CardDescription>
                                Select a template to apply to your invoices and order memos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {templates.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No templates available yet. Templates will appear here once created by the admin.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Default (no template) option */}
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                            selectedId === null
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {selectedId === null && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-5 h-5 text-blue-600" />
                                            </div>
                                        )}
                                        <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs font-bold mb-3">
                                            Default
                                        </div>
                                        <span className="text-sm font-medium text-center">Default Template</span>
                                        <span className="text-xs text-muted-foreground">Classic dark header</span>
                                    </button>

                                    {/* Template options */}
                                    {templates.map((t) => {
                                        const config = { ...defaultConfig, ...t.config };
                                        return (
                                            <button
                                                key={t.template_id}
                                                onClick={() => setSelectedId(t.template_id)}
                                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                                    selectedId === t.template_id
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {selectedId === t.template_id && (
                                                    <div className="absolute top-2 right-2">
                                                        <Check className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                )}
                                                <div
                                                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-3"
                                                    style={{ backgroundColor: config.primaryColor }}
                                                >
                                                    {t.layout_type?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-center leading-tight">{t.name}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{t.layout_type}</span>
                                                {t.is_default && (
                                                    <Badge variant="secondary" className="mt-1 text-xs">Recommended</Badge>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={fetchData} disabled={saving}>
                            Reset
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !hasChanges}>
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Template'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    {selectedTemplate ? (
                        <TemplateMemoPreview
                            template={{
                                layout_type: selectedTemplate.layout_type,
                                config: { ...defaultConfig, ...selectedTemplate.config },
                            }}
                            data={previewData}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200" style={{ maxWidth: '600px' }}>
                            <div className="bg-slate-800 text-white p-6 text-center">
                                <h1 className="text-2xl font-bold mb-2">{previewData.shopName}</h1>
                                <p className="text-sm opacity-90">Mobile: {previewData.shopMobile}</p>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-500 text-center text-sm py-8">
                                    This is the default template with a dark header.
                                    Select a custom template to see it previewed here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
