import { GateForm } from "@/components/GateForm";

type GatePageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function GatePage({ searchParams }: GatePageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/";

  return (
    <div className="gate-wrap">
      <div className="gate-panel stack">
        <section className="hero stack">
          <p className="eyebrow">Protected Access</p>
          <h2>Love & Good Works</h2>
          <p>Hint: Don&apos;s dog&apos;s name</p>
        </section>

        <GateForm nextPath={nextPath} />
      </div>
    </div>
  );
}
