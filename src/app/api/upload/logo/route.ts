import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const profileId = formData.get('profileId') as string;

    if (!file || !profileId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or profile ID' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const profile = await prisma.shopProfile.findUnique({
      where: { id: profileId },
      select: { isPro: true, proExpiry: true }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const isCurrentlyPro = profile.isPro && 
      profile.proExpiry && 
      new Date(profile.proExpiry) > new Date();

    if (!isCurrentlyPro) {
      return NextResponse.json(
        { success: false, error: 'Pro subscription required to upload logo' },
        { status: 403 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${profileId}-${timestamp}.${file.type.split('/')[1]}`;
    
    // Save file to public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);

    // Update profile with logo URL
    const logoUrl = `/uploads/${filename}`;
    await prisma.shopProfile.update({
      where: { id: profileId },
      data: { logoUrl }
    });

    console.log(`📸 Logo uploaded for profile ${profileId}: ${logoUrl}`);

    return NextResponse.json({
      success: true,
      logoUrl,
      message: 'Logo uploaded successfully'
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID required' },
        { status: 400 }
      );
    }

    // Get current logo URL
    const profile = await prisma.shopProfile.findUnique({
      where: { id: profileId },
      select: { logoUrl: true }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Remove logo URL from database
    await prisma.shopProfile.update({
      where: { id: profileId },
      data: { logoUrl: null }
    });

    // Optionally delete the file from filesystem
    if (profile.logoUrl) {
      try {
        const filepath = join(process.cwd(), 'public', profile.logoUrl);
        await unlink(filepath);
      } catch (error) {
        console.error('Error deleting logo file:', error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logo removed successfully'
    });

  } catch (error) {
    console.error('Logo deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove logo' },
      { status: 500 }
    );
  }
}