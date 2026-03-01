export type GoogleCalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
};

function normalizeEventTitle(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

type GoogleCalendarApiEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
};

function parseEventDate(value?: { dateTime?: string; date?: string }) {
  const raw = value?.dateTime || value?.date;
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function getGoogleCalendarEmbedUrl() {
  const directUrl = process.env.GOOGLE_CALENDAR_EMBED_URL?.trim();
  if (directUrl) {
    return directUrl;
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) {
    return null;
  }

  const timezone = process.env.GOOGLE_CALENDAR_TIMEZONE?.trim() || "America/New_York";
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=${encodeURIComponent(timezone)}`;
}

function getGoogleCalendarApiUrl(limit: number) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY?.trim();

  if (!calendarId || !apiKey) {
    return null;
  }

  const timezone = process.env.GOOGLE_CALENDAR_TIMEZONE?.trim() || "America/New_York";
  const nowIso = new Date().toISOString();
  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: nowIso,
    maxResults: String(limit),
    timeZone: timezone,
  });

  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;
}

export async function getUpcomingGoogleCalendarEvents(limit = 20): Promise<GoogleCalendarEvent[]> {
  const apiUrl = getGoogleCalendarApiUrl(limit);
  if (!apiUrl) {
    return [];
  }

  const response = await fetch(apiUrl, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { items?: GoogleCalendarApiEvent[] };
  const items = Array.isArray(payload.items) ? payload.items : [];

  const events = items
    .map((item) => {
      const startAt = parseEventDate(item.start);
      const endAt = parseEventDate(item.end) || startAt;
      if (!startAt || !endAt) {
        return null;
      }

      return {
        id: item.id,
        title: item.summary?.trim() || "Untitled Event",
        description: item.description?.trim() || "",
        location: item.location?.trim() || "",
        startAt,
        endAt,
      } satisfies GoogleCalendarEvent;
    })
    .filter((event): event is GoogleCalendarEvent => Boolean(event));

  return events.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, limit);
}

export async function getNextGoogleCalendarEvent() {
  const events = await getUpcomingGoogleCalendarEvents(1);
  return events[0] ?? null;
}

export async function getNextGoogleCalendarEventByTitle(title: string) {
  const expected = normalizeEventTitle(title);
  const events = await getUpcomingGoogleCalendarEvents(100);
  return events.find((event) => normalizeEventTitle(event.title) === expected) ?? null;
}
