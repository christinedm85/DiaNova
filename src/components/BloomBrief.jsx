import { useState, useEffect } from 'react'
import useCountUp from '../hooks/useCountUp.js'

// ── SVG Progress Ring ──────────────────────────────────────

function ProgressRing({ value, size = 90, strokeWidth = 6, color = '#34d399', label }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-700/50"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold text-surface-50">{value}</span>
        {label && <span className="text-[10px] text-surface-400">{label}</span>}
      </div>
    </div>
  )
}

// ── Small badge for "Needs Attention" ──────────────────────

function AttentionBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-400">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
      {count}
    </span>
  )
}

// ── Today's Mission Card ───────────────────────────────────

function TodayMission({ mission, confidence, onAction }) {
  const animatedConfidence = useCountUp(confidence, { duration: 1500 })

  return (
    <div className="glass p-6 border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-emerald-500/5 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
          <span className="text-sm">🎯</span>
        </div>
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Today's Mission</p>
      </div>

      <p className="text-sm text-surface-200 leading-relaxed mb-4">
        {mission || "Connect your first social account to unlock personalized missions."}
      </p>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-surface-500">Confidence</span>
          <span className="font-semibold text-violet-400">{animatedConfidence}%</span>
        </div>
        <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
            style={{
              width: `${confidence}%`,
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="w-full px-4 py-2.5 rounded-xl bg-violet-500/15 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-all border border-violet-500/20 flex items-center justify-center gap-2"
        >
          Take Action
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Quick Pulse Card ───────────────────────────────────────

function QuickPulse({ activeDeals, followUpsDue, avgDealSize }) {
  const animatedAvg = useCountUp(avgDealSize, { duration: 1500 })

  return (
    <div className="glass p-6 border border-surface-700/30 flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Quick Pulse</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-3 text-center border border-surface-700/20 bg-surface-800/30">
          <p className="font-display text-xl font-bold text-surface-100">{activeDeals}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Active Deals</p>
        </div>
        <div className="glass p-3 text-center border border-surface-700/20 bg-surface-800/30">
          <p className="font-display text-xl font-bold text-amber-400">{followUpsDue}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Follow-ups Due</p>
        </div>
        <div className="glass p-3 text-center border border-surface-700/20 bg-surface-800/30">
          <p className="font-display text-xl font-bold text-emerald-400">${animatedAvg.toLocaleString()}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Avg Deal</p>
        </div>
      </div>
    </div>
  )
}

// ── Ask Bloom Prompt ───────────────────────────────────────

function AskBloom({ onOpenAI, onChipClick }) {
  const chips = [
    { label: 'Which deal should I accept?', tool: 'negotiation' },
    { label: 'How much should I charge?', tool: 'pricing' },
    { label: 'Why is revenue down?', tool: 'benchmarking' },
  ]

  return (
    <div className="glass p-6 border border-surface-700/30 bg-gradient-to-r from-surface-800/50 to-surface-800/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
          <span className="text-sm">🌸</span>
        </div>
        <p className="text-sm font-medium text-surface-200">Ask Bloom</p>
        <span className="ml-auto text-[10px] text-surface-500 bg-surface-700/50 px-2 py-0.5 rounded-full">AI</span>
      </div>

      {/* Chat-style input */}
      <div
        onClick={onOpenAI}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/40 cursor-pointer hover:border-violet-500/30 hover:bg-surface-800/80 transition-all group"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-500 group-hover:text-violet-400 transition-colors shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-sm text-surface-500 group-hover:text-surface-400 transition-colors flex-1">
          Ask me anything about your creator business...
        </span>
        <span className="text-xs text-surface-600">✨</span>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {chips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => onChipClick && onChipClick(chip.tool)}
            className="px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-700/30 text-xs text-surface-400 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Bloom Brief Component ─────────────────────────────

export default function BloomBrief({
  greeting,
  subtitle,
  monthlyRevenue,
  pipelinePotential,
  followUpsDue,
  activeDeals,
  avgDealSize,
  highestOpportunity,
  healthScore,
  hasData,
  hasInsights,
  onNavigate,
  onOpenAI,
}) {
  const [ringAnimated, setRingAnimated] = useState(false)
  const displayHealth = healthScore ?? (hasData ? 92 : 48)
  const animatedRevenue = useCountUp(monthlyRevenue || 0, { duration: 1800 })

  useEffect(() => {
    // Trigger ring animation after mount
    const t = setTimeout(() => setRingAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const statusLine = hasData
    ? "Your creator business is healthier than last week."
    : "Welcome! Let's build your creator empire — one deal at a time."

  const dateStamp = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8 animate-hero-fade-up">
      {/* ═══ Header ═══ */}
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">
          {greeting || 'Welcome to CreatorBloom'}
        </h2>
        <p className="text-surface-400 mt-1">{statusLine}</p>
        <p className="text-xs text-surface-500 mt-1">{dateStamp}</p>
      </div>

      {/* ═══ Main Dominant Card ═══ */}
      <div className="glass p-8 relative overflow-hidden glow-emerald">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-500/8 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative space-y-0">
          {/* ── Row 1: Creator Health ── */}
          <div className="flex items-center gap-4 py-5">
            <ProgressRing
              value={ringAnimated ? displayHealth : 0}
              size={80}
              strokeWidth={5}
              color="#34d399"
              label="/100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">
                Creator Health
              </p>
              <p className="text-sm text-surface-300 leading-relaxed">
                {displayHealth >= 80
                  ? "Excellent — your brand is well-positioned for premium deals."
                  : displayHealth >= 60
                  ? "Solid foundation — a few optimizations could unlock more revenue."
                  : "Getting started — complete your brand kit for a higher score."}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          </div>

          <div className="h-px bg-surface-700/30" />

          {/* ── Row 2: Estimated Monthly Revenue ── */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">
                Estimated Monthly Revenue
              </p>
              <p className="font-display text-2xl font-bold text-emerald-400">
                ${animatedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          </div>

          <div className="h-px bg-surface-700/30" />

          {/* ── Row 3: Highest Value Opportunity ── */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">
                Highest Value Opportunity
              </p>
              {highestOpportunity ? (
                <button
                  onClick={() => onNavigate && onNavigate('sponsorships')}
                  className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors hover:underline underline-offset-2"
                >
                  {highestOpportunity.brand} — ${highestOpportunity.amount?.toLocaleString() || '0'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ) : (
                <span className="text-sm text-surface-500">
                  Add your first deal to see your top opportunity here
                </span>
              )}
            </div>
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          </div>

          <div className="h-px bg-surface-700/30" />

          {/* ── Row 4: Needs Attention ── */}
          <div className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-0.5">
                Needs Attention
              </p>
              <div className="flex items-center gap-2">
                {followUpsDue > 0 ? (
                  <>
                    <span className="text-sm font-bold text-rose-400">
                      {followUpsDue} sponsorship email{followUpsDue > 1 ? 's' : ''}
                    </span>
                    <AttentionBadge count={followUpsDue} />
                  </>
                ) : (
                  <span className="text-sm text-surface-500">All caught up — nothing needs attention right now ✨</span>
                )}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full bg-rose-400 shrink-0 ${followUpsDue > 0 ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="relative mt-4 pt-4 border-t border-surface-700/30 flex items-center justify-between">
          <p className="text-xs text-surface-500">
            Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <span className="text-[10px] text-surface-500 font-medium uppercase tracking-wider bg-surface-700/30 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
      </div>

      {/* ═══ Two Side-by-Side Cards ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayMission
          mission={hasData
            ? "Increase your beauty sponsorship rate by 15%"
            : "Connect your first social account to unlock personalized missions."}
          confidence={hasData ? 95 : 60}
          onAction={() => onNavigate && onNavigate('sponsorships')}
        />

        <QuickPulse
          activeDeals={activeDeals || 0}
          followUpsDue={followUpsDue || 0}
          avgDealSize={avgDealSize || 0}
        />
      </div>

      {/* ═══ Ask Bloom Prompt ═══ */}
      <AskBloom
        onOpenAI={onOpenAI}
        onChipClick={(tool) => {
          // Open AI panel; the Dashboard handles tab selection
          if (onOpenAI) onOpenAI(tool)
        }}
      />
    </div>
  )
}
