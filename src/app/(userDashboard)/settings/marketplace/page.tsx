'use client';

import React, { useState, useEffect } from 'react';
import { sellerService, MarketplaceSettings } from '@/services/sellerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, TrendingUp, Package, Settings as SettingsIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketplaceSettingsPage() {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    is_opted_in: false,
    product_opt_in_mode: 'ALL' as 'ALL' | 'SELECTIVE' | 'NONE',
    auto_accept_marketplace_orders: true,
    marketplace_fulfillment_days: 3,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getMarketplaceSettings();
      setSettings(data);
      setFormData({
        is_opted_in: data.is_opted_in,
        product_opt_in_mode: data.product_opt_in_mode,
        auto_accept_marketplace_orders: data.auto_accept_marketplace_orders,
        marketplace_fulfillment_days: data.marketplace_fulfillment_days,
      });
    } catch (error: any) {
      console.error('Error fetching marketplace settings:', error);

      if (error.response?.data?.code === 'MARKETPLACE_NOT_ALLOWED') {
        toast.error('Marketplace listing not available on your plan');
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await sellerService.updateMarketplaceSettings(formData);
      toast.success('Marketplace settings updated successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

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
          <Store className="h-8 w-8" />
          Marketplace Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          List your products on shop.ezymemo.com and reach more customers
        </p>
      </div>

      {/* Opt-In Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Marketplace Participation</CardTitle>
          <CardDescription>
            Enable this to list your shop and products on the ezyMemo marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="opt-in">Join Marketplace</Label>
              <p className="text-sm text-muted-foreground">
                {formData.is_opted_in
                  ? '✓ Your shop is visible on shop.ezymemo.com'
                  : '✗ Your shop is not listed in the marketplace'}
              </p>
            </div>
            <Switch
              id="opt-in"
              checked={formData.is_opted_in}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_opted_in: checked })
              }
            />
          </div>

          {formData.is_opted_in && (
            <Alert className="mt-4">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Your products will be visible to all marketplace visitors. Commission rates apply based on your subscription plan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Product Visibility Mode */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Visibility</CardTitle>
          <CardDescription>
            Control which products appear in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visibility-mode">Visibility Mode</Label>
            <Select
              value={formData.product_opt_in_mode}
              onValueChange={(value: any) =>
                setFormData({ ...formData, product_opt_in_mode: value })
              }
            >
              <SelectTrigger id="visibility-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <div>
                      <div>All Products</div>
                      <div className="text-xs text-muted-foreground">
                        All active products are visible in marketplace
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="SELECTIVE">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <div>
                      <div>Selective Products</div>
                      <div className="text-xs text-muted-foreground">
                        Manually choose which products to list
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="NONE">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <div>No Products</div>
                      <div className="text-xs text-muted-foreground">
                        Shop visible but no products listed
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.product_opt_in_mode === 'SELECTIVE' && (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                You can manage product visibility from your Products page. Toggle marketplace visibility for each product individually.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Order Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Settings</CardTitle>
          <CardDescription>
            Configure how marketplace orders are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-accept">Auto-Accept Orders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept marketplace orders without manual approval
              </p>
            </div>
            <Switch
              id="auto-accept"
              checked={formData.auto_accept_marketplace_orders}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_accept_marketplace_orders: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fulfillment-days">Fulfillment Days</Label>
            <Input
              id="fulfillment-days"
              type="number"
              min="1"
              max="30"
              value={formData.marketplace_fulfillment_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  marketplace_fulfillment_days: parseInt(e.target.value) || 3,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Expected number of days to fulfill marketplace orders (shown to customers)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Commission Info */}
      {settings && (
        <Alert className="mb-6">
          <SettingsIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Commission Information:</strong> Platform commission rates vary by subscription plan.
            View your current rate in the{' '}
            <a href="/subscription" className="underline font-semibold">
              Subscription
            </a>{' '}
            page. Enterprise plan has 0% commission.
          </AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchSettings} disabled={saving}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
