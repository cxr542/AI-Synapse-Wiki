/**
 * CLI: stdin JSON → docs/topics/{slug}.md + build-entries
 * echo '{"title":"x","slug":"x","body":"# x"}' | node scripts/write-topic.mjs
 */
import { writeTopic } from "./admin-api-handlers.mjs";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const raw = Buffer.concat(chunks).toString("utf8").trim();
if (!raw) {
  console.error("stdin JSON required");
  process.exit(1);
}
const payload = JSON.parse(raw);
const result = writeTopic(payload);
console.log(JSON.stringify({ ok: true, ...result }));
