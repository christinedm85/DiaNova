import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

const CONFETTI_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899', '#06b6d4']

function ConfettiPiece({ delay, color, left }) {
  return (
    <span
      className="confetti-piece"
      style={{
        left: `${left}%`,
        top: '-8px',
        backgroundColor: color,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

function Confetti({ show }) {
  if (!show) return null
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    delay: Math.random() * 0.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: Math.random() * 90 + 5,
  }))
  return (
    <div className="fixed bottom-20 right-6 z-[60] pointer-events-none w-48 h-32 overflow-hidden">
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} {...p} />
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    if (type === 'success') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1400)
    }
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Confetti show={showConfetti} />
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
