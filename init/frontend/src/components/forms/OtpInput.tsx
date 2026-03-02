import { KeyboardEvent, useRef, useState, ClipboardEvent, ChangeEvent } from "react";

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

  // Split into two groups for visual grouping (e.g., 4-4 for 8 digits, 3-3 for 6)
  const midpoint = Math.ceil(length / 2);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-left text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className="flex items-center justify-center gap-1.5">
        {otp.map((digit, index) => (
          <div key={index} className="flex items-center">
            {index === midpoint && (
              <span className="mx-1.5 text-stone-400 dark:text-stone-500 font-medium select-none">
                —
              </span>
            )}
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 h-12 text-center text-lg font-semibold rounded-lg border ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : "border-stone-300 dark:border-stone-600 focus:border-brand focus:ring-brand/30"
              } bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm transition focus:outline-none focus:ring-2`}
              aria-label={`Chữ số ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
