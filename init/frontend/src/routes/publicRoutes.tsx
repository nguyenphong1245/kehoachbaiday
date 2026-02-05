import { type RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResendVerificationPage from "@/pages/auth/ResendVerificationPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ServerErrorPage from "@/pages/error/ServerErrorPage";
import UnauthorizedPage from "@/pages/error/UnauthorizedPage";
import { PublicWorksheetPage } from "@/pages/worksheet";
import { PublicSharedQuizPage } from "@/pages/quiz";
import { PublicCodeExercisePage } from "@/pages/code-exercise";

export const publicRoutes: RouteObject[] = [
  {
    // Trang chủ - redirect đến login nếu chưa đăng nhập
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    // Route công khai cho học sinh làm quiz
    path: "/quiz/:shareCode",
    element: <PublicSharedQuizPage />,
  },
  {
    // Route công khai cho học sinh làm phiếu học tập
    path: "/worksheet/:shareCode",
    element: <PublicWorksheetPage />,
  },
  {
    // Route công khai cho học sinh làm bài tập lập trình
    path: "/code/:shareCode",
    element: <PublicCodeExercisePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "resend-verification", element: <ResendVerificationPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "server-error", element: <ServerErrorPage /> },
    ],
  },
];

export default publicRoutes;
