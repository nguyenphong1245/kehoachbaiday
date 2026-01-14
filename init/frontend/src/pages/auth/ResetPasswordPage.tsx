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

    if (code.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({ token: code, password });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError("Reset failed. Your code may have expired.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      description={
        <span>
          Need a code? <Link to="/forgot-password">Request a reset code</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {email && (
          <p className="text-sm text-slate-600">
            We sent a 6-digit code to <strong>{email}</strong>. Check your inbox.
          </p>
        )}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <OtpInput
          length={6}
          value={code}
          onChange={setCode}
          label="Enter 6-digit reset code"
          error={error}
        />
        <TextInput
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Choose a new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextInput
          label="Confirm password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <SubmitButton label="Reset password" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Remembered your password? <Link to="/login">Go to login</Link>
      </p>
    </AuthCard>
  );
};

export default ResetPasswordPage;
