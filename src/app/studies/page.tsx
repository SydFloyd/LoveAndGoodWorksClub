import Image from "next/image";
import Link from "next/link";
import { listStudies } from "@/lib/data";
import { formatDate } from "@/lib/format";

type StudiesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function StudiesPage({ searchParams }: StudiesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const studies = await listStudies({ query: query || undefined });

  return (
    <>
      <section className="studies-hero-row">
        <div className="studies-hero-logo">
          <Image src="/lgwc-logo-2.png" alt="Love & Good Works" width={1200} height={1200} />
        </div>
        <article className="hero stack">
          <h2>Bible Study Archive</h2>
          <p className="studies-subtitle">
            Search and paruse notes from Kurt&apos;s study outlines curated by our lovely Hannah.
          </p>
          <form className="inline-search" method="get">
            <label>
              Search
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Grace, John 15, discipleship..."
              />
            </label>
            <button className="button-primary" type="submit">
              Search
            </button>
          </form>
        </article>
      </section>

      <section className="stack">
        {studies.length === 0 ? <p>No studies found for this query.</p> : null}
        {studies.map((study) => (
          <article key={study.id} className="card stack">
            <h3>
              <Link href={`/studies/${study.slug}`}>{study.title}</Link>
            </h3>
            <div className="meta-row">
              <span>{formatDate(study.createdAt)}</span>
            </div>
            <p>{stripMarkdown(study.bodyMd).slice(0, 240)}...</p>
            <Link className="button-outline" href={`/studies/${study.slug}`}>
              Read Study
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
