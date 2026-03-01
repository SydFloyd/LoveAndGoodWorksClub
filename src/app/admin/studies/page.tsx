import Link from "next/link";
import { createStudyAction, restoreStudyAction, softDeleteStudyAction } from "@/app/admin/actions";
import { AdminStudyEditor } from "@/components/AdminStudyEditor";
import { formatDate, formatDateInputValue } from "@/lib/format";
import { listStudies, listTrashedStudies } from "@/lib/data";

type AdminStudiesPageProps = {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    restored?: string;
    error?: string;
  }>;
};

export default async function AdminStudiesPage({ searchParams }: AdminStudiesPageProps) {
  const params = await searchParams;
  const [studies, trashedStudies] = await Promise.all([listStudies({}), listTrashedStudies()]);
  const defaultStudyDate = formatDateInputValue(new Date());

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Studies</p>
        <h2>Create Study Notes</h2>
        <p>
          This editor stores title, summary, study date, memory verse(s), and markdown body. Markdown supports
          bold, italics, strikethrough, headers, and bullets.
        </p>
      </section>

      {params.created ? <p className="status success">Study created successfully.</p> : null}
      {params.updated ? <p className="status success">Study updated successfully.</p> : null}
      {params.deleted ? <p className="status success">Study moved to trash.</p> : null}
      {params.restored ? <p className="status success">Study restored from trash.</p> : null}
      {params.error ? <p className="status error">Could not create study. Check form values.</p> : null}

      <AdminStudyEditor
        action={createStudyAction}
        submitLabel="Save Study"
        bodyRows={14}
        defaults={{
          title: "",
          summary: "",
          studyDate: defaultStudyDate,
          memoryVerses: "",
          bodyMd: "",
        }}
      />

      <section className="card stack">
        <h3>Existing Studies</h3>
        {studies.length === 0 ? <p>No studies yet.</p> : null}
        {studies.map((study) => (
          <article key={study.id} className="stack">
            <h4>{study.title}</h4>
            <p>{study.summary}</p>
            <div className="meta-row">
              <span>Study Date: {formatDate(study.studyDate)}</span>
              <span>Memory Verse(s): {study.memoryVerses || "None assigned"}</span>
              <span>Updated: {formatDate(study.updatedAt)}</span>
              <span>{study.slug}</span>
            </div>
            <div className="meta-row">
              <Link className="button-outline" href={`/admin/studies/${study.id}`}>
                Edit
              </Link>
              <form action={softDeleteStudyAction}>
                <input type="hidden" name="id" value={study.id} />
                <button className="button-outline" type="submit">
                  Move To Trash
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>

      <section className="card stack">
        <h3>Trash</h3>
        {trashedStudies.length === 0 ? <p>No deleted studies.</p> : null}
        {trashedStudies.map((study) => (
          <article key={study.id} className="stack">
            <h4>{study.title}</h4>
            <div className="meta-row">
              <span>Deleted: {study.deletedAt ? formatDate(study.deletedAt) : "Unknown"}</span>
              <span>{study.slug}</span>
            </div>
            <form action={restoreStudyAction}>
              <input type="hidden" name="id" value={study.id} />
              <button className="button-outline" type="submit">
                Restore
              </button>
            </form>
          </article>
        ))}
      </section>
    </>
  );
}
