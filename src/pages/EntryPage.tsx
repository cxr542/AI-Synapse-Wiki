import { Link, useParams } from "react-router-dom";
import { MarkdownView } from "../components/MarkdownView";
import { RelatedLinks } from "../components/RelatedLinks";
import { getPublishedEntry, resolveRelated } from "../lib/entries";
import type { EntryKind } from "../lib/types";

interface Props {
  kind: EntryKind;
  title: string;
  publishedOnly?: boolean;
}

export function EntryPage({ kind, title, publishedOnly = true }: Props) {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <p>Wiki 주소 없음</p>;

  const entry = publishedOnly
    ? getPublishedEntry(kind, slug)
    : undefined;

  if (!entry) {
    return (
      <p>
        엔트리를 찾을 수 없거나 비공개입니다. <Link to="/">홈</Link>
      </p>
    );
  }

  const related = resolveRelated(entry, publishedOnly);

  return (
    <article className="entry">
      <p className="breadcrumb">
        <Link to={`/${kind}`}>{title}</Link>
        <span> / </span>
        <span>{entry.title}</span>
      </p>
      <h1>{entry.title}</h1>
      <dl className="meta">
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
      {entry.tags && entry.tags.length > 0 && (
        <div className="tags">
          {entry.tags.map((t) => (
            <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="tag">
              {t}
            </Link>
          ))}
        </div>
      )}
      {entry.body && <MarkdownView content={entry.body} />}
      <RelatedLinks related={related} />
    </article>
  );
}
