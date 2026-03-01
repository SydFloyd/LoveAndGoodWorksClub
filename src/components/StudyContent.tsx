"use client";

import { VerseLookupLayout } from "@/components/VerseLookupLayout";

export function StudyContent({ html, updatedLabel }: { html: string; updatedLabel: string }) {
  return (
    <VerseLookupLayout contentClassName="study-body" listenDocumentClicks>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <p className="study-updated-note study-updated-note-inline">{updatedLabel}</p>
    </VerseLookupLayout>
  );
}
