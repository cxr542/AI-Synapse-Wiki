import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { UserLayout } from "./components/UserLayout";
import { CategoryPage } from "./pages/CategoryPage";
import { EntryPage } from "./pages/EntryPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SearchPage } from "./pages/SearchPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminEntryList } from "./pages/admin/AdminEntryList";
import { AdminTopicEditPage } from "./pages/admin/AdminTopicEditPage";
import { AdminTopicListPage } from "./pages/admin/AdminTopicListPage";
import { AdminEntryView } from "./pages/admin/AdminEntryView";
import { AdminInboxPage } from "./pages/admin/AdminInboxPage";
import { AdminTopicNewPage } from "./pages/admin/AdminTopicNewPage";
import { AdminTopicNlPage } from "./pages/admin/AdminTopicNlPage";
import { AdminTopicRegisterLayout } from "./pages/admin/AdminTopicRegisterLayout";
import { AdminSettingsIndexPage } from "./pages/admin/AdminSettingsIndexPage";
import { AdminSettingsLayout } from "./pages/admin/AdminSettingsLayout";
import { AdminToolsPage } from "./pages/admin/AdminToolsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "topics", element: <CategoryPage kind="topics" title="주제" /> },
      {
        path: "topics/:slug",
        element: <EntryPage kind="topics" title="주제" publishedOnly />,
      },
      { path: "search", element: <SearchPage /> },
      { path: "hubs", element: <Navigate to="/admin/settings/hubs" replace /> },
      {
        path: "stories",
        element: <Navigate to="/admin/settings/stories" replace />,
      },
      { path: "inbox", element: <Navigate to="/admin/settings/inbox" replace /> },
      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "topics", element: <AdminTopicListPage /> },
      {
        path: "topics/register",
        element: <AdminTopicRegisterLayout />,
        children: [
          { index: true, element: <Navigate to="nl" replace /> },
          { path: "nl", element: <AdminTopicNlPage /> },
          { path: "new", element: <AdminTopicNewPage /> },
        ],
      },
      {
        path: "topics/nl",
        element: <Navigate to="/admin/topics/register/nl" replace />,
      },
      {
        path: "topics/new",
        element: <Navigate to="/admin/topics/register/new" replace />,
      },
      { path: "topics/:slug/edit", element: <AdminTopicEditPage /> },
      {
        path: "topics/:slug",
        element: (
          <AdminEntryView
            kind="topics"
            listPath="/admin/topics"
            listLabel="주제 목록"
          />
        ),
      },
      {
        path: "settings",
        element: <AdminSettingsLayout />,
        children: [
          { index: true, element: <AdminSettingsIndexPage /> },
          { path: "inbox", element: <AdminInboxPage /> },
          {
            path: "hubs",
            element: <AdminEntryList kind="hubs" title="AI 소스 기지" />,
          },
          {
            path: "hubs/:slug",
            element: (
              <AdminEntryView
                kind="hubs"
                listPath="/admin/settings/hubs"
                listLabel="AI 소스 기지"
              />
            ),
          },
          {
            path: "stories",
            element: <AdminEntryList kind="stories" title="스토리" />,
          },
          {
            path: "stories/:slug",
            element: (
              <AdminEntryView
                kind="stories"
                listPath="/admin/settings/stories"
                listLabel="스토리"
              />
            ),
          },
          { path: "tools", element: <AdminToolsPage /> },
        ],
      },
      { path: "hubs", element: <Navigate to="/admin/settings/hubs" replace /> },
      {
        path: "hubs/:slug",
        element: <LegacySettingsEntryRedirect kind="hubs" />,
      },
      { path: "inbox", element: <Navigate to="/admin/settings/inbox" replace /> },
      {
        path: "stories",
        element: <Navigate to="/admin/settings/stories" replace />,
      },
      {
        path: "stories/:slug",
        element: <LegacySettingsEntryRedirect kind="stories" />,
      },
      { path: "tools", element: <Navigate to="/admin/settings/tools" replace /> },
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
]);

/** @deprecated 북마크용 — /admin/{kind}/:slug → /admin/settings/{kind}/:slug */
function LegacySettingsEntryRedirect({ kind }: { kind: "hubs" | "stories" }) {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to={`/admin/settings/${kind}`} replace />;
  return <Navigate to={`/admin/settings/${kind}/${slug}`} replace />;
}
