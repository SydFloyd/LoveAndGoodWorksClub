"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

type TranslationCode = "web" | "kjv" | "asv";
type VerseItem = { verse: number; text: string };

type VerseState =
  | { status: "idle"; reference: ""; translation: ""; verses: VerseItem[] }
  | { status: "loading"; reference: string; translation: string; verses: VerseItem[] }
  | { status: "ready"; reference: string; translation: string; verses: VerseItem[] }
  | { status: "error"; reference: string; translation: string; verses: VerseItem[] };

type VerseLookupLayoutProps = {
  children: ReactNode;
  contentClassName: string;
  listenDocumentClicks?: boolean;
};

function splitVerseParagraphs(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function readEncodedVerse(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  const verseButton = target.closest("[data-verse]") as HTMLElement | null;
  return verseButton?.dataset.verse || null;
}

export function VerseLookupLayout({
  children,
  contentClassName,
  listenDocumentClicks = false,
}: VerseLookupLayoutProps) {
  const [referenceInput, setReferenceInput] = useState("");
  const [translation, setTranslation] = useState<TranslationCode>("web");
  const [verse, setVerse] = useState<VerseState>({
    status: "idle",
    reference: "",
    translation: "",
    verses: [],
  });

  const fetchVerse = useCallback(async (reference: string, translationCode: TranslationCode) => {
    setVerse({ status: "loading", reference, translation: translationCode.toUpperCase(), verses: [] });
    const response = await fetch(
      `/api/verse?reference=${encodeURIComponent(reference)}&translation=${encodeURIComponent(translationCode)}`,
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.ok) {
      setVerse({ status: "error", reference, translation: translationCode.toUpperCase(), verses: [] });
      return;
    }

    const verses = Array.isArray(payload.verses)
      ? payload.verses
          .map((entry: { verse?: number; text?: string }, index: number) => ({
            verse: Number.isFinite(entry.verse) ? Number(entry.verse) : index + 1,
            text: typeof entry.text === "string" ? entry.text.trim() : "",
          }))
          .filter((entry: VerseItem) => entry.text.length > 0)
      : [];

    setVerse({
      status: "ready",
      reference: payload.reference || reference,
      translation: payload.translation || translationCode.toUpperCase(),
      verses,
    });
  }, []);

  const onReferenceSelected = useCallback(
    (encodedReference: string) => {
      try {
        const reference = decodeURIComponent(encodedReference);
        setReferenceInput(reference);
        void fetchVerse(reference, translation);
      } catch {
        // Ignore malformed verse references in data attributes.
      }
    },
    [fetchVerse, translation],
  );

  const onContentClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const encoded = readEncodedVerse(event.target);
      if (!encoded) {
        return;
      }

      event.preventDefault();
      onReferenceSelected(encoded);
    },
    [onReferenceSelected],
  );

  function onLookupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = referenceInput.trim();
    if (!reference) {
      return;
    }
    void fetchVerse(reference, translation);
  }

  useEffect(() => {
    if (!listenDocumentClicks) {
      return;
    }

    function onDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }
      const encoded = readEncodedVerse(event.target);
      if (!encoded) {
        return;
      }

      event.preventDefault();
      onReferenceSelected(encoded);
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [listenDocumentClicks, onReferenceSelected]);

  useEffect(() => {
    if (verse.reference) {
      void fetchVerse(verse.reference, translation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation]);

  return (
    <div className="study-layout">
      <div className={contentClassName} onClick={listenDocumentClicks ? undefined : onContentClick}>
        {children}
      </div>

      <aside className="verse-panel" aria-live="polite">
        <h3>Verse Lookup</h3>
        <form className="verse-lookup-form" onSubmit={onLookupSubmit}>
          <label>
            Passage
            <input
              type="text"
              value={referenceInput}
              onChange={(event) => setReferenceInput(event.target.value)}
              placeholder="John 3:16 or John 3"
            />
          </label>
          <label>
            Translation
            <select
              value={translation}
              onChange={(event) => setTranslation(event.target.value as TranslationCode)}
            >
              <option value="web">WEB</option>
              <option value="kjv">KJV</option>
              <option value="asv">ASV</option>
            </select>
          </label>
          <button className="button-outline" type="submit">
            Lookup
          </button>
        </form>
        {verse.status === "idle" ? <p>Click a verse reference to view the passage here.</p> : null}
        {verse.status === "loading" ? <p>Loading {verse.reference}...</p> : null}
        {verse.status === "error" ? <p>Could not load {verse.reference}. Try another reference.</p> : null}
        {verse.status === "ready" ? (
          <div className="verse-result">
            <p className="verse-reference">{verse.reference}</p>
            <div className="verse-passages">
              {verse.verses.map((entry) => {
                const paragraphs = splitVerseParagraphs(entry.text);
                if (paragraphs.length === 0) {
                  return null;
                }

                return (
                  <div key={`${entry.verse}-${paragraphs[0].slice(0, 16)}`} className="verse-entry">
                    {paragraphs.map((paragraph, index) => (
                      <p key={`${entry.verse}-${index}`} className="verse-line">
                        {index === 0 ? <sup className="verse-number">{entry.verse}</sup> : null}
                        <span>{paragraph}</span>
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="verse-translation">{verse.translation}</p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
