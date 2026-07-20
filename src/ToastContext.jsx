import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-xl border animate-slide-up max-w-sm ${
              t.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
              t.type === 'error' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
              'bg-accent-500/20 border-accent-500/30 text-accent-400'
            }`}
          >
            {t.type === 'success' && '✓ '}
            {t.type === 'error' && '✗ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
