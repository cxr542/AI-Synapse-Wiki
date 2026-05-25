import { Link } from "react-router-dom";
import type { WikiEntry } from "../lib/types";
import { entryPath } from "../lib/routes";

interface Props {
  entry: WikiEntry;
}

export function EntryCard({ entry }: Props) {
  return (
    <article className="card">
      <Link to={entryPath(entry.kind, entry.slug)} className="card-title">
        {entry.title}
      </Link>
      {entry.source_url && (
        <a
          href={entry.source_url}
          className="card-url"
          target="_blank"
          rel="noreferrer"
        >
          {entry.source_url}
        </a>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <div className="tags">
          {entry.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      )}
      {entry.body && <p className="card-excerpt">{entry.body.slice(0, 160)}…</p>}
    </article>
  );
}
