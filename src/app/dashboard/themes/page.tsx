'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CustomTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export default function ThemesPage() {
  const [theme, setTheme] = useState<CustomTheme>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  });

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch('/api/theme');
      const result = await response.json();
      if (result.success && result.theme) {
        setTheme(result.theme);
      }
    } catch (error) {
      toast.error('An error occurred while fetching your theme');
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTheme(prev => ({ ...prev, [name]: value }));
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(prev => ({ ...prev, fontFamily: e.target.value }));
  };

  const handleSaveTheme = async () => {
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Theme saved successfully');
      } else {
        toast.error('Failed to save theme');
      }
    } catch (error) {
      toast.error('An error occurred while saving the theme');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Custom Theme Builder</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customize Your Memo's Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              type="color"
              value={theme.primaryColor}
              onChange={handleColorChange}
            />
          </div>
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <Input
              id="secondaryColor"
              name="secondaryColor"
              type="color"
              value={theme.secondaryColor}
              onChange={handleColorChange}
            />
          </div>
          <div>
            <Label htmlFor="fontFamily">Font Family</Label>
            <select
              id="fontFamily"
              name="fontFamily"
              value={theme.fontFamily}
              onChange={handleFontChange}
              className="w-full p-2 border rounded"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Lucida Sans Unicode', sans-serif">Lucida Sans</option>
            </select>
          </div>
          <Button onClick={handleSaveTheme}>Save Theme</Button>
        </CardContent>
      </Card>
    </div>
  );
}
