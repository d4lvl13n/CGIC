import "server-only";

import { JOB_TRANSLATION_FIELD_MAX } from "@/lib/recruitcrm/client";
import { sanitizeSourceForTranslation } from "./sanitize";

/**
 * Translates a job description into Markdown for storage in a RecruitCRM job
 * custom field.
 *
 * Markdown rather than HTML because those fields strip tags: `<ul><li>a</li></ul>`
 * comes back as `a`. Markdown carries the same structure through untouched, stays
 * readable for a recruiter editing the record, and is rendered back to HTML on the
 * site. A bare `<` silently truncates the stored value from that point onwards, so
 * the model is told to escape it and we enforce that again before writing.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-5-5";
/** The model overshoots the length it is asked for, so it is asked for less than the field holds. */
const PROMPT_LENGTH_TARGET = JOB_TRANSLATION_FIELD_MAX - 500;

/** The translation was produced (and paid for) but cannot be stored. Retrying the same source will not help. */
export class TranslationTooLongError extends Error {
  constructor(public readonly length: number) {
    super(`Translation is ${length} characters, over the ${JOB_TRANSLATION_FIELD_MAX} field limit`);
    this.name = "TranslationTooLongError";
  }
}

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  nl: "Dutch",
};

export function isTranslationConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Escapes the two characters that the CRM field mangles. `>` is only escaped when
 * it does not open a Markdown blockquote, so quoting still works.
 */
export function escapeForCustomField(markdown: string) {
  return markdown
    .replace(/</g, "&lt;")
    .replace(/^(\s*)>(?!\s)/gm, "$1&gt;")
    .replace(/([^\n>])>/g, "$1&gt;");
}

function prompt(targetLanguage: string, sourceHtml: string) {
  return `Translate the job description below into ${targetLanguage}.

Output rules:
- Return Markdown only. No preamble, no explanation, no code fences.
- Preserve the structure of the original: EVERY heading in the source (h1-h6) becomes
  a "## Heading" line of its own, with a blank line before and after it. Never join a
  heading onto the end of the previous paragraph — "...evolving environment.Your Role"
  is wrong; it must be a blank line, then "## Your Role", then a blank line.
- Sources are inconsistent: some section titles are real headings, others are just a
  short bold line such as "<p><strong>Your Role:</strong></p>". Treat BOTH as headings
  and emit "## Your Role" for each. Do not leave a section title as bold body text and
  do not leave one as a bare unmarked line.
- List items become "- item", emphasis becomes **bold** or *italic*, links become
  [text](url). Keep paragraphs separated by a blank line.
- Write "&lt;" instead of "<" and "&gt;" instead of ">" anywhere they appear as
  literal characters in the text (for example "&lt;5 days"). This is required: a raw
  "<" destroys the stored value.
- Translate the prose. Do NOT translate: proper nouns, company names, technology
  names (Java, Spring, SQL, Kubernetes, AV, IT), or job titles.
- Keep the professional register of a recruitment advertisement. Do not add,
  remove, embellish or summarise anything — especially not contractual details such
  as contract type, seniority, salary, clearance requirements or location.
- The result must be under ${PROMPT_LENGTH_TARGET} characters. If the source is
  long, translate faithfully but tightly rather than dropping sections.

Job description:
${sourceHtml}`;
}

export async function translateJobDescription(
  sourceHtml: string,
  targetLocale: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const language = LANGUAGE_NAMES[targetLocale] ?? targetLocale;
  const source = sanitizeSourceForTranslation(sourceHtml);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt(language, source) }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Translation request failed (${response.status}): ${await response.text()}`);
  }

  const payload = await response.json();
  const text: string = (payload.content ?? [])
    .filter((block: { type?: string }) => block.type === "text")
    .map((block: { text?: string }) => block.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Translation returned no text");

  const escaped = escapeForCustomField(text);
  // A cut-off translation can still fit the field, so truncation counts as too long.
  if (payload.stop_reason === "max_tokens" || escaped.length > JOB_TRANSLATION_FIELD_MAX) {
    throw new TranslationTooLongError(escaped.length);
  }
  return escaped;
}
