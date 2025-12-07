import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

// GET the custom theme
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.shopProfile.findFirst({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ success: true, theme: profile?.customTheme });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch theme' }, { status: 500 });
  }
}

// POST to update the custom theme
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const theme = await request.json();
    await prisma.shopProfile.update({
      where: { userId: session.user.id },
      data: {
        customTheme: theme,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save theme' }, { status: 500 });
  }
}
