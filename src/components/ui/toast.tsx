'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onDismiss])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-info" />,
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg bg-nyx-surface border p-4 shadow-xl animate-slide-up',
        {
          'border-success/20': toast.type === 'success',
          'border-error/20': toast.type === 'error',
          'border-warning/20': toast.type === 'warning',
          'border-info/20': toast.type === 'info',
        }
      )}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-500 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
