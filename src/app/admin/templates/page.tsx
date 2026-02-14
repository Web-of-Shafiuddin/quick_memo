'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface InvoiceTemplate {
    template_id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    layout_type: string;
    config: TemplateConfig;
    preset_data: PresetData;
    is_active: boolean;
    is_default: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

interface TemplateConfig {
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

interface PresetData {
    profession: string;
    invoiceTitle: string;
    itemsHeader: string;
    defaultNotes: string;
    defaultItems: Array<{ name: string; price: number }>;
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

const defaultPresetData: PresetData = {
    profession: '',
    invoiceTitle: 'Invoice',
    itemsHeader: 'Items & Services',
    defaultNotes: 'Thank you for your business!',
    defaultItems: [{ name: '', price: 0 }],
};

const initialFormState = {
    name: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    layout_type: 'classic',
    config: { ...defaultConfig },
    preset_data: { ...defaultPresetData },
    is_active: true,
    is_default: false,
    sort_order: 0,
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [formDialog, setFormDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'visual' | 'preset'>('basic');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/admin/templates');
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setSelectedTemplate(null);
        setFormData({
            ...initialFormState,
            config: { ...defaultConfig },
            preset_data: { ...defaultPresetData, defaultItems: [{ name: '', price: 0 }] },
        });
        setActiveTab('basic');
        setFormDialog(true);
    };

    const openEditDialog = (template: InvoiceTemplate) => {
        setSelectedTemplate(template);
        const config = typeof template.config === 'string' ? JSON.parse(template.config) : template.config;
        const preset = typeof template.preset_data === 'string' ? JSON.parse(template.preset_data) : template.preset_data;
        setFormData({
            name: template.name,
            slug: template.slug,
            description: template.description || '',
            thumbnail_url: template.thumbnail_url || '',
            layout_type: template.layout_type,
            config: { ...defaultConfig, ...config },
            preset_data: {
                ...defaultPresetData,
                ...preset,
                defaultItems: preset?.defaultItems?.length ? preset.defaultItems : [{ name: '', price: 0 }],
            },
            is_active: template.is_active,
            is_default: template.is_default,
            sort_order: template.sort_order,
        });
        setActiveTab('basic');
        setFormDialog(true);
    };

    const openDeleteDialog = (template: InvoiceTemplate) => {
        setSelectedTemplate(template);
        setDeleteDialog(true);
    };

    const handleNameChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            slug: selectedTemplate ? prev.slug : generateSlug(name),
        }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast.error('Name and slug are required');
            return;
        }

