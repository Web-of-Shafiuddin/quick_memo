'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Theme {
  id: string;
  customTheme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  profile: {
    shopName: string;
  };
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes');
      const result = await response.json();
      if (result.success) {
        setThemes(result.themes);
      } else {
        toast.error('Failed to fetch themes');
      }
    } catch (error) {
      toast.error('An error occurred while fetching themes');
    }
  };

  const handleDelete = async (themeId: string) => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Theme deleted successfully');
        fetchThemes();
      } else {
        toast.error('Failed to delete theme');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the theme');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Theme Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Custom Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Primary Color</TableHead>
                <TableHead>Secondary Color</TableHead>
                <TableHead>Font Family</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.map((theme) => (
                <TableRow key={theme.id}>
                  <TableCell>{theme.profile.shopName}</TableCell>
                  <TableCell>{theme.customTheme.primaryColor}</TableCell>
                  <TableCell>{theme.customTheme.secondaryColor}</TableCell>
                  <TableCell>{theme.customTheme.fontFamily}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(theme.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
