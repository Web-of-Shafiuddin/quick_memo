import { NextRequest, NextResponse } from 'next/server';
import { saveShopProfile as saveShopProfileAction } from '@/app/actions/shop';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await saveShopProfileAction(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in shop save API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}