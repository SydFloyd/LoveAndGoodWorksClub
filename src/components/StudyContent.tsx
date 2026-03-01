"use client";

import { VerseLookupLayout } from "@/components/VerseLookupLayout";

export function StudyContent({ html }: { html: string }) {
  return (
    <VerseLookupLayout contentClassName="study-body" listenDocumentClicks>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </VerseLookupLayout>
  );
}
