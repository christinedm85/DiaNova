import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

export default function LoginPage({ onSwitch, onBack, onForgot }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
            <span className="text-surface-50">Pilot</span>
          </h1>
          <p className="text-surface-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-surface-400 block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs text-surface-400 block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="flex justify-between items-center">
            <button type="button" onClick={onForgot} className="text-xs text-surface-500 hover:text-accent-400 transition-colors">
              Forgot password?
            </button>
            <p className="text-xs text-surface-500">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={onSwitch} className="text-accent-400 hover:underline">
                Create one
              </button>
            </p>
          </div>

          <div className="pt-2 border-t border-surface-700/30">
            <p className="text-xs text-surface-600 text-center">
              Demo: alex@creatorpilot.com / creator123
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
