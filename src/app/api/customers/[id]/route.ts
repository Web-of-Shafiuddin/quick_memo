import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

// PUT update a customer
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE a customer
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete customer' }, { status: 500 });
  }
}
