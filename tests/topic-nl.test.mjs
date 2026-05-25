import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  generateTopicNlDraft,
  parseTopicRequest,
  preferEnglishTopicTitle,
  slugifyTopicTitle,
} from "../scripts/topic-nl-generate.mjs";

/** @param {Record<string, string>} files slug → minimal front matter title */
function useTempWiki(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-nl-"));
  const topicsDir = path.join(root, "docs", "topics");
  fs.mkdirSync(topicsDir, { recursive: true });
  for (const [slug, title] of Object.entries(files)) {
    fs.writeFileSync(
      path.join(topicsDir, `${slug}.md`),
      `---\ntitle: ${title}\n---\n`,
      "utf8",
    );
  }
  const prev = process.env.WIKI_ROOT;
  process.env.WIKI_ROOT = root;
  return () => {
    if (prev === undefined) delete process.env.WIKI_ROOT;
    else process.env.WIKI_ROOT = prev;
    fs.rmSync(root, { recursive: true, force: true });
  };
}

describe("topic-nl", () => {
  it("prefers English when title mixes Korean and Latin", () => {
    expect(preferEnglishTopicTitle("클로드 코드 (Claude Code)")).toBe(
      "Claude Code",
    );
    expect(preferEnglishTopicTitle("안티그래비티 2.0 / Antigravity 2.0")).toBe(
      "Antigravity 2.0",
    );
    expect(preferEnglishTopicTitle("ChatGPT 챗GPT")).toBe("ChatGPT");
    expect(preferEnglishTopicTitle("하네스만")).toBe("하네스만");
  });

  it("parses Korean register phrases", () => {
    expect(parseTopicRequest("헤르메스 에이전트 등록해줘")).toBe("헤르메스 에이전트");
    expect(parseTopicRequest("주제 등록: RAG 개요")).toBe("RAG 개요");
  });

  it("slugifies local hermes notify vs nous agent", () => {
    expect(slugifyTopicTitle("헤르메스")).toBe("hermes-wiki-notify");
    expect(slugifyTopicTitle("헤르메스 에이전트")).toBe("nous-hermes-agent");
  });

  it("generates hermes heuristic draft without API key", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft("헤르메스 Gmail 알림 등록해줘", {});
      expect(draft.slug).toBe("hermes-wiki-notify");
      expect(draft.body).toContain("한 줄 정의");
      expect(draft.body).toContain("Gmail");
      expect(draft.mode).toBe("heuristic");
    } finally {
      cleanup();
    }
  });

  it("generates chatgpt heuristic draft without API key", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft("ChatGPT 등록해줘", {});
      expect(draft.slug).toBe("chatgpt");
      expect(draft.body).toContain("OpenAI");
      expect(draft.mode).toBe("heuristic");
    } finally {
      cleanup();
    }
  });

  it("generates gemini heuristic draft without API key", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft("제미나이 등록해줘", {});
      expect(draft.slug).toBe("gemini");
      expect(draft.body).toContain("Google");
      expect(draft.note).toContain("API 미사용");
    } finally {
      cleanup();
    }
  });

  it("generates claude-code heuristic draft without API key", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft("클로드 코드 등록해줘", {});
      expect(draft.slug).toBe("claude-code");
      expect(draft.body).toContain("Anthropic");
      expect(draft.body).not.toContain("채워 주세요");
    } finally {
      cleanup();
    }
  });

  it("slugifies NousResearch Hermes Agent separately from wiki notify", () => {
    expect(slugifyTopicTitle("NousResearch Hermes Agent")).toBe(
      "nous-hermes-agent",
    );
    expect(slugifyTopicTitle("헤르메스 알림")).toBe("hermes-wiki-notify");
  });

  it("generates nous hermes agent heuristic draft without API key", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft(
        "NousResearch Hermes Agent 등록해줘",
        {},
      );
      expect(draft.slug).toBe("nous-hermes-agent");
      expect(draft.body).toContain("NousResearch");
      expect(draft.body).toContain("ACP");
      expect(draft.mode).toBe("heuristic");
    } finally {
      cleanup();
    }
  });

  it("slugifies Antigravity CLI separately from antigravity-2", () => {
    expect(slugifyTopicTitle("Antigravity CLI")).toBe("antigravity-cli");
    expect(slugifyTopicTitle("Antigravity 2.0")).toBe("antigravity-2");
  });

  it("generic draft uses English title when both languages given", async () => {
    const cleanup = useTempWiki({});
    try {
      const draft = await generateTopicNlDraft(
        "커서 에이전트 Cursor Agent 등록해줘",
        {},
      );
      expect(draft.title).toBe("Cursor Agent");
      expect(draft.slug).toBe("cursor-agent");
    } finally {
      cleanup();
    }
  });

  it("generates antigravity-cli draft without colliding with antigravity-2", async () => {
    const cleanup = useTempWiki({ "antigravity-2": "Antigravity 2.0" });
    try {
      const draft = await generateTopicNlDraft("Antigravity CLI", {});
      expect(draft.slug).toBe("antigravity-cli");
      expect(draft.slug).not.toBe("antigravity-2");
      expect(draft.body).toContain("`agy`");
    } finally {
      cleanup();
    }
  });
});
