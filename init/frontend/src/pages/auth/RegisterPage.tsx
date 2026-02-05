import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    resetError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await registerUser({ email, password });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <AuthCard
      title="Tạo tài khoản"
      description={
        <span>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sau khi đăng ký, chúng tôi sẽ gửi email xác minh. Hoàn thành bước đó trước khi đăng nhập.
        </p>
        {localError ? <FormAlert>{localError}</FormAlert> : null}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Địa chỉ email"
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
          autoComplete="new-password"
          placeholder="Chọn mật khẩu an toàn"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextInput
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <SubmitButton label="Tạo tài khoản" isLoading={isLoading} />
      </form>
      <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Chưa nhận được email? <Link to="/resend-verification">Gửi lại xác minh</Link>
      </div>
    </AuthCard>
  );
};

export default RegisterPage;
