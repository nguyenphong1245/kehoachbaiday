import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";

const LoginPage = () => {
  const navigator = useNavigate();
  const { login, isLoading, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    resetError();
    try {
      // Teacher/Admin login only (email-based)
      await login({ email, password });
      setSuccess(`Đăng nhập thành công! Đang chuyển hướng...`);
      navigator("/lesson-builder");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <AuthCard title="ĐĂNG NHẬP">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
      <div className="mt-4 flex flex-col gap-2 text-center text-sm text-stone-500 dark:text-stone-400">
        <Link className="font-medium text-brand" to="/forgot-password">
          Quên mật khẩu?
        </Link>
        <span>
          Chưa có tài khoản? <Link className="font-medium text-brand" to="/register">Đăng ký ngay</Link>
        </span>
      </div>
    </AuthCard>
  );
};

export default LoginPage;
