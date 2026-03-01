"use client";

import { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function PrayerForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      requesterName: form.get("requesterName"),
      requesterEmail: form.get("requesterEmail"),
      requestText: form.get("requestText"),
    };

    const response = await fetch("/api/prayer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSubmitState("error");
      setMessage(body?.error || "Submission failed. Please try again.");
      return;
    }

    setSubmitState("success");
    setMessage(body?.message || "Prayer request received.");
    event.currentTarget.reset();
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label>
        Name (optional)
        <input name="requesterName" type="text" maxLength={120} />
      </label>

      <label>
        Email (optional)
        <input name="requesterEmail" type="email" maxLength={180} />
      </label>

      <label>
        Prayer request
        <textarea
          name="requestText"
          required
          minLength={10}
          maxLength={5000}
          rows={7}
          placeholder="Share what we can pray for..."
        />
      </label>

      <button type="submit" className="button-primary" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "Submitting..." : "Submit Prayer Request"}
      </button>

      {message ? (
        <p className={submitState === "error" ? "status error" : "status success"}>{message}</p>
      ) : null}
    </form>
  );
}
