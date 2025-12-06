'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Check, X, Eye, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  profileId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  profile: {
    shopName: string;
    ownerName: string;
    mobile: string;
    isPro: boolean;
    proExpiry?: string;
  };
}

interface AdminStats {
  totalTransactions: number;
  pendingTransactions: number;
  verifiedTransactions: number;
  rejectedTransactions: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalTransactions: 0,
    pendingTransactions: 0,
    verifiedTransactions: 0,
    rejectedTransactions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [verificationNote, setVerificationNote] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      const result = await response.json();
      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        toast.success('Login successful');
        fetchData();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [transactionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/transactions'),
        fetch('/api/admin/stats')
      ]);

      const transactionsData = await transactionsRes.json();
      const statsData = await statsRes.json();

      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const handleVerifyTransaction = async (transactionId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/verify-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionId, 
          status,
          note: verificationNote 
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Transaction ${status} successfully`);
        setSelectedTransaction(null);
        setVerificationNote('');
        fetchData();
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@quickmemo.bd"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage transactions and subscriptions</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem('adminAuth');
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">৳{stats.totalRevenue}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.profile.shopName}</TableCell>
                    <TableCell>{transaction.profile.ownerName}</TableCell>
                    <TableCell>{transaction.profile.mobile}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                    <TableCell>৳{transaction.amount}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.status === 'pending' && (
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Shop Name</Label>
                                    <p className="font-medium">{selectedTransaction?.profile.shopName}</p>
                                  </div>
                                  <div>
                                    <Label>Owner Name</Label>
                                    <p className="font-medium">{selectedTransaction?.profile.ownerName}</p>
                                  </div>
                                  <div>
                                    <Label>Mobile</Label>
                                    <p className="font-medium">{selectedTransaction?.profile.mobile}</p>
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <p className="font-medium">৳{selectedTransaction?.amount}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Transaction ID</Label>
                                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                                    {selectedTransaction?.transactionId}
                                  </p>
                                </div>
                                <div>
                                  <Label>Verification Note</Label>
                                  <Textarea
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                    placeholder="Add a note for this verification..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => selectedTransaction && handleVerifyTransaction(selectedTransaction.transactionId, 'verified')}
                                    className="flex-1"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Verify
                                  </Button>
                                  <Button
                                    onClick={() => selectedTransaction && handleVerifyTransaction(selectedTransaction.transactionId, 'rejected')}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}