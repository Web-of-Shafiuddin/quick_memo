'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencySelector } from '@/components/CurrencySelector';
import { userService } from '@/services/userService';
import useAuthStore from '@/store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { Save, Store, User as UserIcon, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    preferred_currency: 'USD',
    shop_name: '',
    shop_owner_name: '',
    shop_mobile: '',
    shop_email: '',
    shop_address: '',
  });

  useEffect(() => {
    if (user) {
      // First, populate with data from auth store
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        preferred_currency: user.preferred_currency || 'USD',
        shop_name: user.shop_name || '',
        shop_owner_name: user.shop_owner_name || '',
        shop_mobile: user.shop_mobile || '',
        shop_email: user.shop_email || '',
        shop_address: user.shop_address || '',
      });

      // Then fetch fresh data from API
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.user_id) return;

    try {
      const response = await userService.getById(user.user_id.toString());
      const userData = response.data;

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        mobile: userData.mobile || '',
        preferred_currency: userData.preferred_currency || 'USD',
        shop_name: userData.shop_name || '',
        shop_owner_name: userData.shop_owner_name || '',
        shop_mobile: userData.shop_mobile || '',
        shop_email: userData.shop_email || '',
        shop_address: userData.shop_address || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    try {
      setLoading(true);
      await userService.update(user.user_id.toString(), formData);
      toast.success('Profile updated successfully');

      // Update the auth store with new user data
      const response = await userService.getById(user.user_id.toString());
      useAuthStore.setState({ user: response.data });
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and shop information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Business Settings
            </CardTitle>
            <CardDescription>
              Configure your business currency for products, orders, and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_currency">Business Currency</Label>
                <CurrencySelector
                  value={formData.preferred_currency}
                  onChange={(value) => setFormData({ ...formData, preferred_currency: value })}
                />
                <p className="text-sm text-muted-foreground">
                  This currency will be used for your products, orders, and invoices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Shop Information
            </CardTitle>
            <CardDescription>
              This information will appear on your order memos and invoices. Make sure to fill in all fields for a professional look.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  placeholder="Your Shop Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_owner_name">Shop Owner Name</Label>
                <Input
                  id="shop_owner_name"
                  name="shop_owner_name"
                  value={formData.shop_owner_name}
                  onChange={handleChange}
                  placeholder="Owner Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_mobile">Shop Mobile</Label>
                <Input
                  id="shop_mobile"
                  name="shop_mobile"
                  value={formData.shop_mobile}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_email">Shop Email</Label>
                <Input
                  id="shop_email"
                  name="shop_email"
                  type="email"
                  value={formData.shop_email}
                  onChange={handleChange}
                  placeholder="shop@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shop_address">Shop Address</Label>
                <Textarea
                  id="shop_address"
                  name="shop_address"
                  value={formData.shop_address}
                  onChange={handleChange}
                  placeholder="Enter your shop address"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
