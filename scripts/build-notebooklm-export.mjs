/**
 * plan.md Phase 4 — docs → export/notebooklm/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPORT = path.join(ROOT, "export", "notebooklm");
const ENTRIES = path.join(ROOT, "src", "data", "entries.json");

if (!fs.existsSync(ENTRIES)) {
  console.warn("entries.json missing; run npm run build:entries first");
  process.exit(0);
}

const { entries } = JSON.parse(fs.readFileSync(ENTRIES, "utf8"));
const exportable = entries.filter(
  (e) => ["hubs", "stories", "topics"].includes(e.kind) && e.slug !== "_index",
);

fs.mkdirSync(EXPORT, { recursive: true });

const indexLines = [
  "# AI-Synapse Wiki — NotebookLM 인덱스",
  "",
  `생성: ${new Date().toISOString().slice(0, 10)}`,
  "",
  "## 엔트리",
  "",
];

let n = 1;
for (const e of exportable) {
  const url = e.source_url ? `\n- URL: ${e.source_url}` : "";
  indexLines.push(`### ${n}. ${e.title}`, `- 유형: ${e.kind}`, `- 경로: ${e.route}${url}`, "");
  const body = [
    `# ${e.title}`,
    "",
    e.source_url ? `**출처:** ${e.source_url}` : "",
    e.collected_at ? `**수집일:** ${e.collected_at}` : "",
    "",
    e.body || "",
  ]
    .filter(Boolean)
    .join("\n");
  const fname = `${String(n).padStart(2, "0")}-${e.kind}-${e.slug}-ko.md`;
  fs.writeFileSync(path.join(EXPORT, fname), body, "utf8");
  n++;
}

fs.writeFileSync(path.join(EXPORT, "00-index-ko.md"), indexLines.join("\n"), "utf8");

const readme = `# NotebookLM export

1. \`00-index-ko.md\` — 목차
2. \`01-…\` ~ — 허브·스토리·토픽 본문

재생성: \`npm run build:export\`
`;
fs.writeFileSync(path.join(EXPORT, "README.md"), readme, "utf8");
console.log(`Exported ${exportable.length} files to ${EXPORT}`);
