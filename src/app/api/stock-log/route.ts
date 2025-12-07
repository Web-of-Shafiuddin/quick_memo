import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, adjustment } = await request.json();

    const product = await prisma.savedProduct.update({
      where: { id: productId },
      data: {
        stock: {
          increment: adjustment,
        },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to adjust stock' }, { status: 500 });
  }
}
