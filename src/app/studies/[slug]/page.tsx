import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyContent } from "@/components/StudyContent";
import { getStudyBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderStudyMarkdown } from "@/lib/markdown";

type StudyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);
  if (!study) {
    return {
      title: "Study Not Found",
    };
  }

  return {
    title: study.title,
    description: `Bible study notes published ${formatDate(study.createdAt)}.`,
  };
}

export default async function StudyDetailPage({ params }: StudyPageProps) {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const html = renderStudyMarkdown(study.bodyMd);

  return (
    <>
      <section className="card stack">
        <p className="eyebrow">Study Archive</p>
        <h2>{study.title}</h2>
        <div className="meta-row">
          <span>Published: {formatDate(study.createdAt)}</span>
          <span>Updated: {formatDate(study.updatedAt)}</span>
        </div>
      </section>

      <StudyContent html={html} />
    </>
  );
}
