import { Link } from "react-router-dom";
import { entryPath } from "../lib/routes";
import type { WikiEntry } from "../lib/types";
import { isUserVisible } from "../lib/visibility";

interface Props {
  related: WikiEntry[];
  admin?: boolean;
}

export function RelatedLinks({ related, admin = false }: Props) {
  if (related.length === 0) return null;
  return (
    <section className="related">
      <h2>Synapse · 연관</h2>
      <ul>
        {related.map((e) => (
          <li key={e.route}>
            {admin ? (
              <>
                <Link to={entryPath(e.kind, e.slug, true)}>{e.title}</Link>
                <span className="related-kind">{e.kind}</span>
                {e.kind === "topics" && isUserVisible(e) && (
                  <>
                    {" · "}
                    <Link to={`/topics/${e.slug}`} className="wiki-public-link">
                      Wiki
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to={
                    e.kind === "topics" && isUserVisible(e)
                      ? `/topics/${e.slug}`
                      : entryPath(e.kind, e.slug, true)
                  }
                >
                  {e.title}
                </Link>
                <span className="related-kind">{e.kind}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
