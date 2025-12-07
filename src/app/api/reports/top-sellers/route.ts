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

    const data = await prisma.$queryRaw`
      SELECT
        p.name,
        COUNT(p.name) as count
      FROM "Order" o,
      json_to_recordset(o.products) as p(name text, price float, quantity int)
      WHERE o."profileId" = ${profile.id}
      GROUP BY p.name
      ORDER BY count DESC
      LIMIT 10;
    `;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch top sellers' }, { status: 500 });
  }
}
