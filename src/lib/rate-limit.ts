import { sql } from "@/lib/db";

type RateLimitParams = {
  action: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function enforceRateLimit(params: RateLimitParams): Promise<RateLimitResult> {
  const { action, identifier, limit, windowSeconds } = params;
  const nowEpoch = Math.floor(Date.now() / 1000);
  const windowStartEpoch = Math.floor(nowEpoch / windowSeconds) * windowSeconds;

  const [row] = await sql<{ request_count: number }[]>`
    insert into rate_limits (action, identifier, window_start, request_count)
    values (
      ${action},
      ${identifier},
      to_timestamp(${windowStartEpoch}),
      1
    )
    on conflict (action, identifier, window_start)
    do update
      set request_count = rate_limits.request_count + 1
    returning request_count
  `;

  await sql`
    delete from rate_limits
    where window_start < now() - interval '2 days'
  `;

  const requestCount = row?.request_count ?? 1;
  const remaining = Math.max(0, limit - requestCount);
  const retryAfterSeconds = windowStartEpoch + windowSeconds - nowEpoch;

  return {
    allowed: requestCount <= limit,
    remaining,
    retryAfterSeconds,
  };
}
