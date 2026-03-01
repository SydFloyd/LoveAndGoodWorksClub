import { NextResponse, type NextRequest } from "next/server";
import { getRequestAccessRole } from "@/lib/auth";

const publicPaths = new Set<string>(["/gate"]);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    publicPaths.has(pathname)
  ) {
    return NextResponse.next();
  }

  const role = getRequestAccessRole(request);

  if (!role) {
    const gateUrl = request.nextUrl.clone();
    gateUrl.pathname = "/gate";
    gateUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(gateUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const gateUrl = request.nextUrl.clone();
    gateUrl.pathname = "/gate";
    gateUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(gateUrl);
  }

  if (role) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
