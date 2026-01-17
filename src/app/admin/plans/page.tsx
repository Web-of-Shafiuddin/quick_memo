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
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '@/lib/adminApi';

interface Plan {
    plan_id: number;
    name: string;
    description: string | null;
    monthly_price: number;
    half_yearly_price: number | null;
    yearly_price: number | null;
    max_categories: number;
    max_products: number;
    max_orders_per_month: number;
    max_customers: number;
    can_upload_images: boolean;
    features: string[];
    badge_text: string | null;
    badge_color: string | null;
    display_order: number;
    is_popular: boolean;
    is_active: boolean;
}

const initialFormState = {
    name: '',
    description: '',
    monthly_price: 0,
    half_yearly_price: 0,
    yearly_price: 0,
    max_categories: -1,
    max_products: -1,
    max_orders_per_month: -1,
    max_customers: -1,
    can_upload_images: false,
    features: [] as string[],
    badge_text: '',
    badge_color: '',
    display_order: 0,
    is_popular: false,
    is_active: true,
};

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [formDialog, setFormDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [featuresText, setFeaturesText] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/subscriptions/admin/plans');
            const plansData = response.data.data || [];
            const parsedPlans = plansData.map((plan: any) => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []
            }));
            setPlans(parsedPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to fetch plans');
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setSelectedPlan(null);
        setFormData(initialFormState);
        setFeaturesText('');
        setFormDialog(true);
    };

    const openEditDialog = (plan: Plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            monthly_price: plan.monthly_price,
            half_yearly_price: plan.half_yearly_price || 0,
            yearly_price: plan.yearly_price || 0,
            max_categories: plan.max_categories,
            max_products: plan.max_products,
            max_orders_per_month: plan.max_orders_per_month,
            max_customers: plan.max_customers,
            can_upload_images: plan.can_upload_images,
            features: plan.features,
            badge_text: plan.badge_text || '',
            badge_color: plan.badge_color || '',
            display_order: plan.display_order,
            is_popular: plan.is_popular,
            is_active: plan.is_active,
        });
        setFeaturesText(plan.features.join('\n'));
        setFormDialog(true);
    };

    const openDeleteDialog = (plan: Plan) => {
        setSelectedPlan(plan);
        setDeleteDialog(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('Plan name is required');
            return;
        }

        try {
            setProcessing(true);
            const features = featuresText.split('\n').filter(f => f.trim());
            const payload = {
                ...formData,
                features,
                half_yearly_price: formData.half_yearly_price || null,
                yearly_price: formData.yearly_price || null,
                badge_text: formData.badge_text || null,
                badge_color: formData.badge_color || null,
                description: formData.description || null,
            };

            if (selectedPlan) {
                await adminApi.put(`/subscriptions/admin/plans/${selectedPlan.plan_id}`, payload);
                toast.success('Plan updated successfully');
            } else {
                await adminApi.post('/subscriptions/admin/plans', payload);
                toast.success('Plan created successfully');
            }

            setFormDialog(false);
            fetchPlans();
        } catch (error: any) {
            console.error('Error saving plan:', error);
            toast.error(error.response?.data?.error || 'Failed to save plan');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPlan) return;

        try {
            setProcessing(true);
            await adminApi.delete(`/subscriptions/admin/plans/${selectedPlan.plan_id}`);
            toast.success('Plan deactivated successfully');
            setDeleteDialog(false);
            fetchPlans();
        } catch (error: any) {
            console.error('Error deleting plan:', error);
            toast.error(error.response?.data?.error || 'Failed to delete plan');
        } finally {
            setProcessing(false);
        }
    };

    const formatLimit = (value: number): string => {
        return value === -1 ? 'Unlimited' : value.toLocaleString();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
                        <p className="text-slate-400">Manage pricing plans and features</p>
                    </div>
                    <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Plan
                    </Button>
                </div>

                {/* Plans Table */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">All Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">Loading...</div>
                        ) : plans.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No plans found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-slate-400">Order</TableHead>
                                            <TableHead className="text-slate-400">Plan</TableHead>
                                            <TableHead className="text-slate-400">Pricing</TableHead>
                                            <TableHead className="text-slate-400">Limits</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                            <TableHead className="text-slate-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plans.map((plan) => (
                                            <TableRow key={plan.plan_id} className="border-slate-700">
                                                <TableCell className="text-slate-300">
                                                    {plan.display_order}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <div className="font-medium text-white flex items-center gap-2">
                                                                {plan.name}
                                                                {plan.is_popular && (
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                )}
                                                            </div>
                                                            {plan.badge_text && (
                                                                <Badge className={`mt-1 bg-${plan.badge_color}-500`}>
                                                                    {plan.badge_text}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="text-white">${plan.monthly_price}/mo</div>
                                                        {plan.half_yearly_price && (
                                                            <div className="text-slate-400">${plan.half_yearly_price}/6mo</div>
                                                        )}
                                                        {plan.yearly_price && (
                                                            <div className="text-slate-400">${plan.yearly_price}/yr</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-slate-300 space-y-1">
                                                        <div>Products: {formatLimit(plan.max_products)}</div>
                                                        <div>Orders: {formatLimit(plan.max_orders_per_month)}</div>
                                                        <div>Customers: {formatLimit(plan.max_customers)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {plan.is_active ? (
                                                        <Badge className="bg-green-600">Active</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-600">Inactive</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-slate-300 hover:text-white hover:bg-slate-700"
                                                            onClick={() => openEditDialog(plan)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-400 hover:bg-slate-700"
                                                            onClick={() => openDeleteDialog(plan)}
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
                        <DialogTitle>{selectedPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {selectedPlan ? 'Update plan details' : 'Add a new subscription plan'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Plan Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-700 border-slate-600"
                                    placeholder="e.g., Premium"
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
                            <Label className="text-slate-300">Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-slate-700 border-slate-600"
                                placeholder="Brief description of the plan"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Monthly Price ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.monthly_price}
                                    onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">6-Month Price ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.half_yearly_price}
                                    onChange={(e) => setFormData({ ...formData, half_yearly_price: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Yearly Price ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.yearly_price}
                                    onChange={(e) => setFormData({ ...formData, yearly_price: parseFloat(e.target.value) || 0 })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Max Products (-1 = unlimited)</Label>
                                <Input
                                    type="number"
                                    value={formData.max_products}
                                    onChange={(e) => setFormData({ ...formData, max_products: parseInt(e.target.value) })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Max Orders/Month</Label>
                                <Input
                                    type="number"
                                    value={formData.max_orders_per_month}
                                    onChange={(e) => setFormData({ ...formData, max_orders_per_month: parseInt(e.target.value) })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Max Customers</Label>
                                <Input
                                    type="number"
                                    value={formData.max_customers}
                                    onChange={(e) => setFormData({ ...formData, max_customers: parseInt(e.target.value) })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Max Categories</Label>
                                <Input
                                    type="number"
                                    value={formData.max_categories}
                                    onChange={(e) => setFormData({ ...formData, max_categories: parseInt(e.target.value) })}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Image Upload</Label>
                                <div className="flex items-center gap-2 h-10">
                                    <Switch
                                        checked={formData.can_upload_images}
                                        onCheckedChange={(checked) => setFormData({ ...formData, can_upload_images: checked })}
                                    />
                                    <span className="text-slate-400 text-sm">
                                        {formData.can_upload_images ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Badge Text</Label>
                                <Input
                                    value={formData.badge_text}
                                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                                    className="bg-slate-700 border-slate-600"
                                    placeholder="e.g., Popular"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Features (one per line)</Label>
                            <Textarea
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                className="bg-slate-700 border-slate-600"
                                placeholder="Enter each feature on a new line"
                                rows={5}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_popular}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                                />
                                <Label className="text-slate-300">Mark as Popular</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label className="text-slate-300">Active</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing}>
                            {processing ? 'Saving...' : selectedPlan ? 'Update Plan' : 'Create Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Deactivate Plan</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to deactivate the "{selectedPlan?.name}" plan?
                            This will hide it from users but won't affect existing subscriptions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(false)} className="border-slate-600">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} disabled={processing} variant="destructive">
                            {processing ? 'Deactivating...' : 'Deactivate Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
