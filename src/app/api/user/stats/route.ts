import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from token (simplified for demo)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's memos
    const memos = await db.memo.findMany({
      where: { profileId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Calculate stats
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthMemos = memos.filter(m => 
      new Date(m.createdAt) >= thisMonth
    ).length;

    const lastMonthMemos = memos.filter(m => 
      new Date(m.createdAt) >= lastMonth && new Date(m.createdAt) < thisMonth
    ).length;

    const totalRevenue = memos.reduce((sum, memo) => sum + memo.totalAmount, 0);

    const stats = {
      totalMemos: memos.length,
      thisMonth: thisMonthMemos,
      lastMonth: lastMonthMemos,
      totalRevenue
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}