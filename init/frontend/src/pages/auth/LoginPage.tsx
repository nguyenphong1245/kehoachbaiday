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
      const response = await login({ email, password });
      setSuccess(`Đăng nhập thành công! Đang chuyển hướng...`);
      navigator('/lesson-builder');
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <AuthCard
      title="Chào mừng trở lại!"
      description={
        <span>
          Cần một tài khoản? <Link to="/register">Tạo mới</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextInput
          label="Password"
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
      <div className="mt-4 flex flex-col gap-2 text-center text-sm text-slate-500">
        <span>
          <Link className="font-medium text-brand" to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </span>
        <span>
          Cần một email xác minh? <Link to="/resend-verification">Gửi lại xác minh</Link>
        </span>
      </div>
    </AuthCard>
  );
};

export default LoginPage;
