import { useState, useEffect, useCallback } from 'react'
import { api } from '../api.js'
import { useToast } from '../ToastContext.jsx'
import { useAuth } from '../AuthContext.jsx'

const CATEGORY_LABELS = {
  brand_deal: 'Brand Deal',
  affiliate: 'Affiliate',
  ugc_request: 'UGC Request',
  gifted: 'Gifted',
  other: 'Other',
}

const CATEGORY_COLORS = {
  brand_deal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  affiliate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ugc_request: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  gifted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  other: 'bg-surface-600/10 text-surface-400 border-surface-500/20',
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return d.toLocaleDateString()
}

function getConfidenceColor(score) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-surface-500'
}

export default function GmailIntegration() {
  const [status, setStatus] = useState(null)
  const [emails, setEmails] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [addingToPipeline, setAddingToPipeline] = useState(null)
  const toast = useToast()
  const { user } = useAuth()

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, emailsRes, statsRes] = await Promise.all([
        api.gmail.status(),
        api.gmail.sponsorships(),
        api.gmail.stats(),
      ])
      setStatus(statusRes)
      setEmails(emailsRes)
      setStats(statsRes)
    } catch (e) {
      console.error('Gmail fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `/api/integrations/gmail/auth?userId=${user.id}`
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Gmail account from CreatorBloom?')) return
    try {
      await api.gmail.disconnect()
      setStatus({ connected: false, email: null, configured: status?.configured })
      setEmails(null)
      setStats(null)
      toast?.show?.({ message: 'Gmail disconnected', type: 'success' }) ||
        console.log('Gmail disconnected')
    } catch (e) {
      toast?.show?.({ message: 'Failed to disconnect', type: 'error' }) ||
        alert('Failed to disconnect')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    api.gmail.clearCache?.().finally(() => fetchData())
  }

  const handleAddToPipeline = async (email) => {
    setAddingToPipeline(email.id)
    try {
      await api.sponsorships.create({
        brand: email.fromName || email.from,
        amount: 0,
        status: 'prospecting',
        notes: `From Gmail: ${email.subject}\n\n${email.snippet}\n\nContact: ${email.from}`,
      })
      toast?.show?.({ message: `"${email.fromName || email.from}" added to pipeline`, type: 'success' }) ||
        alert('Added to sponsorship pipeline!')
    } catch (e) {
      toast?.show?.({ message: 'Failed to add to pipeline', type: 'error' }) ||
        alert('Failed to add to pipeline')
    } finally {
      setAddingToPipeline(null)
    }
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
          <h2 className="font-display text-3xl font-bold text-surface-50">Gmail Integration</h2>
          <p className="text-surface-400 mt-1">Connect your Gmail to automatically detect sponsorship inquiries and brand deals in your inbox.</p>
        </div>
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polyline points="3,6 12,14 21,6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Gmail API Not Configured</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto">
            Set <code className="text-accent-400 bg-surface-800 px-1 rounded">GOOGLE_GMAIL_CLIENT_ID</code> and <code className="text-accent-400 bg-surface-800 px-1 rounded">GOOGLE_GMAIL_CLIENT_SECRET</code> in your server environment to enable Gmail integration.
          </p>
        </div>

        {/* Always show mock data for demo/development */}
        {emails && emails.length > 0 && (
          <SponsorshipInbox emails={emails} stats={stats} onRefresh={handleRefresh} onAddToPipeline={handleAddToPipeline} addingToPipeline={addingToPipeline} />
        )}
      </div>
    )
  }

  // Not connected state
  if (status && !status.connected) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Gmail Integration</h2>
          <p className="text-surface-400 mt-1">Connect your Gmail to automatically detect sponsorship inquiries and brand deals in your inbox.</p>
        </div>

        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-400/20 to-red-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">Connect Your Gmail</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Connect Gmail to automatically find sponsorship opportunities hiding in your inbox — categorized and ready for your pipeline.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            )}
            {connecting ? 'Connecting...' : 'Connect Gmail'}
          </button>
        </div>

        {/* Show mock data for preview even when not connected */}
        {emails && emails.length > 0 && (
          <SponsorshipInbox emails={emails} stats={stats} onRefresh={handleRefresh} onAddToPipeline={handleAddToPipeline} addingToPipeline={addingToPipeline} />
        )}
      </div>
    )
  }

  // Connected state
  return (
    <div className="page-enter space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">Gmail Sponsorship Inbox</h2>
          <p className="text-surface-400 mt-1">Sponsorship emails automatically detected from your inbox.</p>
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

      {/* Connected account header */}
      {status.email && (
        <div className="glass p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center ring-2 ring-surface-700 shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-surface-100">{status.email}</h3>
            <p className="text-sm text-surface-400">Scanning for sponsorship emails</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              Connected
            </span>
          </div>
        </div>
      )}

      {emails && emails.length > 0 && (
        <SponsorshipInbox emails={emails} stats={stats} onRefresh={handleRefresh} onAddToPipeline={handleAddToPipeline} addingToPipeline={addingToPipeline} />
      )}

      {emails && emails.length === 0 && (
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-800 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">No Sponsorship Emails Found</h3>
          <p className="text-surface-400 text-sm">We scanned your inbox from the last 30 days and didn't find any sponsorship-related emails. They'll appear here automatically when they arrive.</p>
        </div>
      )}
    </div>
  )
}

