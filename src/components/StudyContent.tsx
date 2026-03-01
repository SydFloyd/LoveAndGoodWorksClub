"use client";

import { useState } from "react";

type VerseState =
  | { status: "idle"; reference: ""; text: ""; translation: "" }
  | { status: "loading"; reference: string; text: ""; translation: "" }
  | { status: "ready"; reference: string; text: string; translation: string }
  | { status: "error"; reference: string; text: ""; translation: "" };

export function StudyContent({ html }: { html: string }) {
  const [verse, setVerse] = useState<VerseState>({
    status: "idle",
    reference: "",
    text: "",
    translation: "",
  });

  async function fetchVerse(reference: string) {
    setVerse({ status: "loading", reference, text: "", translation: "" });
    const response = await fetch(`/api/verse?reference=${encodeURIComponent(reference)}`);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.ok) {
      setVerse({ status: "error", reference, text: "", translation: "" });
      return;
    }

    setVerse({
      status: "ready",
      reference: payload.reference || reference,
      text: payload.text || "",
      translation: payload.translation || "",
    });
  }

  function onStudyClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const verseButton = target.closest("[data-verse]") as HTMLElement | null;
    if (!verseButton) {
      return;
    }

    const encoded = verseButton.dataset.verse;
    if (!encoded) {
      return;
    }

    event.preventDefault();
    const reference = decodeURIComponent(encoded);
    void fetchVerse(reference);
  }

  return (
    <div className="study-layout">
      <div className="study-body" onClick={onStudyClick} dangerouslySetInnerHTML={{ __html: html }} />

      <aside className="verse-panel" aria-live="polite">
        <h3>Verse Lookup</h3>
        {verse.status === "idle" ? <p>Click a verse reference to view the passage here.</p> : null}
        {verse.status === "loading" ? <p>Loading {verse.reference}...</p> : null}
        {verse.status === "error" ? <p>Could not load {verse.reference}. Try another reference.</p> : null}
        {verse.status === "ready" ? (
          <div className="verse-result">
            <p className="verse-reference">{verse.reference}</p>
            <p>{verse.text}</p>
            <p className="verse-translation">{verse.translation}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
