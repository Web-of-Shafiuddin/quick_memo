import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * Handles:
 * 1. Localhost development - everything passes through directly
 * 2. Marketplace subdomain (shop.yourdomain.com) - rewrites to /marketplace/*
 * 3. Main domain (yourdomain.com) - passes through
 *
 * Environment variables:
 *   NEXT_PUBLIC_MAIN_DOMAIN        - e.g. ezymemo.com
 *   NEXT_PUBLIC_MARKETPLACE_DOMAIN - e.g. shop.ezymemo.com
 */

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
