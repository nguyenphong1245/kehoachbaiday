import React from 'react'

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | boolean
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, error, className = '', checked, onChange, required, disabled, ...rest }) => {
  return (
    <div>
      <label className="inline-flex items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
        {/* visually-hidden native input for accessibility, use peer for styling */}
        <input
          type="checkbox"
          className={['peer sr-only', className].join(' ')}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-required={required}
          {...rest}
        />

        {/* custom box: white bg in light mode, gray in dark mode when checked; outline & focus ring preserved */}
            <span
              className={[
                'flex h-5 w-5 items-center justify-center rounded transition-colors',
                // box background/border when checked vs unchecked
                checked
                  ? 'bg-white dark:bg-gray-700 border border-brand'
                  : 'bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700',
              ].join(' ')}
              aria-hidden
            >
              {/* SVG checkmark: hidden by default (opacity-0), shown when checked. Also keep peer-checked as fallback */}
              <svg
                className={[
                  'h-4 w-4 transition-opacity',
                  checked ? 'opacity-100 text-brand' : 'opacity-0 peer-checked:opacity-100 peer-checked:text-brand',
                ].join(' ')}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>

        <span>{label}</span>
        {required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
      </label>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{typeof error === 'string' ? error : 'Invalid'}</p>}
    </div>
  )
}

export default Checkbox
