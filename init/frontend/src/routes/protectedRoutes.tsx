import type { RouteObject } from "react-router-dom";

import AccountLayout from "@/components/layout/AccountLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import RequireAuth from "@/components/routes/RequireAuth";
import AccountPage from "@/pages/account/AccountPage";
import AdminPage from "@/pages/admin/AdminPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import DocumentsPage from "@/pages/admin/DocumentsPage";
import { WorksheetManagementPage } from "@/pages/worksheet";
import { SharedQuizManagementPage } from "@/pages/quiz";
import { LessonPlanBuilderPage, SavedLessonPlansPage, ViewSavedLessonPlanPage } from "@/pages/lesson-builder";

export const protectedRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <RequireAuth requiredRoles={["admin"]} unauthorizedPath="/unauthorized">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "documents", element: <DocumentsPage /> },
    ],
  },
  {
    path: "/account",
    element: (
      <RequireAuth>
        <AccountLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <AccountPage /> }],
  },
  {
    path: "/lesson-builder",
    element: (
      <RequireAuth>
        <LessonPlanBuilderPage />
      </RequireAuth>
    ),
  },
  {
    path: "/lesson-builder/saved",
    element: (
      <RequireAuth>
        <SavedLessonPlansPage />
      </RequireAuth>
    ),
  },
  {
    path: "/lesson-builder/saved/:id",
    element: (
      <RequireAuth>
        <ViewSavedLessonPlanPage />
      </RequireAuth>
    ),
  },
  {
    path: "/worksheet-management",
    element: (
      <RequireAuth>
        <WorksheetManagementPage />
      </RequireAuth>
    ),
  },
  {
    path: "/quiz-management",
    element: (
      <RequireAuth>
        <SharedQuizManagementPage />
      </RequireAuth>
    ),
  },
];
