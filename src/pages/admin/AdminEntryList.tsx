import { Link } from "react-router-dom";
import { getByKind } from "../../lib/entries";
import type { EntryKind } from "../../lib/types";
import { WIKI_SLUG_LABEL } from "../../lib/labels";
import { entryPath } from "../../lib/routes";

interface Props {
  kind: EntryKind;
  title: string;
}

export function AdminEntryList({ kind, title }: Props) {
  const items = getByKind(kind);

  return (
    <div>
      <h1>{title}</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>{WIKI_SLUG_LABEL}</th>
            <th>visibility</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.route}>
              <td>{e.title}</td>
              <td>
                <code>{e.slug}</code>
              </td>
              <td>{e.visibility ?? "—"}</td>
              <td>
                <Link to={entryPath(kind, e.slug, true)}>보기</Link>
                {e.visibility === "published" && kind !== "inbox" && (
                  <>
                    {" · "}
                    <Link to={`/${kind}/${e.slug}`}>Wiki</Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
