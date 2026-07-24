import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import AIPanel from './AIPanel.jsx'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e']

// ── Icon components ──────────────────────────────────────

function IconMail({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconDollar({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconPackage({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconChart({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconZap({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconChevronDown({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconRefresh({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

const iconComponents = {
  mail: IconMail,
  dollar: IconDollar,
  package: IconPackage,
  chart: IconChart,
  zap: IconZap,
}

// ── Color maps for insight types ──────────────────────────

const insightColors = {
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400', dot: 'bg-amber-400' },
  alert: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'text-red-400', dot: 'bg-red-400' },
  trend: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400', dot: 'bg-blue-400' },
  opportunity: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400', dot: 'bg-emerald-400' },
}

const insightEmoji = {
  warning: '⚠️',
  alert: '🔔',
  trend: '📊',
  opportunity: '💡',
}

// ── Skeleton components ───────────────────────────────────

function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-surface-700/50 rounded w-20 mb-3" />
      <div className="h-8 bg-surface-700/50 rounded w-28 mb-2" />
      <div className="h-3 bg-surface-700/50 rounded w-16" />
    </div>
  )
}

function SkeletonInsight() {
  return (
    <div className="glass p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-700/50 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-surface-700/50 rounded w-3/4" />
          <div className="h-3 bg-surface-700/50 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard Component ──────────────────────────────

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [youtubeStatus, setYoutubeStatus] = useState(null)
  const [metaStatus, setMetaStatus] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [dismissDemo, setDismissDemo] = useState(false)

  const isDemoUser = user?.email?.includes('demo')

  useEffect(() => {
    api.youtube.status().then(setYoutubeStatus).catch(() => {})
    api.meta.status().then(setMetaStatus).catch(() => {})
  }, [])

  const fetchAll = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.dashboard(),
      api.trend(),
      api.insights().catch(e => {
        console.error('Insights fetch failed:', e)
        return null
      }),
    ])
      .then(([d, t, i]) => {
        setData(d)
        setTrend(t)
        setInsights(i)
        setLoading(false)
      })
      .catch(e => {
        console.error('Dashboard fetch error:', e)
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => { fetchAll() }, [])

  // ── Loading state ─────────────────────────────────────

  if (loading) {
    return (
      <div className="page-enter space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-700/50 rounded w-64 mb-2" />
          <div className="h-4 bg-surface-700/50 rounded w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonInsight />
          <SkeletonInsight />
          <SkeletonInsight />
          <SkeletonInsight />
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────

  if (error && !data) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20">
        <div className="glass p-8 max-w-md text-center">
          <p className="text-4xl mb-4">😕</p>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Something went wrong</h3>
          <p className="text-surface-400 text-sm mb-6">Could not load your dashboard data.</p>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-400 transition-colors"
          >
            <IconRefresh className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────

  if (!data || (data.monthly_revenue === 0 && data.pipeline.prospecting === 0 &&
    data.pipeline.negotiating === 0 && data.pipeline.confirmed === 0 && data.pipeline.completed === 0)) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20">
        <div className="glass p-8 max-w-md text-center">
          <p className="text-4xl mb-4">🚀</p>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Your Smart Home Screen awaits</h3>
          <p className="text-surface-400 text-sm mb-6">
            Connect your first sponsorship to see AI-powered insights, revenue forecasts, and personalized recommendations.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('sponsorships')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-400 transition-colors"
          >
            <IconZap className="w-4 h-4" /> Add your first sponsorship
          </button>
        </div>
      </div>
    )
  }

  // ── Data extraction ───────────────────────────────────

  const { monthly_revenue, active_sponsors, affiliate_revenue, product_sales, revenue_breakdown, pipeline, recent_activity } = data
  const hasInsights = insights && insights.insights && insights.insights.length > 0

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="page-enter space-y-8">
      {/* ═══ Demo Banner ═══ */}
      {isDemoUser && !dismissDemo && (
        <div className="glass p-4 border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="text-sm font-medium text-amber-300">Welcome! This is a pre-loaded demo workspace.</p>
              <p className="text-xs text-surface-400 mt-0.5">All data is sample data. Explore the features and see how CreatorBloom works for your business.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                localStorage.removeItem('token')
                window.location.reload()
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-800 text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-colors"
            >
              Start fresh
            </button>
            <button
              onClick={() => setDismissDemo(true)}
              className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-500 hover:text-surface-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Hero Section ═══ */}
      <div id="sales-tour-dashboard-hero" className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">
            👋 {insights?.greeting || `Good morning, ${user?.name || 'there'}`}
          </h2>
          <p className="text-surface-400 mt-1">
            {hasInsights
              ? "Here's what's happening with your creator business today."
              : "Here's how your revenue streams are performing today."}
          </p>
        </div>
        <button
          id="sales-tour-ai-button"
          onClick={() => setShowAI(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500/10 text-accent-400 text-sm font-medium hover:bg-accent-500/20 transition-all border border-accent-500/20"
        >
          <span>✨</span> AI Assistant
        </button>
      </div>

      {/* ═══ Revenue Snapshot Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroStatCard
          label="Revenue This Month"
          value={`${monthly_revenue.toLocaleString()}`}
          trend="+12.5%"
          positive
          color="accent"
          icon={<IconDollar className="w-5 h-5" />}
        />
        <HeroStatCard
          label="Pipeline Potential"
          value={`${(insights?.pipelinePotential || 0).toLocaleString()}`}
          trend={`${active_sponsors} active`}
          positive
          color="emerald"
          icon={<IconChart className="w-5 h-5" />}
          onClick={() => onNavigate && onNavigate('sponsorships')}
        />
        <HeroStatCard
          label="Affiliate Revenue"
          value={`${affiliate_revenue.toLocaleString()}`}
          trend="+8.2%"
          positive
          color="amber"
          icon={<IconMail className="w-5 h-5" />}
        />
        <HeroStatCard
          label={insights?.followUpsDue > 0 ? 'Follow-ups Due' : 'Product Sales'}
          value={insights?.followUpsDue > 0 ? String(insights.followUpsDue) : `${product_sales.toLocaleString()}`}
          trend={insights?.followUpsDue > 0 ? 'Action needed' : '-3.1%'}
          positive={insights?.followUpsDue > 0 ? false : false}
          color={insights?.followUpsDue > 0 ? 'rose' : 'rose'}
          icon={<IconZap className="w-5 h-5" />}
          onClick={insights?.followUpsDue > 0 ? () => onNavigate && onNavigate('sponsorships') : undefined}
        />
      </div>

      {/* YouTube integration card */}
      {youtubeStatus && youtubeStatus.connected && (
        <div className="glass p-5 flex items-center gap-4 border-l-3 border-l-red-500">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/><polygon fill="#1e293b" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-400">YouTube Channel</p>
            <p className="font-display text-xl font-bold text-surface-50">{youtubeStatus.channel?.title || 'Connected'}</p>
            <p className="text-xs text-surface-400 mt-0.5">
              {(youtubeStatus.channel?.subscriberCount || 0).toLocaleString()} subscribers
            </p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = '#youtube' }} className="text-xs text-accent-400 hover:text-accent-300 whitespace-nowrap">View analytics →</a>
        </div>
      )}

      {/* Meta integration card */}
      {metaStatus && metaStatus.connected && (
        <div className="glass p-5 flex items-center gap-4 border-l-3 border-l-purple-500">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-rose-500/20 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="8.5" cy="12" r="2.5"/>
              <path d="M16 9a4 4 0 0 0-4 4v4"/>
              <path d="M16 15a2 2 0 1 0 0-4"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-400">Instagram &amp; Facebook</p>
            <p className="font-display text-xl font-bold text-surface-50">
              {metaStatus.instagram ? `@${metaStatus.instagram.username}` : metaStatus.facebook?.name || 'Connected'}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {metaStatus.instagram ? `${(metaStatus.instagram.followerCount || 0).toLocaleString()} followers` : 'Connected'}
            </p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('meta') }} className="text-xs text-accent-400 hover:text-accent-300 whitespace-nowrap">View analytics →</a>
        </div>
      )}

      {/* ═══ AI Insights Feed ═══ */}
      {hasInsights && (
        <section>
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
            <span>✨</span> Smart Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.insights.map((item, i) => (
              <InsightCard
                key={i}
                type={item.type}
                message={item.message}
                action={item.action}
                onAction={() => {
                  const routeMap = {
                    warning: 'pricing',
                    alert: 'sponsorships',
                    trend: 'affiliates',
                    opportunity: 'products',
                  }
                  onNavigate && onNavigate(routeMap[item.type] || 'sponsorships')
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══ Revenue Forecast ═══ */}
      {insights?.forecast && (
        <section id="sales-tour-forecast">
          <div className="glass p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="relative">
              <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">📈 Revenue Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-surface-400 mb-1">Projected next month</p>
                  <p className="font-display text-3xl font-bold text-surface-50">
                    ${insights.forecast.nextMonth?.toLocaleString() || monthly_revenue.toLocaleString()}
                  </p>
                  {insights.forecast.potentialIncrease > 0 && (
                    <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">
                      <span>↑</span> Up to {insights.forecast.potentialIncrease}% more possible
                    </p>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  {insights.forecast.potentialIncrease > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">Current projection</span>
                        <span className="text-surface-200 font-medium">${monthly_revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, 100 - insights.forecast.potentialIncrease)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">With one more deal</span>
                        <span className="text-emerald-400 font-medium">
                          ${(insights.forecast.nextMonth || monthly_revenue).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '100%' }} />
                      </div>
                      <p className="text-xs text-surface-500 mt-2">
                        💡 {insights.forecast.increaseAction || 'Closing just one more sponsorship'} would boost your revenue significantly.
                      </p>
                    </div>
                  )}
                  {insights.forecast.potentialIncrease === 0 && (
                    <p className="text-sm text-surface-400">
                      Keep building your pipeline — insights will become more personalized as you add more deals.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Quick Actions ═══ */}
      {insights?.quickActions && insights.quickActions.length > 0 && (
        <section>
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">⚡ Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {insights.quickActions.map((action, i) => {
              const IconComp = iconComponents[action.icon] || IconZap
              return (
                <button
                  key={i}
                  onClick={() => onNavigate && onNavigate(action.route.replace('/', ''))}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-200 text-sm font-medium hover:bg-surface-700/50 hover:border-surface-600/50 transition-all"
                >
                  <IconComp className="w-4 h-4 text-accent-400" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ Detailed Analytics (collapsible) ═══ */}
      <section>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 w-full text-left text-surface-400 hover:text-surface-200 transition-colors mb-4"
        >
          <IconChevronDown className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          <span className="font-display text-lg font-semibold text-surface-100">Detailed Analytics</span>
          <span className="text-xs text-surface-500 ml-2">charts &amp; breakdowns</span>
        </button>

        {showDetails && (
          <div className="space-y-6 page-enter">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Monthly Revenue" value={`$${monthly_revenue.toLocaleString()}`} change="+12.5%" positive color="accent" />
              <StatCard label="Active Sponsors" value={String(active_sponsors)} change="+2 this month" positive color="emerald" />
              <StatCard label="Affiliate Rev" value={`$${affiliate_revenue.toLocaleString()}`} change="+8.2%" positive color="amber" />
              <StatCard label="Product Sales" value={`$${product_sales.toLocaleString()}`} change="-3.1%" positive={false} color="rose" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend */}
              <div className="lg:col-span-2 glass p-6">
                <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorSponsor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                      formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
                    />
                    <Area type="monotone" dataKey="sponsorships" stroke="#6366f1" fill="url(#colorSponsor)" strokeWidth={2} />
                    <Area type="monotone" dataKey="affiliates" stroke="#f59e0b" fill="url(#colorAff)" strokeWidth={2} />
                    <Area type="monotone" dataKey="products" stroke="#10b981" fill="url(#colorProd)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Breakdown Donut */}
              <div className="glass p-6 flex flex-col items-center">
                <h3 className="font-display text-lg font-semibold text-surface-100 mb-2 w-full">Revenue Mix</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData(revenue_breakdown)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData(revenue_breakdown).map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                      formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-1">
                  {pieData(revenue_breakdown).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-surface-400">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pipeline + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass p-6">
                <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Sponsorship Pipeline</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pipeData(pipeline)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                      formatter={(v) => [`${v} deals`, undefined]}
                    />
                    <Bar dataKey="deals" radius={[6, 6, 0, 0]}>
                      {pipeData(pipeline).map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass p-6">
                <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recent_activity.map((item, i) => (
                    <ActivityItem key={i} action={item.action} detail={`${item.brand} — $${item.amount.toLocaleString()}`} time="Recently" />
                  ))}
                  {recent_activity.length === 0 && (
                    <ActivityItem action="No activity yet" detail="Start tracking your deals" time="" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <AIPanel show={showAI} onClose={() => setShowAI(false)} />
    </div>
  )
}

// ── Hero Stat Card ───────────────────────────────────────

function HeroStatCard({ label, value, trend, positive, color, icon, onClick }) {
  const glowMap = {
    accent: 'shadow-accent-500/20',
    emerald: 'shadow-emerald-500/20',
    amber: 'shadow-amber-500/20',
    rose: 'shadow-rose-500/20',
  }
  const iconColorMap = {
    accent: 'text-accent-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-surface-400">{label}</p>
        <span className={iconColorMap[color] || 'text-accent-400'}>{icon}</span>
      </div>
      <p className="font-display text-3xl font-bold text-surface-50">{value}</p>
      <p className={`text-xs mt-2 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {positive ? '↑' : color === 'rose' && trend.includes('Action') ? '⚠' : '↓'} {trend}
      </p>
    </>
  )

  const classes = `glass glass-hover p-5 ${glowMap[color] || ''} ${onClick ? 'cursor-pointer' : ''}`

  return onClick ? (
    <button onClick={onClick} className={`${classes} text-left w-full`}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  )
}

// ── Insight Card ─────────────────────────────────────────

function InsightCard({ type, message, action, onAction }) {
  const colors = insightColors[type] || insightColors.opportunity
  const emoji = insightEmoji[type] || '💡'

  return (
    <div className={`glass glass-hover p-4 border ${colors.border} group transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 text-lg`}>
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-surface-200 leading-relaxed">{message}</p>
          {action && (
            <button
              onClick={onAction}
              className={`mt-2.5 text-xs font-medium px-3 py-1.5 rounded-lg ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
            >
              {action} →
            </button>
          )}
        </div>
        <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
      </div>
    </div>
  )
}

// ── Legacy Stat Card (for detailed analytics) ────────────

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
      <p className={`text-xs mt-1.5 ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {positive ? '↑' : '↓'} {change}
      </p>
    </div>
  )
}

function ActivityItem({ action, detail, time }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-2 h-2 rounded-full bg-accent-400 mt-1.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-surface-200">{action}</p>
        <p className="text-surface-500 text-xs">{detail}</p>
      </div>
      <span className="text-surface-600 text-xs shrink-0">{time}</span>
    </div>
  )
}

// ── Data helpers ─────────────────────────────────────────

function pieData(breakdown) {
  return [
    { name: 'Sponsorships', value: breakdown.sponsorships },
    { name: 'Affiliates', value: breakdown.affiliates },
    { name: 'Products', value: breakdown.products },
    { name: 'Consulting', value: breakdown.consulting },
  ].filter(d => d.value > 0)
}

function pipeData(pipeline) {
  return Object.entries(pipeline).map(([key, count]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    deals: count,
  }))
}
