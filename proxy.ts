import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Production only: ofersanja.com.br/admin/** → admin.ofersanja.com.br/**
  // Safe locally: hostname "ofersanja.com.br" never matches localhost.
  if (hostname === "ofersanja.com.br" && pathname.startsWith("/admin")) {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = "admin.ofersanja.com.br";
    redirectUrl.pathname = pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isAdminSubdomain =
    hostname === "admin.ofersanja.com.br" ||
    hostname.startsWith("admin.ofersanja.com.br:");

  if (isAdminSubdomain) {
    // Clean up any /admin prefix leaking into the subdomain URL.
    // e.g. admin.ofersanja.com.br/admin/dashboard → admin.ofersanja.com.br/dashboard
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const cleanPath = pathname.replace(/^\/admin/, "") || "/";
      const redirectUrl = url.clone();
      redirectUrl.pathname = cleanPath;
      return NextResponse.redirect(redirectUrl, 308);
    }

    // Never rewrite API routes — they must resolve as-is
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Rewrite to /admin/** so Next.js serves the right pages
    if (!pathname.startsWith("/admin")) {
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

