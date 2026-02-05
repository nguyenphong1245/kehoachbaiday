import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import { requestPasswordReset } from "@/services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
      navigate("/reset-password", { state: { email } });
    } catch (err: unknown) {
      setError("Không thể xử lý yêu cầu. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Quên mật khẩu?"
      description={
        <span>
          Cần xác minh email? <Link to="/resend-verification">Gửi lại email xác minh</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Email tài khoản"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <SubmitButton label="Gửi liên kết đặt lại" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
