import { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import AIPanel from './AIPanel.jsx'
import useCountUp from '../hooks/useCountUp.js'
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
  const [tiktokStatus, setTiktokStatus] = useState(null)
  const [monetizationStatus, setMonetizationStatus] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [dismissDemo, setDismissDemo] = useState(false)
  const [animateChart, setAnimateChart] = useState(false)
  const [animateProgress, setAnimateProgress] = useState(false)

  const isDemoUser = user?.email?.includes('demo')

  useEffect(() => {
    api.youtube.status().then(setYoutubeStatus).catch(() => {})
    api.meta.status().then(setMetaStatus).catch(() => {})
    api.tiktok.status().then(setTiktokStatus).catch(() => {})
    api.monetization.status().then(setMonetizationStatus).catch(() => {})
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
        // Trigger animations after a brief delay for initial render
        setTimeout(() => setAnimateProgress(true), 100)
        setTimeout(() => setAnimateChart(true), 200)
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
    const loadHour = new Date().getHours()
    const loadTimeOfDay = loadHour < 12 ? 'morning' : loadHour < 17 ? 'afternoon' : 'evening'
    return (
      <div className="page-enter space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-surface-50">
            {`Good ${loadTimeOfDay}, ${user?.name || 'there'} 🌸`}
          </h2>
          <p className="text-surface-400 mt-1">Calculating your worth... ✨</p>
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

  // ── Determine greeting & time of day ───────────────────

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const greeting = insights?.greeting || `Good ${timeOfDay}, ${user?.name || 'there'}`
  const greetingWithFlower = greeting.includes('🌸') ? greeting : `${greeting} 🌸`

  // ── Personalized second line ───────────────────────────
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const isFriday = dayOfWeek === 'Friday'
  const isLateNight = hour >= 22 || hour < 5

  const getPersonalizedSubtitle = () => {
    if (!hasInsights && !hasData) {
      return isLateNight
        ? "Burning the midnight oil? Let's build your creator empire. 🌙"
        : "Welcome to your command center. This is where $100K creators manage their business. No pressure. 😉"
    }
    if (isFriday) return "Happy Friday! Time to close those deals before the weekend. 🍾"
    if (isLateNight) return "Burning the midnight oil? Us too. Let's make it count. 🌙"
    if (insights?.forecast?.potentialIncrease > 0) {
      const pct = insights.forecast.potentialIncrease
      return `You're trending up ${pct}% this month. Keep that momentum! 🔥`
    }
    if (insights?.followUpsDue > 0) {
      return `${insights.followUpsDue} deals haven't moved. Time for a friendly nudge?`
    }
    return hasData
      ? "Here's how your creator business is doing today."
      : "Let's build your brand — one deal at a time."
  }

  // ── Derive stats from available data ───────────────────

  const hasData = data && !(data.monthly_revenue === 0 && data.pipeline.prospecting === 0 &&
    data.pipeline.negotiating === 0 && data.pipeline.confirmed === 0 && data.pipeline.completed === 0)

  const derivedStats = {
    engagementChange: hasData ? '+18%' : '—',
    revenueOpportunity: hasData
      ? `+${((insights?.pipelinePotential || 0) * 0.15).toLocaleString()}`
      : '—',
    brandMatches: hasData ? (insights?.insights?.length || 0) : '—',
    followUpsNeeded: hasData ? (insights?.followUpsDue || 0) : '—',
  }

  const todayMission = hasData && insights?.insights?.length > 0
    ? insights.insights[0]
    : { message: 'Connect your first social account to unlock personalized growth recommendations.', action: 'Connect Instagram or YouTube' }

  // ── Error state ───────────────────────────────────────

  if (error && !data && !loading) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20">
        <div className="glass p-8 max-w-md text-center">
          <p className="text-4xl mb-4">😕</p>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Something went sideways</h3>
          <p className="text-surface-400 text-sm mb-6">Could not load your dashboard data. Let's try that again.</p>
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

  // ── Data extraction ───────────────────────────────────

  const monthly_revenue = data?.monthly_revenue || 0
  const active_sponsors = data?.active_sponsors || 0
  const affiliate_revenue = data?.affiliate_revenue || 0
  const product_sales = data?.product_sales || 0
  const revenue_breakdown = data?.revenue_breakdown || { sponsorships: 0, affiliates: 0, products: 0, consulting: 0 }
  const pipeline = data?.pipeline || { prospecting: 0, negotiating: 0, confirmed: 0, completed: 0 }
  const recent_activity = data?.recent_activity || []
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
                {greetingWithFlower}
              </h2>
              <p className="text-surface-400 mt-1">
                {getPersonalizedSubtitle()}
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

          {/* ═══ Dashboard Hero Cards ═══ */}
          <DashboardHeroCards
            monthlyRevenue={monthly_revenue}
            forecast={insights?.forecast}
            insights={insights?.insights}
            hasInsights={hasInsights}
            hasData={hasData}
            onNavigate={onNavigate}
          />

          {/* ═══ Stats Row ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStatBadge
              label="Engagement"
              value={derivedStats.engagementChange}
              color="emerald"
              active={hasData}
            />
            <MiniStatBadge
              label="Revenue Opportunity"
              value={derivedStats.revenueOpportunity}
              color="accent"
              active={hasData}
            />
            <MiniStatBadge
              label="Brand Matches"
              value={derivedStats.brandMatches}
              color="amber"
              active={hasData}
            />
            <MiniStatBadge
              label="Follow-ups"
              value={derivedStats.followUpsNeeded}
              color="rose"
              active={hasData}
            />
          </div>

          {/* ═══ Today's Mission Card ═══ */}
          <div className="glass p-5 border border-accent-500/15 bg-gradient-to-r from-accent-500/5 to-emerald-500/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0 text-xl">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">🎯 Your Next Win</p>
                <p className="text-sm text-surface-200 leading-relaxed">
                  {todayMission.message || todayMission.text || 'Connect your first social account to unlock personalized growth recommendations.'}
                </p>
                {todayMission.action && hasData && (
                  <button
                    onClick={() => onNavigate && onNavigate('sponsorships')}
                    className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-500/15 text-accent-400 hover:bg-accent-500/25 transition-colors"
                  >
                    {todayMission.action} →
                  </button>
                )}
                {!hasData && (
                  <button
                    onClick={() => onNavigate && onNavigate('youtube')}
                    className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-500/15 text-accent-400 hover:bg-accent-500/25 transition-colors"
                  >
                    Connect Instagram or YouTube →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Revenue Snapshot Cards ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasData ? (
              <>
                <HeroStatCard
                  label="Revenue This Month"
                  value={`${monthly_revenue.toLocaleString()}`}
                  rawValue={monthly_revenue}
                  trend="+12.5%"
                  positive
                  color="accent"
                  icon={<IconDollar className="w-5 h-5" />}
                />
                <HeroStatCard
                  label="Pipeline Potential"
                  value={`${(insights?.pipelinePotential || 0).toLocaleString()}`}
                  rawValue={insights?.pipelinePotential || 0}
                  trend={`${active_sponsors} active`}
                  positive
                  color="emerald"
                  icon={<IconChart className="w-5 h-5" />}
                  onClick={() => onNavigate && onNavigate('sponsorships')}
                />
                <HeroStatCard
                  label="Affiliate Revenue"
                  value={`${affiliate_revenue.toLocaleString()}`}
                  rawValue={affiliate_revenue}
                  trend="+8.2%"
                  positive
                  color="amber"
                  icon={<IconMail className="w-5 h-5" />}
                />
                <HeroStatCard
                  label={insights?.followUpsDue > 0 ? 'Follow-ups Due' : 'Product Sales'}
                  value={insights?.followUpsDue > 0 ? String(insights.followUpsDue) : `${product_sales.toLocaleString()}`}
                  rawValue={insights?.followUpsDue > 0 ? insights.followUpsDue : product_sales}
                  trend={insights?.followUpsDue > 0 ? 'Action needed' : '-3.1%'}
                  positive={false}
                  color="rose"
                  icon={<IconZap className="w-5 h-5" />}
                  onClick={insights?.followUpsDue > 0 ? () => onNavigate && onNavigate('sponsorships') : undefined}
                />
              </>
            ) : (
              <>
                <PreviewStatCard label="Revenue This Month" icon={<IconDollar className="w-5 h-5" />} color="accent" />
                <PreviewStatCard label="Pipeline Potential" icon={<IconChart className="w-5 h-5" />} color="emerald" />
                <PreviewStatCard label="Affiliate Revenue" icon={<IconMail className="w-5 h-5" />} color="amber" />
                <PreviewStatCard label="Product Sales" icon={<IconZap className="w-5 h-5" />} color="rose" />
              </>
            )}
          </div>

      {/* YouTube integration card */}
      {youtubeStatus && youtubeStatus.connected && (
        <div className="glass card-lift p-5 flex items-center gap-4 border-l-3 border-l-red-500">
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
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('youtube') }} className="text-xs text-accent-400 hover:text-accent-300 whitespace-nowrap">See your stats →</a>
        </div>
      )}

      {/* Meta integration card */}
      {metaStatus && metaStatus.connected && (
        <div className="glass card-lift p-5 flex items-center gap-4 border-l-3 border-l-purple-500">
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

      {/* TikTok integration card */}
      {tiktokStatus && tiktokStatus.connected && (
        <div className="glass card-lift p-5 flex items-center gap-4 border-l-3 border-l-cyan-500">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#06b6d4">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-400">TikTok</p>
            <p className="font-display text-xl font-bold text-surface-50">
              {tiktokStatus.creator ? `@${tiktokStatus.creator.username}` : 'Connected'}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {tiktokStatus.creator ? `${(tiktokStatus.creator.followerCount || 0).toLocaleString()} followers` : 'Connected'}
            </p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('tiktok') }} className="text-xs text-accent-400 hover:text-accent-300 whitespace-nowrap">View analytics →</a>
        </div>
      )}

      {/* Monetization integration card */}
      {monetizationStatus && (monetizationStatus.stripe?.connected || monetizationStatus.shopify?.connected) && (
        <div className="glass card-lift p-5 flex items-center gap-4 border-l-3 border-l-emerald-500">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-400">Monetization Revenue</p>
            <p className="font-display text-xl font-bold text-surface-50">
              {[
                monetizationStatus.stripe?.connected ? 'Stripe' : null,
                monetizationStatus.shopify?.connected ? 'Shopify' : null,
              ].filter(Boolean).join(' + ')}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">
              {monetizationStatus.shopify?.storeUrl || ''}
            </p>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('monetization') }} className="text-xs text-accent-400 hover:text-accent-300 whitespace-nowrap">View details →</a>
        </div>
      )}

      {/* ═══ AI Insights Feed ═══ */}
      <section>
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <span>✨</span> Smart Insights
        </h3>
        {hasInsights ? (
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
        ) : (
          <div>
            <p className="text-sm text-surface-400 mb-4">
              Connect one social account and CreatorBloom will surface personalized opportunities — brands that match your vibe, deals you'd actually want. ✨
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreviewInsightCard emoji="📈" text="Engagement increased 12% this week." color="emerald" />
              <PreviewInsightCard emoji="💰" text="You're likely underpricing sponsorships." color="amber" />
              <PreviewInsightCard emoji="🌸" text="Beauty content is outperforming lifestyle content." color="accent" />
            </div>
          </div>
        )}
      </section>

      {/* ═══ Revenue Forecast ═══ */}
      {insights?.forecast ? (
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
                          className="h-full bg-accent-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: animateProgress ? `${Math.min(100, 100 - insights.forecast.potentialIncrease)}%` : '0%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">With one more deal</span>
                        <span className="text-emerald-400 font-medium">
                          ${(insights.forecast.nextMonth || monthly_revenue).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out delay-300" style={{ width: animateProgress ? '100%' : '0%' }} />
                      </div>
                      <p className="text-xs text-surface-500 mt-2">
                        💡 {insights.forecast.increaseAction || 'Closing just one more sponsorship'} could bump your monthly revenue significantly. That's real money. 💪
                      </p>
                    </div>
                  )}
                  {insights.forecast.potentialIncrease === 0 && (
                    <p className="text-sm text-surface-400">
                      Add your first few deals and we'll start forecasting your revenue. The more you track, the smarter it gets. 📈
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="glass p-6 relative overflow-hidden opacity-80">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute top-3 right-4 px-2 py-0.5 rounded-full bg-surface-700/60 border border-surface-600/30 text-xs text-surface-400 font-medium">
              Preview
            </div>
            <div className="relative">
              <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">📈 Revenue Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-surface-400 mb-1">Projected next month</p>
                  <p className="font-display text-3xl font-bold text-surface-600">$—</p>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="space-y-3 opacity-40">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-400">Current projection</span>
                      <span className="text-surface-500 font-medium">$0</span>
                    </div>
                    <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500/30 rounded-full" style={{ width: '40%' }} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-400">With one more deal</span>
                      <span className="text-surface-500 font-medium">$—</span>
                    </div>
                    <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/30 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-surface-500 mt-4 text-center">
                Connect your social accounts and revenue streams — we'll show you exactly where your next $1,000 is coming from.
              </p>
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
                    <Area type="monotone" dataKey="sponsorships" stroke="#6366f1" fill="url(#colorSponsor)" strokeWidth={2} animationDuration={animateChart ? 1200 : 0} animationBegin={0} />
                    <Area type="monotone" dataKey="affiliates" stroke="#f59e0b" fill="url(#colorAff)" strokeWidth={2} animationDuration={animateChart ? 1200 : 0} animationBegin={200} />
                    <Area type="monotone" dataKey="products" stroke="#10b981" fill="url(#colorProd)" strokeWidth={2} animationDuration={animateChart ? 1200 : 0} animationBegin={400} />
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
                      animationDuration={animateChart ? 1000 : 0}
                      animationBegin={200}
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
                {Object.values(pipeline).reduce((a, b) => a + b, 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pipeData(pipeline)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px', color: '#e2e8f0' }}
                        formatter={(v) => [`${v} deals`, undefined]}
                      />
                      <Bar dataKey="deals" radius={[6, 6, 0, 0]} animationDuration={animateChart ? 1000 : 0} animationBegin={100}>
                        {pipeData(pipeline).map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-full h-[200px] flex items-center justify-center opacity-20 relative">
                      <div className="absolute inset-0 flex items-end justify-around px-8 pb-4">
                        <div className="w-12 bg-accent-400/50 rounded-t-md" style={{ height: '30%' }} />
                        <div className="w-12 bg-emerald-400/50 rounded-t-md" style={{ height: '50%' }} />
                        <div className="w-12 bg-amber-400/50 rounded-t-md" style={{ height: '40%' }} />
                        <div className="w-12 bg-rose-400/50 rounded-t-md" style={{ height: '20%' }} />
                      </div>
                    </div>
                    <p className="text-sm text-surface-400 mt-3 text-center">
                      💡 Ready to land your first brand deal? Track every opportunity here and never let a follow-up slip.
                    </p>
                    <button
                      onClick={() => onNavigate && onNavigate('gmail')}
                      className="mt-3 px-4 py-2 rounded-xl bg-rose-500/15 text-rose-400 text-sm font-medium hover:bg-rose-500/25 transition-colors border border-rose-500/20 flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <polyline points="3,6 12,14 21,6" />
                      </svg>
                      Connect Gmail
                    </button>
                  </div>
                )}
              </div>
              <div className="glass p-6">
                <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recent_activity.map((item, i) => (
                    <ActivityItem key={i} action={item.action} detail={`${item.brand} — ${item.amount.toLocaleString()}`} time="Recently" />
                  ))}
                  {recent_activity.length === 0 && (
                    <ActivityItem action="No activity yet" detail="Land your first deal and it'll show up right here. 🤝" time="" />
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

// ── Animated Number component ────────────────────────────

function AnimatedNumber({ value, duration = 1200, prefix = '', suffix = '', formatter = v => v.toLocaleString() }) {
  const animated = useCountUp(value, { duration })
  return <>{prefix}{formatter(animated)}{suffix}</>
}

// ── Hero Stat Card ───────────────────────────────────────

function HeroStatCard({ label, value, rawValue, trend, positive, color, icon, onClick }) {
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
      <p className="font-display text-3xl font-bold text-surface-50">
        {rawValue !== undefined ? <AnimatedNumber value={rawValue} /> : value}
      </p>
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
    <div className={`glass glass-hover card-lift p-4 border ${colors.border} group transition-all duration-300`}>
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
    <div className={`glass glass-hover card-lift p-5 ${glowMap[color] || ''}`}>
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

// ── Dashboard Hero Cards ────────────────────────────────

function DashboardHeroCards({ monthlyRevenue, forecast, insights, hasInsights, hasData, onNavigate }) {
  // ── Card 1: Revenue data ───────────────────────────────
  const heroRevenue = forecast?.nextMonth || monthlyRevenue || 8400
  const heroTrend = forecast?.potentialIncrease || 18

  // ── Card 2: AI Insight ─────────────────────────────────
  const fallbackInsights = [
    'Beauty collaborations generated 34% higher revenue than lifestyle brands.',
    'Creators who post consistently see 2.5x more brand deals.',
    'Your affiliate revenue is growing faster than sponsorship income.',
    'Short-form video content drives 60% more engagement for brand partnerships.',
  ]
  const insightMessage = hasInsights && insights?.length > 0
    ? insights[0].message
    : fallbackInsights[Math.floor(Date.now() / 12000) % fallbackInsights.length]

  // ── Card 3: Suggested Action ───────────────────────────
  const fallbackActions = [
    'Increase outreach to beauty brands this week.',
    'Review your sponsorship pricing — you may be undervaluing your reach.',
    'Follow up with brands in your negotiation pipeline.',
    'Diversify into affiliate programs for passive income.',
  ]
  const actionText = hasInsights && insights?.length > 0
    ? insights[0].action || fallbackActions[0]
    : fallbackActions[Math.floor(Date.now() / 15000) % fallbackActions.length]

  const handleActionClick = () => onNavigate && onNavigate('sponsorships')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ── Revenue Card ──────────────────────────────── */}
      <HeroCard
        accentColor="emerald"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      >
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Monthly Revenue</p>
        <p className="font-display text-4xl font-bold text-surface-50 tracking-tight">
          <AnimatedNumber value={heroRevenue} prefix="$" />
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
            ↗︎ +{heroTrend}%
          </span>
          <span className="text-xs text-surface-500">vs last month</span>
        </div>
        {/* subtle glow bar */}
        <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/0" />
      </HeroCard>

      {/* ── AI Insight Card ────────────────────────────── */}
      <HeroCard
        accentColor="amber"
        icon={<span className="text-xl">💡</span>}
      >
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">AI Insight</p>
        <p className="text-sm text-surface-200 leading-relaxed line-clamp-3">
          {insightMessage}
        </p>
        <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-amber-500/40 to-amber-500/0" />
      </HeroCard>

      {/* ── Suggested Action Card ──────────────────────── */}
      <HeroCard
        accentColor="purple"
        icon={<span className="text-xl">🎯</span>}
      >
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Suggested Action</p>
        <p className="text-sm text-surface-200 leading-relaxed line-clamp-3 flex-1">
          {actionText}
        </p>
        <button
          onClick={handleActionClick}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500/15 text-purple-400 text-xs font-semibold hover:bg-purple-500/25 transition-all border border-purple-500/20"
        >
          Take Action
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-purple-500/40 to-purple-500/0" />
      </HeroCard>
    </div>
  )
}

// ── Hero Card (shared shell) ──────────────────────────────

function HeroCard({ accentColor, icon, children }) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/25',
      glow: 'shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/20',
      badgeText: 'text-emerald-400',
      badgeLabel: 'Live',
    },
    amber: {
      border: 'border-amber-500/25',
      glow: 'shadow-amber-500/10',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-400',
      badgeLabel: 'AI',
    },
    purple: {
      border: 'border-purple-500/25',
      glow: 'shadow-purple-500/10',
      iconBg: 'bg-purple-500/10',
      iconText: 'text-purple-400',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-500/20',
      badgeText: 'text-purple-400',
      badgeLabel: 'Action',
    },
  }
  const c = colorMap[accentColor] || colorMap.emerald

  return (
    <div
      className={`glass card-lift p-6 border ${c.border} ${c.glow} flex flex-col transition-all duration-500`}
      style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 150ms forwards' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 ${c.iconText}`}>
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${c.badgeBg} ${c.badgeBorder} text-[10px] font-semibold ${c.badgeText} uppercase tracking-wider`}>
          {c.badgeLabel}
        </span>
      </div>
      {children}
    </div>
  )
}

// ── Mini Stat Badge (for stats row) ──────────────────────

function MiniStatBadge({ label, value, color, active }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    accent: 'text-accent-400 bg-accent-500/10 border-accent-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }
  return (
    <div className={`glass p-3 text-center ${active ? '' : 'opacity-60'}`}>
      <p className="text-xs text-surface-400 mb-1">{label}</p>
      <p className={`font-display text-lg font-bold ${active ? colorMap[color]?.split(' ')[0] || 'text-surface-200' : 'text-surface-500'}`}>
        {String(value)}
      </p>
    </div>
  )
}

// ── Preview Stat Card ─────────────────────────────────────

function PreviewStatCard({ label, icon, color }) {
  const iconColorMap = {
    accent: 'text-accent-400/40',
    emerald: 'text-emerald-400/40',
    amber: 'text-amber-400/40',
    rose: 'text-rose-400/40',
  }
  return (
    <div className="glass p-5 opacity-50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-surface-500">{label}</p>
        <span className={iconColorMap[color] || 'text-surface-500'}>{icon}</span>
      </div>
      <p className="font-display text-3xl font-bold text-surface-600">$—</p>
      <p className="text-xs mt-2 text-surface-600">—</p>
    </div>
  )
}

// ── Preview Insight Card ──────────────────────────────────

function PreviewInsightCard({ emoji, text, color }) {
  const colorMap = {
    emerald: 'border-emerald-500/10 bg-emerald-500/5',
    amber: 'border-amber-500/10 bg-amber-500/5',
    accent: 'border-accent-500/10 bg-accent-500/5',
  }
  return (
    <div className={`glass p-4 border ${colorMap[color] || 'border-surface-700/20'} opacity-50`}>
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">{emoji}</span>
        <p className="text-sm text-surface-400 leading-relaxed">{text}</p>
      </div>
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
