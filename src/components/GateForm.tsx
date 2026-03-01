"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GateForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        next: nextPath,
      }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.ok) {
      setError(body.error || "Incorrect password.");
      setIsLoading(false);
      return;
    }

    router.push(body.redirectTo || "/");
    router.refresh();
  }

  return (
    <form className="stack gate-form" onSubmit={onSubmit}>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />
      </label>

      <button className="button-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Checking..." : "Enter Site"}
      </button>

      {error ? <p className="status error">{error}</p> : null}
    </form>
  );
}
