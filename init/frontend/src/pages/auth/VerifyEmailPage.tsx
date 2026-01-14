import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import OtpInput from "@/components/forms/OtpInput";
import SubmitButton from "@/components/forms/SubmitButton";
import AuthCard from "@/components/layout/AuthCard";
import { verifyEmail } from "@/services/authService";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email;
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
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      const response = await verifyEmail({ token: code });
      setSuccess(response.message);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login", { state: { message: "Email verified successfully! You can now log in." } });
      }, 2000);
    } catch (err: unknown) {
      setError("Verification failed. Please check your code and try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      description={
        <span>
          Lost your code? <Link to="/resend-verification">Send it again</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
          label="Enter 6-digit code"
          error={error}
        />
        <SubmitButton label="Verify email" isLoading={isSubmitting} />
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Ready to sign in? <Link to="/login">Go to login</Link>
      </p>
    </AuthCard>
  );
};

export default VerifyEmailPage;
