import { markPrayerReviewedAction } from "@/app/admin/actions";
import { listPrayerRequestsSince } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

type AdminPrayerPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

export default async function AdminPrayerPage({ searchParams }: AdminPrayerPageProps) {
  const params = await searchParams;
  const requests = await listPrayerRequestsSince(7);

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Prayer</p>
        <h2>Prayer Requests (Last 7 Days)</h2>
        <p>
          This list is private and one-way. Requests do not publish publicly to the website. Use this page
          as your weekly review queue.
        </p>
      </section>

      {params.updated ? <p className="status success">Request marked as reviewed.</p> : null}
      {params.error ? <p className="status error">Unable to update this request.</p> : null}

      <section className="stack">
        {requests.length === 0 ? <p>No requests submitted in the past week.</p> : null}
        {requests.map((request) => (
          <article key={request.id} className="card stack">
            <div className="meta-row">
              <span>{formatDateTime(request.createdAt)}</span>
              <span>{request.reviewed ? "Reviewed" : "Pending"}</span>
              <span>{request.isAnonymous ? "Anonymous" : request.requesterName || "Named request"}</span>
            </div>

            {request.requesterEmail && !request.isAnonymous ? <p>Email: {request.requesterEmail}</p> : null}
            <p>{request.requestText}</p>

            {!request.reviewed ? (
              <form action={markPrayerReviewedAction} className="stack">
                <input type="hidden" name="id" value={request.id} />
                <label>
                  Reviewer note (optional)
                  <input type="text" name="reviewerNote" maxLength={500} />
                </label>
                <button type="submit" className="button-primary">
                  Mark Reviewed
                </button>
              </form>
            ) : request.reviewerNote ? (
              <p>
                <strong>Note:</strong> {request.reviewerNote}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </>
  );
}
