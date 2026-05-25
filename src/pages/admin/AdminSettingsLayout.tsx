import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { getByKind } from "../../lib/entries";

const COLLECTION_LINKS = [
  { to: "/admin/settings/inbox", label: "Inbox" },
  { to: "/admin/settings/hubs", label: "AI 소스 기지" },
  { to: "/admin/settings/stories", label: "스토리" },
  { to: "/admin/settings/tools", label: "도구" },
] as const;

export function AdminSettingsLayout() {
  const { pathname } = useLocation();
  const isOverview =
    pathname === "/admin/settings" || pathname === "/admin/settings/";
  const inboxPending = getByKind("inbox").filter(
    (e) => e.status !== "promoted",
  ).length;

  return (
    <div className="admin-settings">
      <p className="breadcrumb">
        <Link to="/admin">대시보드</Link>
        <span> / </span>
        {isOverview ? (
          <span>설정</span>
        ) : (
          <Link to="/admin/settings">설정</Link>
        )}
      </p>
      {isOverview && <h1>설정</h1>}
      <nav className="admin-settings-section" aria-label="수집·정리">
        <span className="admin-settings-section-label">수집·정리</span>
        <div className="admin-register-tabs admin-settings-tabs">
          {COLLECTION_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {label}
              {label === "Inbox" && inboxPending > 0 && (
                <span className="admin-badge-inline">{inboxPending}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
