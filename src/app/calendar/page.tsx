import { formatDateTime } from "@/lib/format";
import { getGoogleCalendarEmbedUrl, getUpcomingGoogleCalendarEvents } from "@/lib/google-calendar";

function EventsTable({ events }: { events: Awaited<ReturnType<typeof getUpcomingGoogleCalendarEvents>> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>Date & Time</th>
            <th>Location</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{formatDateTime(event.startAt)}</td>
              <td>{event.location || "-"}</td>
              <td>{event.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CalendarPage() {
  const [events, embedUrl] = await Promise.all([getUpcomingGoogleCalendarEvents(24), getGoogleCalendarEmbedUrl()]);
  const firstFiveEvents = events.slice(0, 5);
  const remainingEvents = events.slice(5);

  return (
    <>
      <section className="stack">
        <h2>LGWC Events</h2>
      </section>

      <section className="card stack">
        <p className="eyebrow">Calendar View</p>
        {embedUrl ? (
          <iframe
            title="Love & Good Works Google Calendar"
            src={embedUrl}
            width="100%"
            height="700"
            frameBorder="0"
            scrolling="no"
          />
        ) : (
          <p>
            Set `GOOGLE_CALENDAR_ID` (or `GOOGLE_CALENDAR_EMBED_URL`) in your environment to enable the
            embedded calendar.
          </p>
        )}
      </section>

      <section className="card stack">
        <p className="eyebrow">Upcoming Events</p>
        {events.length === 0 ? (
          <p>No upcoming events found. Check your Google Calendar sharing and environment settings.</p>
        ) : (
          <>
            <EventsTable events={firstFiveEvents} />
            {remainingEvents.length > 0 ? (
              <details className="events-expander">
                <summary>See all ({remainingEvents.length} more)</summary>
                <EventsTable events={remainingEvents} />
              </details>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
