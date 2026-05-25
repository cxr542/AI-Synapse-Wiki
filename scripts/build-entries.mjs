/**
 * docs/ + inbox/ → src/data/entries.json
 * plan.md Phase 1–2, 웹앱 라우터 데이터 소스
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter } from "./parse-front-matter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const INBOX = path.join(ROOT, "inbox");
const OUT = path.join(ROOT, "src", "data", "entries.json");

const KINDS = ["hubs", "stories", "topics"];

/** @param {string} kind @param {Record<string, unknown>} data */
function resolveVisibility(kind, data) {
  if (data.visibility) return data.visibility;
  if (kind === "topics") return "published";
  if (kind === "stories") return "draft";
  if (kind === "hubs") return "admin";
  return undefined;
}

/** @param {string} dir */
function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("."))
    .map((f) => path.join(dir, f));
}

/** @param {Date} d */
function toDateString(d) {
  return d.toISOString().slice(0, 10);
}

/** @param {string} filePath @param {string} kind */
function parseEntry(filePath, kind) {
  const stat = fs.statSync(filePath);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontMatter(raw);
  const base = path.basename(filePath, ".md");
  const slug = base === "_index" ? null : base;
  if (!slug) {
    return {
      kind,
      slug: "_index",
      route: `/${kind}`,
      title: data.title ?? kind,
      isIndex: true,
      body: content.trim(),
      meta: data,
    };
  }
  const visibility = resolveVisibility(kind, data);
  return {
    kind,
    slug,
    route: `/${kind}/${slug}`,
    title: data.title ?? slug,
    visibility,
    source_url: data.source_url ?? null,
    collected_at: data.collected_at ?? null,
    updated_at: toDateString(stat.mtime),
    tags: Array.isArray(data.tags) ? data.tags : [],
    sync_source: data.sync_source ?? null,
    related: Array.isArray(data.related) ? data.related : [],
    body: content.trim(),
    meta: data,
  };
}

/** @param {string} filePath */
function parseInbox(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontMatter(raw);
  const slug = path.basename(filePath, ".md");
  return {
    kind: "inbox",
    slug,
    route: `/inbox/${slug}`,
    title: slug,
    visibility: "admin",
    status: data.status ?? "pending",
    promoted_to: data.promoted_to ?? null,
    body: content.trim(),
    meta: data,
  };
}

const entries = [];
const homePath = path.join(DOCS, "index.md");
if (fs.existsSync(homePath)) {
  const raw = fs.readFileSync(homePath, "utf8");
  const { data, content } = parseFrontMatter(raw);
  entries.push({
    kind: "home",
    slug: "index",
    route: "/",
    title: data.title ?? "AI-Synapse Wiki",
    body: content.trim(),
    meta: data,
  });
}

for (const kind of KINDS) {
  const dir = path.join(DOCS, kind);
  for (const file of listMd(dir)) {
    entries.push(parseEntry(file, kind));
  }
}

for (const file of listMd(INBOX)) {
  entries.push(parseInbox(file));
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2));
console.log(`Wrote ${entries.length} entries → ${OUT}`);
