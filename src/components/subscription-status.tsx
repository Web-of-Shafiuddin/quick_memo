'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  profileId?: string;
  isPro: boolean;
  proExpiry?: string;
}

export default function SubscriptionStatus({ profileId, isPro, proExpiry }: SubscriptionStatusProps) {
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  useEffect(() => {
    const checkPendingTransactions = async () => {
      if (profileId) {
        try {
          const response = await fetch('/api/user/transactions');
          const result = await response.json();
          
          if (result.success) {
            setPendingTransactions(result.transactions.filter((t: any) => t.status === 'pending'));
          }
        } catch (error) {
          console.error('Error checking transactions:', error);
        }
      }
    };

    checkPendingTransactions();
  }, [profileId]);

  const getSubscriptionStatus = () => {
    if (pendingTransactions.length > 0) {
      return {
        status: 'pending',
        text: 'Payment Pending Verification',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      };
    }

    if (isPro && proExpiry && new Date(proExpiry) > new Date()) {
      const expiryDate = new Date(proExpiry);
      const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        status: 'active',
        text: `Pro Active (${daysLeft} days left)`,
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }

    if (isPro && proExpiry && new Date(proExpiry) <= new Date()) {
      return {
        status: 'expired',
        text: 'Subscription Expired',
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="w-4 h-4" />
      };
    }

    return {
      status: 'free',
      text: 'Free Plan',
      color: 'bg-gray-100 text-gray-800',
      icon: null
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (subscriptionStatus.status === 'free') {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-yellow-400 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${subscriptionStatus.color}`}>
              {subscriptionStatus.icon || <Crown className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-medium">{subscriptionStatus.text}</p>
              {subscriptionStatus.status === 'pending' && (
                <p className="text-sm text-gray-600">
                  Your payment is being verified by admin
                </p>
              )}
              {subscriptionStatus.status === 'expired' && (
                <p className="text-sm text-gray-600">
                  Please renew to continue using Pro features
                </p>
              )}
            </div>
          </div>
          <Badge className={subscriptionStatus.color}>
            {subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}