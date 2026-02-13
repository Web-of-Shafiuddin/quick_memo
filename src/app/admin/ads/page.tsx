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
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface AdPlacement {
    ad_id: number;
    slot_name: string;
    ad_type: 'ADSENSE' | 'CUSTOM_BANNER' | 'CUSTOM_HTML';
    ad_client: string | null;
    ad_slot: string | null;
    custom_html: string | null;
    custom_image_url: string | null;
    custom_link_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

const initialFormState = {
    slot_name: '',
    ad_type: 'ADSENSE' as 'ADSENSE' | 'CUSTOM_BANNER' | 'CUSTOM_HTML',
    ad_client: '',
    ad_slot: '',
    custom_html: '',
    custom_image_url: '',
    custom_link_url: '',
    is_active: true,
    display_order: 0,
};

export default function AdminAdsPage() {
    const [placements, setPlacements] = useState<AdPlacement[]>([]);
    const [loading, setLoading] = useState(true);
    const [formDialog, setFormDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [previewDialog, setPreviewDialog] = useState(false);
    const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPlacements();
    }, []);

    const fetchPlacements = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/ads');
            setPlacements(response.data.data || []);
        } catch (error) {
            console.error('Error fetching ad placements:', error);
            toast.error('Failed to fetch ad placements');
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setSelectedPlacement(null);
        setFormData(initialFormState);
        setFormDialog(true);
    };

    const openEditDialog = (placement: AdPlacement) => {
        setSelectedPlacement(placement);
        setFormData({
            slot_name: placement.slot_name,
            ad_type: placement.ad_type,
            ad_client: placement.ad_client || '',
            ad_slot: placement.ad_slot || '',
            custom_html: placement.custom_html || '',
            custom_image_url: placement.custom_image_url || '',
            custom_link_url: placement.custom_link_url || '',
            is_active: placement.is_active,
            display_order: placement.display_order,
        });
        setFormDialog(true);
    };

    const openDeleteDialog = (placement: AdPlacement) => {
        setSelectedPlacement(placement);
        setDeleteDialog(true);
    };

    const openPreviewDialog = (placement: AdPlacement) => {
        setSelectedPlacement(placement);
        setPreviewDialog(true);
    };

    const handleSave = async () => {
        if (!formData.slot_name) {
            toast.error('Slot name is required');
            return;
        }

        try {
            setProcessing(true);
            const payload = {
                ...formData,
                ad_client: formData.ad_client || null,
                ad_slot: formData.ad_slot || null,
                custom_html: formData.custom_html || null,
                custom_image_url: formData.custom_image_url || null,
                custom_link_url: formData.custom_link_url || null,
            };

            if (selectedPlacement) {
                await adminApi.put(`/ads/${selectedPlacement.ad_id}`, payload);
                toast.success('Ad placement updated');
            } else {
                await adminApi.post('/ads', payload);
                toast.success('Ad placement created');
            }

            setFormDialog(false);
            fetchPlacements();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save ad placement');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPlacement) return;
        try {
            setProcessing(true);
            await adminApi.delete(`/ads/${selectedPlacement.ad_id}`);
            toast.success('Ad placement deleted');
            setDeleteDialog(false);
            fetchPlacements();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete ad placement');
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleActive = async (placement: AdPlacement) => {
        try {
            await adminApi.put(`/ads/${placement.ad_id}`, {
                is_active: !placement.is_active,
            });
            toast.success(`Ad ${placement.is_active ? 'deactivated' : 'activated'}`);
            fetchPlacements();
        } catch (error: any) {
            toast.error('Failed to toggle ad status');
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'ADSENSE':
                return <Badge className="bg-blue-600">AdSense</Badge>;
            case 'CUSTOM_BANNER':
                return <Badge className="bg-purple-600">Banner</Badge>;
            case 'CUSTOM_HTML':
                return <Badge className="bg-orange-600">HTML</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Ad Placements</h1>
                        <p className="text-slate-400">Manage ad slots across the platform</p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Placement
                    </Button>
                </div>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Placements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : placements.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No ad placements found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-slate-400">Order</TableHead>
                                            <TableHead className="text-slate-400">Slot Name</TableHead>
                                            <TableHead className="text-slate-400">Type</TableHead>
                                            <TableHead className="text-slate-400">AdSense IDs</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {placements.map((placement) => (
                                            <TableRow key={placement.ad_id} className="border-slate-700">
                                                <TableCell className="text-slate-300">{placement.display_order}</TableCell>
                                                <TableCell className="text-white font-mono text-sm">
                                                    {placement.slot_name}
                                                </TableCell>
                                                <TableCell>{getTypeBadge(placement.ad_type)}</TableCell>
                                                <TableCell className="text-slate-300 text-sm">
                                                    {placement.ad_type === 'ADSENSE' ? (
                                                        <div>
                                                            <div>Client: {placement.ad_client || <span className="text-slate-500">Not set</span>}</div>
                                                            <div>Slot: {placement.ad_slot || <span className="text-slate-500">Not set</span>}</div>
                                                        </div>
                                                    ) : placement.ad_type === 'CUSTOM_BANNER' ? (
                                                        <div className="truncate max-w-xs">{placement.custom_image_url || 'No image'}</div>
                                                    ) : (
                                                        <div className="truncate max-w-xs">{placement.custom_html ? 'HTML set' : 'No HTML'}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={placement.is_active}
                                                        onCheckedChange={() => handleToggleActive(placement)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {(placement.ad_type === 'CUSTOM_BANNER' || placement.ad_type === 'CUSTOM_HTML') && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                                onClick={() => openPreviewDialog(placement)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                            onClick={() => openEditDialog(placement)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-400 hover:bg-slate-700"
                                                            onClick={() => openDeleteDialog(placement)}
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
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedPlacement ? 'Edit Ad Placement' : 'Create Ad Placement'}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure an ad slot for the platform
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Slot Name *</Label>
                                <Input
                                    value={formData.slot_name}
                                    onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                                    className="bg-slate-700 border-slate-600"
                                    placeholder="e.g., marketplace_top_banner"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Display Order</Label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Ad Type</Label>
                            <Select
                                value={formData.ad_type}
                                onValueChange={(value) => setFormData({ ...formData, ad_type: value as any })}
                            >
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADSENSE">Google AdSense</SelectItem>
                                    <SelectItem value="CUSTOM_BANNER">Custom Banner</SelectItem>
                                    <SelectItem value="CUSTOM_HTML">Custom HTML</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.ad_type === 'ADSENSE' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">AdSense Client ID</Label>
                                    <Input
                                        value={formData.ad_client}
                                        onChange={(e) => setFormData({ ...formData, ad_client: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="ca-pub-XXXXXXXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">AdSense Slot ID</Label>
                                    <Input
                                        value={formData.ad_slot}
                                        onChange={(e) => setFormData({ ...formData, ad_slot: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.ad_type === 'CUSTOM_BANNER' && (
                            <>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Banner Image URL</Label>
                                    <Input
                                        value={formData.custom_image_url}
                                        onChange={(e) => setFormData({ ...formData, custom_image_url: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="https://example.com/banner.jpg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Click-through URL</Label>
                                    <Input
                                        value={formData.custom_link_url}
                                        onChange={(e) => setFormData({ ...formData, custom_link_url: e.target.value })}
                                        className="bg-slate-700 border-slate-600"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                {formData.custom_image_url && (
                                    <div className="border border-slate-600 rounded p-2">
                                        <Label className="text-slate-400 text-xs mb-2 block">Preview</Label>
                                        <img src={formData.custom_image_url} alt="Banner preview" className="w-full h-auto rounded max-h-32 object-contain" />
                                    </div>
                                )}
                            </>
                        )}

                        {formData.ad_type === 'CUSTOM_HTML' && (
                            <div className="space-y-2">
                                <Label className="text-slate-300">Custom HTML</Label>
                                <Textarea
                                    value={formData.custom_html}
                                    onChange={(e) => setFormData({ ...formData, custom_html: e.target.value })}
                                    className="bg-slate-700 border-slate-600 font-mono text-sm"
                                    placeholder="<div>Your ad HTML here</div>"
                                    rows={6}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label className="text-slate-300">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing}>
                            {processing ? 'Saving...' : selectedPlacement ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Ad Placement</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to delete "{selectedPlacement?.slot_name}"? This action cannot be undone.
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

            {/* Preview Dialog */}
            <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Preview: {selectedPlacement?.slot_name}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 bg-white rounded">
                        {selectedPlacement?.ad_type === 'CUSTOM_BANNER' && selectedPlacement.custom_image_url && (
                            <img src={selectedPlacement.custom_image_url} alt="Banner preview" className="w-full h-auto" />
                        )}
                        {selectedPlacement?.ad_type === 'CUSTOM_HTML' && selectedPlacement.custom_html && (
                            <div dangerouslySetInnerHTML={{ __html: selectedPlacement.custom_html }} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
