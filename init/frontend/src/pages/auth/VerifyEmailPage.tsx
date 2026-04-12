import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import OtpInput from "@/components/forms/OtpInput";
import SubmitButton from "@/components/forms/SubmitButton";
import AuthCard from "@/components/layout/AuthCard";
import { verifyEmail } from "@/services/authService";
import { usePageTitle } from "@/hooks/usePageTitle";
import { parseAuthApiError, translateAuthText } from "@/utils/authText";

const VerifyEmailPage = () => {
  usePageTitle("Xác thực email");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pageState = (location.state as { email?: string; password?: string } | null) ?? null;
  const email = pageState?.email;
  const password = pageState?.password;
  const [code, setCode] = useState(() => searchParams.get("code") ?? "");
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
    if (code.length !== 8) {
      setError("Vui lòng nhập mã xác minh 8 chữ số.");
      return;
    }
    if (!email) {
      setError("Không tìm thấy email. Vui lòng quay lại trang đăng ký.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const response = await verifyEmail({ email, token: code });
      setSuccess(translateAuthText(response.message));
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Xác minh email thành công! Bạn có thể đăng nhập.",
            prefillEmail: email,
            prefillPassword: password,
          },
        });
      }, 2000);
    } catch (err: unknown) {
      setError(parseAuthApiError(err, "Xác minh thất bại. Vui lòng kiểm tra lại mã và thử lại."));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Xác minh email"
      description={
        <span>
          Mất mã xác minh? <Link to="/resend-verification">Gửi lại</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {email && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Mã xác minh đã gửi đến <strong>{email}</strong>
          </p>
        )}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <OtpInput
          length={8}
          value={code}
          onChange={setCode}
          error={error}
        />
        <SubmitButton label="Xác minh email" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        Sẵn sàng đăng nhập? <Link to="/login" state={{ prefillEmail: email, prefillPassword: password }}>Đi đến đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default VerifyEmailPage;
