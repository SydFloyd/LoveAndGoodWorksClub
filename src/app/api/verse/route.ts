import { NextResponse, type NextRequest } from "next/server";
import { hashIdentifier, getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";

type TranslationCode = "web" | "kjv" | "asv";
const supportedTranslations: TranslationCode[] = ["web", "kjv", "asv"];

type BibleApiVerse = {
  verse?: number;
  text?: string;
};

function normalizeTranslation(value?: string): TranslationCode {
  const normalized = value?.trim().toLowerCase();
  if (normalized && supportedTranslations.includes(normalized as TranslationCode)) {
    return normalized as TranslationCode;
  }
  return "web";
}

function normalizeVerseText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")?.trim();
  const translation = normalizeTranslation(request.nextUrl.searchParams.get("translation") || undefined);

  if (!reference || reference.length > 180) {
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

  const upstreamUrl = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    next: {
      revalidate: 60 * 60 * 12,
    },
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json({ ok: false, error: "Verse not found." }, { status: 404 });
  }

  const payload = (await upstreamResponse.json()) as {
    reference?: string;
    text?: string;
    translation_name?: string;
    verses?: BibleApiVerse[];
  };
  const verses = Array.isArray(payload.verses) ? payload.verses : [];
  const verseItems = verses
    .map((entry, index) => ({
      verse: Number.isFinite(entry.verse) ? Number(entry.verse) : index + 1,
      text: normalizeVerseText(entry.text || ""),
    }))
    .filter((entry) => entry.text.length > 0);
  const fallbackText = normalizeVerseText(payload.text || "");
  const outputVerses =
    verseItems.length > 0
      ? verseItems
      : fallbackText
      ? [{ verse: 1, text: fallbackText }]
      : [];
  const verseText = outputVerses.map((entry) => entry.text).join(" ").trim();

  return NextResponse.json({
    ok: true,
    reference: payload.reference || reference,
    text: verseText,
    translation: payload.translation_name || translation.toUpperCase(),
    verses: outputVerses,
  });
}
