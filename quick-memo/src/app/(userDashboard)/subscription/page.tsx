'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, CheckCircle, Clock, XCircle, Send, CreditCard, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Plan {
  plan_id: number;
  name: string;
  monthly_price: number;
  max_categories: number;
  max_products: number;
  max_orders_per_month: number;
  is_active: boolean;
}

interface Subscription {
  subscription_id: number;
  plan_id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface SubscriptionRequest {
  request_id: number;
  plan_id: number;
  plan_name: string;
  payment_method: string;
  transaction_id: string;
  amount: number;
  phone_number: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const PAYMENT_METHODS = [
  { value: 'bKash', label: 'bKash' },
  { value: 'Nagad', label: 'Nagad' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
];

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: '',
    transaction_id: '',
    phone_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes, requestsRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/my-subscription'),
        api.get('/subscriptions/my-requests'),
      ]);

      setPlans(plansRes.data.data || []);
      setSubscription(subRes.data.data || null);
      setRequests(requestsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
    setFormData({
      payment_method: '',
      transaction_id: '',
      phone_number: '',
    });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!formData.payment_method || !formData.transaction_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/subscriptions/request', {
        plan_id: selectedPlan.plan_id,
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id,
        amount: selectedPlan.monthly_price,
        phone_number: formData.phone_number,
      });

      toast.success('Subscription request submitted! We will verify your payment within 24 hours.');
      setShowForm(false);
      setSelectedPlan(null);
      fetchData();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLimit = (value: number) => {
    return value === -1 ? 'Unlimited' : value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan</p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Current Plan: {subscription.plan_name}
            </CardTitle>
            <CardDescription>
              Your subscription is {getStatusBadge(subscription.status)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Start Date:</span>
                <span className="ml-2 font-medium">{formatDate(subscription.start_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">End Date:</span>
                <span className="ml-2 font-medium">{formatDate(subscription.end_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Request Notice */}
      {requests.some(r => r.status === 'PENDING') && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Payment Verification Pending</p>
                <p className="text-sm text-yellow-700">
                  Your subscription request is being verified. This usually takes up to 24 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      {!showForm && (
        <>
          <h2 className="text-xl font-semibold">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.filter(p => p.is_active).map((plan) => (
              <Card
                key={plan.plan_id}
                className={`relative ${subscription?.plan_name === plan.name ? 'border-primary border-2' : ''}`}
              >
                {subscription?.plan_name === plan.name && (
                  <Badge className="absolute top-2 right-2 bg-primary">Current</Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <span className="text-2xl font-bold">
                      {plan.monthly_price === 0 ? 'Free' : `৳${plan.monthly_price}/mo`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Categories</span>
                      <span className="font-medium">{formatLimit(plan.max_categories)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Products</span>
                      <span className="font-medium">{formatLimit(plan.max_products)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Orders/Month</span>
                      <span className="font-medium">{formatLimit(plan.max_orders_per_month)}</span>
                    </li>
                  </ul>
                  {plan.monthly_price > 0 && subscription?.plan_name !== plan.name && (
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={requests.some(r => r.status === 'PENDING')}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Subscribe
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Payment Form */}
      {showForm && selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to {selectedPlan.name}</CardTitle>
            <CardDescription>
              Complete payment of ৳{selectedPlan.monthly_price} and submit the transaction details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Payment Instructions</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Send ৳{selectedPlan.monthly_price} to our payment account</li>
                <li>bKash/Nagad/Rocket: <span className="font-mono font-bold">01XXXXXXXXX</span></li>
                <li>Copy the Transaction ID from your payment confirmation</li>
                <li>Fill in the form below and submit</li>
                <li>We will verify your payment within 24 hours</li>
              </ol>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_id">Transaction ID *</Label>
                <Input
                  id="transaction_id"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  placeholder="Enter transaction ID from payment confirmation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (used for payment)</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPlan(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Your subscription payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.request_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.plan_name}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{request.payment_method}</span>
                      <span className="mx-2">•</span>
                      <span>TxID: {request.transaction_id}</span>
                      <span className="mx-2">•</span>
                      <span>৳{request.amount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {formatDate(request.created_at)}
                    </div>
                    {request.admin_notes && request.status === 'REJECTED' && (
                      <div className="text-sm text-red-600 mt-2">
                        Reason: {request.admin_notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
