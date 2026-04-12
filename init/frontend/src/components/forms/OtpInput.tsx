import { KeyboardEvent, useRef, useState, ClipboardEvent, ChangeEvent, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string | null;
}

const OtpInput = ({ length = 6, value, onChange, label, error }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(value.split("").concat(Array(length).fill("")).slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const next = value.split("").concat(Array(length).fill("")).slice(0, length);
    setOtp(next);
  }, [value, length]);

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, "");

    if (digit.length > 1) {
      const digits = digit.split("").slice(0, length);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      onChange(newOtp.join(""));

      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = pasteData.split("").slice(0, length);
    const newOtp = Array(length).fill("");
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));

    const lastIndex = Math.min(digits.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleInputChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    handleChange(index, e.target.value);
  };

  // Keep a small visual separation between halves (4-4 for 8 digits, 3-3 for 6)
  const midpoint = Math.ceil(length / 2);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-left text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className={`rounded-2xl border px-3 py-3 ${
        error
          ? "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10"
          : "border-stone-200 bg-stone-50/70 dark:border-stone-700 dark:bg-stone-800/40"
      }`}>
        <div className="flex items-center justify-center gap-2">
        {otp.map((digit, index) => (
          <div
            key={index}
            className={`flex items-center ${index === midpoint ? "ml-2" : ""}`}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={digit}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`h-12 w-10 rounded-xl border text-center text-lg font-semibold tracking-[0.04em] caret-transparent transition focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 bg-white text-red-700 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700 dark:bg-stone-900 dark:text-red-300"
                  : "border-stone-300 bg-white text-stone-900 focus:border-stone-500 focus:ring-stone-400/20 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-400"
              }`}
              aria-label={`Chữ số ${index + 1}`}
              aria-invalid={Boolean(error)}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default OtpInput;
