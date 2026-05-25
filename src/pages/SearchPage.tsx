import { useMemo, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchEntries } from "../lib/entries";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const results = useMemo(() => searchEntries(q, true), [q]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get("q") ?? "").trim();
    setParams(next ? { q: next } : {});
  }

  return (
    <div>
      <h1>검색</h1>
      <p className="hint">발행된 주제만 검색합니다.</p>
      <form className="search-form" onSubmit={onSubmit}>
        <input name="q" type="search" defaultValue={q} placeholder="RAG, Antigravity…" />
        <button type="submit">검색</button>
      </form>
      {q && <p>「{q}」 — {results.length}건</p>}
      <ul className="link-list">
        {results.map((e) => (
          <li key={e.route}>
            <Link to={e.route}>
              [{e.kind}] {e.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
