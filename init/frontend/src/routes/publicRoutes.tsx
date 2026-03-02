import { type RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResendVerificationPage from "@/pages/auth/ResendVerificationPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import StudentLoginPage from "@/pages/auth/StudentLoginPage";
import ServerErrorPage from "@/pages/error/ServerErrorPage";
import UnauthorizedPage from "@/pages/error/UnauthorizedPage";
import { PublicCodeExercisePage } from "@/pages/code-exercise";
import UserGuidePage from "@/pages/guide/UserGuidePage";

export const publicRoutes: RouteObject[] = [
  {
    // Trang chủ - redirect đến login nếu chưa đăng nhập
    path: "/",
    element: <Navigate to="/login" replace />,
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
      { path: "student/login", element: <StudentLoginPage /> },
      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "server-error", element: <ServerErrorPage /> },
    ],
  },
  {
    path: "code/:shareCode",
    element: <PublicCodeExercisePage />,
  },
  {
    path: "huong-dan",
    element: <UserGuidePage />,
  },
];

export default publicRoutes;
