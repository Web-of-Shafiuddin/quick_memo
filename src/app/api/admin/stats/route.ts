import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get transaction stats
    const totalTransactions = await db.paymentTransaction.count();
    const pendingTransactions = await db.paymentTransaction.count({
      where: { status: 'pending' }
    });
    const verifiedTransactions = await db.paymentTransaction.count({
      where: { status: 'verified' }
    });
    const rejectedTransactions = await db.paymentTransaction.count({
      where: { status: 'rejected' }
    });

    // Calculate total revenue from verified transactions
    const revenueResult = await db.paymentTransaction.aggregate({
      where: { status: 'verified' },
      _sum: { amount: true }
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Get active subscriptions (profiles with valid pro expiry)
    const activeSubscriptions = await db.shopProfile.count({
      where: {
        isPro: true,
        proExpiry: {
          gt: new Date()
        }
      }
    });

    const stats = {
      totalTransactions,
      pendingTransactions,
      verifiedTransactions,
      rejectedTransactions,
      totalRevenue,
      activeSubscriptions
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}