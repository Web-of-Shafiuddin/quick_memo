'use client';

import React, { useState, useEffect } from 'react';
import { sellerService, EarningsDashboard } from '@/services/sellerService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  TrendingUp,
  Clock,
  Download,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EarningsPage() {
  const [dashboard, setDashboard] = useState<EarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getEarningsDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || !payoutMethod) {
      toast.error('Please enter payout amount and method');
      return;
    }

    try {
      setRequesting(true);
      await sellerService.requestPayout(parseFloat(payoutAmount), payoutMethod, payoutNotes);
      toast.success('Payout request submitted successfully!');
      setShowPayoutDialog(false);
      setPayoutAmount('');
      setPayoutMethod('');
      setPayoutNotes('');
      await fetchDashboard();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast.error(error.response?.data?.error || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto py-10">
        <p>No earnings data available</p>
      </div>
    );
  }

  const { balance, statistics, recent_commissions } = dashboard;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Earnings
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your marketplace earnings and request payouts
          </p>
        </div>
        <Button
          onClick={() => setShowPayoutDialog(true)}
          disabled={balance.available < 500}
        >
          <Download className="h-4 w-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{balance.available.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{balance.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              7-day holding period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{balance.total_earned.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sales Statistics</CardTitle>
          <CardDescription>Your marketplace performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{statistics.total_orders}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Sales</p>
              <p className="text-2xl font-bold">৳{statistics.total_gross_sales.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Paid</p>
              <p className="text-2xl font-bold">৳{statistics.total_commission.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Commission</p>
              <p className="text-2xl font-bold">{statistics.average_commission_rate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commissions</CardTitle>
          <CardDescription>Latest marketplace order commissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recent_commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No commissions yet</p>
              <p className="text-sm">Start selling on the marketplace to see your earnings here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_commissions.map((commission) => (
                  <TableRow key={commission.commission_id}>
                    <TableCell className="font-mono">
                      #{commission.transaction_id}
                    </TableCell>
                    <TableCell>
                      {new Date(commission.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>৳{commission.gross_amount}</TableCell>
                    <TableCell className="text-red-600">
                      -৳{commission.commission_amount}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ৳{commission.net_amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          commission.payout_status === 'PAID'
                            ? 'default'
                            : commission.payout_status === 'READY'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {commission.payout_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Withdraw your available balance via bKash or Nagad
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500"
                min="500"
                max={balance.available}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Available: ৳{balance.available.toLocaleString()} | Minimum: ৳500
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Input
                id="method"
                placeholder="bKash: 01XXXXXXXXX or Nagad: 01XXXXXXXXX"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional information"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </div>

            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Payout Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Minimum payout: ৳500</li>
                    <li>Processing time: 1-3 business days</li>
                    <li>Admin will manually transfer via bKash/Nagad</li>
                    <li>You'll be notified when payment is sent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPayoutDialog(false)}
              disabled={requesting}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestPayout} disabled={requesting}>
              {requesting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
