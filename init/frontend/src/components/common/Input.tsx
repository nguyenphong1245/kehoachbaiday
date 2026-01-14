import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type = 'text',
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
  ...rest
}) => {
  const base = 'block w-full px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm outline-none focus:border-brand focus:ring-brand sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-brand'
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
          {label}
          {required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={[base, className].join(' ')}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{typeof error === 'string' ? error : 'Invalid'}</p>}
    </div>
  )
}

export default Input
