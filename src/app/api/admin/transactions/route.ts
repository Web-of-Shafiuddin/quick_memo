import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        profile: {
          select: {
            shopName: true,
            ownerName: true,
            mobile: true,
            isPro: true,
            proExpiry: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Get last 100 transactions
    });

    console.log('📊 Fetched transactions:', transactions.length, 'items');

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}