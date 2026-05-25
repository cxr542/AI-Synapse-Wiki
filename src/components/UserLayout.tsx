import { Link, Outlet } from "react-router-dom";
import { getAdminConfig } from "../lib/admin-config";

export function UserLayout() {
  const adminEnabled = getAdminConfig().enabled;

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          AI-Synapse Wiki
        </Link>
        <nav className="nav">
          <Link to="/">홈</Link>
          <Link to="/topics">주제</Link>
          <Link to="/search">검색</Link>
          {adminEnabled && (
            <Link to="/admin" className="nav-admin">
              관리
            </Link>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <span>v0.2 · 사용자 Wiki</span>
      </footer>
    </div>
  );
}
