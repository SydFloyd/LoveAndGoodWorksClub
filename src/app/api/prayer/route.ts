import { NextResponse, type NextRequest } from "next/server";
import { createPrayerRequest } from "@/lib/data";
import { hashIdentifier, getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { prayerRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = prayerRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid prayer request." }, { status: 400 });
  }

  const ipHash = hashIdentifier(getClientIp(request));
  const rateLimit = await enforceRateLimit({
    action: "prayer-submit",
    identifier: ipHash,
    limit: 4,
    windowSeconds: 60 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many submissions. Please try again later.",
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

  const requesterName = parsed.data.requesterName;
  const requesterEmail = parsed.data.requesterEmail;
  const isAnonymous = !requesterName && !requesterEmail;

  await createPrayerRequest({
    requesterName,
    requesterEmail,
    isAnonymous,
    requestText: parsed.data.requestText,
    submittedIpHash: ipHash,
  });

  return NextResponse.json({
    ok: true,
    message: "Your request has been received and will be reviewed privately.",
  });
}
