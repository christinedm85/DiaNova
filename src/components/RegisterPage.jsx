import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import FormField from './FormField.jsx'

export default function RegisterPage({ onSwitch, onBack }) {
  const { register, resendVerification } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState(null)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await register(name, email, password)
      if (result.needsVerification) {
        setPendingEmail(result.email)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    try {
      await resendVerification(pendingEmail)
      setResent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Verification-pending screen ──

  if (pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-surface-50">Check your email</h2>
            <p className="text-sm text-surface-400">
              We sent a verification link to <span className="text-surface-200">{pendingEmail}</span>.
              Click it to activate your account.
            </p>
            {resent && (
              <p className="text-xs text-emerald-400">Verification link resent!</p>
            )}
            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full py-2.5 bg-surface-700 hover:bg-surface-600 disabled:opacity-50 text-surface-200 text-sm font-medium rounded-xl transition-colors"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
            <button onClick={onSwitch} className="text-sm text-accent-400 hover:underline">
              Already verified? Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ──

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-sm">
        {onBack && (
          <button onClick={onBack} className="text-sm text-surface-500 hover:text-surface-300 mb-6 flex items-center gap-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
        )}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="gradient-text">Creator</span>
            <span className="text-surface-50">Bloom</span>
          </h1>
          <p className="text-surface-500 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
              {error}
            </div>
          )}

          <FormField
            label="Name"
            icon="👤"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />

          <FormField
            label="Email"
            icon="📧"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <FormField
            label="Password"
            icon="🔒"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-surface-500">
            Already have an account?{' '}
            <button type="button" onClick={onSwitch} className="text-accent-400 hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
