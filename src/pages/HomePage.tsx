import { Link } from "react-router-dom";
import { EntryCard } from "../components/EntryCard";
import { getAdminConfig } from "../lib/admin-config";
import { getPublishedByKindSorted } from "../lib/entries";

export function HomePage() {
  const topics = getPublishedByKindSorted("topics");
  const adminEnabled = getAdminConfig().enabled;

  return (
    <div>
      <h1>AI-Synapse Wiki</h1>
      <p className="hint">
        주제 중심으로 AI 지식을 읽습니다.
        {adminEnabled ? (
          <>
            {" "}
            수집·등록은 <Link to="/admin">관리</Link>에서 합니다.
          </>
        ) : (
          " 수집·등록은 로컬 관리 화면(.env)에서 활성화할 수 있습니다."
        )}
      </p>
      <section className="section">
        <h2>주제</h2>
        <div className="grid">
          {topics.map((e) => (
            <EntryCard key={e.route} entry={e} />
          ))}
        </div>
        {topics.length === 0 && (
          <p>발행된 주제가 없습니다. 관리에서 주제를 등록하세요.</p>
        )}
      </section>
      <section className="section">
        <p>
          <Link to="/search">검색</Link>
        </p>
      </section>
    </div>
  );
}
