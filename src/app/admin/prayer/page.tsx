import Link from "next/link";
import { markPrayerReviewedAction } from "@/app/admin/actions";
import { listPrayerRequests } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

type AdminPrayerPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
    page?: string;
    pending?: string;
    name?: string;
    from?: string;
    to?: string;
  }>;
};

function normalizeDateParam(value?: string) {
  const input = value?.trim() || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return "";
  }
  const parsed = new Date(`${input}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? "" : input;
}

function parsePage(value?: string) {
  const page = Number(value || "");
  if (!Number.isFinite(page)) {
    return 1;
  }
  return Math.max(1, Math.floor(page));
}

export default async function AdminPrayerPage({ searchParams }: AdminPrayerPageProps) {
  const params = await searchParams;
  const pendingOnly = params.pending === "1";
  const name = params.name?.trim() || "";
  const fromDate = normalizeDateParam(params.from);
  const toDate = normalizeDateParam(params.to);
  const requestedPage = parsePage(params.page);

  const requests = await listPrayerRequests({
    page: requestedPage,
    pageSize: 20,
    pendingOnly,
    requesterName: name || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  function buildPageHref(page: number) {
    const query = new URLSearchParams();
    if (pendingOnly) {
      query.set("pending", "1");
    }
    if (name) {
      query.set("name", name);
    }
    if (fromDate) {
      query.set("from", fromDate);
    }
    if (toDate) {
      query.set("to", toDate);
    }
    if (page > 1) {
      query.set("page", String(page));
    }
    const queryString = query.toString();
    return queryString ? `/admin/prayer?${queryString}` : "/admin/prayer";
  }

  const currentPageHref = buildPageHref(requests.page);
  const shownStart = requests.total === 0 ? 0 : (requests.page - 1) * requests.pageSize + 1;
  const shownEnd = requests.total === 0 ? 0 : shownStart + requests.items.length - 1;

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Prayer</p>
        <h2>Prayer Requests</h2>
        <p>
          This list is private and one-way. Requests do not publish publicly to the website. Use this page
          as your review queue.
        </p>
      </section>

      {params.updated ? <p className="status success">Request marked as reviewed.</p> : null}
      {params.error ? <p className="status error">Unable to update this request.</p> : null}

      <details className="card stack admin-filter-panel">
        <summary>Filters</summary>
        <form className="stack" method="get">
          <div className="grid cols-3">
            <label>
              Requester Name
              <input type="search" name="name" defaultValue={name} placeholder="Search by name..." />
            </label>

            <label>
              From Date
              <input type="date" name="from" defaultValue={fromDate} />
            </label>

            <label>
              To Date
              <input type="date" name="to" defaultValue={toDate} />
            </label>
          </div>

          <label className="checkbox-row">
            <input type="checkbox" name="pending" value="1" defaultChecked={pendingOnly} />
            Show only unreviewed
          </label>

          <div className="meta-row">
            <button type="submit" className="button-primary">
              Apply Filters
            </button>
            <Link className="button-outline" href="/admin/prayer">
              Clear
            </Link>
          </div>
        </form>
      </details>

      <section className="card stack admin-panel-tight">
        <p>
          Showing {shownStart}-{shownEnd} of {requests.total} requests.
        </p>
        {requests.totalPages > 1 ? (
          <div className="meta-row">
            {requests.page > 1 ? (
              <Link className="button-outline" href={buildPageHref(requests.page - 1)}>
                Previous
              </Link>
            ) : null}
            <span>
              Page {requests.page} of {requests.totalPages}
            </span>
            {requests.page < requests.totalPages ? (
              <Link className="button-outline" href={buildPageHref(requests.page + 1)}>
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="stack">
        {requests.items.length === 0 ? <p>No requests found for the current filters.</p> : null}
        {requests.items.map((request) => (
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
                <input type="hidden" name="returnTo" value={currentPageHref} />
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
