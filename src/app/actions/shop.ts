'use server';

import { prisma } from '@/lib/db';
import { z } from 'zod';

const ShopProfileSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  mobile: z.string().min(11, 'Valid mobile number is required'),
  address: z.string().optional(),
  bkashNumber: z.string().optional(),
  theme: z.string().default('default'),
  isPro: z.boolean().default(false)
});

export async function saveShopProfile(formData: FormData) {
  try {
    const data = {
      shopName: formData.get('shopName') as string,
      ownerName: formData.get('ownerName') as string,
      mobile: formData.get('mobile') as string,
      address: formData.get('address') as string,
      bkashNumber: formData.get('bkashNumber') as string,
      theme: formData.get('theme') as string || 'default',
      isPro: formData.get('isPro') === 'true'
    };

    const validated = ShopProfileSchema.parse(data);

    // Check if profile already exists by mobile number
    const existingProfile = await prisma.shopProfile.findFirst({
      where: { mobile: validated.mobile }
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.shopProfile.update({
        where: { id: existingProfile.id },
        data: validated
      });
    } else {
      // Create new profile
      profile = await prisma.shopProfile.create({
        data: validated
      });
    }

    console.log(`💾 Shop profile saved: ${profile.shopName} (${profile.mobile})`);

    return {
      success: true,
      profile: {
        id: profile.id,
        shopName: profile.shopName,
        ownerName: profile.ownerName,
        mobile: profile.mobile,
        address: profile.address,
        theme: profile.theme,
        isPro: profile.isPro,
        bkashNumber: profile.bkashNumber,
        proExpiry: profile.proExpiry
      }
    };

  } catch (error) {
    console.error('Error saving shop profile:', error);
    return {
      success: false,
      error: 'Failed to save shop profile'
    };
  }
}

export async function getShopProfile(mobile: string) {
  try {
    const profile = await prisma.shopProfile.findFirst({
      where: { mobile },
      include: {
        savedProducts: true
      }
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    return {
      success: true,
      profile: {
        id: profile.id,
        shopName: profile.shopName,
        ownerName: profile.ownerName,
        mobile: profile.mobile,
        address: profile.address,
        theme: profile.theme,
        isPro: profile.isPro,
        bkashNumber: profile.bkashNumber,
        savedProducts: profile.savedProducts
      }
    };

  } catch (error) {
    console.error('Error fetching shop profile:', error);
    return {
      success: false,
      error: 'Failed to fetch shop profile'
    };
  }
}

export async function saveMemo(formData: FormData) {
  try {
    const data = {
      profileId: formData.get('profileId') as string,
      customerName: formData.get('customerName') as string,
      customerMobile: formData.get('customerMobile') as string,
      customerAddress: formData.get('customerAddress') as string,
      products: JSON.parse(formData.get('products') as string),
      subtotal: parseFloat(formData.get('subtotal') as string),
      deliveryCharge: parseFloat(formData.get('deliveryCharge') as string),
      discount: parseFloat(formData.get('discount') as string),
      totalAmount: parseFloat(formData.get('totalAmount') as string),
      paymentMethod: formData.get('paymentMethod') as string,
      status: 'completed'
    };

    const memo = await prisma.memo.create({
      data
    });

    return {
      success: true,
      memoId: memo.id
    };

  } catch (error) {
    console.error('Error saving memo:', error);
    return {
      success: false,
      error: 'Failed to save memo'
    };
  }
}

export async function getShopMemos(profileId: string) {
  try {
    const memos = await prisma.memo.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 memos
    });

    return {
      success: true,
      memos
    };

  } catch (error) {
    console.error('Error fetching memos:', error);
    return {
      success: false,
      error: 'Failed to fetch memos'
    };
  }
}