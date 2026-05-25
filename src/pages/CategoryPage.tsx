import { EntryCard } from "../components/EntryCard";
import { getPublishedByKind } from "../lib/entries";
import type { EntryKind } from "../lib/types";

interface Props {
  kind: EntryKind;
  title: string;
}

export function CategoryPage({ kind, title }: Props) {
  const items = getPublishedByKind(kind);

  return (
    <div>
      <h1>{title}</h1>
      <div className="grid">
        {items.map((e) => (
          <EntryCard key={e.route} entry={e} />
        ))}
      </div>
      {items.length === 0 && <p>발행된 항목이 없습니다.</p>}
    </div>
  );
}
