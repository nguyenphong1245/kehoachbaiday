import type { RouteObject } from "react-router-dom";

import AccountLayout from "@/components/layout/AccountLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import StudentLayout from "@/components/layout/StudentLayout";
import RequireAuth from "@/components/routes/RequireAuth";
import AccountPage from "@/pages/account/AccountPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminTeachersPage from "@/pages/admin/AdminTeachersPage";
import { WorksheetManagementPage } from "@/pages/worksheet";
import { SharedQuizManagementPage } from "@/pages/quiz";
import { SharingManagementPage } from "@/pages/sharing";
import { LessonPlanBuilderPage, SavedLessonPlansPage, ViewSavedLessonPlanPage } from "@/pages/lesson-builder";
import { TeacherManagementPage } from "@/pages/classroom";
import { StudentDashboardPage, StudentAssignmentPage, CollaborativeWorkspacePage, PeerReviewPage, GroupPeerReviewPage } from "@/pages/student";

export const protectedRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <RequireAuth requiredRoles={["admin"]} unauthorizedPath="/unauthorized">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "teachers", element: <AdminTeachersPage /> },
    ],
  },
  {
    path: "/",
    element: (
      <RequireAuth requiredRoles={["teacher", "user", "admin"]} unauthorizedPath="/student/dashboard">
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "lesson-builder",
        element: <LessonPlanBuilderPage />,
      },
      {
        path: "lesson-builder/saved",
        element: <SavedLessonPlansPage />,
      },
      {
        path: "lesson-builder/saved/:id",
        element: <ViewSavedLessonPlanPage />,
      },
      {
        path: "sharing-management",
        element: <SharingManagementPage />,
      },
      {
        path: "worksheet-management",
        element: <WorksheetManagementPage />,
      },
      {
        path: "quiz-management",
        element: <SharedQuizManagementPage />,
      },
      {
        path: "classes",
        element: <TeacherManagementPage />,
      },
    ],
  },
  // Student routes
  {
    path: "/student",
    element: (
      <RequireAuth requiredRoles={["student"]} unauthorizedPath="/unauthorized">
        <StudentLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <StudentDashboardPage /> },
      { path: "dashboard", element: <StudentDashboardPage /> },
      { path: "assignment/:id", element: <StudentAssignmentPage /> },
      { path: "assignment/:id/workspace", element: <CollaborativeWorkspacePage /> },
      { path: "assignment/:id/peer-review", element: <PeerReviewPage /> },
      { path: "assignment/:id/group-peer-review", element: <GroupPeerReviewPage /> },
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
];
