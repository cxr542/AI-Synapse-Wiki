import { describe, expect, it } from "vitest";
import { isUserVisible } from "../src/lib/visibility";
import type { WikiEntry } from "../src/lib/types";

function entry(partial: Partial<WikiEntry> & Pick<WikiEntry, "kind" | "slug">): WikiEntry {
  return {
    route: "/",
    title: partial.slug,
    ...partial,
  };
}

describe("isUserVisible", () => {
  it("shows published topics only", () => {
    expect(
      isUserVisible(
        entry({ kind: "topics", slug: "rag", visibility: "published" }),
      ),
    ).toBe(true);
    expect(
      isUserVisible(entry({ kind: "topics", slug: "x", visibility: "draft" })),
    ).toBe(false);
    expect(
      isUserVisible(entry({ kind: "hubs", slug: "x", visibility: "admin" })),
    ).toBe(false);
  });

  it("hides inbox and index", () => {
    expect(isUserVisible(entry({ kind: "inbox", slug: "clip" }))).toBe(false);
    expect(
      isUserVisible(entry({ kind: "topics", slug: "_index", visibility: "published" })),
    ).toBe(false);
  });

  it("always shows home", () => {
    expect(isUserVisible(entry({ kind: "home", slug: "index" }))).toBe(true);
  });
});
