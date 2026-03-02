import type { ChangeEventHandler } from "react";

interface TextInputProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  error?: string | null;
}

const TextInput = ({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  required = false,
  error,
}: TextInputProps) => {
  return (
    <label className="flex flex-col gap-1 text-left text-sm font-medium text-stone-700 dark:text-stone-300">
      <span>{label}</span>
      <input
        className="w-full rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2.5 text-base text-stone-900 dark:text-stone-100 shadow-sm transition placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
};

export default TextInput;
