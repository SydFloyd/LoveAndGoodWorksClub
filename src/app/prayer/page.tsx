import { PrayerForm } from "@/components/PrayerForm";

export default function PrayerPage() {
  return (
    <>
      <section className="hero stack">
        <p className="eyebrow">Prayer</p>
        <h2>Private Prayer Request Submission</h2>
        <p>
          Requests submitted here are private and one-way. They are reviewed by admin and included in
          the prayer list workflow.
        </p>
      </section>

      <section className="card">
        <PrayerForm />
      </section>
    </>
  );
}
