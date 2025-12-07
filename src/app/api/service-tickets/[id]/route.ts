import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

// PUT update a service ticket
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const ticket = await prisma.serviceTicket.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update service ticket' }, { status: 500 });
  }
}

// DELETE a service ticket
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.serviceTicket.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete service ticket' }, { status: 500 });
  }
}
