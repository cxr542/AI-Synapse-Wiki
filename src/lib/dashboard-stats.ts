import { generatedAt, getByKind } from "./entries";
import type { WikiEntry } from "./types";

export interface MonthCount {
  month: string;
  count: number;
}

export const DASHBOARD_RECENT_ROWS = 8;

export const VISIBILITY_KEYS = [
  { key: "published", label: "published" },
  { key: "draft", label: "draft" },
  { key: "admin", label: "admin" },
] as const;

export interface DashboardStats {
  generatedAt: string;
  topics: {
    total: number;
    published: number;
    draft: number;
    admin: number;
  };
  publishedPct: number;
  inboxPending: number;
  hubs: number;
  stories: number;
  storiesDraft: number;
  registrationsByMonth: MonthCount[];
  updatesByMonth: MonthCount[];
  visibilityTopics: { label: string; count: number; key: string }[];
  recentTopics: WikiEntry[];
  allTopics: WikiEntry[];
}

function monthKey(iso: string | null | undefined): string | null {
  if (!iso || iso.length < 7) return null;
  return iso.slice(0, 7);
}

function countsByMonth(dates: string[], monthsBack = 6): MonthCount[] {
  const now = new Date();
  const buckets: MonthCount[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ month: key, count: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.month, i]));
  for (const raw of dates) {
    const key = monthKey(raw);
    if (!key || !index.has(key)) continue;
    buckets[index.get(key)!].count += 1;
  }
  return buckets;
}

export function formatDashboardMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}.${m}`;
}

export function computeDashboardStats(): DashboardStats {
  const topics = getByKind("topics");
  const inbox = getByKind("inbox").filter((e) => e.status !== "promoted");
  const hubs = getByKind("hubs");
  const stories = getByKind("stories");

  const vis = { published: 0, draft: 0, admin: 0 };
  for (const t of topics) {
    const v = t.visibility ?? "published";
    if (v === "published") vis.published += 1;
    else if (v === "draft") vis.draft += 1;
    else if (v === "admin") vis.admin += 1;
  }

  const collectedDates = topics
    .map((t) => t.collected_at)
    .filter((d): d is string => Boolean(d));
  const updatedDates = topics
    .map((t) => t.updated_at ?? t.collected_at)
    .filter((d): d is string => Boolean(d));

  const recentTopics = [...topics]
    .sort((a, b) => {
      const da = a.updated_at ?? a.collected_at ?? "";
      const db = b.updated_at ?? b.collected_at ?? "";
      return db.localeCompare(da);
    })
    .slice(0, 8);

  const visibilityTopics = VISIBILITY_KEYS.map(({ key, label }) => ({
    key,
    label,
    count: vis[key as keyof typeof vis],
  }));

  const total = topics.length;
  const publishedPct = total > 0 ? Math.round((vis.published / total) * 100) : 0;

  return {
    generatedAt,
    topics: {
      total,
      published: vis.published,
      draft: vis.draft,
      admin: vis.admin,
    },
    publishedPct,
    inboxPending: inbox.length,
    hubs: hubs.length,
    stories: stories.length,
    storiesDraft: stories.filter((s) => s.visibility === "draft").length,
    registrationsByMonth: countsByMonth(collectedDates),
    updatesByMonth: countsByMonth(updatedDates),
    visibilityTopics,
    recentTopics,
    allTopics: topics,
  };
}

export function maxMonthCount(series: MonthCount[]): number {
  return Math.max(1, ...series.map((m) => m.count));
}
