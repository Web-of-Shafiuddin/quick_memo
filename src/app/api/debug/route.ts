import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all transactions and profiles for debugging
    const transactions = await db.paymentTransaction.findMany({
      include: { profile: true }
    });
    
    const profiles = await db.shopProfile.findMany();

    return NextResponse.json({
      success: true,
      data: {
        transactionsCount: transactions.length,
        profilesCount: profiles.length,
        transactions: transactions.map(t => ({
          id: t.id,
          transactionId: t.transactionId,
          amount: t.amount,
          status: t.status,
          profileId: t.profileId,
          profileName: t.profile?.shopName
        })),
        profiles: profiles.map(p => ({
          id: p.id,
          shopName: p.shopName,
          mobile: p.mobile,
          isPro: p.isPro
        }))
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}