import { createResourceAction, updateSiteSettingsAction } from "@/app/admin/actions";
import { getResources, getSiteSettings } from "@/lib/data";

type AdminContentPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams;
  const [settings, resources] = await Promise.all([getSiteSettings(), getResources()]);

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Content</p>
        <h2>Manage Home and Resources</h2>
        <p>Calendar updates are managed directly in Google Calendar.</p>
      </section>

      {params.updated ? <p className="status success">Saved: {params.updated}</p> : null}
      {params.error ? <p className="status error">Error: {params.error}</p> : null}

      <section className="card stack">
        <h3>Home Settings</h3>
        <form className="stack" action={updateSiteSettingsAction}>
          <label>
            Welcome Message
            <textarea name="welcomeMessage" defaultValue={settings.welcomeMessage} rows={5} required />
          </label>

          <button className="button-primary" type="submit">
            Save Welcome Message
          </button>
        </form>
      </section>

      <section>
        <article id="resources-center" className="card stack">
          <h3>Add Resource Link</h3>
          <form className="stack" action={createResourceAction}>
            <label>
              Category
              <select name="category" defaultValue="BOOK">
                <option value="BOOK">Book</option>
                <option value="ARTICLE">Article</option>
                <option value="TOOL">Tool</option>
              </select>
            </label>
            <label>
              Title
              <input type="text" name="title" required />
            </label>
            <label>
              URL
              <input type="url" name="url" required />
            </label>
            <label>
              Description
              <textarea name="description" rows={3} />
            </label>
            <button className="button-primary" type="submit">
              Add Resource
            </button>
          </form>
          <div className="stack">
            {resources.slice(0, 8).map((resource) => (
              <div key={resource.id}>
                <p>
                  <strong>{resource.title}</strong> ({resource.category})
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
