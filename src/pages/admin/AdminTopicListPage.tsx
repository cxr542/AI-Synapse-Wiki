import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminFetch } from "../../lib/admin-fetch";
import { getByKindSorted } from "../../lib/entries";
import { useAdminSettings } from "../../lib/use-admin-settings";
import { WIKI_SLUG_LABEL } from "../../lib/labels";
import { entryPath } from "../../lib/routes";
import type { Visibility } from "../../lib/types";

const VIS_FILTERS: Visibility[] = ["published", "draft", "admin"];

function parseVisibilityFilter(raw: string | null): Visibility | null {
  if (!raw) return null;
  return VIS_FILTERS.includes(raw as Visibility) ? (raw as Visibility) : null;
}

export function AdminTopicListPage() {
  const [searchParams] = useSearchParams();
  const visibilityFilter = parseVisibilityFilter(
    searchParams.get("visibility"),
  );
  const allItems = getByKindSorted("topics");
  const items = useMemo(
    () =>
      visibilityFilter
        ? allItems.filter(
            (e) => (e.visibility ?? "published") === visibilityFilter,
          )
        : allItems,
    [allItems, visibilityFilter],
  );
  const {
    protectMode,
    protectLocked,
    protectSaving,
    setProtectMode,
    loaded,
  } = useAdminSettings();
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);

  async function deleteTopic(slug: string, title: string) {
    if (protectMode) return;
    if (
      !window.confirm(
        `「${title}」(Wiki 주소: ${slug}) 주제를 삭제할까요?\n\ndocs/topics/${slug}.md 가 제거됩니다.`,
      )
    ) {
      return;
    }
    setError("");
    setBusySlug(slug);
    try {
      const res = await adminFetch(`/api/admin/topics/${slug}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "삭제 실패");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setBusySlug(null);
    }
  }

  async function onProtectToggle(next: boolean) {
    setError("");
    try {
      await setProtectMode(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "보호 모드 설정 실패");
    }
  }

  return (
    <div>
      <h1>
        주제 목록
        {visibilityFilter && (
          <span className="admin-list-filter-tag"> · {visibilityFilter}</span>
        )}
      </h1>
      {visibilityFilter && (
        <p className="admin-filter-bar">
          <span>
            필터: <code>visibility={visibilityFilter}</code> ({items.length}건)
          </span>
          <Link to="/admin/topics">필터 해제</Link>
          <Link to="/admin">대시보드</Link>
        </p>
      )}
      <p className="hint">
        제목 오름차순 · 등록일은 주제 front matter · 갱신일은 md 파일 수정 시각
        <br />
        <Link to="/admin/topics/register">주제 등록</Link>
        {" — "}
        <Link to="/admin/topics/register/nl">자연어</Link>
        {" · "}
        <Link to="/admin/topics/register/new">수동</Link>
      </p>
      {error && <p className="form-error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>{WIKI_SLUG_LABEL}</th>
            <th className="admin-col-date">등록</th>
            <th className="admin-col-date">갱신</th>
            <th>visibility</th>
            <th className="admin-th-manage">
              <div className="admin-th-manage-row">
                <span className="admin-th-manage-label">관리</span>
                <label
                  className="admin-protect-switch"
                  title={
                    protectLocked
                      ? ".env VITE_ADMIN_PROTECT 로 고정됨"
                      : "켜면 주제 삭제 비활성"
                  }
                >
                  <input
                    type="checkbox"
                    role="switch"
                    aria-label="보호 모드"
                    checked={protectMode}
                    disabled={!loaded || protectLocked || protectSaving}
                    onChange={(e) => void onProtectToggle(e.target.checked)}
                  />
                  <span className="admin-protect-switch-text">
                    보호 {protectMode ? "ON" : "OFF"}
                    {protectSaving ? " …" : ""}
                  </span>
                </label>
                {protectLocked && (
                  <span className="admin-protect-env-lock">.env 고정</span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.route}>
              <td>
                <Link
                  to={entryPath("topics", e.slug, true)}
                  className="admin-table-title-link"
                >
                  {e.title}
                </Link>
              </td>
              <td>
                <code>{e.slug}</code>
              </td>
              <td className="admin-col-date">{e.collected_at ?? "—"}</td>
              <td className="admin-col-date">{e.updated_at ?? "—"}</td>
              <td>{e.visibility ?? "—"}</td>
              <td className="admin-actions">
                <Link to={entryPath("topics", e.slug, true)}>보기</Link>
                {" · "}
                <Link to={`/admin/topics/${e.slug}/edit`}>편집</Link>
                {e.visibility === "published" && (
                  <>
                    {" · "}
                    <Link to={`/topics/${e.slug}`}>Wiki</Link>
                  </>
                )}
                {!protectMode && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="btn-danger-inline"
                      disabled={busySlug === e.slug}
                      onClick={() => void deleteTopic(e.slug, e.title)}
                    >
                      {busySlug === e.slug ? "…" : "삭제"}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p>
          {visibilityFilter
            ? `「${visibilityFilter}」 주제가 없습니다.`
            : "등록된 주제가 없습니다."}
        </p>
      )}
    </div>
  );
}