        try {
            setProcessing(true);
            const payload = {
                ...formData,
                description: formData.description || null,
                thumbnail_url: formData.thumbnail_url || null,
                preset_data: {
                    ...formData.preset_data,
                    defaultItems: formData.preset_data.defaultItems.filter(item => item.name.trim()),
                },
            };

            if (selectedTemplate) {
                await adminApi.put(`/admin/templates/${selectedTemplate.template_id}`, payload);
                toast.success('Template updated');
            } else {
                await adminApi.post('/admin/templates', payload);
                toast.success('Template created');
            }

            setFormDialog(false);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save template');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTemplate) return;
        try {
            setProcessing(true);
            await adminApi.delete(`/admin/templates/${selectedTemplate.template_id}`);
            toast.success('Template deleted');
            setDeleteDialog(false);
            fetchTemplates();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete template');
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleActive = async (template: InvoiceTemplate) => {
        try {
            await adminApi.put(`/admin/templates/${template.template_id}`, {
                is_active: !template.is_active,
            });
            toast.success(`Template ${template.is_active ? 'deactivated' : 'activated'}`);
            fetchTemplates();
        } catch (error: any) {
            toast.error('Failed to toggle template status');
        }
    };

    const addPresetItem = () => {
        setFormData(prev => ({
            ...prev,
            preset_data: {
                ...prev.preset_data,
                defaultItems: [...prev.preset_data.defaultItems, { name: '', price: 0 }],
            },
        }));
    };

    const removePresetItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            preset_data: {
                ...prev.preset_data,
                defaultItems: prev.preset_data.defaultItems.filter((_, i) => i !== index),
            },
        }));
    };

    const updatePresetItem = (index: number, field: 'name' | 'price', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            preset_data: {
                ...prev.preset_data,
                defaultItems: prev.preset_data.defaultItems.map((item, i) =>
                    i === index ? { ...item, [field]: value } : item
                ),
            },
        }));
    };

    const getLayoutBadge = (type: string) => {
        const colors: Record<string, string> = {
            classic: 'bg-blue-600',
            modern: 'bg-purple-600',
            minimal: 'bg-gray-600',
            bold: 'bg-orange-600',
        };
        return <Badge className={colors[type] || 'bg-gray-600'}>{type}</Badge>;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Invoice Templates</h1>
                        <p className="text-slate-400">Manage invoice and memo template designs</p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Template
                    </Button>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No templates found. Create your first template.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-slate-400">Order</TableHead>
                                            <TableHead className="text-slate-400">Thumbnail</TableHead>
                                            <TableHead className="text-slate-400">Name</TableHead>
                                            <TableHead className="text-slate-400">Slug</TableHead>
                                            <TableHead className="text-slate-400">Layout</TableHead>
                                            <TableHead className="text-slate-400">Default</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates.map((template) => (
                                            <TableRow key={template.template_id} className="border-slate-700">
                                                <TableCell className="text-slate-300">{template.sort_order}</TableCell>
                                                <TableCell>
                                                    {template.thumbnail_url ? (
                                                        <img
                                                            src={template.thumbnail_url}
                                                            alt={template.name}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center text-slate-500 text-xs">
                                                            N/A
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-white font-medium">{template.name}</TableCell>
                                                <TableCell className="text-slate-300 font-mono text-sm">{template.slug}</TableCell>
                                                <TableCell>{getLayoutBadge(template.layout_type)}</TableCell>
                                                <TableCell>
                                                    {template.is_default && (
                                                        <Badge className="bg-yellow-600">Default</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={template.is_active}
                                                        onCheckedChange={() => handleToggleActive(template)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                            onClick={() => openEditDialog(template)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-400 hover:bg-slate-700"
                                                            onClick={() => openDeleteDialog(template)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={formDialog} onOpenChange={setFormDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure an invoice template with visual settings and preset data
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 border-b border-slate-700 pb-2">
                        {(['basic', 'visual', 'preset'] as const).map((tab) => (
                            <Button
                                key={tab}
                                size="sm"
                                variant={activeTab === tab ? 'secondary' : 'ghost'}
                                className={activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400'}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'basic' ? 'Basic Info' : tab === 'visual' ? 'Visual Config' : 'Preset Data'}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-4 py-4">
                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Template Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="bg-slate-700 border-slate-600"
                                            placeholder="e.g., Photography Receipt"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Slug *</Label>
                                        <Input
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="bg-slate-700 border-slate-600"
                                            placeholder="photography-receipt"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="A brief description of this template..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Layout Type</Label>
                                        <Select
                                            value={formData.layout_type}
                                            onValueChange={(value) => setFormData({ ...formData, layout_type: value })}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="classic">Classic</SelectItem>
                                                <SelectItem value="modern">Modern</SelectItem>
                                                <SelectItem value="minimal">Minimal</SelectItem>
                                                <SelectItem value="bold">Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Sort Order</Label>
                                        <Input
                                            type="number"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                            className="bg-slate-700 border-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Thumbnail URL</Label>
                                    <Input
                                        value={formData.thumbnail_url}
                                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="https://example.com/thumbnail.png"
                                    />
                                    {formData.thumbnail_url && (
                                        <div className="border border-slate-600 rounded p-2 mt-2">
                                            <img src={formData.thumbnail_url} alt="Thumbnail preview" className="w-32 h-auto rounded" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label className="text-slate-300">Active</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.is_default}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                                        />
                                        <Label className="text-slate-300">Default Template</Label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Visual Config Tab */}
                        {activeTab === 'visual' && (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Primary Color</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.config.primaryColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, primaryColor: e.target.value },
                                                })}
                                                className="w-10 h-10 rounded cursor-pointer border-0"
                                            />
                                            <Input
                                                value={formData.config.primaryColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, primaryColor: e.target.value },
                                                })}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Secondary Color</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.config.secondaryColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, secondaryColor: e.target.value },
                                                })}
                                                className="w-10 h-10 rounded cursor-pointer border-0"
                                            />
                                            <Input
                                                value={formData.config.secondaryColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, secondaryColor: e.target.value },
                                                })}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Accent Color</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={formData.config.accentColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, accentColor: e.target.value },
                                                })}
                                                className="w-10 h-10 rounded cursor-pointer border-0"
                                            />
                                            <Input
                                                value={formData.config.accentColor}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, accentColor: e.target.value },
                                                })}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Header Style</Label>
                                        <Select
                                            value={formData.config.headerStyle}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, headerStyle: value },
                                            })}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="modern">Modern</SelectItem>
                                                <SelectItem value="classic">Classic</SelectItem>
                                                <SelectItem value="minimal">Minimal</SelectItem>
                                                <SelectItem value="centered">Centered</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Border Style</Label>
                                        <Select
                                            value={formData.config.borderStyle}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, borderStyle: value },
                                            })}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rounded">Rounded</SelectItem>
                                                <SelectItem value="sharp">Sharp</SelectItem>
                                                <SelectItem value="none">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Table Style</Label>
                                        <Select
                                            value={formData.config.tableStyle}
                                            onValueChange={(value) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, tableStyle: value },
                                            })}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="striped">Striped</SelectItem>
                                                <SelectItem value="bordered">Bordered</SelectItem>
                                                <SelectItem value="clean">Clean</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.config.showLogo}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, showLogo: checked },
                                            })}
                                        />
                                        <Label className="text-slate-300">Show Logo</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.config.showFooter}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, showFooter: checked },
                                            })}
                                        />
                                        <Label className="text-slate-300">Show Footer</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.config.showWatermark}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, showWatermark: checked },
                                            })}
                                        />
                                        <Label className="text-slate-300">Show Watermark</Label>
                                    </div>
                                </div>

                                {/* Color Preview */}
                                <div className="border border-slate-600 rounded p-4">
                                    <Label className="text-slate-400 text-xs mb-3 block">Color Preview</Label>
                                    <div className="flex gap-3">
                                        <div
                                            className="w-16 h-16 rounded"
                                            style={{ backgroundColor: formData.config.primaryColor }}
                                        >
                                            <span className="text-white text-xs p-1 block">Primary</span>
                                        </div>
                                        <div
                                            className="w-16 h-16 rounded"
                                            style={{ backgroundColor: formData.config.secondaryColor }}
                                        >
                                            <span className="text-white text-xs p-1 block">Secondary</span>
                                        </div>
                                        <div
                                            className="w-16 h-16 rounded"
                                            style={{ backgroundColor: formData.config.accentColor }}
                                        >
                                            <span className="text-white text-xs p-1 block">Accent</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Preset Data Tab */}
                        {activeTab === 'preset' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Profession</Label>
                                        <Input
                                            value={formData.preset_data.profession}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preset_data: { ...formData.preset_data, profession: e.target.value },
                                            })}
                                            className="bg-slate-700 border-slate-600"
                                            placeholder="e.g., Photography"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Invoice Title</Label>
                                        <Input
                                            value={formData.preset_data.invoiceTitle}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preset_data: { ...formData.preset_data, invoiceTitle: e.target.value },
                                            })}
                                            className="bg-slate-700 border-slate-600"
                                            placeholder="e.g., Photography Invoice"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Items Header</Label>
                                    <Input
                                        value={formData.preset_data.itemsHeader}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            preset_data: { ...formData.preset_data, itemsHeader: e.target.value },
                                        })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="e.g., Services & Products"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-300">Default Notes</Label>
                                    <Textarea
                                        value={formData.preset_data.defaultNotes}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            preset_data: { ...formData.preset_data, defaultNotes: e.target.value },
                                        })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="Thank you for choosing our services!"
                                        rows={2}
                                    />
                                </div>

                                {/* Default Items */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-slate-300">Default Items</Label>
                                        <Button size="sm" variant="ghost" onClick={addPresetItem} className="text-green-400 hover:text-green-300">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Item
                                        </Button>
                                    </div>
                                    {formData.preset_data.defaultItems.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                value={item.name}
                                                onChange={(e) => updatePresetItem(index, 'name', e.target.value)}
                                                className="bg-slate-700 border-slate-600 flex-1"
                                                placeholder="Item name"
                                            />
                                            <Input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updatePresetItem(index, 'price', parseFloat(e.target.value) || 0)}
                                                className="bg-slate-700 border-slate-600 w-28"
                                                placeholder="Price"
                                                min="0"
                                                step="0.01"
                                            />
                                            {formData.preset_data.defaultItems.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removePresetItem(index)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing}>
                            {processing ? 'Saving...' : selectedTemplate ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to delete &quot;{selectedTemplate?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} disabled={processing} variant="destructive">
                            {processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
