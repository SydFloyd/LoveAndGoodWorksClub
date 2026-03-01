import Link from "next/link";
import { getResources, listPrayerRequestsSince, listStudies } from "@/lib/data";

export default async function AdminDashboardPage() {
  const [recentPrayer, studies, resources] = await Promise.all([
    listPrayerRequestsSince(7),
    listStudies({}),
    getResources(),
  ]);

  const unreviewedPrayer = recentPrayer.filter((item) => !item.reviewed).length;

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin</p>
        <h2>Content & Ministry Dashboard</h2>
        <p>Manage studies, homepage content, resources, and weekly prayer review.</p>
      </section>

      <section className="grid cols-3">
        <article className="card stack">
          <h3>Prayer Requests (7 days)</h3>
          <p>Total: {recentPrayer.length}</p>
          <p>Unreviewed: {unreviewedPrayer}</p>
          <Link href="/admin/prayer" className="button-primary">
            Review Prayer Requests
          </Link>
        </article>

        <article className="card stack">
          <h3>Studies</h3>
          <p>Total archived studies: {studies.length}</p>
          <Link href="/admin/studies" className="button-primary">
            Manage Studies
          </Link>
        </article>

        <article className="card stack">
          <h3>Resources Center</h3>
          <p>Total resources: {resources.length}</p>
          <Link href="/admin/content#resources-center" className="button-primary">
            Manage Resources
          </Link>
        </article>

      </section>
    </>
  );
}
