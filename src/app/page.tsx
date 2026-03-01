import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { getSiteSettings } from "@/lib/data";
import { getNextGoogleCalendarEvent } from "@/lib/google-calendar";

export default async function HomePage() {
  const [settings, nextCalendarEvent] = await Promise.all([getSiteSettings(), getNextGoogleCalendarEvent()]);

  const nextMeeting = nextCalendarEvent
    ? {
        title: nextCalendarEvent.title,
        time: nextCalendarEvent.startAt,
        location: nextCalendarEvent.location,
      }
    : null;

  return (
    <>
      <section className="home-hero-row">
        <article className="home-hero-logo">
          <Image src="/lgwc-logo-1.png" alt="Love & Good Works Logo" width={600} height={600} priority />
        </article>
        <article className="hero stack">
          <p className="eyebrow">Welcome</p>
          <h2>Love & Good Works</h2>
          <p>{settings.welcomeMessage}</p>
          <blockquote className="scripture-quote">
            And let us consider how to stir up one another to love and good works, not neglecting to meet
            together, as is the habit of some, but encouraging one another, and all the more as you see
            the Day drawing near.
          </blockquote>
          <p className="scripture-ref">Hebrews 10:24-25</p>
        </article>
      </section>

      <section className="home-main-row">
        <div className="stack">
          <article className="card stack">
            <p className="eyebrow">Next Meeting</p>
            {nextMeeting ? (
              <>
                <h3>{nextMeeting.title}</h3>
                <p>
                  <strong>{formatDateTime(nextMeeting.time)}</strong>
                </p>
                <p>{nextMeeting.location}</p>
              </>
            ) : (
              <p>Meeting information will be posted soon.</p>
            )}
            <Link href="/calendar" className="button-outline">
              View Full Calendar
            </Link>
          </article>

          <article className="card stack">
            <p className="eyebrow">Current Studies</p>
            <p>Browse archived notes from our Bible studies with verse quick-lookup.</p>
            <Link href="/studies" className="button-primary">
              Explore Studies
            </Link>
          </article>

          <article className="card stack">
            <p className="eyebrow">Prayer Requests</p>
            <p>
              Submit private prayer needs to the admin team. Requests are reviewed privately and included
              in weekly prayer follow-up.
            </p>
            <Link href="/prayer" className="button-primary">
              Submit Prayer Request
            </Link>
          </article>
        </div>

        <article className="home-logo-secondary">
          <Image src="/lgwc-logo-2.png" alt="Love & Good Works" width={1200} height={1200} />
        </article>
      </section>
    </>
  );
}
