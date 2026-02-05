import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import { resendVerificationEmail } from "@/services/authService";

const ResendVerificationPage = () => {
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
      await resendVerificationEmail({ email });
      navigate("/verify-email", { state: { email } });
    } catch (err: unknown) {
      setError("Không thể gửi email xác minh. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Gửi lại xác minh"
      description={
        <span>
          Đã có mã? <Link to="/verify-email">Nhập mã xác minh</Link>
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
        <SubmitButton label="Gửi xác minh" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ResendVerificationPage;
