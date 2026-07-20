import { useState } from 'react'
import { api } from '../api.js'
import FormField from './FormField.jsx'

export default function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.auth.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-surface-50">Check your email</h2>
            <p className="text-sm text-surface-400">
              If <span className="text-surface-200">{email}</span> is registered, we sent a reset link there.
            </p>
            <button onClick={onBack} className="text-sm text-accent-400 hover:underline mt-2">
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-sm text-surface-500 hover:text-surface-300 mb-6 flex items-center gap-1 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="gradient-text">Creator</span>
            <span className="text-surface-50">Pilot</span>
          </h1>
          <p className="text-surface-500 text-sm mt-2">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
              {error}
            </div>
          )}

          <p className="text-xs text-surface-400">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <div>
            <FormField
              label="Email"
              icon="📧"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}
