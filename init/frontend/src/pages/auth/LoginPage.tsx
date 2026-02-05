import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";

const LoginPage = () => {
  const navigator = useNavigate();
  const { login, studentLogin, isLoading, error, resetError } = useAuth();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    resetError();
    try {
      // Detect if input is email (contains @) or username (student)
      const isEmail = credential.includes("@");

      if (isEmail) {
        // Teacher/Admin login
        const response = await login({ email: credential, password });
        setSuccess(`Đăng nhập thành công! Đang chuyển hướng...`);

        const roles = response.user.roles?.map((r) => r.name) ?? [];
        if (roles.includes("student")) {
          navigator("/student/dashboard");
        } else {
          navigator("/lesson-builder");
        }
      } else {
        // Student login
        await studentLogin({ username: credential, password });
        setSuccess(`Đăng nhập thành công! Đang chuyển hướng...`);
        navigator("/student/dashboard");
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <AuthCard
      title="Chào mừng trở lại!"
      description={
        <span>
          Đăng nhập vào hệ thống KHBD
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Email hoặc Tài khoản"
          name="credential"
          type="text"
          autoComplete="username"
          placeholder="email@example.com"
          value={credential}
          onChange={(event) => setCredential(event.target.value)}
          required
        />
        <TextInput
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <SubmitButton label="Đăng nhập" isLoading={isLoading} />
      </form>
      <div className="mt-4 flex flex-col gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
        <span>
          <Link className="font-medium text-brand" to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </span>
        <span>
          Cần email xác minh? <Link to="/resend-verification">Gửi lại xác minh</Link>
        </span>
        <span className="mt-2 border-t pt-3">
          Chưa có tài khoản? <Link className="font-medium text-brand" to="/register">Đăng ký ngay</Link>
        </span>
      </div>
    </AuthCard>
  );
};

export default LoginPage;
