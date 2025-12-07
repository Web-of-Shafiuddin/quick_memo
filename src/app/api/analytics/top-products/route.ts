import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const data = await prisma.$queryRaw`
      SELECT
        p.name,
        COUNT(p.name) as count
      FROM "Memo" m,
      json_to_recordset(m.products) as p(name text, price float, quantity int)
      GROUP BY p.name
      ORDER BY count DESC
      LIMIT 5;
    `;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch top products' }, { status: 500 });
  }
}
