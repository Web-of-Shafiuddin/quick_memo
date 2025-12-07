import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, status, note, adminId } = await request.json();
    
    console.log('🔍 Verification request:', { transactionId, status, note, adminId });

    if (!transactionId || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Get the transaction to verify
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { transactionId },
      include: { profile: true }
    });

    console.log('📋 Found transaction:', transaction);

    if (!transaction) {
      console.log('❌ Transaction not found with ID:', transactionId);
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Transaction already processed' },
        { status: 400 }
      );
    }

    // Update transaction status
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { transactionId },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedBy: adminId || 'system'
      }
    });

    // If verified, update user's Pro status
    if (status === 'verified') {
      const proExpiry = new Date();
      proExpiry.setMonth(proExpiry.getMonth() + 1); // Add 1 month

      await prisma.shopProfile.update({
        where: { id: transaction.profileId },
        data: {
          isPro: true,
          proExpiry
        }
      });

      console.log(`✅ User ${transaction.profile.shopName} upgraded to Pro until ${proExpiry.toDateString()}`);
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: `Transaction ${status} successfully`
    });

  } catch (error) {
    console.error('Error verifying transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}