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
    // Only allow digits
    const digit = inputValue.replace(/\D/g, "");
    
    if (digit.length > 1) {
      // Handle paste
      const digits = digit.split("").slice(0, length);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      onChange(newOtp.join(""));
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Auto focus next input
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
    
    // Focus last input
    const lastIndex = Math.min(digits.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleInputChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    handleChange(index, e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-left text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-12 h-14 text-center text-2xl font-semibold rounded-lg border ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-slate-300 dark:border-slate-600 focus:border-brand focus:ring-brand/30"
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition focus:outline-none focus:ring-2`}
            aria-label={`Chữ số ${index + 1}`}
          />
        ))}
      </div>
      {error && <span className="text-xs text-red-500 text-center">{error}</span>}
    </div>
  );
};

export default OtpInput;
