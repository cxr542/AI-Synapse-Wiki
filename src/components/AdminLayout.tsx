import { Link, NavLink, Outlet } from "react-router-dom";
import { getAdminConfig } from "../lib/admin-config";
import { isAdminSessionUnlocked, lockAdminSession } from "../lib/admin-session";
import { useAdminSettings } from "../lib/use-admin-settings";
import { AdminDisabledPage } from "../pages/admin/AdminDisabledPage";
import { AdminUnlockPage } from "../pages/admin/AdminUnlockPage";

const ADMIN_LINKS = [
  { to: "/admin", label: "대시보드", end: true },
  { to: "/admin/topics", label: "주제 목록", end: true },
  { to: "/admin/topics/register", label: "주제 등록", end: false },
  { to: "/admin/settings", label: "설정", end: false },
] as const;

export function AdminLayout() {
  const { enabled, pinRequired } = getAdminConfig();
  const { protectMode, protectLocked } = useAdminSettings();

  if (!enabled) {
    return (
      <div className="app app-admin">
        <main className="main">
          <AdminDisabledPage />
        </main>
      </div>
    );
  }

  if (pinRequired && !isAdminSessionUnlocked()) {
    return (
      <div className="app app-admin">
        <main className="main">
          <AdminUnlockPage />
        </main>
      </div>
    );
  }

  return (
    <div className="app app-admin">
      <header className="header header-admin">
        <Link to="/admin" className="logo">
          Wiki 관리
        </Link>
        <nav className="nav nav-admin-wrap">
          {ADMIN_LINKS.map(({ to, label, end: linkEnd }) => (
            <NavLink
              key={to}
              to={to}
              end={linkEnd ?? true}
              className={({ isActive }) => (isActive ? "nav-active" : undefined)}
            >
              {label}
            </NavLink>
          ))}
          <Link to="/" className="nav-wiki-home">
            Wiki Home
          </Link>
          {pinRequired && (
            <button
              type="button"
              className="nav-link-button"
              onClick={() => {
                lockAdminSession();
                window.location.reload();
              }}
            >
              잠금
            </button>
          )}
        </nav>
      </header>
      <main className="main">
        {protectMode && (
          <p className="admin-protect-banner" role="status">
            보호 모드 — 주제 삭제가 비활성화되어 있습니다.{" "}
            {protectLocked ? (
              <>
                해제: <code>.env</code> 의 <code>VITE_ADMIN_PROTECT</code> 를
                끄고 dev 서버 재시작.
              </>
            ) : (
              <>
                해제: <Link to="/admin/topics">주제 목록</Link> 관리 열의 보호
                모드 스위치.
              </>
            )}
          </p>
        )}
        <Outlet />
      </main>
      <footer className="footer">
        <span>v0.2 · 관리자</span>
      </footer>
    </div>
  );
}
