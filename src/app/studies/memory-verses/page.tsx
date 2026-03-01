import Link from "next/link";
import { VerseLookupLayout } from "@/components/VerseLookupLayout";
import { listStudyMemoryVerses } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { splitMemoryVerses } from "@/lib/verses";

export default async function MemoryVersesPage() {
  const studies = await listStudyMemoryVerses();

  return (
    <>
      <section className="hero stack">
        <h2>Memory Verses</h2>
        <p>Click any memory verse to open it in the verse reader.</p>
      </section>

      <VerseLookupLayout contentClassName="card stack">
        {studies.length === 0 ? (
          <p>No studies available yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Study Date</th>
                  <th>Study</th>
                  <th>Memory Verse(s)</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => {
                  const references = splitMemoryVerses(study.memoryVerses);
                  return (
                    <tr key={study.id}>
                      <td>{formatDate(study.studyDate)}</td>
                      <td>
                        <Link href={`/studies/${study.slug}`}>{study.title}</Link>
                      </td>
                      <td>
                        {references.length === 0 ? (
                          <span className="muted-text">None assigned</span>
                        ) : (
                          <span className="memory-verse-list">
                            {references.map((reference, index) => (
                              <span key={`${study.id}-${reference}-${index}`}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </VerseLookupLayout>
    </>
  );
}
