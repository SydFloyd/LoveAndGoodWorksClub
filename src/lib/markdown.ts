import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { linkVerseReferences } from "@/lib/verses";

marked.setOptions({
  gfm: true,
  breaks: true,
});

function transformVerseLinks(html: string) {
  return html.replace(
    /<a href="verse:([^"]+)">([\s\S]*?)<\/a>/g,
    '<button class="verse-link" data-verse="$1" type="button">$2</button>',
  );
}

export function renderStudyMarkdown(markdown: string) {
  const linkedMarkdown = linkVerseReferences(markdown);
  const rawHtml = marked.parse(linkedMarkdown) as string;
  const withVerseButtons = transformVerseLinks(rawHtml);

  return sanitizeHtml(withVerseButtons, {
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
      "button",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      button: ["class", "data-verse", "type"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
