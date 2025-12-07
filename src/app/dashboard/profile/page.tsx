'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';

interface UserProfile {
  shopName: string;
  ownerName: string;
  mobile: string;
  address: string;
  logoUrl: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const result = await response.json();
      if (result.success) {
        setProfile(result.profile);
      } else {
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      toast.error('An error occurred while fetching your profile');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const data = new FormData();
    data.append('logo', file);

    try {
      const response = await fetch('/api/profile/logo', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Logo uploaded successfully');
        fetchProfile();
      } else {
        toast.error('Failed to upload logo');
      }
    } catch (error) {
      toast.error('An error occurred while uploading the logo');
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {profile.logoUrl && (
              <Image
                src={profile.logoUrl}
                alt="Shop Logo"
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
            <div>
              <p><strong>Shop Name:</strong> {profile.shopName}</p>
              <p><strong>Owner:</strong> {profile.ownerName}</p>
              <p><strong>Mobile:</strong> {profile.mobile}</p>
              <p><strong>Address:</strong> {profile.address}</p>
            </div>
          </div>
          <form onSubmit={handleLogoUpload} className="space-y-2">
            <Label htmlFor="logo">Upload New Logo</Label>
            <Input id="logo" type="file" onChange={handleFileChange} />
            <Button type="submit">Upload Logo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
