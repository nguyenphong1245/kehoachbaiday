import React from 'react'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, required, value, onChange, ...rest }) => {
  const base = 'block w-full px-4 py-2 rounded-md border border-stone-300 bg-white shadow-sm outline-none focus:border-brand focus:ring-brand sm:text-sm dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:focus:border-brand'
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1 dark:text-stone-200">
          {label}
          {required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
        </label>
      )}
      <select className={[base, className].join(' ')} value={value} onChange={onChange} required={required} {...rest}>
        {children}
      </select>
    </div>
  )
}

export default Select