function SponsorshipInbox({ emails, stats, onRefresh, onAddToPipeline, addingToPipeline }) {
  // Filter to only meaningful emails (confidence >= 30)
  const meaningful = emails.filter(e => e.confidence >= 30)

  return (
    <>
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Inquiries"
            value={stats.totalSponsorshipEmails}
            change="Last 30 days"
            positive
            color="accent"
          />
          <StatCard
            label="Response Rate"
            value={`${stats.responseRate}%`}
            change="Of total inquiries"
            positive
            color="emerald"
          />
          <StatCard
            label="Brand Deals"
            value={stats.categoryBreakdown?.brand_deal || 0}
            change={`${stats.categoryBreakdown?.affiliate || 0} affiliate`}
            positive
            color="amber"
          />
          <StatCard
            label="UGC Requests"
            value={stats.categoryBreakdown?.ugc_request || 0}
            change={`${stats.categoryBreakdown?.gifted || 0} gifted`}
            positive
            color="rose"
          />
        </div>
      )}

      {/* Monthly trend */}
      {stats?.monthlyTrend && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Monthly Sponsorship Trend</h3>
          <div className="flex items-end gap-3 h-32">
            {stats.monthlyTrend.map((item, i) => {
              const maxVal = Math.max(...stats.monthlyTrend.map(m => m.count), 1)
              const height = (item.count / maxVal) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-surface-400 font-medium">{item.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-accent-500/60 to-accent-400/30 transition-all"
                    style={{ height: `${height}%`, minWidth: '24px' }}
                  />
                  <span className="text-[10px] text-surface-500 mt-1">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {stats?.categoryBreakdown && (
        <div className="glass p-6">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="text-center p-3 rounded-xl bg-surface-800/30">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[cat] || CATEGORY_COLORS.other}`}>
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                <p className="font-display text-2xl font-bold text-surface-100 mt-2">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email table */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-surface-100">Sponsorship Emails</h3>
          <span className="text-xs text-surface-500">{meaningful.length} detected</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-500 border-b border-surface-700/50">
                <th className="pb-3 font-medium">From</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Confidence</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {meaningful.map((email) => (
                <tr key={email.id} className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors">
                  <td className="py-3">
                    <div>
                      <p className="text-surface-200 font-medium">{email.fromName}</p>
                      <p className="text-surface-500 text-xs">{email.from}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="max-w-[280px]">
                      <p className="text-surface-200 truncate">{email.subject}</p>
                      <p className="text-surface-500 text-xs truncate mt-0.5">{email.snippet}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[email.category] || CATEGORY_COLORS.other}`}>
                      {CATEGORY_LABELS[email.category] || email.category}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-mono text-xs font-semibold ${getConfidenceColor(email.confidence)}`}>
                      {email.confidence}%
                    </span>
                  </td>
                  <td className="py-3 text-surface-500 text-xs">
                    {formatDate(email.date)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onAddToPipeline(email)}
                      disabled={addingToPipeline === email.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-600/15 text-accent-400 text-xs font-medium hover:bg-accent-600/25 transition-colors border border-accent-500/20 disabled:opacity-50"
                    >
                      {addingToPipeline === email.id ? (
                        <div className="w-3 h-3 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                      Pipeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
