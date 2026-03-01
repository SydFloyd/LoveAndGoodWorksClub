import { NextResponse, type NextRequest } from "next/server";
import { hashIdentifier, getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")?.trim();

  if (!reference || reference.length > 120) {
    return NextResponse.json({ ok: false, error: "Invalid verse reference." }, { status: 400 });
  }

  const ipHash = hashIdentifier(getClientIp(request));
  const rateLimit = await enforceRateLimit({
    action: "verse-lookup",
    identifier: ipHash,
    limit: 60,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many lookups." }, { status: 429 });
  }

  const upstreamUrl = `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`;
  const upstreamResponse = await fetch(upstreamUrl, {
    next: {
      revalidate: 60 * 60 * 12,
    },
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json({ ok: false, error: "Verse not found." }, { status: 404 });
  }

  const payload = await upstreamResponse.json();
  const verses = Array.isArray(payload.verses) ? payload.verses : [];
  const verseText = verses
    .map((entry: { text?: string }) => entry.text || "")
    .join("")
    .trim();

  return NextResponse.json({
    ok: true,
    reference: payload.reference || reference,
    text: verseText || payload.text || "",
    translation: payload.translation_name || "KJV",
  });
}
