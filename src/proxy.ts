import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * Handles:
 * 1. Localhost development - everything passes through directly
 * 2. Marketplace subdomain (shop.yourdomain.com) - rewrites to /marketplace/*
 * 3. Main domain (yourdomain.com) - passes through
 * 4. Custom domains (mystore.com) - resolves via API and rewrites to /shop/[slug]
 *
 * Environment variables:
 *   NEXT_PUBLIC_MAIN_DOMAIN        - e.g. ezymemo.com
 *   NEXT_PUBLIC_MARKETPLACE_DOMAIN - e.g. shop.ezymemo.com
 *   BACKEND_URL                    - e.g. http://localhost:3001 (internal, no /api suffix)
 */

// Backend URL for server-side domain resolution (NOT NEXT_PUBLIC_API_URL which has /api suffix)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const MARKETPLACE_DOMAIN =
  process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN || "";
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "";

export async function proxy(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  // Skip for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- LOCALHOST: Allow everything through directly ---
  // In development, access marketplace via http://localhost:3000/marketplace
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");

  if (isLocalhost) {
    return NextResponse.next();
  }

  // --- MARKETPLACE SUBDOMAIN: Rewrite to /marketplace/* ---
  if (
    MARKETPLACE_DOMAIN &&
    (hostname === MARKETPLACE_DOMAIN || hostname === `shop.${MAIN_DOMAIN}`)
  ) {
    if (!pathname.startsWith("/marketplace")) {
      const url = request.nextUrl.clone();
      url.pathname = `/marketplace${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // --- MAIN DOMAIN: Pass through ---
  if (
    MAIN_DOMAIN &&
    (hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`)
  ) {
    return NextResponse.next();
  }

  // --- CUSTOM DOMAIN: Resolve via backend API ---
  try {
    const resolveUrl = `${BACKEND_URL}/api/domains/resolve?domain=${hostname}`;

    const response = await fetch(resolveUrl, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data?.shopSlug) {
        const { shopSlug } = data.data;

        if (pathname.startsWith(`/shop/${shopSlug}`)) {
          return NextResponse.next();
        }

        const url = request.nextUrl.clone();
        url.pathname = `/shop/${shopSlug}${pathname}`;
        return NextResponse.rewrite(url);
      }
    }

    return new NextResponse("Domain Not Found", { status: 404 });
  } catch (error) {
    console.error("Domain resolution error:", error);
    return new NextResponse("Service Unavailable", { status: 503 });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
