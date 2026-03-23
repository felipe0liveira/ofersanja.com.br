import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const isAdminSubdomain =
    hostname === "admin.ofersanja.com.br" ||
    hostname.startsWith("admin.ofersanja.com.br:");

  if (isAdminSubdomain) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // Never rewrite API routes — they must resolve as-is
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Already under /admin — no rewrite needed
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
