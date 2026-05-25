import { Link, useParams } from "react-router-dom";
import { MarkdownView } from "../../components/MarkdownView";
import { RelatedLinks } from "../../components/RelatedLinks";
import { getEntry, resolveRelated } from "../../lib/entries";
import { WIKI_SLUG_LABEL } from "../../lib/labels";
import { entryPath } from "../../lib/routes";
import type { EntryKind } from "../../lib/types";
import { isUserVisible } from "../../lib/visibility";

interface Props {
  kind: EntryKind;
  listPath: string;
  listLabel: string;
}

export function AdminEntryView({ kind, listPath, listLabel }: Props) {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return null;

  const entry = getEntry(kind, slug);
  if (!entry) {
    return (
      <p>
        없음. <Link to={listPath}>목록</Link>
      </p>
    );
  }

  const related = resolveRelated(entry, false);

  return (
    <article className="entry">
      <p className="breadcrumb">
        <Link to={listPath}>{listLabel}</Link> / {entry.title}
      </p>
      <h1>{entry.title}</h1>
      <p className="entry-admin-bar">
        visibility: <strong>{entry.visibility ?? "—"}</strong>
        {kind === "topics" && (
          <>
            {" · "}
            <Link to={`/admin/topics/${slug}/edit`}>편집</Link>
          </>
        )}
        {entry.visibility === "published" && kind === "topics" && (
          <>
            {" · "}
            <Link to={`/topics/${slug}`} className="wiki-public-link">
              사용자 Wiki
            </Link>
          </>
        )}
        {entry.visibility === "published" && kind !== "inbox" && kind !== "topics" && (
          <>
            {" · "}
            <Link to={entryPath(kind, slug, true)}>관리 보기</Link>
          </>
        )}
      </p>
      <dl className="meta">
        <dt>{WIKI_SLUG_LABEL}</dt>
        <dd>
          <code>{entry.slug}</code>
        </dd>
        {entry.source_url && (
          <>
            <dt>출처</dt>
            <dd>
              <a href={entry.source_url} target="_blank" rel="noreferrer">
                {entry.source_url}
              </a>
            </dd>
          </>
        )}
        {entry.collected_at && (
          <>
            <dt>수집일</dt>
            <dd>{entry.collected_at}</dd>
          </>
        )}
      </dl>
      {related.length > 0 && (
        <nav className="entry-linked-topics" aria-label="연관 Wiki 엔트리">
          <span className="entry-linked-topics-label">연관:</span>
          {related.map((e, i) => (
            <span key={e.route}>
              {i > 0 && " · "}
              <Link to={entryPath(e.kind, e.slug, true)}>{e.title}</Link>
              {e.kind === "topics" && isUserVisible(e) && (
                <>
                  {" "}
                  (<Link to={`/topics/${e.slug}`} className="wiki-public-link">
                    Wiki
                  </Link>
                  )
                </>
              )}
            </span>
          ))}
        </nav>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <div className="tags">
          {entry.tags.map((t) => (
            <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="tag">
              {t}
            </Link>
          ))}
        </div>
      )}
      {entry.body && <MarkdownView content={entry.body} linkContext="admin" />}
      <RelatedLinks related={related} admin />
    </article>
  );
}
