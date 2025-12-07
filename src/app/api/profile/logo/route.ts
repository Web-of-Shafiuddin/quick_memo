import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const logo = data.get('logo') as File;

    if (!logo) {
      return NextResponse.json({ success: false, error: 'No logo provided' }, { status: 400 });
    }

    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const uploadResult: any = await uploadImage(logo);

    await prisma.shopProfile.update({
      where: { userId: session.user.id },
      data: {
        logoUrl: uploadResult.secure_url,
      },
    });

    return NextResponse.json({ success: true, logoUrl: uploadResult.secure_url });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upload logo' }, { status: 500 });
  }
}
