import { useState, useEffect } from 'react'
import { api } from '../api.js'

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/25'
          : 'bg-surface-800 text-surface-400 hover:text-surface-200'
      }`}
    >
      {children}
    </button>
  )
}

function StatCard({ label, value, subtitle, color = 'accent' }) {
  const colors = {
    accent: 'border-accent-500/20 shadow-accent-500/10',
    emerald: 'border-emerald-500/20 shadow-emerald-500/10',
    amber: 'border-amber-500/20 shadow-amber-500/10',
    rose: 'border-rose-500/20 shadow-rose-500/10',
  }
  return (
    <div className={`glass p-5 border ${colors[color] || colors.accent}`}>
      <p className="text-sm text-surface-400">{label}</p>
      <p className="font-display text-3xl font-bold text-surface-50 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seedMsg, setSeedMsg] = useState(null)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedAllMsg, setSeedAllMsg] = useState(null)
  const [seedAllLoading, setSeedAllLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  const fetchData = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.admin.users().catch(e => { throw e }),
      api.admin.stats().catch(e => { throw e }),
    ])
      .then(([u, s]) => {
        setUsers(u)
        setStats(s)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => { fetchData() }, [])

  const handleSeedDemo = async () => {
    if (!selectedUserId) {
      setSeedMsg({ type: 'error', text: 'Please enter a user ID.' })
      return
    }
    setSeedLoading(true)
    setSeedMsg(null)
    try {
      const res = await api.admin.seedDemo(parseInt(selectedUserId))
      setSeedMsg({ type: 'success', text: res.message || 'Demo data seeded successfully!' })
      fetchData()
    } catch (e) {
      setSeedMsg({ type: 'error', text: e.message })
    }
    setSeedLoading(false)
  }

  const handleSeedAll = async () => {
    setSeedAllLoading(true)
    setSeedAllMsg(null)
    try {
      // Seed demo data for the demo user
      await api.admin.seedDemo(selectedUserId ? parseInt(selectedUserId) : null)
      setSeedAllMsg({ type: 'success', text: 'Demo workspace reset successfully!' })
      fetchData()
    } catch (e) {
      setSeedAllMsg({ type: 'error', text: e.message })
    }
    setSeedAllLoading(false)
  }

  if (loading) {
    return (
      <div className="page-enter space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-700/50 rounded w-48 mb-2" />
          <div className="h-4 bg-surface-700/50 rounded w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass p-5 animate-pulse">
              <div className="h-3 bg-surface-700/50 rounded w-20 mb-3" />
              <div className="h-8 bg-surface-700/50 rounded w-28 mb-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20">
        <div className="glass p-8 max-w-md text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Access Denied</h3>
          <p className="text-surface-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const totalPipeline = stats
    ? stats.pipeline.prospecting + stats.pipeline.negotiating + stats.pipeline.confirmed + stats.pipeline.completed
    : 0

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-xl">🛡️</span>
          Admin Dashboard
        </h2>
        <p className="text-surface-400 mt-1">Platform management and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
          👥 Users
        </TabButton>
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>
          📊 Stats
        </TabButton>
        <TabButton active={tab === 'actions'} onClick={() => setTab('actions')}>
          ⚡ Actions
        </TabButton>
      </div>

      {/* ── Users Tab ── */}
      {tab === 'users' && users && (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Revenue</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Deals</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Joined</th>
                  <th className="text-left px-5 py-3 text-surface-400 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const totalRev = (u.sponsor_revenue || 0) + (u.affiliate_revenue || 0) + (u.product_revenue || 0)
                  return (
                    <tr key={u.id} className="border-b border-surface-700/30 hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center text-xs font-bold text-accent-400">
                            {u.name?.[0] || '?'}
                          </div>
                          <span className="font-medium text-surface-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-surface-400">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.plan === 'studio' ? 'bg-purple-500/10 text-purple-400' :
                          u.plan === 'pro' ? 'bg-accent-500/10 text-accent-400' :
                          'bg-surface-700 text-surface-400'
                        }`}>
                          {u.plan === 'studio' ? '👑' : u.plan === 'pro' ? '⭐' : ''} {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-surface-200 font-mono">${totalRev.toLocaleString()}</td>
                      <td className="px-5 py-3 text-surface-200">{u.sponsor_count || 0}</td>
                      <td className="px-5 py-3 text-surface-500 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {u.is_admin ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">Admin</span> : null}
                          {u.email?.includes('demo') ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">Demo</span> : null}
                          {!u.email_verified ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400">Unverified</span> : null}
                          {u.onboarding_complete ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">Onboarded</span> : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-surface-700/50 text-xs text-surface-500">
            {users.length} total users
          </div>
        </div>
      )}

      {/* ── Stats Tab ── */}
      {tab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Top-level stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} subtitle={`${stats.recentSignups} new this week`} color="accent" />
            <StatCard label="MRR" value={`$${stats.mrr.toLocaleString()}`} subtitle={`${stats.activeSubs} active subscriptions`} color="emerald" />
            <StatCard label="Paid Users" value={stats.paidUsers} subtitle={`${stats.verifiedUsers} verified`} color="amber" />
            <StatCard label="Demo Accounts" value={stats.demoUsers} color="rose" />
          </div>

          {/* Pipeline cards */}
          <h3 className="font-display text-lg font-semibold text-surface-100">Platform Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.pipeline.prospecting}</p>
              <p className="text-xs text-surface-500 mt-1">Prospecting</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.pipeline.negotiating}</p>
              <p className="text-xs text-surface-500 mt-1">Negotiating</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.pipeline.confirmed}</p>
              <p className="text-xs text-surface-500 mt-1">Confirmed</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-surface-300">{stats.pipeline.completed}</p>
              <p className="text-xs text-surface-500 mt-1">Completed</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="glass p-5">
            <h3 className="font-display text-lg font-semibold text-surface-100 mb-3">Platform Revenue</h3>
            <p className="font-display text-4xl font-bold text-surface-50">
              ${stats.platformRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-surface-400 mt-1">Total confirmed + completed sponsorship value</p>
          </div>

          {/* Plan breakdown */}
          <div className="glass p-5">
            <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Plan Breakdown</h3>
            <div className="space-y-3">
              {stats.planBreakdown.map(p => {
                const total = stats.planBreakdown.reduce((s, x) => s + x.count, 0) || 1
                const pct = Math.round((p.count / total) * 100)
                const colors = {
                  studio: 'bg-purple-500',
                  pro: 'bg-accent-500',
                  free: 'bg-surface-600',
                }
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-surface-300 capitalize">{p.plan}</span>
                      <span className="text-surface-400">{p.count} users ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[p.plan] || 'bg-surface-500'} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Actions Tab ── */}
      {tab === 'actions' && (
        <div className="space-y-6">
          {/* Reset Demo Workspace */}
          <div className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">🔄 Reset Demo Workspace</h3>
            <p className="text-sm text-surface-400 mb-4">
              Re-seed demo data for a specific user. Clears their existing data and populates with fresh sample data.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="User ID"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-surface-200 text-sm w-40 focus:outline-none focus:border-accent-500 transition-colors"
              />
              <button
                onClick={handleSeedDemo}
                disabled={seedLoading}
                className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
              >
                {seedLoading ? 'Seeding...' : 'Seed Demo Data'}
              </button>
            </div>
            {seedMsg && (
              <p className={`mt-3 text-sm ${seedMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {seedMsg.text}
              </p>
            )}
          </div>

          {/* Seed All Demo Data */}
          <div className="glass p-6">
            <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">🌟 Seed All Demo Data</h3>
            <p className="text-sm text-surface-400 mb-4">
              Reset the public demo account (demo@creatorbloom.app) with fresh sample data. This is the same endpoint
              used by the "Try Demo Workspace" button on the landing page.
            </p>
            <button
              onClick={handleSeedAll}
              disabled={seedAllLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
            >
              {seedAllLoading ? 'Resetting...' : '👋 Reset Public Demo'}
            </button>
            {seedAllMsg && (
              <p className={`mt-3 text-sm ${seedAllMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {seedAllMsg.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
