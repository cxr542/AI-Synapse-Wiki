import { getEntry } from "./entries";
import { entryPath } from "./routes";
import type { EntryKind, WikiEntry } from "./types";
import { isUserVisible } from "./visibility";

const WIKI_PATH =
  /^\/?(?:admin(?:\/settings)?\/)?(topics|hubs|stories|inbox)\/([a-z0-9][a-z0-9-]*)\/?$/i;

/** @param {string} href markdown / router path or same-origin URL */
export function parseWikiPath(href: string): { kind: EntryKind; slug: string } | null {
  if (!href || href.startsWith("#")) return null;
  let path = href.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const u = new URL(path);
      if (u.origin !== window.location.origin) return null;
      path = u.pathname;
    }
  } catch {
    return null;
  }
  const m = path.match(WIKI_PATH);
  if (!m) return null;
  return { kind: m[1].toLowerCase() as EntryKind, slug: m[2] };
}

export type ResolvedWikiLink = {
  to: string;
  entry: WikiEntry;
  /** 사용자 Wiki(공개 주제)로 연결 */
  isPublicWiki: boolean;
};

/**
 * 등록된 엔트리만 링크. admin 화면에서는 공개 주제는 /topics/slug, 그 외는 /admin/...
 */
export function resolveWikiHref(
  href: string,
  context: "admin" | "user" = "user",
): ResolvedWikiLink | null {
  const parsed = parseWikiPath(href);
  if (!parsed) return null;
  const entry = getEntry(parsed.kind, parsed.slug);
  if (!entry) return null;

  if (parsed.kind === "topics" && isUserVisible(entry)) {
    return { to: `/topics/${parsed.slug}`, entry, isPublicWiki: true };
  }

  if (context === "admin") {
    return {
      to: entryPath(parsed.kind, parsed.slug, true),
      entry,
      isPublicWiki: false,
    };
  }

  if (parsed.kind === "topics") return null;

  return {
    to: entryPath(parsed.kind, parsed.slug, true),
    entry,
    isPublicWiki: false,
  };
}
