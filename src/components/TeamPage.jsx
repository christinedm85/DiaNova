import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import FormField from './FormField.jsx'

export default function TeamPage() {
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = async () => {
    try {
      const res = await fetch('/api/team', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      setTeam(data.team)
    } catch (e) { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } catch (e) {
      setError(e.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId) => {
    try {
      await fetch(`/api/team/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      fetch()
    } catch (e) { /* ignore */ }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (user?.plan !== 'studio') {
    return (
      <div className="page-enter space-y-10 max-w-6xl">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Team</h2>
          <p className="text-sm text-surface-500 mt-1">Collaborate with your team.</p>
        </div>
        <div className="glass p-8 text-center space-y-4">
          <div className="text-4xl">👥</div>
          <h3 className="font-display text-lg font-semibold text-surface-100">Studio Plan Required</h3>
          <p className="text-sm text-surface-400">Team access is available on the Studio plan. Upgrade to invite team members and collaborate.</p>
          <button onClick={() => window.location.hash = '#billing'} className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-colors">
            Upgrade to Studio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-10 max-w-6xl">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Team</h2>
        <p className="text-sm text-surface-500 mt-1">Invite collaborators to share your pipeline, leads, and products.</p>
      </div>

      {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">{error}</div>}
      {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">{success}</div>}

      {/* Invite form */}
      <form onSubmit={handleInvite} className="glass p-6 space-y-3 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">Invite a team member</h3>
        <div className="flex gap-2">
          <FormField
            type="email"
            required
            icon="📧"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@email.com"
            className="flex-1"
          />
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2.5 bg-accent-600 hover:bg-accent-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            {inviting ? 'Sending...' : 'Send invite'}
          </button>
        </div>
        <p className="text-xs text-surface-500">They'll receive an invite link to join your team. All team members share the same data.</p>
      </form>

      {/* Members */}
      <div className="glass p-6 space-y-3 max-w-2xl">
        <h3 className="text-sm font-semibold text-surface-200">
          Team Members {team?.members && `(${team.members.length})`}
        </h3>
        {team?.members?.length > 0 ? (
          <div className="space-y-1">
            {team.members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-800/50 transition-colors group">
                <div className="w-8 h-8 rounded-full gradient-border flex items-center justify-center text-xs font-bold text-white">
                  {m.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-200">{m.name}</p>
                  <p className="text-xs text-surface-500">{m.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'owner' ? 'bg-amber-500/10 text-amber-400' : 'bg-accent-500/10 text-accent-400'}`}>
                  {m.role}
                </span>
                {m.role !== 'owner' && (
                  <button onClick={() => handleRemove(m.id)} className="text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-surface-500 text-center py-4">No team members yet. Invite someone!</p>
        )}
      </div>
    </div>
  )
}
