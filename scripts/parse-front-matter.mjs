/**
 * Minimal front matter parser (no npm deps — Google Drive safe)
 */

/** @param {string} block */
function parseSimpleYaml(block) {
  /** @type {Record<string, unknown>} */
  const data = {};
  /** @type {Array<Record<string, string>> | null} */
  let related = null;
  /** @type {Record<string, string> | null} */
  let relatedItem = null;

  for (const line of block.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    if (line.startsWith("related:")) {
      related = [];
      data.related = related;
      relatedItem = null;
      continue;
    }

    if (line.startsWith("  - kind:")) {
      relatedItem = { kind: line.split(":")[1].trim() };
      related?.push(relatedItem);
      continue;
    }

    if (line.startsWith("    slug:") && relatedItem) {
      relatedItem.slug = line.split(":")[1].trim();
      continue;
    }

    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    const value = raw.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, "");
    }
  }

  return data;
}

/** @param {string} raw */
export function parseFrontMatter(raw) {
  if (!raw.startsWith("---")) {
    return { data: {}, content: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, content: raw };
  }
  const yaml = raw.slice(4, end).trim();
  const content = raw.slice(end + 4).replace(/^\r?\n/, "");
  return { data: parseSimpleYaml(yaml), content };
}
