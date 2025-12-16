// proxy.ts
import { NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/products', '/settings'];

export async function proxy(request: NextResponse) {
  const { pathname } = new URL(request.url);
  
  // Check if the current route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    
    // Check for the HttpOnly cookie (the core security check)
    const jwtCookie = request.cookies.get('quick_memo_user_token');
    console.log("cookie",jwtCookie);

    if (!jwtCookie) {
      // Unauthenticated access attempt on a protected route
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // NOTE: A real-world scenario would include JWT validation here 
    // before allowing the request to proceed. (Assume valid for flow)
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths under the protected groups
  matcher: ['/dashboard/:path*', '/products/:path*', '/settings/:path*'],
};