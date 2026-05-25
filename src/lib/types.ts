export type EntryKind = "home" | "hubs" | "stories" | "topics" | "inbox";

export type Visibility = "published" | "draft" | "admin";

export interface RelatedRef {
  kind: Exclude<EntryKind, "home" | "inbox">;
  slug: string;
}

export interface WikiEntry {
  kind: EntryKind;
  slug: string;
  route: string;
  title: string;
  visibility?: Visibility;
  source_url?: string | null;
  collected_at?: string | null;
  /** docs/*.md 파일 최종 수정일 (build-entries 시 stat.mtime) */
  updated_at?: string | null;
  tags?: string[];
  sync_source?: string | null;
  related?: RelatedRef[];
  body?: string;
  isIndex?: boolean;
  status?: string;
  promoted_to?: string | null;
  meta?: Record<string, unknown>;
}

export interface EntriesBundle {
  generatedAt: string;
  entries: WikiEntry[];
}
