import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.shopProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { profileId: profile.id },
      include: {
        products: true,
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmount;
      for (const product of order.products) {
        const savedProduct = await prisma.savedProduct.findFirst({
          where: { name: product.name, profileId: profile.id },
        });
        if (savedProduct && savedProduct.costPrice) {
          totalCost += savedProduct.costPrice * product.quantity;
        }
      }
    }

    const grossProfit = totalRevenue - totalCost;

    return NextResponse.json({ success: true, grossProfit });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to calculate gross profit' }, { status: 500 });
  }
}
