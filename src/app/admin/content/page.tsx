import {
  createResourceAction,
  deleteResourceAction,
  updateResourceAction,
} from "@/app/admin/actions";
import { getResources } from "@/lib/data";

type AdminContentPageProps = {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams;
  const resources = await getResources();

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Content</p>
        <h2>Manage Resources</h2>
        <p>Calendar updates are managed directly in Google Calendar.</p>
      </section>

      {params.updated ? <p className="status success">Saved: {params.updated}</p> : null}
      {params.error ? <p className="status error">Error: {params.error}</p> : null}

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
          <h3>Edit or Delete Existing Resources</h3>
          <div className="stack">
            {resources.length === 0 ? <p>No resources yet.</p> : null}
            {resources.map((resource) => (
              <article key={resource.id} className="card stack">
                <form className="stack" action={updateResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <label>
                    Category
                    <select name="category" defaultValue={resource.category}>
                      <option value="BOOK">Book</option>
                      <option value="ARTICLE">Article</option>
                      <option value="TOOL">Tool</option>
                    </select>
                  </label>
                  <label>
                    Title
                    <input type="text" name="title" required defaultValue={resource.title} />
                  </label>
                  <label>
                    URL
                    <input type="url" name="url" required defaultValue={resource.url} />
                  </label>
                  <label>
                    Description
                    <textarea name="description" rows={3} defaultValue={resource.description} />
                  </label>
                  <button className="button-primary" type="submit">
                    Save Changes
                  </button>
                </form>
                <form action={deleteResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <button className="button-outline" type="submit">
                    Delete Resource
                  </button>
                </form>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
