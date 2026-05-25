import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseFrontMatter } from "../scripts/parse-front-matter.mjs";

describe("parseFrontMatter", () => {
  it("parses related synapse links", () => {
    const raw = readFileSync(
      path.resolve("docs/hubs/teddynote.md"),
      "utf8",
    );
    const { data } = parseFrontMatter(raw);
    expect(data.title).toContain("테디노트");
    expect(Array.isArray(data.related)).toBe(true);
    expect((data.related as Array<{ slug: string }>)[0].slug).toBe(
      "llm-marketing-pipeline",
    );
  });
});
