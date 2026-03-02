import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import FormAlert from "@/components/forms/FormAlert";
import OtpInput from "@/components/forms/OtpInput";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import { resetPassword, requestPasswordReset } from "@/services/authService";

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
      const response = await resetPassword({ email: email!, token: code, password });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError("Đặt lại thất bại. Mã của bạn có thể đã hết hạn hoặc không đúng.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setError(null);
    setSuccess(null);
    try {
      await requestPasswordReset({ email });
      setSuccess("Đã gửi lại mã xác minh. Kiểm tra hộp thư của bạn.");
    } catch {
      setError("Gửi lại thất bại. Vui lòng thử lại sau.");
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
              Chúng tôi đã gửi mã 8 chữ số đến <strong>{email}</strong>. Kiểm tra hộp thư của bạn.
            </p>
          )}
          {error && <FormAlert>{error}</FormAlert>}
          {success && <FormAlert variant="success">{success}</FormAlert>}
          <OtpInput
            length={8}
            value={code}
            onChange={setCode}
            label="Nhập mã đặt lại 8 chữ số"
            error={error}
          />
          <SubmitButton label="Xác nhận mã" isLoading={false} />
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <button
              type="button"
              onClick={goBackToStep1}
              className="inline-flex items-center gap-1 text-brand hover:text-brand-dark transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại
            </button>
            <span>•</span>
            <span>Mã: {code.slice(0, 3)}•••{code.slice(-2)}</span>
          </div>
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
        Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ResetPasswordPage;
