'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Upload, Check, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface ProFeaturesModalProps {
  shopProfile: {
    id?: string;
    isPro: boolean;
    shopName: string;
    mobile: string;
  };
  onUpgrade: (profileId: string, transactionId: string) => Promise<void>;
  onLogoUpload: (file: File) => Promise<void>;
}

const ProFeaturesModal: React.FC<ProFeaturesModalProps> = ({
  shopProfile,
  onUpgrade,
  onLogoUpload
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upgrade' | 'logo'>('upgrade');
  const [transactionId, setTransactionId] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpgrade = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter a valid transaction ID');
      return;
    }

    if (!shopProfile.id) {
      toast.error('Please save your shop profile first');
      return;
    }

    setIsUpgrading(true);
    try {
      await onUpgrade(shopProfile.id, transactionId);
      toast.success('Payment submitted! We will verify it within 24 hours.');
      setIsOpen(false);
      setTransactionId('');
    } catch (error) {
      toast.error('Failed to verify payment. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      await onLogoUpload(file);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const features = [
    {
      title: 'Remove Watermark',
      description: 'Download clean memos without the QuickMemo BD branding',
      icon: <X className="w-5 h-5" />
    },
    {
      title: 'Upload Your Logo',
      description: 'Add your shop logo to make memos more professional',
      icon: <Upload className="w-5 h-5" />
    },
    {
      title: 'Save Product List',
      description: 'Quickly add frequently sold products with one click',
      icon: <Check className="w-5 h-5" />
    },
    {
      title: 'Premium Themes',
      description: 'Access exclusive color themes and templates',
      icon: <Crown className="w-5 h-5" />
    },
    {
      title: 'Priority Support',
      description: 'Get faster response times for your queries',
      icon: <Check className="w-5 h-5" />
    },
    {
      title: 'Cloud Sync',
      description: 'Access your data from any device with cloud backup',
      icon: <Check className="w-5 h-5" />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={shopProfile.isPro ? "secondary" : "default"}>
          <Crown className="w-4 h-4 mr-2" />
          {shopProfile.isPro ? 'Manage Pro' : 'Upgrade to Pro'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Pro Features - ৳200/month
          </DialogTitle>
        </DialogHeader>

        {shopProfile.isPro ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You are a Pro User!</h3>
            <p className="text-gray-600 mb-6">Enjoy all the premium features</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setActiveTab('logo')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <Button variant="outline" onClick={onUpgrade}>
                <Crown className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Upgrade Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Payment Instructions:</p>
                  <ol className="text-sm space-y-1 text-gray-700">
                    <li>1. Send ৳200 to Bkash: 01xxxxxxxxx</li>
                    <li>2. Use your mobile number as reference</li>
                    <li>3. Enter the transaction ID below</li>
                    <li>4. Click "Submit Payment" to request verification</li>
                    <li>5. Wait for admin approval (usually within 24 hours)</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter Bkash transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleUpgrade} 
                  disabled={!transactionId.trim() || isUpgrading}
                  className="w-full"
                >
                  {isUpgrading ? 'Submitting...' : 'Submit Payment for Verification'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  ⏳ Payment verification may take up to 24 hours. You'll be notified when approved.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logo Upload Section (for Pro users) */}
        {shopProfile.isPro && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Shop Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload your shop logo (JPEG, PNG, WebP)
                  </p>
                  <p className="text-xs text-gray-500 mb-4">Maximum file size: 2MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    asChild 
                    variant="outline"
                    disabled={isUploading}
                  >
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProFeaturesModal;