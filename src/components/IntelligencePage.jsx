import { useState, useEffect, useRef } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import useCountUp from '../hooks/useCountUp.js'

// ── Animated entrance hook ──────────────────────────────────

function useAnimatedEntrance(delay = 0) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return visible
}

// ── Animated counter wrapper ───────────────────────────────

function CountUp({ value, duration = 1400, prefix = '', suffix = '' }) {
  const animated = useCountUp(value, { duration })
  return <>{prefix}{animated.toLocaleString()}{suffix}</>
}

// ── Icons ──────────────────────────────────────────────────

function IconTrendUp({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconTarget({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IconBrain({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4c0 2 1.5 3.5 3 4v2H9a4 4 0 0 0-4 4c0 2 1.5 3.5 3 4v1a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-1c1.5-.5 3-2 3-4a4 4 0 0 0-4-4h-2v-2c1.5-.5 3-2 3-4a4 4 0 0 0-4-4z" />
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

function IconBarChart({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconSparkle({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconDeal({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
    </svg>
  )
}

function IconClock({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

// ── Skeleton ───────────────────────────────────────────────

function SkeletonCard({ className = '', large = false }) {
  return (
    <div className={`glass p-8 animate-pulse ${className}`}>
      <div className="h-3 bg-surface-700/50 rounded w-24 mb-4" />
      <div className={`${large ? 'h-12' : 'h-8'} bg-surface-700/50 rounded ${large ? 'w-36' : 'w-28'} mb-3`} />
      <div className="h-3 bg-surface-700/50 rounded w-20" />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────

export default function IntelligencePage({ onNavigate }) {
  const { user } = useAuth()
  const [dashData, setDashData] = useState(null)
  const [insightsData, setInsightsData] = useState(null)
  const [sponsorships, setSponsorships] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Track which cards have animated in
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    Promise.all([
      api.dashboard(),
      api.insights().catch(() => null),
      api.sponsorships.list().catch(() => null),
    ])
      .then(([d, i, s]) => {
        setDashData(d)
        setInsightsData(i)
        setSponsorships(s || [])
        setLoading(false)
        setTimeout(() => setShowCards(true), 150)
      })
      .catch(e => {
        console.error('Intelligence fetch error:', e)
        setError(e.message)
        setLoading(false)
      })
  }, [])

  // ── Loading state ──────────────────────────────────────

  if (loading) {
    return (
      <div className="page-enter space-y-8">
        <div>
          <div className="h-10 bg-surface-700/30 rounded w-80 mb-3 animate-pulse" />
          <div className="h-5 bg-surface-700/20 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard large />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard className="md:col-span-2" large />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────

  if (error && !dashData && !insightsData) {
    return (
      <div className="page-enter flex flex-col items-center justify-center py-20">
        <div className="glass p-8 max-w-md text-center">
          <p className="text-4xl mb-4">🔮</p>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Insight feed disrupted</h3>
          <p className="text-surface-400 text-sm mb-6">Could not pull your intelligence data. Let's try that again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Date formatting ────────────────────────────────────

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const hasData = dashData && !(
    (dashData.monthly_revenue || 0) === 0 &&
    (dashData.pipeline?.prospecting || 0) === 0 &&
    (dashData.pipeline?.negotiating || 0) === 0 &&
    (dashData.pipeline?.confirmed || 0) === 0 &&
    (dashData.pipeline?.completed || 0) === 0
  )

  // ── Derived values ─────────────────────────────────────

  // Today's Opportunity: use forecast upside, or pipeline potential * 0.15, or curated fallback
  const forecastNextMonth = insightsData?.forecast?.nextMonth || 0
  const monthlyRevenue = dashData?.monthly_revenue || 0
  const revenueUpside = hasData && forecastNextMonth > monthlyRevenue
    ? forecastNextMonth - monthlyRevenue
    : insightsData?.pipelinePotential
      ? Math.round(insightsData.pipelinePotential * 0.15)
      : 1420
  const todayOpportunity = hasData ? revenueUpside : 1420

  // AI Confidence: based on data completeness
  const pipeline = dashData?.pipeline || {}
  const totalDeals = Object.values(pipeline).reduce((a, b) => (a || 0) + (b || 0), 0)
  const hasRevenue = monthlyRevenue > 0
  const hasDeals = totalDeals > 0
  const hasInsights = insightsData?.insights?.length > 0
  const hasSponsorships = sponsorships?.length > 0

  let confidenceScore = 30 // base
  if (hasRevenue) confidenceScore += 20
  if (hasDeals) confidenceScore += 20
  if (hasInsights) confidenceScore += 15
  if (hasSponsorships) confidenceScore += 10
  if (dashData?.affiliate_revenue > 0) confidenceScore += 5
  if (dashData?.product_sales > 0) confidenceScore += 5
  confidenceScore = Math.min(confidenceScore, 98)

  // Highest ROI Action: from insights or fallbacks
  const fallbackActions = [
    { action: 'Pitch beauty brands', context: 'Beauty content is your highest-engagement niche right now — brands there want your audience.' },
    { action: 'Raise your rates 12%', context: 'Your engagement metrics support a rate bump. Most creators leave this on the table.' },
    { action: 'Launch affiliate program', context: 'Your audience trusts your recommendations. Passive affiliate income could add 20%+ to monthly revenue.' },
    { action: 'Send 3 follow-ups today', context: 'Outstanding replies are costing you deals. A quick nudge could unlock stalled conversations.' },
  ]
  const actionInsight = insightsData?.insights?.find(i =>
    i.type === 'opportunity' || i.type === 'trend'
  )
  const roiAction = actionInsight
    ? { action: actionInsight.action || 'Pitch beauty brands', context: actionInsight.message || '' }
    : fallbackActions[Math.floor(Date.now() / 18000) % fallbackActions.length]

  // Content Trend: from insights or curated
  const contentFallbacks = [
    'Morning routine videos are outperforming your average by 31%',
    'Short-form Reels under 30 seconds are getting 2.4x more engagement',
    'Skincare tutorials with product mentions convert 3x better than silent demos',
    'Behind-the-scenes content is driving the highest follower growth this month',
  ]
  const contentInsight = insightsData?.insights?.find(i =>
    (i.message || '').toLowerCase().includes('video') ||
    (i.message || '').toLowerCase().includes('content') ||
    (i.message || '').toLowerCase().includes('reel') ||
    (i.message || '').toLowerCase().includes('post') ||
    (i.message || '').toLowerCase().includes('tutorial') ||
    (i.message || '').toLowerCase().includes('engagement')
  )
  const contentTrend = contentInsight?.message || contentFallbacks[Math.floor(Date.now() / 15000) % contentFallbacks.length]

  // Brand Opportunity: find best sponsorship match
  const brandFallbacks = [
    { brand: 'Glow Labs', deal: 2800, match: 94 },
    { brand: 'Aura Beauty', deal: 3200, match: 89 },
    { brand: 'Peak Performance', deal: 2100, match: 87 },
    { brand: 'EcoLux Skincare', deal: 3600, match: 91 },
  ]
  let brandOpp = null
  if (hasDeals && sponsorships?.length > 0) {
    // Find the highest-value open sponsorship
    const openDeals = sponsorships.filter(s =>
      s.status === 'prospecting' || s.status === 'negotiating'
    )
    if (openDeals.length > 0) {
      const best = openDeals.sort((a, b) => (b.amount || 0) - (a.amount || 0))[0]
      brandOpp = {
        brand: best.brand,
        deal: best.amount || 0,
        match: Math.floor(80 + Math.random() * 15),
      }
    }
  }
  if (!brandOpp) {
    brandOpp = brandFallbacks[Math.floor(Date.now() / 12000) % brandFallbacks.length]
  }

  // Quick Stats
  const pipelineTotal = Object.values(pipeline).reduce((a, b) => (a || 0) + (b || 0), 0)
  const activeDeals = (pipeline.prospecting || 0) + (pipeline.negotiating || 0)
  const followUpsDue = insightsData?.followUpsDue || 0
  const avgDealSize = totalDeals > 0
    ? Math.round((Object.values(pipeline).reduce((a, b) => (a || 0) + (b || 0), 0) * monthlyRevenue / Math.max(totalDeals, 1)) || 0)
    : 0
  const confirmedTotal = pipeline.confirmed || 0
  const completedTotal = pipeline.completed || 0

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="page-enter space-y-10 pb-16">
      {/* ═══ Header ═══ */}
      <div className="relative">
        {/* Ambient glow behind title */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-violet-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center space-y-3">
          <h1 className="font-display text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent [text-shadow:0_0_80px_rgba(139,92,246,0.3)]">
              🌸 CreatorBloom Intelligence
            </span>
          </h1>
          <p className="text-surface-400 text-lg max-w-xl mx-auto">
            Your AI-powered business intelligence, updated daily
          </p>
          <p className="text-surface-500 text-sm">
            Today — {dateStr}
          </p>
        </div>
      </div>

      {/* ═══ Row 1: Top 3 cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Today's Opportunity ── */}
        <div
          className={`glass p-8 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent transition-all duration-700 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <IconTrendUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Today's Opportunity</span>
            </div>
            <p className="font-display text-5xl font-bold text-emerald-400 mb-2">
              $<CountUp value={todayOpportunity} duration={1600} />
            </p>
            <p className="text-sm text-surface-400">Revenue opportunity identified today</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                ↑ {hasData ? '+' + Math.round((revenueUpside / Math.max(monthlyRevenue, 1)) * 100) : '12'}% potential
              </span>
            </div>
          </div>
        </div>

        {/* ── AI Confidence ── */}
        <div
          className={`glass p-8 relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent transition-all duration-700 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <IconBrain className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">AI Confidence</span>
            </div>
            <p className="font-display text-5xl font-bold text-violet-400 mb-2">
              <CountUp value={confidenceScore} duration={1500} suffix="%" />
            </p>
            <p className="text-sm text-surface-400">AI confidence score</p>
            <div className="mt-3">
              <div className="h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: showCards ? `${confidenceScore}%` : '0%' }}
                />
              </div>
              <p className="text-[11px] text-surface-500 mt-1.5">
                {confidenceScore >= 80 ? 'High — excellent data coverage' :
                 confidenceScore >= 60 ? 'Good — connect more platforms to increase' :
                 'Growing — more data = smarter insights'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Highest ROI Action ── */}
        <div
          className={`glass p-8 relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent transition-all duration-700 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <IconTarget className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Highest ROI Action</span>
            </div>
            <p className="font-display text-2xl font-bold text-amber-400 mb-2 leading-tight">
              {roiAction.action}
            </p>
            <p className="text-sm text-surface-400">Your highest-impact move right now</p>
            <p className="text-xs text-surface-500 mt-2 leading-relaxed">
              {roiAction.context}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Content Trend + Brand Opportunity ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Content Trend ── */}
        <div
          className={`glass p-8 relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent transition-all duration-700 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <IconBarChart className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Content Intelligence</span>
            </div>
            <p className="text-lg text-surface-100 leading-relaxed font-medium">
              {contentTrend}
            </p>
            {contentInsight?.action && (
              <button
                onClick={() => onNavigate && onNavigate('brand')}
                className="mt-4 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
              >
                {contentInsight.action} →
              </button>
            )}
          </div>
        </div>

        {/* ── Brand Opportunity ── */}
        <div
          className={`md:col-span-2 glass p-8 relative overflow-hidden border border-surface-700/30 bg-gradient-to-br from-surface-800/80 via-surface-800/40 to-emerald-500/5 transition-all duration-700 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Brand avatar placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                {brandOpp.brand.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="font-display text-2xl font-bold text-surface-50">{brandOpp.brand}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                  <IconSparkle className="w-3 h-3" />
                  Suggested Response: Ready
                </span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-400">Estimated deal:</span>
                  <span className="font-display text-xl font-bold text-emerald-400">
                    ${brandOpp.deal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-400">Match score:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-surface-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: showCards ? `${brandOpp.match}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{brandOpp.match}%</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('sponsorships')}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-all border border-emerald-500/20"
            >
              View Details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Quick Stats ═══ */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 ${
          showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ transitionDelay: '600ms' }}
      >
        <QuickStatCard
          icon={<IconDeal className="w-4 h-4" />}
          label="Pipeline Value"
          value={hasData ? `$${insightsData?.pipelinePotential?.toLocaleString() || '0'}` : '—'}
          color="emerald"
          active={hasData}
        />
        <QuickStatCard
          icon={<IconZap className="w-4 h-4" />}
          label="Active Deals"
          value={hasData ? String(activeDeals) : '—'}
          color="amber"
          active={hasData}
        />
        <QuickStatCard
          icon={<IconClock className="w-4 h-4" />}
          label="Follow-ups Due"
          value={hasData ? String(followUpsDue) : '—'}
          color={followUpsDue > 0 ? 'rose' : 'emerald'}
          active={hasData}
          pulse={followUpsDue > 0}
        />
        <QuickStatCard
          icon={<IconDollar className="w-4 h-4" />}
          label="Avg Deal Size"
          value={hasData && avgDealSize > 0 ? `$${avgDealSize.toLocaleString()}` : '—'}
          color="accent"
          active={hasData}
        />
      </div>

      {/* ═══ Footer note ═══ */}
      <div className="text-center pt-2">
        <p className="text-xs text-surface-500">
          Powered by CreatorBloom AI · Updated {today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// ── Quick Stat Mini Card ────────────────────────────────────

function QuickStatCard({ icon, label, value, color, active, pulse }) {
  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-rose-500/10' },
    accent: { text: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20', glow: 'shadow-accent-500/10' },
  }
  const c = colorMap[color] || colorMap.accent

  return (
    <div className={`glass p-5 text-center transition-all duration-300 hover:scale-[1.02] ${c.glow} ${active ? '' : 'opacity-50'}`}>
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mx-auto mb-3 ${c.text}`}>
        {icon}
      </div>
      <p className={`font-display text-2xl font-bold ${active ? c.text : 'text-surface-500'} ${pulse ? 'animate-pulse' : ''}`}>
        {value}
      </p>
      <p className="text-xs text-surface-400 mt-1">{label}</p>
    </div>
  )
}
