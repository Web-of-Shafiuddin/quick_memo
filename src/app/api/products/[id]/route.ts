import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { getAuthSession } from '@/lib/auth';

// PUT update a product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.formData();
    const name = data.get('name') as string;
    const price = parseFloat(data.get('price') as string);
    const category = data.get('category') as string;
    const image = data.get('image') as File;

    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existingProduct = await prisma.savedProduct.findUnique({
        where: { id: params.id },
        include: { profile: true },
    });

    if (!existingProduct || existingProduct.profile.userId !== session.user.id) {
        return NextResponse.json({ success: false, error: 'Product not found or not owned by user' }, { status: 404 });
    }

    let imageUrl: string | undefined = undefined;
    if (image) {
      const imageLimit = existingProduct.profile.isPro ? 5 * 1024 * 1024 : 1 * 1024 * 1024; // 5MB or 1MB
      if (image.size > imageLimit) {
        return NextResponse.json({ success: false, error: 'Image size limit exceeded' }, { status: 403 });
      }
      const uploadResult: any = await uploadImage(image);
      imageUrl = uploadResult.secure_url;
    }

    const updatedProduct = await prisma.savedProduct.update({
      where: { id: params.id },
      data: {
        name,
        price,
        category,
        ...(imageUrl && { imageUrl }),
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.savedProduct.findUnique({
      where: { id: params.id },
      include: { profile: true },
    });

    if (!product || product.profile.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Product not found or not owned by user' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.savedProduct.delete({
        where: { id: params.id },
      });

      await tx.shopProfile.update({
        where: { id: product.profileId },
        data: {
          productCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
