"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

type AdminStudyEditorProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  bodyRows?: number;
  defaults: {
    id?: number | string;
    title: string;
    summary: string;
    studyDate: string;
    bodyMd: string;
  };
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

function renderPreview(markdown: string) {
  if (!markdown.trim()) {
    return "";
  }

  const rawHtml = marked.parse(markdown) as string;
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "del",
      "u",
      "blockquote",
      "code",
      "pre",
      "a",
      "hr",
      "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function AdminStudyEditor({
  action,
  submitLabel,
  bodyRows = 14,
  defaults,
}: AdminStudyEditorProps) {
  const editorKey = `${defaults.id ?? "new"}:${defaults.title}:${defaults.summary}:${defaults.studyDate}:${defaults.bodyMd.length}`;
  const [bodyMd, setBodyMd] = useState(defaults.bodyMd);
  const [previewHtml, setPreviewHtml] = useState(() => renderPreview(defaults.bodyMd));

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(renderPreview(bodyMd));
    }, 220);

    return () => clearTimeout(timer);
  }, [bodyMd]);

  return (
    <section key={editorKey} className="card stack">
      <form className="stack" action={action}>
        {defaults.id !== undefined ? <input type="hidden" name="id" value={defaults.id} /> : null}

        <label>
          Title
          <input type="text" name="title" required maxLength={200} defaultValue={defaults.title} />
        </label>

        <label>
          Summary
          <input type="text" name="summary" required minLength={8} maxLength={320} defaultValue={defaults.summary} />
        </label>

        <label>
          Study Date
          <input type="date" name="studyDate" required defaultValue={defaults.studyDate} />
        </label>

        <label>
          Body (Markdown)
          <textarea
            name="bodyMd"
            required
            minLength={10}
            maxLength={50000}
            rows={bodyRows}
            value={bodyMd}
            onChange={(event) => setBodyMd(event.target.value)}
            placeholder="# Study Title&#10;&#10;- Point 1&#10;- Point 2&#10;&#10;Read John 3:16"
          />
        </label>

        <button className="button-primary" type="submit">
          {submitLabel}
        </button>
      </form>

      <section className="markdown-preview stack" aria-live="polite">
        <h3>Markdown Preview</h3>
        {previewHtml ? (
          <div className="study-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        ) : (
          <p className="markdown-preview-empty">Preview will appear here as you type.</p>
        )}
      </section>
    </section>
  );
}
