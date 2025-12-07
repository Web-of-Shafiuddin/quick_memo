import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const themes = await prisma.shopProfile.findMany({
      where: {
        customTheme: {
          not: null,
        },
      },
      select: {
        id: true,
        customTheme: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, themes });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch themes' }, { status: 500 });
  }
}
