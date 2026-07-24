import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'
import { useToast } from '../ToastContext.jsx'
import { useAuth } from '../AuthContext.jsx'

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function formatPercent(n) {
  if (n == null || isNaN(n)) return '—'
  return n.toFixed(1) + '%'
}

export default function MetaIntegration() {
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const toast = useToast()
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        api.meta.status(),
        api.meta.stats(),
      ])
      setStatus(statusRes)
      setStats(statsRes)
    } catch (e) {
      console.error('Meta fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `/api/integrations/meta/auth?userId=${user.id}`
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Instagram & Facebook accounts from CreatorBloom?')) return
    try {
      await api.meta.disconnect()
      setStatus({ connected: false, instagram: null, facebook: null, configured: status?.configured })
      setStats(null)
      toast?.show?.({ message: 'Instagram & Facebook disconnected. Your data is safe — reconnect anytime. 👋', type: 'success' }) ||
        console.log('Meta disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect', type: 'error' }) ||
        alert('Failed to disconnect')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    api.meta.clearCache?.().finally(() => fetchData())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not configured state
  if (status && !status.configured) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Meta Integration</h2>
          <p className="text-surface-400 mt-1">Connect Instagram &amp; Facebook to track your social media analytics in CreatorBloom.</p>
        </div>
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Meta API Not Configured</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Set <code className="text-accent-400 bg-surface-800 px-1 rounded">META_APP_ID</code> and <code className="text-accent-400 bg-surface-800 px-1 rounded">META_APP_SECRET</code> in your server environment to enable Meta integration.
          </p>
        </div>

        {/* Always show mock stats for demo/development */}
        {stats && (
          <MetaStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Not connected state
  if (status && !status.connected) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Meta Integration</h2>
          <p className="text-surface-400 mt-1">Connect Instagram &amp; Facebook to track your social media analytics in CreatorBloom.</p>
        </div>

        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-rose-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#metaGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs><linearGradient id="metaGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="8.5" cy="12" r="2.5"/>
              <path d="M16 9a4 4 0 0 0-4 4v4"/>
              <path d="M16 15a2 2 0 1 0 0-4"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Connect Instagram &amp; Facebook</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Connect Instagram &amp; Facebook to unlock audience insights, engagement data, and post performance — all inside CreatorBloom. Your audience story, told by data. 📸
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="8.5" cy="12" r="2.5" fill="#1e293b"/>
                <path d="M16 9a4 4 0 0 0-4 4v4" fill="none" stroke="#1e293b" strokeWidth="2"/>
                <path d="M16 15a2 2 0 1 0 0-4" fill="#1e293b"/>
              </svg>
            )}
            {connecting ? 'Connecting...' : 'Connect Instagram & Facebook'}
          </button>
        </div>

        {/* Show mock data for preview even when not connected */}
        {stats && (
          <MetaStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Connected state
  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Meta Analytics</h2>
          <p className="text-surface-400 mt-1">Instagram &amp; Facebook performance at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Connected accounts header */}
      <div className="flex gap-4 flex-wrap">
        {status.instagram && (
          <div className="glass p-5 flex items-center gap-4 flex-1 min-w-[250px]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="#1e293b"/>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-surface-100">@{status.instagram.username}</h4>
              <p className="text-xs text-surface-400">{formatNumber(status.instagram.followerCount)} followers</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Connected
              </span>
            </div>
          </div>
        )}
        {status.facebook && (
          <div className="glass p-5 flex items-center gap-4 flex-1 min-w-[250px]">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-surface-100">{status.facebook.name}</h4>
              <p className="text-xs text-surface-400">Facebook Page</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                Connected
              </span>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <MetaStatsDashboard stats={stats} onRefresh={handleRefresh} />
      )}
    </div>
  )
}

function MetaStatsDashboard({ stats, onRefresh }) {
  const { instagram, facebook, recentPosts, audience } = stats

  return (
    <>
      {/* Stat cards — Instagram + Facebook side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Instagram card */}
        {instagram && (
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-surface-100">Instagram</h3>
              <span className="text-xs text-surface-400 ml-auto">Last 30 days</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Followers" value={formatNumber(instagram.followerCount)} color="purple" />
              <MiniStat label="Engagement Rate" value={formatPercent(instagram.engagementRate)} color="rose" />
              <MiniStat label="Reach" value={formatNumber(instagram.reach)} color="emerald" />
              <MiniStat label="Impressions" value={formatNumber(instagram.impressions)} color="amber" />
            </div>
          </div>
        )}

        {/* Facebook card */}
        {facebook && (
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-surface-100">Facebook</h3>
              <span className="text-xs text-surface-400 ml-auto">Last 30 days</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Page Followers" value={formatNumber(facebook.followerCount)} color="blue" />
              <MiniStat label="Engagement" value={formatNumber(facebook.engagement)} color="emerald" />
              <MiniStat label="Reach" value={formatNumber(facebook.reach)} color="amber" />
              <MiniStat label="Page" value={facebook.pageName || '—'} color="surface" small />
            </div>
          </div>
        )}
      </div>

      {/* Recent posts */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Instagram Posts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-700/50">
                  <th className="pb-3 font-medium w-8">#</th>
                  <th className="pb-3 font-medium">Caption</th>
                  <th className="pb-3 font-medium text-right">Likes</th>
                  <th className="pb-3 font-medium text-right">Comments</th>
                  <th className="pb-3 font-medium text-right">Impressions</th>
                  <th className="pb-3 font-medium text-right">Posted</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post, i) => (
                  <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 text-surface-500">{i + 1}</td>
                    <td className="py-3">
                      <span className="text-surface-200 truncate max-w-[280px] inline-block">{post.caption}</span>
                    </td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(post.likes)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(post.comments)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(post.impressions)}</td>
                    <td className="py-3 text-right text-surface-500 text-xs">{post.postedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audience demographics */}
      {audience && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Audience Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age */}
            <div>
              <h4 className="text-sm font-medium text-surface-400 mb-3">Age Distribution</h4>
              <div className="space-y-2">
                {Object.entries(audience.age || {}).map(([range, pct]) => (
                  <div key={range}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-surface-400">{range}</span>
                      <span className="text-surface-300">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <h4 className="text-sm font-medium text-surface-400 mb-3">Gender</h4>
              <div className="space-y-2">
                {Object.entries(audience.gender || {}).map(([g, pct]) => (
                  <div key={g}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-surface-400 capitalize">{g}</span>
                      <span className="text-surface-300">{pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g === 'female' ? 'bg-rose-500' : g === 'male' ? 'bg-blue-500' : 'bg-purple-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            <div>
              <h4 className="text-sm font-medium text-surface-400 mb-3">Top Cities</h4>
              <ul className="space-y-2">
                {(audience.topCities || []).map((city, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-surface-500 w-5">{i + 1}.</span>
                    <span className="text-surface-200">{city}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MiniStat({ label, value, color, small }) {
  const colorMap = {
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    surface: 'text-surface-300',
  }
  return (
    <div>
      <p className="text-xs text-surface-500">{label}</p>
      <p className={`font-display ${small ? 'text-lg' : 'text-2xl'} font-bold text-surface-50 mt-0.5`}>{value}</p>
    </div>
  )
}
