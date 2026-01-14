import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormAlert from "@/components/forms/FormAlert";
import SubmitButton from "@/components/forms/SubmitButton";
import TextInput from "@/components/forms/TextInput";
import AuthCard from "@/components/layout/AuthCard";
import useAuth from "@/hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    resetError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await registerUser({ email, password });
      // Redirect to verify-email page
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <AuthCard
      title="Create an account"
      description={
        <span>
          Already registered? <Link to="/login">Sign in</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-500">
          After signing up we send a verification email. Complete that step before your first sign in.
        </p>
        {localError ? <FormAlert>{localError}</FormAlert> : null}
        {error ? <FormAlert>{error}</FormAlert> : null}
        {success ? <FormAlert variant="success">{success}</FormAlert> : null}
        <TextInput
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Choose a secure password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <TextInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <SubmitButton label="Create account" isLoading={isLoading} />
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        Didn't get the email? <Link to="/resend-verification">Resend verification</Link>
      </div>
    </AuthCard>
  );
};

export default RegisterPage;
