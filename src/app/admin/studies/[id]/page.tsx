import { notFound } from "next/navigation";
import { updateStudyAction } from "@/app/admin/actions";
import { AdminStudyEditor } from "@/components/AdminStudyEditor";
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

      <AdminStudyEditor
        action={updateStudyAction}
        submitLabel="Save Changes"
        bodyRows={16}
        defaults={{
          id: study.id,
          title: study.title,
          summary: study.summary,
          studyDate: formatDateInputValue(study.studyDate),
          memoryVerses: study.memoryVerses,
          bodyMd: study.bodyMd,
        }}
      />
    </>
  );
}
