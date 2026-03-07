import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

const StudentLoginPage = () => {
  usePageTitle("Đăng nhập học sinh");
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
    <AuthCard title="ĐĂNG NHẬP" description="Trang đăng nhập dành cho học sinh">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Tài khoản"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="VD: HS07012015123"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <TextInput
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="VD: 07012015"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <SubmitButton label="Đăng nhập" isLoading={isLoading} />
      </form>
    </AuthCard>
  );
};

export default StudentLoginPage;
