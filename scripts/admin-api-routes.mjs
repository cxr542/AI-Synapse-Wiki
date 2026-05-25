const RESERVED_TOPIC_SLUGS = new Set(["nl-draft", "nl-config", "new", "nl"]);

/**
 * @param {string} url
 * @returns {{ resource: string; slug: string } | null}
 */
export function parseTopicSlugUrl(url) {
  const pathOnly = url.split("?")[0];
  const m = pathOnly.match(/^\/api\/admin\/topics\/([a-z0-9][a-z0-9-]*)$/i);
  if (!m || RESERVED_TOPIC_SLUGS.has(m[1])) return null;
  return { resource: "topics", slug: m[1] };
}
