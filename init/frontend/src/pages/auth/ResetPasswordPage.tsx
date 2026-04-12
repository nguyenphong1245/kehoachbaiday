import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import OtpInput from "@/components/forms/OtpInput";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import { resetPassword, requestPasswordReset } from "@/services/authService";
import { usePageTitle } from "@/hooks/usePageTitle";
import { parseAuthApiError, translateAuthText } from "@/utils/authText";

const ResetPasswordPage = () => {
  usePageTitle("Đặt lại mật khẩu");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pageState = (location.state as { email?: string } | null) ?? null;
  const email = pageState?.email;
  const [code, setCode] = useState(() => searchParams.get("code") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    const queryCode = searchParams.get("code");
    if (queryCode) {
      setCode(queryCode);
    }
  }, [searchParams]);

  const handleVerifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (code.length !== 8) {
      setError("Vui lòng nhập mã đặt lại 8 chữ số.");
      return;
    }

    if (!email) {
      setError("Không tìm thấy email. Vui lòng quay lại trang quên mật khẩu.");
      return;
    }

    setStep(2);
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

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
      const nextPassword = password;
      const response = await resetPassword({ email: email!, token: code, password });
      navigate("/login", {
        state: {
          message: translateAuthText(response.message),
          prefillEmail: email,
          prefillPassword: nextPassword,
        },
      });
    } catch (err: unknown) {
      setError(parseAuthApiError(err, "Đặt lại thất bại. Mã của bạn có thể đã hết hạn hoặc không đúng."));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setError(null);
    setSuccess(null);
    try {
      await requestPasswordReset({ email });
      setSuccess("Đã gửi lại mã xác minh. Kiểm tra hộp thư của bạn.");
    } catch (err: unknown) {
      setError(parseAuthApiError(err, "Gửi lại thất bại. Vui lòng thử lại sau."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title={step === 1 ? "NHẬP MÃ XÁC MINH" : "ĐẶT LẠI MẬT KHẨU"}
      description={
        step === 1 ? (
          <span>
            Chưa nhận được mã?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !email}
              className="text-brand hover:text-brand-dark underline transition-colors disabled:opacity-50"
            >
              {isResending ? "Đang gửi..." : "Gửi lại"}
            </button>
          </span>
        ) : undefined
      }
    >
      {step === 1 ? (
        <form className="flex flex-col gap-4" onSubmit={handleVerifyCode}>
          {email && (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Mã đặt lại đã gửi đến <strong>{email}</strong>
            </p>
          )}
          {error && <FormAlert>{error}</FormAlert>}
          {success && <FormAlert variant="success">{success}</FormAlert>}
          <OtpInput
            length={8}
            value={code}
            onChange={setCode}
            error={error}
          />
          <SubmitButton label="Xác nhận mã" isLoading={false} />
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
          {error && <FormAlert>{error}</FormAlert>}
          {success && <FormAlert variant="success">{success}</FormAlert>}
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
      )}
      <p className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        Đã nhớ mật khẩu? <Link to="/login" state={{ prefillEmail: email }}>Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ResetPasswordPage;
