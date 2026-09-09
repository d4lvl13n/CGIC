import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function sanitizeCmsHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em",
      "blockquote", "a", "figure", "figcaption", "img", "table", "thead",
      "tbody", "tr", "th", "td", "hr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
}

export function plainTextFromHtml(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

/**
 * Translations are stored in RecruitCRM as Markdown, because those custom fields
 * strip HTML tags. Render to HTML, then through the same allowlist as any other
 * CMS copy — the Markdown is model-generated, so it is not trusted input.
 */
export function sanitizedHtmlFromMarkdown(markdown: string) {
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: false });
  return sanitizeCmsHtml(html as string);
}

/**
 * Structural view of a source description, for handing to the translation model.
 *
 * Recruiters paste from Word, so headings arrive as `<h1><span style="font-size:14px">`
 * and the styling noise buries the structure — the model then misses headings and
 * runs them into the preceding paragraph. Stripping to bare structural tags makes the
 * headings unambiguous.
 */
export function sanitizeSourceForTranslation(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "blockquote", "a"],
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
