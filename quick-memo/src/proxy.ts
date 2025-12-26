// proxy.ts
import { NextResponse } from 'next/server';

export async function proxy() {
  // Auth is handled client-side via localStorage and AuthInitializer
  // Protected routes are guarded by the (userDashboard) layout
  return NextResponse.next();
}

export const config = {
  matcher: [],
};