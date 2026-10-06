import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toast from '../components/common/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', tone: 'info', duration: 4000, id: 0 })

  const close = useCallback(() => setToast((t) => ({ ...t, open: false })), [])

  const show = useCallback((message, tone = 'info', duration = 4000) => {
    setToast({ open: true, message, tone, duration, id: Date.now() })
  }, [])

  const api = useMemo(
    () => ({
      show,
      close,
      success: (message) => show(message, 'success'),
      info: (message) => show(message, 'info'),
      warning: (message) => show(message, 'warning', 6000),
      error: (message) => show(message, 'error', 7000),
    }),
    [show, close]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast key={toast.id} open={toast.open} onClose={close} message={toast.message} tone={toast.tone} duration={toast.duration} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
