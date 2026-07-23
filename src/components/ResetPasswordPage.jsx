import { useState, useEffect } from 'react'
import { api } from '../api.js'
import FormField from './FormField.jsx'

export default function ResetPasswordPage({ onBack }) {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  const [valid, setValid] = useState(null) // null=loading, true/false
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) {
      setValid(false)
      return
    }
    api.auth.verifyResetToken(token)
      .then(r => setValid(r.valid))
      .catch(() => setValid(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.auth.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Invalid or expired token
  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-surface-50">Invalid or expired link</h2>
            <p className="text-sm text-surface-400">
              This reset link is no longer valid. Please request a new one.
            </p>
            <button onClick={onBack} className="text-sm text-accent-400 hover:underline">
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (valid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-surface-50">Password reset</h2>
            <p className="text-sm text-surface-400">Your password has been changed. You can now sign in with your new password.</p>
            <button onClick={onBack} className="text-sm text-accent-400 hover:underline">
              Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="gradient-text">Creator</span>
            <span className="text-surface-50">Bloom</span>
          </h1>
          <p className="text-surface-500 text-sm mt-2">Choose a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
              {error}
            </div>
          )}

          <div>
            <FormField
              label="New password"
              icon="🔒"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <FormField
              label="Confirm password"
              icon="🔒"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}
