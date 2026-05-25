import { Link } from "react-router-dom";
import { generatedAt, getAllEntries, getByKind } from "../../lib/entries";

export function AdminSettingsIndexPage() {
  const inbox = getByKind("inbox").filter((e) => e.status !== "promoted");
  const hubs = getByKind("hubs");
  const stories = getByKind("stories");
  const drafts = getAllEntries().filter((e) => e.visibility === "draft");

  return (
    <div className="admin-settings-overview">
      <p className="hint">
        수집·정리 메뉴에서 Inbox 승격, 허브·스토리 목록, 빌드·export 도구를
        사용합니다. 마지막 빌드: {generatedAt}
      </p>
      <ul className="admin-settings-cards">
        <li>
          <Link to="/admin/settings/inbox">
            <strong>Inbox</strong>
            <span>대기 {inbox.length}건 — URL 클리핑 승격</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/settings/hubs">
            <strong>AI 소스 기지</strong>
            <span>{hubs.length}건 — 허브 목록·보기</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/settings/stories">
            <strong>스토리</strong>
            <span>{stories.length}건 — 이관·검수 카드</span>
          </Link>
        </li>
        <li>
          <Link to="/admin/settings/tools">
            <strong>도구</strong>
            <span>build-entries · export · Hermes</span>
          </Link>
        </li>
      </ul>
      {drafts.length > 0 && (
        <p className="hint">미발행(draft) 엔트리: {drafts.length}건</p>
      )}
    </div>
  );
}
