import Image from "next/image";
import Link from "next/link";
import { formatDate, formatDateTimeInTimeZone } from "@/lib/format";
import { getSiteSettings, listStudies } from "@/lib/data";
import { getNextGoogleCalendarEventByTitle } from "@/lib/google-calendar";

export default async function HomePage() {
  const meetingTimeZone = "America/Chicago";

  const [settings, nextCalendarEvent, studies] = await Promise.all([
    getSiteSettings(),
    getNextGoogleCalendarEventByTitle("Fellowship & Study"),
    listStudies({}),
  ]);
  const latestStudies = studies.slice(0, 3);

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
          <h2>Love & Good Works Club</h2>
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
          <article className="card stack next-meeting-card">
            <p className="eyebrow">Next Meeting</p>
            {nextMeeting ? (
              <>
                <h3>{nextMeeting.title}</h3>
                <p>
                  <strong>{formatDateTimeInTimeZone(nextMeeting.time, meetingTimeZone)}</strong>
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
            <p className="eyebrow">Latest Studies</p>
            <p>**Study Archive In Progress -- many months of study notes to be added**</p>
            <div className="latest-studies-list">
              {latestStudies.length === 0 ? <p>No studies posted yet.</p> : null}
              {latestStudies.map((study) => (
                <article key={study.id} className="latest-study-item">
                  <p className="latest-study-line">
                    <Link href={`/studies/${study.slug}`}>{study.title}</Link>
                    <span> - {study.summary}</span>
                  </p>
                  <p className="latest-study-date">{formatDate(study.studyDate)}</p>
                </article>
              ))}
            </div>
            <Link href="/studies" className="button-primary">
              Explore Study Archive
            </Link>
          </article>

          <article className="card stack">
            <p className="eyebrow">Prayer Requests</p>
            <p>
              Requests are reviewed privately to be included in weekly prayer mailing.
            </p>
            <Link href="/prayer" className="button-primary">
              Submit Prayer Request
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
