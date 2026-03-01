import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StudyContent } from "@/components/StudyContent";
import { getAdjacentStudiesBySlug, getStudyBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { renderStudyMarkdown } from "@/lib/markdown";
import { splitMemoryVerses } from "@/lib/verses";

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
    description: study.summary || `Bible study notes from ${formatDate(study.studyDate)}.`,
  };
}

export default async function StudyDetailPage({ params }: StudyPageProps) {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const adjacent = await getAdjacentStudiesBySlug(slug);
  const html = renderStudyMarkdown(study.bodyMd);
  const memoryVerseReferences = splitMemoryVerses(study.memoryVerses);

  return (
    <>
      <section className="card stack">
        <div className="study-header-row">
          <h2>{study.title}</h2>
          <span className="study-summary-date study-header-date">{formatDate(study.studyDate)}</span>
        </div>
        <p className="study-summary-line">{study.summary}</p>
        <div className="memory-verse-row">
          <span>Memory Verse(s): </span>
          {memoryVerseReferences.length === 0 ? (
            <span>None assigned.</span>
          ) : (
            <span className="memory-verse-list">
              {memoryVerseReferences.map((reference, index) => (
                <span key={`${reference}-${index}`}>
                  {index > 0 ? ", " : ""}
                  <button
                    className="verse-link"
                    data-verse={encodeURIComponent(reference)}
                    type="button"
                  >
                    {reference}
                  </button>
                </span>
              ))}
            </span>
          )}
        </div>
      </section>

      <StudyContent html={html} updatedLabel={`Last updated: ${formatDate(study.updatedAt)}`} />

      <nav className="study-pager" aria-label="Study navigation">
        <div className="study-pager-slot study-pager-slot-prev">
          {adjacent.prev ? (
            <Link className="button-outline study-pager-link study-pager-link-prev" href={`/studies/${adjacent.prev.slug}`}>
              <span className="study-pager-label">&lt;-Prev</span>
              <span className="study-pager-title">{adjacent.prev.title}</span>
            </Link>
          ) : null}
        </div>

        <div className="study-pager-slot study-pager-slot-next">
          {adjacent.next ? (
            <Link className="button-outline study-pager-link study-pager-link-next" href={`/studies/${adjacent.next.slug}`}>
              <span className="study-pager-label">Next-&gt;</span>
              <span className="study-pager-title">{adjacent.next.title}</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}
