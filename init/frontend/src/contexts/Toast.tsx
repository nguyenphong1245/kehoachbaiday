import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Check, XCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

type ToastAction = { label: string; onClick?: () => void }

type Toast = {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number // ms
  actions?: ToastAction[]
}

type ToastContextValue = {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, number>>({})

  const remove = useCallback((id: string) => {
    // clear timer if exists
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
    setToasts((s) => s.filter((x) => x.id !== id))
  }, [])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    const toast = { id, ...t }
    setToasts((s) => [toast, ...s])
    const duration = t.duration ?? 4000
    const timer = window.setTimeout(() => remove(id), duration)
    timers.current[id] = timer
  }, [remove])

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const base = 'max-w-sm min-w-[300px] px-4 py-2 rounded-md shadow flex flex-col gap-1'
          const typeClasses: Record<string, string> = {
            success: 'bg-green-50 border border-green-200 dark:bg-green-900/30 dark:border-green-700',
            error: 'bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700',
            info: 'bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
            warning: 'bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700',
            default: 'bg-white border dark:bg-gray-800 dark:border-gray-700',
          }

          const key = t.type ?? 'default'

          const icon = (() => {
            switch (t.type) {
              case 'success':
                return <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              case 'error':
                return <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              case 'warning':
                return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              case 'info':
              default:
                return <Info className="h-6 w-6 text-sky-500 dark:text-sky-400" />
            }
          })()

          return (
            <div key={t.id} className={[base, typeClasses[key]].join(' ')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    {t.title && <div className="font-semibold dark:text-gray-100">{t.title}</div>}
                    {t.description && <div className="text-sm text-gray-700 dark:text-gray-300">{t.description}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.actions?.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        a.onClick?.()
                        remove(t.id)
                      }}
                      className="text-sm text-brand underline"
                    >
                      {a.label}
                    </button>
                  ))}
                  <button onClick={() => remove(t.id)} className="text-sm text-gray-500 dark:text-gray-400">✕</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastProvider
