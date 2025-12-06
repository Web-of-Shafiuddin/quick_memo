import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get profile ID from query or from authentication in production
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID required' },
        { status: 400 }
      );
    }

    const transactions = await db.paymentTransaction.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}