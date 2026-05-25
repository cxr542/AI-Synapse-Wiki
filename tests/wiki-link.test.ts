import { describe, expect, it } from "vitest";
import { parseWikiPath } from "../src/lib/wiki-link";

describe("parseWikiPath", () => {
  it("parses user topic paths", () => {
    expect(parseWikiPath("/topics/antigravity-2")).toEqual({
      kind: "topics",
      slug: "antigravity-2",
    });
  });

  it("parses admin paths", () => {
    expect(parseWikiPath("/admin/hubs/ai-synapse-lab")).toEqual({
      kind: "hubs",
      slug: "ai-synapse-lab",
    });
    expect(parseWikiPath("/admin/settings/hubs/ai-synapse-lab")).toEqual({
      kind: "hubs",
      slug: "ai-synapse-lab",
    });
  });

  it("rejects external URLs", () => {
    expect(parseWikiPath("https://example.com/topics/foo")).toBeNull();
  });

  it("rejects unknown paths", () => {
    expect(parseWikiPath("/search?q=x")).toBeNull();
  });
});
