import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import OtpInput from "@/components/forms/OtpInput";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import { resetPassword } from "@/services/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;
  const [code, setCode] = useState(() => searchParams.get("code") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const queryCode = searchParams.get("code");
    if (queryCode) {
      setCode(queryCode);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (code.length !== 8) {
      setError("Vui lòng nhập mã đặt lại 8 chữ số.");
      return;
    }

    if (!email) {
      setError("Không tìm thấy email. Vui lòng quay lại trang quên mật khẩu.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({ email, token: code, password });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError("Đặt lại thất bại. Mã của bạn có thể đã hết hạn.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      description={
        <span>
          Cần mã? <Link to="/forgot-password">Yêu cầu mã đặt lại</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {email && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Chúng tôi đã gửi mã 8 chữ số đến <strong>{email}</strong>. Kiểm tra hộp thư của bạn.
          </p>
        )}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <OtpInput
          length={8}
          value={code}
          onChange={setCode}
          label="Nhập mã đặt lại 8 chữ số"
          error={error}
        />
        <TextInput
          label="Mật khẩu mới"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Chọn mật khẩu mới"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextInput
          label="Xác nhận mật khẩu"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <SubmitButton label="Đặt lại mật khẩu" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ResetPasswordPage;
