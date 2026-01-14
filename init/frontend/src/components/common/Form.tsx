import React from 'react'
import { Button } from './Button'

export type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  loading?: boolean
  footer?: React.ReactNode
}

export const Form: React.FC<FormProps> = ({ onCancel, submitText = 'Save', cancelText = 'Cancel', loading = false, footer, children, className = '', ...rest }) => {
  return (
    <form className={["flex flex-col gap-4", className].join(' ')} {...rest}>
      {children}
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} type="button">
            {cancelText}
          </Button>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </form>
  )
}

export default Form
