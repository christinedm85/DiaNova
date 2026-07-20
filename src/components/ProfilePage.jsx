import { useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleNameChange = async (e) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === user.name) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.auth.updateProfile({ name: name.trim() })
      setSuccess('Name updated')
      // Refresh the user in context — just update locally
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!currentPassword) { setError('Enter your current password'); return }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.auth.updateProfile({ currentPassword, newPassword })
      setSuccess('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter space-y-8 max-w-6xl">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Profile Settings</h2>
        <p className="text-sm text-surface-500 mt-1">Manage your name, email, password, and notification preferences.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">{success}</div>
      )}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">{error}</div>
      )}

      {/* Name */}
      <form onSubmit={handleNameChange} className="glass p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">Display Name</h3>
        <div>
          <label className="text-xs text-surface-400 block mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim() || name.trim() === user?.name}
          className="px-4 py-2 bg-accent-600 hover:bg-accent-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? 'Saving...' : 'Save name'}
        </button>
      </form>

      {/* Email (read-only) */}
      <div className="glass p-6 space-y-3 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">Email</h3>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="flex-1 px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/30 text-surface-400 text-sm cursor-not-allowed"
          />
          {user?.email_verified !== false ? (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full whitespace-nowrap">Verified</span>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full whitespace-nowrap">Pending</span>
          )}
        </div>
      </div>

      {/* Password */}
      <form onSubmit={handlePasswordChange} className="glass p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">Change Password</h3>
        <div>
          <label className="text-xs text-surface-400 block mb-1.5">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="text-xs text-surface-400 block mb-1.5">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="text-xs text-surface-400 block mb-1.5">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 transition-colors"
            placeholder="Re-enter new password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent-600 hover:bg-accent-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      {/* Notifications */}
      <div className="glass p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">Email Notifications</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm text-surface-200">Deal pipeline changes</p>
            <p className="text-xs text-surface-500">Get notified when a deal moves to a new stage</p>
          </div>
          <Toggle
            checked={user?.notify_deal_moved !== 0}
            onChange={async (checked) => {
              try {
                await api.auth.updateProfile({ notify_deal_moved: checked })
              } catch (e) { /* ignore */ }
            }}
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-surface-700/30">
          <div>
            <p className="text-sm text-surface-200">New lead captured</p>
            <p className="text-xs text-surface-500">Get notified when someone signs up as a lead</p>
          </div>
          <Toggle
            checked={user?.notify_new_lead !== 0}
            onChange={async (checked) => {
              try {
                await api.auth.updateProfile({ notify_new_lead: checked })
              } catch (e) { /* ignore */ }
            }}
          />
        </label>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-accent-500' : 'bg-surface-600'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}
