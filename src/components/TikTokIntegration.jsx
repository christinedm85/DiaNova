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

export default function TikTokIntegration() {
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const toast = useToast()
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        api.tiktok.status(),
        api.tiktok.stats(),
      ])
      setStatus(statusRes)
      setStats(statsRes)
    } catch (e) {
      console.error('TikTok fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `/api/integrations/tiktok/auth?userId=${user.id}`
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your TikTok account from CreatorBloom?')) return
    try {
      await api.tiktok.disconnect()
      setStatus({ connected: false, creator: null, configured: status?.configured })
      setStats(null)
      toast?.show?.({ message: 'TikTok disconnected', type: 'success' }) ||
        console.log('TikTok disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect', type: 'error' }) ||
        alert('Failed to disconnect')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    api.tiktok.clearCache?.().finally(() => fetchData())
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
          <h2 className="font-display text-3xl font-bold text-surface-50">TikTok Integration</h2>
          <p className="text-surface-400 mt-1">Connect your TikTok account to track analytics directly in CreatorBloom.</p>
        </div>
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">TikTok API Not Configured</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Set <code className="text-accent-400 bg-surface-800 px-1 rounded">TIKTOK_CLIENT_KEY</code> and <code className="text-accent-400 bg-surface-800 px-1 rounded">TIKTOK_CLIENT_SECRET</code> in your server environment to enable TikTok integration.
          </p>
        </div>

        {/* Always show mock stats for demo/development */}
        {stats && (
          <TikTokStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Not connected state
  if (status && !status.connected) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">TikTok Integration</h2>
          <p className="text-surface-400 mt-1">Connect your TikTok account to track analytics directly in CreatorBloom.</p>
        </div>

        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-pink-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Connect Your TikTok Account</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Connect TikTok to track video performance, creator analytics, and audience insights — all inside CreatorBloom.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            )}
            {connecting ? 'Connecting...' : 'Connect TikTok'}
          </button>
        </div>

        {/* Show mock data for preview even when not connected */}
        {stats && (
          <TikTokStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Connected state
  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">TikTok Analytics</h2>
          <p className="text-surface-400 mt-1">Your TikTok performance at a glance.</p>
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

      {/* Creator Header */}
      {status.creator && (
        <div className="glass p-5 flex items-center gap-4">
          {status.creator.avatar && (
            <img src={status.creator.avatar} alt="" className="w-14 h-14 rounded-full ring-2 ring-surface-700" />
          )}
          {!status.creator.avatar && (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center ring-2 ring-surface-700 shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-surface-100">
              {status.creator.displayName || status.creator.username}
            </h3>
            <p className="text-sm text-surface-400">
              @{status.creator.username} · {formatNumber(status.creator.followerCount)} followers
            </p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              Connected
            </span>
          </div>
        </div>
      )}

      {stats && (
        <TikTokStatsDashboard stats={stats} onRefresh={handleRefresh} />
      )}
    </div>
  )
}

function TikTokStatsDashboard({ stats, onRefresh }) {
  const { creator, stats: periodStats, recentVideos, audience } = stats

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Followers"
          value={creator?.followerCount ? formatNumber(creator.followerCount) : '—'}
          change={creator?.engagementRate ? `${formatPercent(creator.engagementRate)} engagement` : '—'}
          positive
          color="accent"
        />
        <StatCard
          label="30-Day Video Views"
          value={periodStats?.videoViews ? formatNumber(periodStats.videoViews) : '—'}
          change="Last 30 days"
          positive
          color="emerald"
        />
        <StatCard
          label="Engagement Rate"
          value={creator?.engagementRate ? formatPercent(creator.engagementRate) : '—'}
          change={periodStats?.likes ? `${formatNumber(periodStats.likes)} total likes` : '—'}
          positive
          color="amber"
        />
        <StatCard
          label="Total Likes"
          value={creator?.likesTotal ? formatNumber(creator.likesTotal) : '—'}
          change={periodStats?.comments ? `${formatNumber(periodStats.comments)} comments` : '—'}
          positive
          color="rose"
        />
      </div>

      {/* Recent videos */}
      {recentVideos && recentVideos.length > 0 && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Videos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-700/50">
                  <th className="pb-3 font-medium w-8">#</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium text-right">Views</th>
                  <th className="pb-3 font-medium text-right">Likes</th>
                  <th className="pb-3 font-medium text-right">Comments</th>
                  <th className="pb-3 font-medium text-right">Shares</th>
                </tr>
              </thead>
              <tbody>
                {recentVideos.map((video, i) => (
                  <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 text-surface-500">{i + 1}</td>
                    <td className="py-3">
                      <span className="text-surface-200 truncate max-w-[280px] inline-block">{video.title}</span>
                    </td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.views)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.likes)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.comments)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.shares)}</td>
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

            {/* Top Territories */}
            <div>
              <h4 className="text-sm font-medium text-surface-400 mb-3">Top Territories</h4>
              <ul className="space-y-2">
                {(audience.topTerritories || []).map((territory, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-surface-500 w-5">{i + 1}.</span>
                    <span className="text-surface-200">{territory}</span>
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

function StatCard({ label, value, change, positive, color }) {
  const glowMap = {
    accent: 'shadow-accent-500/20',
    emerald: 'shadow-emerald-500/20',
    amber: 'shadow-amber-500/20',
    rose: 'shadow-rose-500/20',
  }
  return (
    <div className={`glass glass-hover p-5 ${glowMap[color] || ''}`}>
      <p className="text-sm text-surface-400">{label}</p>
      <p className="font-display text-3xl font-bold text-surface-50 mt-1">{value}</p>
      {change && (
        <p className={`text-xs mt-1.5 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change}
        </p>
      )}
    </div>
  )
}
