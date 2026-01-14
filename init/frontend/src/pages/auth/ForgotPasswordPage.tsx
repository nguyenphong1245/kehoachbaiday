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
      // Redirect to reset-password page
      navigate("/reset-password", { state: { email } });
    } catch (err: unknown) {
      setError("Unable to process your request right now. Please try again in a moment.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      description={
        <span>
          Need to verify instead? <Link to="/resend-verification">Resend verification email</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Account email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <SubmitButton label="Send reset link" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Remembered your password? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
