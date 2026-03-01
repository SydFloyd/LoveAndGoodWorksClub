import { PrayerForm } from "@/components/PrayerForm";

export default function PrayerPage() {
  return (
    <>
      <section className="hero stack prayer-hero-tight">
        <h2>Private Prayer Request Submission</h2>
        <p>
          Requests submitted here are private and one-way. They are reviewed by the prayer captain and 
          included in the prayer list mailings.
        </p>
      </section>

      <section className="card">
        <PrayerForm />
      </section>
    </>
  );
}
