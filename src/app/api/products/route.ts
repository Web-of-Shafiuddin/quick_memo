import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { getAuthSession } from '@/lib/auth';

// GET all products
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

    const products = await prisma.savedProduct.findMany({
      where: { profileId: profile.id },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST a new product
export async function POST(request: Request) {
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

    const profile = await prisma.shopProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const productLimit = profile.isPro ? 100 : 15;
    if (profile.productCount >= productLimit) {
      return NextResponse.json({ success: false, error: 'Product limit reached' }, { status: 403 });
    }

    let imageUrl = '';
    if (image) {
      const imageLimit = profile.isPro ? 5 * 1024 * 1024 : 1 * 1024 * 1024; // 5MB or 1MB
      if (image.size > imageLimit) {
        return NextResponse.json({ success: false, error: 'Image size limit exceeded' }, { status: 403 });
      }
      const uploadResult: any = await uploadImage(image);
      imageUrl = uploadResult.secure_url;
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.savedProduct.create({
        data: {
          name,
          price,
          category,
          imageUrl,
          profileId: profile.id,
        },
      });

      await tx.shopProfile.update({
        where: { id: profile.id },
        data: {
          productCount: {
            increment: 1,
          },
        },
      });

      return newProduct;
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
