import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // For demo purposes, use hardcoded credentials
    // In production, use proper authentication with hashed passwords
    const ADMIN_EMAIL = 'admin@quickmemo.bd';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Check if admin exists in database, create if not
      let admin = await db.admin.findUnique({
        where: { email }
      });

      if (!admin) {
        admin = await db.admin.create({
          data: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // In production, hash this
            name: 'Admin User'
          }
        });
      }

      return NextResponse.json({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}