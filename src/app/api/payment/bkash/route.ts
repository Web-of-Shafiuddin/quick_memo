import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { profileId, transactionId, amount } = await request.json();

    // Validate input
    if (!profileId || !transactionId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if transaction ID already exists
    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { transactionId }
    });

    if (existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID already exists' },
        { status: 400 }
      );
    }

    // Create payment transaction record (pending status)
    const transaction = await prisma.paymentTransaction.create({
      data: {
        profileId,
        transactionId,
        amount,
        paymentMethod: 'bkash',
        status: 'pending'
      }
    });

    console.log(`📝 New payment transaction created: ${transactionId} for profile ${profileId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment submitted for verification',
      transaction: {
        id: transaction.id,
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');

  if (!profileId) {
    return NextResponse.json(
      { success: false, error: 'Profile ID required' },
      { status: 400 }
    );
  }

  try {
    const profile = await prisma.shopProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        isPro: true,
        proExpiry: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if Pro status has expired
    const isCurrentlyPro = profile.isPro && 
      profile.proExpiry && 
      new Date(profile.proExpiry) > new Date();

    // Update if expired
    if (profile.isPro && !isCurrentlyPro) {
      await prisma.shopProfile.update({
        where: { id: profileId },
        data: { isPro: false }
      });
    }

    return NextResponse.json({
      success: true,
      isPro: isCurrentlyPro,
      proExpiry: profile.proExpiry
    });

  } catch (error) {
    console.error('Error checking Pro status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}