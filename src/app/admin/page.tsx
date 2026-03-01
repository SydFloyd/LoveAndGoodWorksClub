import Link from "next/link";
import { updateSiteSettingsAction } from "@/app/admin/actions";
import {
  getResources,
  getSiteSettings,
  listPrayerRequestsSince,
  listStudies,
} from "@/lib/data";

type AdminDashboardPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const [recentPrayer, studies, resources, settings] = await Promise.all([
    listPrayerRequestsSince(7),
    listStudies({}),
    getResources(),
    getSiteSettings(),
  ]);

  const unreviewedPrayer = recentPrayer.filter((item) => !item.reviewed).length;

  return (
    <>
      <section className="hero stack admin-panel-tight">
        <p className="eyebrow">Admin</p>
        <h2>Content & Ministry Dashboard</h2>
        <p>Manage studies, welcome message, resources, and weekly prayer review.</p>
      </section>

      {params.updated ? <p className="status success">Saved: {params.updated}</p> : null}
      {params.error ? <p className="status error">Error: {params.error}</p> : null}

      <section className="card stack admin-panel-tight">
        <h3>Home Welcome Message</h3>
        <form className="stack admin-panel-tight" action={updateSiteSettingsAction}>
          <label>
            Welcome Message
            <textarea name="welcomeMessage" defaultValue={settings.welcomeMessage} rows={5} required />
          </label>
          <button className="button-primary" type="submit">
            Save Welcome Message
          </button>
        </form>
      </section>

      <section className="grid cols-3">
        <article className="card stack admin-panel-tight">
          <h3>Prayer Requests (7 days)</h3>
          <p>Total: {recentPrayer.length}</p>
          <p>Unreviewed: {unreviewedPrayer}</p>
          <Link href="/admin/prayer" className="button-primary">
            Review Prayer Requests
          </Link>
        </article>

        <article className="card stack admin-panel-tight">
          <h3>Studies</h3>
          <p>Total archived studies: {studies.length}</p>
          <Link href="/admin/studies" className="button-primary">
            Manage Studies
          </Link>
        </article>

        <article className="card stack admin-panel-tight">
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
