import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/gate", request.url));
  response.cookies.set({
    name: SITE_AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
