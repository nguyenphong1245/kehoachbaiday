import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";

const StudentLoginPage = () => {
  const navigator = useNavigate();
  const { studentLogin, isLoading, error, resetError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    resetError();
    try {
      await studentLogin({ username, password });
      setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      navigator("/student/dashboard");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <AuthCard
      title="Học sinh đăng nhập"
      description={
        <span>
          Sử dụng tài khoản được giáo viên cấp
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Tài khoản"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="hs_mahs_lop"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
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
      <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        <span>
          Bạn là giáo viên?{" "}
          <Link className="font-medium text-brand" to="/login">
            Đăng nhập tại đây
          </Link>
        </span>
      </div>
    </AuthCard>
  );
};

export default StudentLoginPage;
