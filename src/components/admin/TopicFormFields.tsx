import { getByKind } from "../../lib/entries";
import { WIKI_SLUG_HINT, WIKI_SLUG_LABEL } from "../../lib/labels";
import { preferEnglishTopicTitle } from "../../lib/prefer-english-title";
import type { WikiEntry } from "../../lib/types";

export function slugifyTopicTitle(title: string): string {
  const label = preferEnglishTopicTitle(title);
  const ascii = label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii.slice(0, 60) || "new-topic";
}

interface Props {
  initial?: WikiEntry;
  slugReadOnly?: boolean;
}

export function TopicFormFields({ initial, slugReadOnly = false }: Props) {
  const allTopics = getByKind("topics");
  const relatedSet = new Set(
    initial?.related?.filter((r) => r.kind === "topics").map((r) => r.slug) ?? [],
  );

  return (
    <>
      <label>
        제목 *
        <input
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="Antigravity 2.0 (영문·한글 혼합 시 영문 우선)"
        />
      </label>
      <label>
        {WIKI_SLUG_LABEL} *
        <span className="label-hint">{WIKI_SLUG_HINT}</span>
        <input
          name="slug"
          readOnly={slugReadOnly}
          defaultValue={initial?.slug ?? ""}
          placeholder="antigravity-2"
          aria-label={WIKI_SLUG_LABEL}
        />
      </label>
      <label>
        visibility
        <select name="visibility" defaultValue={initial?.visibility ?? "published"}>
          <option value="published">published (사용자 Wiki)</option>
          <option value="draft">draft</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <label>
        출처 URL
        <input
          name="source_url"
          type="url"
          defaultValue={initial?.source_url ?? ""}
          placeholder="https://..."
        />
      </label>
      <label>
        본문 (마크다운) *
        <textarea
          name="body"
          required
          rows={14}
          defaultValue={initial?.body ?? ""}
        />
      </label>
      <fieldset>
        <legend>연관 주제 (Synapse)</legend>
        {allTopics
          .filter((t) => t.slug !== initial?.slug)
          .map((t) => (
            <label key={t.slug} className="checkbox-row">
              <input
                type="checkbox"
                name="related"
                value={t.slug}
                defaultChecked={relatedSet.has(t.slug)}
              />
              {t.title}
            </label>
          ))}
      </fieldset>
    </>
  );
}

export function readTopicForm(fd: FormData) {
  const rawTitle = String(fd.get("title") ?? "").trim();
  const title = preferEnglishTopicTitle(rawTitle);
  const slug =
    String(fd.get("slug") ?? "").trim() || slugifyTopicTitle(title);
  const body = String(fd.get("body") ?? "").trim();
  const source_url = String(fd.get("source_url") ?? "").trim();
  const visibility = String(fd.get("visibility") ?? "published");
  const relatedSlugs = fd.getAll("related").map(String);
  return {
    title,
    slug,
    body,
    source_url: source_url || null,
    visibility,
    tags: ["topic"],
    related: relatedSlugs.map((s) => ({ kind: "topics" as const, slug: s })),
  };
}
