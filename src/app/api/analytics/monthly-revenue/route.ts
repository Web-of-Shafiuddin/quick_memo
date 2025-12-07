import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const data = await prisma.$queryRaw`
      SELECT
        to_char("createdAt", 'YYYY-MM') as month,
        SUM("totalAmount") as revenue
      FROM "Memo"
      GROUP BY month
      ORDER BY month;
    `;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch monthly revenue' }, { status: 500 });
  }
}
