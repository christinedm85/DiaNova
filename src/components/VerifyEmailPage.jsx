import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext.jsx'

export default function VerifyEmailPage({ onBack }) {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | error | done
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrMsg('No verification token found in the link.')
      return
    }
    verifyEmail(token)
      .then(() => {
        setStatus('done')
        // Redirect to dashboard after a beat
        setTimeout(() => {
          window.history.replaceState({}, '', '/')
          window.location.reload()
        }, 2000)
      })
      .catch(err => {
        setStatus('error')
        setErrMsg(err.message)
      })
  }, [token, verifyEmail])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-400 text-sm">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-surface-50">Email verified!</h2>
            <p className="text-sm text-surface-400">Your account is now active. Redirecting you to the dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="glass p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-surface-50">Verification failed</h2>
          <p className="text-sm text-surface-400">{errMsg}</p>
          <button onClick={onBack} className="text-sm text-accent-400 hover:underline">
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}
