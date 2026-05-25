import type { EntryKind } from "./types";

/** 사용자 Wiki 네비 — 주제·검색만 */
export const USER_TOPIC_KIND: EntryKind = "topics";

export const CATEGORY_KINDS: EntryKind[] = ["hubs", "stories", "topics"];

export const CATEGORY_LABELS: Record<string, string> = {
  hubs: "AI 소스 기지",
  stories: "스토리",
  topics: "주제",
  inbox: "Inbox",
};

export function entryPath(kind: EntryKind, slug: string, admin = false): string {
  if (kind === "home") return admin ? "/admin" : "/";
  if (kind === "inbox") return `/admin/settings/inbox/${slug}`;
  if (admin && (kind === "hubs" || kind === "stories")) {
    return `/admin/settings/${kind}/${slug}`;
  }
  if (admin) return `/admin/${kind}/${slug}`;
  return `/${kind}/${slug}`;
}

export function isCategoryKind(kind: string): kind is EntryKind {
  return CATEGORY_KINDS.includes(kind as EntryKind);
}
