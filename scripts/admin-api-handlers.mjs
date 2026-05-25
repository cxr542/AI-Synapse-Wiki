/**
 * Dev-only admin write API (topics, inbox promote, rebuild)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function wikiRoot() {
  return process.env.WIKI_ROOT ?? path.resolve(__dirname, "..");
}

/** @deprecated use wikiRoot() */
export const ROOT = wikiRoot();

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** @param {string} s */
function yamlQuote(s) {
  if (/[:#\[\]{}&*!|>'"%@`]/.test(s) || s.includes("\n")) {
    return JSON.stringify(s);
  }
  return s;
}

/** @param {Record<string, unknown>} data @param {string} body */
function packMd(data, body) {
  const lines = ["---"];
  for (const [key, val] of Object.entries(data)) {
    if (val == null) continue;
    if (key === "related" && Array.isArray(val)) {
      lines.push("related:");
      for (const r of val) {
        if (r && typeof r === "object" && "kind" in r && "slug" in r) {
          lines.push(`  - kind: ${r.kind}`);
          lines.push(`    slug: ${r.slug}`);
        }
      }
      continue;
    }
    if (Array.isArray(val)) {
      lines.push(`tags: [${val.join(", ")}]`);
      continue;
    }
    lines.push(`${key}: ${yamlQuote(String(val))}`);
  }
  lines.push("---", "", body.trim(), "");
  return lines.join("\n");
}

/** @param {string} body */
function assertTopicBody(body) {
  if (body.includes("채워 주세요") || (body.includes("(항목)") && body.includes("(설명)"))) {
    throw new Error(
      "본문이 템플릿 플레이스홀더입니다. 내용을 채운 뒤 저장하세요.",
    );
  }
}

/** @param {string} slug */
function topicFilePath(slug) {
  return path.join(wikiRoot(), "docs", "topics", `${slug}.md`);
}

export function runBuildEntries() {
  const root = wikiRoot();
  const script = path.join(root, "scripts", "build-entries.mjs");
  const r = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(r.stderr || r.stdout || "build-entries failed");
  }
  const out = path.join(root, "src", "data", "entries.json");
  const data = JSON.parse(fs.readFileSync(out, "utf8"));
  return data.entries.length;
}

/**
 * @param {{
 *   title: string;
 *   slug: string;
 *   body: string;
 *   source_url?: string | null;
 *   tags?: string[];
 *   related?: Array<{ kind: string; slug: string }>;
 *   visibility?: string;
 * }} payload
 */
/**
 * @param {{
 *   title: string;
 *   slug: string;
 *   body: string;
 *   source_url?: string | null;
 *   tags?: string[];
 *   related?: Array<{ kind: string; slug: string }>;
 *   visibility?: string;
 *   collected_at?: string;
 * }} payload
 * @param {{ create?: boolean }} opts
 */
function saveTopicFile(payload, opts = {}) {
  const slug = payload.slug.trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
    throw new Error("slug 형식이 올바르지 않습니다");
  }
  if (slug === "new-topic") {
    throw new Error("slug이 new-topic 입니다. 영문 slug(예: gemini)로 바꾸세요.");
  }
  const body = String(payload.body ?? "").trim();
  assertTopicBody(body);
  const file = topicFilePath(slug);
  if (opts.create && fs.existsSync(file)) {
    throw new Error(`이미 존재: topics/${slug}.md`);
  }
  if (!opts.create && !fs.existsSync(file)) {
    throw new Error(`없음: topics/${slug}.md`);
  }
  const fm = {
    title: payload.title.trim(),
    visibility: payload.visibility ?? "published",
    collected_at: payload.collected_at ?? today(),
    tags: payload.tags?.length ? payload.tags : ["topic"],
    related: payload.related ?? [],
  };
  if (payload.source_url) fm.source_url = payload.source_url;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, packMd(fm, body), "utf8");
  const count = runBuildEntries();
  return { slug, count };
}

export function writeTopic(payload) {
  return saveTopicFile(payload, { create: true });
}

/**
 * @param {string} currentSlug
 * @param {Parameters<typeof saveTopicFile>[0]} payload
 */
export function updateTopic(currentSlug, payload) {
  const cur = currentSlug.trim();
  const next = payload.slug.trim();
  if (cur !== next) {
    throw new Error("slug 변경은 아직 지원하지 않습니다. 파일명을 직접 옮기세요.");
  }
  let collected_at = today();
  const file = topicFilePath(cur);
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^collected_at:\s*(\S+)/m);
    if (m) collected_at = m[1];
  }
  return saveTopicFile({ ...payload, collected_at }, { create: false });
}

/** @param {string} slug */
export function deleteTopic(slug) {
  const s = slug.trim();
  const file = topicFilePath(s);
  if (!fs.existsSync(file)) {
    throw new Error(`없음: topics/${slug}.md`);
  }
  fs.unlinkSync(file);
  const count = runBuildEntries();
  return { slug: s, count };
}

/**
 * @param {{
 *   inboxSlug: string;
 *   kind: "topics" | "hubs" | "stories";
 *   slug: string;
 *   title: string;
 *   visibility?: string;
 * }} payload
 */
export function promoteInbox(payload) {
  const inboxFile = path.join(wikiRoot(), "inbox", `${payload.inboxSlug}.md`);
  if (!fs.existsSync(inboxFile)) {
    throw new Error(`inbox 없음: ${payload.inboxSlug}`);
  }
  const raw = fs.readFileSync(inboxFile, "utf8");
  const bodyStart = raw.indexOf("\n---", 3);
  const body = bodyStart >= 0 ? raw.slice(bodyStart + 4).replace(/^\r?\n/, "") : raw;
  const kind = payload.kind;
  const slug = payload.slug.trim();
  const target = path.join(wikiRoot(), "docs", kind, `${slug}.md`);
  if (fs.existsSync(target)) {
    throw new Error(`이미 존재: ${kind}/${slug}.md`);
  }
  const vis =
    payload.visibility ??
    (kind === "topics" ? "published" : kind === "stories" ? "draft" : "admin");
  const fm = {
    title: payload.title.trim(),
    visibility: vis,
    collected_at: today(),
    tags: [kind === "topics" ? "topic" : kind === "stories" ? "story" : "hub"],
  };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, packMd(fm, body), "utf8");

  const promoted = `${kind}/${slug}`;
  const inboxFm = `---\nstatus: promoted\npromoted_to: ${promoted}\n---\n\n${body.trim()}\n`;
  fs.writeFileSync(inboxFile, inboxFm, "utf8");

  const count = runBuildEntries();
  return { promoted, count };
}

export { generateTopicNlDraft } from "./topic-nl-generate.mjs";
