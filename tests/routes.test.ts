import { describe, expect, it } from "vitest";
import { entryPath, isCategoryKind } from "../src/lib/routes";

describe("routes", () => {
  it("builds entry paths per kind", () => {
    expect(entryPath("hubs", "teddynote")).toBe("/hubs/teddynote");
    expect(entryPath("hubs", "teddynote", true)).toBe(
      "/admin/settings/hubs/teddynote",
    );
    expect(entryPath("stories", "llm-marketing-pipeline")).toBe(
      "/stories/llm-marketing-pipeline",
    );
    expect(entryPath("topics", "antigravity-2")).toBe("/topics/antigravity-2");
    expect(entryPath("topics", "antigravity-2", true)).toBe(
      "/admin/topics/antigravity-2",
    );
    expect(entryPath("inbox", "poc-notes")).toBe(
      "/admin/settings/inbox/poc-notes",
    );
    expect(entryPath("inbox", "poc-notes", true)).toBe(
      "/admin/settings/inbox/poc-notes",
    );
    expect(entryPath("home", "index")).toBe("/");
    expect(entryPath("home", "index", true)).toBe("/admin");
  });

  it("recognizes category kinds", () => {
    expect(isCategoryKind("hubs")).toBe(true);
    expect(isCategoryKind("inbox")).toBe(false);
  });
});
