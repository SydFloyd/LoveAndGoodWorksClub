import { NextResponse, type NextRequest } from "next/server";
import { buildAuthCookieValue, resolveRoleForPassword, SITE_AUTH_COOKIE } from "@/lib/auth";
import { hashIdentifier, getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }
  if (nextPath.startsWith("//")) {
    return "/";
  }
  return nextPath;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid login request." }, { status: 400 });
  }

  const ipHash = hashIdentifier(getClientIp(request));
  const rateLimit = await enforceRateLimit({
    action: "auth-login",
    identifier: ipHash,
    limit: 8,
    windowSeconds: 10 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Try again later.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const role = resolveRoleForPassword(parsed.data.password);
  if (!role) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const redirectTo = sanitizeNextPath(parsed.data.next);
  const response = NextResponse.json({ ok: true, redirectTo, role });
  response.cookies.set({
    name: SITE_AUTH_COOKIE,
    value: buildAuthCookieValue(role),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
