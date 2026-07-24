import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'
import { useToast } from '../ToastContext.jsx'
import { useAuth } from '../AuthContext.jsx'

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '$0'
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatMinutes(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    return `${h}h ${m}m`
  }
  return `${Math.round(min)}m`
}

export default function YouTubeIntegration() {
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const toast = useToast()
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        api.youtube.status(),
        api.youtube.stats(),
      ])
      setStatus(statusRes)
      setStats(statsRes)
    } catch (e) {
      console.error('YouTube fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `/api/integrations/youtube/auth?userId=${user.id}`
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your YouTube channel from CreatorBloom?')) return
    try {
      await api.youtube.disconnect()
      setStatus({ connected: false, channel: null, configured: status?.configured })
      setStats(null)
      toast?.show?.({ message: 'YouTube disconnected', type: 'success' }) ||
        console.log('YouTube disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect', type: 'error' }) ||
        alert('Failed to disconnect')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    api.youtube.clearCache?.().finally(() => fetchData())
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
          <h2 className="font-display text-3xl font-bold text-surface-50">YouTube Integration</h2>
          <p className="text-surface-400 mt-1">Connect your YouTube channel to track analytics directly in CreatorBloom.</p>
        </div>
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Google API Not Configured</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Set <code className="text-accent-400 bg-surface-800 px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="text-accent-400 bg-surface-800 px-1 rounded">GOOGLE_CLIENT_SECRET</code> in your server environment to enable YouTube integration.
          </p>
        </div>

        {/* Always show mock stats for demo/development */}
        {stats && (
          <YouTubeStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Not connected state
  if (status && !status.connected) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">YouTube Integration</h2>
          <p className="text-surface-400 mt-1">Connect your YouTube channel to track analytics directly in CreatorBloom.</p>
        </div>

        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/><polygon fill="#1e293b" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Connect Your YouTube Channel</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Link your YouTube account to see channel analytics, top videos, and revenue estimates — all inside CreatorBloom.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/><polygon fill="#1e293b" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            )}
            {connecting ? 'Connecting...' : 'Connect YouTube'}
          </button>
        </div>

        {/* Show mock data for preview even when not connected */}
        {stats && (
          <YouTubeStatsDashboard stats={stats} onRefresh={handleRefresh} />
        )}
      </div>
    )
  }

  // Connected state
  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">YouTube Analytics</h2>
          <p className="text-surface-400 mt-1">Your channel performance at a glance.</p>
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

      {/* Channel Header */}
      {status.channel && (
        <div className="glass p-5 flex items-center gap-4">
          {status.channel.thumbnail && (
            <img src={status.channel.thumbnail} alt="" className="w-14 h-14 rounded-full ring-2 ring-surface-700" />
          )}
          <div>
            <h3 className="text-xl font-semibold text-surface-100">{status.channel.title}</h3>
            <p className="text-sm text-surface-400">
              {formatNumber(status.channel.subscriberCount)} subscribers
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
        <YouTubeStatsDashboard stats={stats} onRefresh={handleRefresh} />
      )}
    </div>
  )
}

function YouTubeStatsDashboard({ stats, onRefresh }) {
  const { channel, stats: periodStats, topVideos } = stats

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Subscribers"
          value={channel?.subscriberCount ? formatNumber(channel.subscriberCount) : '—'}
          change={periodStats?.subscriberChange != null ? `${periodStats.subscriberChange >= 0 ? '+' : ''}${formatNumber(periodStats.subscriberChange)} this month` : ''}
          positive={periodStats?.subscriberChange >= 0}
          color="accent"
        />
        <StatCard
          label="30-Day Views"
          value={periodStats?.views ? formatNumber(periodStats.views) : '—'}
          change="Last 30 days"
          positive
          color="emerald"
        />
        <StatCard
          label="Watch Time"
          value={periodStats?.watchTimeMinutes ? formatMinutes(periodStats.watchTimeMinutes) : '—'}
          change="Last 30 days"
          positive
          color="amber"
        />
        <StatCard
          label="Est. Revenue"
          value={periodStats?.estimatedRevenue ? formatCurrency(periodStats.estimatedRevenue) : '—'}
          change="YouTube Partner + sponsors"
          positive
          color="rose"
        />
      </div>

      {/* Top videos */}
      {topVideos && topVideos.length > 0 && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Top 10 Videos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 border-b border-surface-700/50">
                  <th className="pb-3 font-medium w-8">#</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium text-right">Views</th>
                  <th className="pb-3 font-medium text-right">Likes</th>
                  <th className="pb-3 font-medium text-right">Comments</th>
                </tr>
              </thead>
              <tbody>
                {topVideos.map((video, i) => (
                  <tr key={i} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 text-surface-500">{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {video.thumbnail && (
                          <img src={video.thumbnail} alt="" className="w-10 h-7 rounded object-cover" />
                        )}
                        <span className="text-surface-200 truncate max-w-[300px]">{video.title}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.views)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.likes)}</td>
                    <td className="py-3 text-right text-surface-300">{formatNumber(video.comments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
