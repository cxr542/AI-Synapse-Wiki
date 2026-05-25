import { describe, expect, it } from "vitest";
import { parseTopicSlugUrl } from "../scripts/admin-api-routes.mjs";

describe("parseTopicSlugUrl", () => {
  it("parses topic slug from API path", () => {
    expect(parseTopicSlugUrl("/api/admin/topics/gemini")?.slug).toBe("gemini");
    expect(parseTopicSlugUrl("/api/admin/topics/nl-draft")).toBeNull();
    expect(parseTopicSlugUrl("/api/admin/topics")).toBeNull();
  });
});
