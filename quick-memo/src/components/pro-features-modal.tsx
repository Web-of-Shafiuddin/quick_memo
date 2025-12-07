'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Check, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ShopProfile {
    id?: string;
    shopName: string;
    ownerName: string;
    mobile: string;
    address?: string;
    logoUrl?: string;
    theme: string;
    isPro: boolean;
    bkashNumber?: string;
}

interface ProFeaturesModalProps {
    shopProfile: ShopProfile;
    onUpgrade: (profileId: string, transactionId: string) => Promise<void>;
    onLogoUpload: (file: File) => Promise<void>;
}

const ProFeaturesModal: React.FC<ProFeaturesModalProps> = ({ shopProfile, onUpgrade, onLogoUpload }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const proFeatures = [
        'Save unlimited products for quick reuse',
        'Upload custom shop logo',
        'Remove QuickMemo watermark',
        'Access to premium color themes',
        'Priority customer support',
        'Unlimited memo generation'
    ];

    const handleUpgrade = async () => {
        if (!transactionId.trim()) {
            toast.error('Please enter a transaction ID');
            return;
        }

        // Frontend-only demo
        toast.success('Pro features enabled for demo! (No actual payment processed)');
        setIsOpen(false);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setIsUploading(true);

        // Frontend-only: Create a local URL for the image
        const reader = new FileReader();
        reader.onload = () => {
            const imageUrl = reader.result as string;
            // In a real app, this would upload to server
            toast.success('Logo uploaded successfully! (Demo mode)');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                    <Crown className="w-4 h-4 mr-2" />
                    {shopProfile.isPro ? 'Pro Features' : 'Upgrade to Pro'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Crown className="w-6 h-6 text-primary" />
                        QuickMemo Pro
                    </DialogTitle>
                    <DialogDescription>
                        Unlock premium features for just ৳200/month
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Features List */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-gray-700">Pro Features:</h3>
                        {proFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {shopProfile.isPro ? (
                        /* Logo Upload for Pro Users */
                        <div className="space-y-3">
                            <Label htmlFor="logo-upload">Upload Shop Logo</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    disabled={isUploading}
                                    className="flex-1"
                                />
                                <Button disabled={isUploading} size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Recommended: Square image, max 2MB
                            </p>
                        </div>
                    ) : (
                        /* Payment Section for Free Users */
                        <div className="space-y-4 border-t pt-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Payment Instructions:</h4>
                                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                    <li>Send ৳200 to: <strong>01XXXXXXXXX</strong> (Bkash)</li>
                                    <li>Copy the transaction ID</li>
                                    <li>Enter it below and click Submit</li>
                                    <li>Wait for admin approval (usually within 24 hours)</li>
                                </ol>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transactionId">Bkash Transaction ID</Label>
                                <Input
                                    id="transactionId"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                />
                            </div>

                            <Button onClick={handleUpgrade} className="w-full">
                                Submit Payment for Verification
                            </Button>

                            <p className="text-xs text-center text-muted-foreground">
                                Your account will be upgraded after admin verification
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProFeaturesModal;
