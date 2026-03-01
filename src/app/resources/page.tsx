import { getResources } from "@/lib/data";

const categoryLabels: Record<string, string> = {
  BOOK: "Recommended Books",
  ARTICLE: "Articles",
  TOOL: "Study Tools",
};

export default async function ResourcesPage() {
  const resources = await getResources();

  const grouped = resources.reduce<Record<string, typeof resources>>((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {});

  const toolResources = [...(grouped.TOOL || [])].sort((a, b) => {
    const aIsDbs = a.url.toLowerCase().includes("dbs.org");
    const bIsDbs = b.url.toLowerCase().includes("dbs.org");
    if (aIsDbs && !bIsDbs) {
      return -1;
    }
    if (!aIsDbs && bIsDbs) {
      return 1;
    }
    return a.title.localeCompare(b.title);
  });
  grouped.TOOL = toolResources;

  return (
    <>
      {(["BOOK", "ARTICLE", "TOOL"] as const).map((category) => (
        <section key={category} className="card resource-section">
          <h3>{categoryLabels[category]}</h3>
          <div className="resource-list">
            {grouped[category]?.length ? (
              grouped[category].map((resource) => (
                <article key={resource.id}>
                  <p className="resource-line">
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      {resource.title}
                    </a>
                    {resource.description ? ` - ${resource.description}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <p>No entries yet.</p>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
