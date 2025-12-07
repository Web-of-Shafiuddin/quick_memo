'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface TopSeller {
  name: string;
  count: number;
}

interface SalesByStatus {
  status: string;
  total: number;
}

export default function ReportsPage() {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [salesByStatus, setSalesByStatus] = useState<SalesByStatus[]>([]);

  useEffect(() => {
    fetchTopSellers();
    fetchSalesByStatus();
  }, []);

  const fetchTopSellers = async () => {
    try {
      const response = await fetch('/api/reports/top-sellers');
      const result = await response.json();
      if (result.success) {
        setTopSellers(result.data);
      } else {
        toast.error('Failed to fetch top sellers');
      }
    } catch (error) {
      toast.error('An error occurred while fetching top sellers');
    }
  };

  const fetchSalesByStatus = async () => {
    try {
      const response = await fetch('/api/reports/sales-by-status');
      const result = await response.json();
      if (result.success) {
        setSalesByStatus(result.data);
      } else {
        toast.error('Failed to fetch sales by status');
      }
    } catch (error) {
      toast.error('An error occurred while fetching sales by status');
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellers.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sales by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesByStatus.map((status, index) => (
                <TableRow key={index}>
                  <TableCell>{status.status}</TableCell>
                  <TableCell>৳{status.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
