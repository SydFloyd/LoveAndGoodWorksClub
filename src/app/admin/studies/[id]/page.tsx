import { notFound } from "next/navigation";
import { updateStudyAction } from "@/app/admin/actions";
import { getStudyById } from "@/lib/data";
import { formatDateInputValue } from "@/lib/format";

type AdminEditStudyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditStudyPage({ params }: AdminEditStudyPageProps) {
  const { id } = await params;
  const studyId = Number(id);

  if (!Number.isFinite(studyId)) {
    notFound();
  }

  const study = await getStudyById(studyId);
  if (!study || study.deletedAt) {
    notFound();
  }

  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Admin / Studies</p>
        <h2>Edit Study</h2>
      </section>

      <section className="card">
        <form className="stack" action={updateStudyAction}>
          <input type="hidden" name="id" value={study.id} />
          <div className="study-title-date-row">
            <label className="study-title-inline">
              Title
              <input type="text" name="title" required maxLength={200} defaultValue={study.title} />
            </label>

            <label className="study-date-inline">
              Study Date
              <input
                type="date"
                name="studyDate"
                required
                defaultValue={formatDateInputValue(study.studyDate)}
              />
            </label>
          </div>

          <label>
            Summary
            <input
              type="text"
              name="summary"
              required
              minLength={8}
              maxLength={320}
              defaultValue={study.summary}
            />
          </label>

          <label>
            Body (Markdown)
            <textarea
              name="bodyMd"
              required
              minLength={10}
              maxLength={50000}
              rows={16}
              defaultValue={study.bodyMd}
            />
          </label>

          <button className="button-primary" type="submit">
            Save Changes
          </button>
        </form>
      </section>
    </>
  );
}
