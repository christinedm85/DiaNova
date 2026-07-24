import { useState, useEffect } from 'react'
import { getOpportunities } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

const TYPE_CONFIG = {
  brand_deal: { badge: 'Brand Deal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  seasonal: { badge: 'Seasonal', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  trend: { badge: 'Trend Alert', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  affiliate: { badge: 'Affiliate', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  content_idea: { badge: 'Content', color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
}

const URGENCY_DOT = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-emerald-400',
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'brand_deal', label: 'Brand Deals' },
  { key: 'seasonal', label: 'Seasonal' },
  { key: 'trend', label: 'Trends' },
  { key: 'affiliate', label: 'Affiliates' },
  { key: 'content_idea', label: 'Content' },
]

export default function OpportunityFeed({ onNavigate }) {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  const niche = user?.niche || user?.category || 'content creation'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getOpportunities(niche)
      .then(data => {
        if (!cancelled) {
          setOpportunities(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load opportunities')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [niche])

  const filtered = filter === 'all'
    ? opportunities
    : opportunities.filter(o => o.type === filter)

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h2 id="sales-tour-opportunities" className="font-display text-3xl font-bold text-surface-50">Opportunities</h2>
        <p className="text-surface-400 mt-1">AI-curated opportunities matched to your niche</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              filter === key
                ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 border border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass p-5 animate-pulse">
              <div className="h-4 w-20 bg-surface-700/50 rounded mb-3" />
              <div className="h-5 w-3/4 bg-surface-700/50 rounded mb-2" />
              <div className="h-3 w-full bg-surface-700/50 rounded mb-2" />
              <div className="h-3 w-2/3 bg-surface-700/50 rounded mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-surface-700/50 rounded" />
                <div className="h-8 w-24 bg-surface-700/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glass p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-semibold text-surface-200 text-lg mb-1">Couldn't load opportunities</h3>
          <p className="text-surface-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="glass p-10 text-center">
          {filter !== 'all' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-surface-800/70 border border-surface-700/30 flex items-center justify-center mx-auto mb-5 text-2xl">
                🔍
              </div>
              <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">No matches in this category</h3>
              <p className="text-surface-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                No {FILTERS.find(f => f.key === filter)?.label?.toLowerCase() || ''} opportunities match your current filter. Try broadening your search.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 text-white bg-accent-600 hover:bg-accent-500 shadow-lg shadow-accent-600/25"
              >
                Show All Opportunities
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-accent-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-3xl animate-[gentle-pulse_2.5s_ease-in-out_infinite]">
                🌟
              </div>
              <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Your opportunity engine is warming up</h3>
              <p className="text-surface-400 text-sm max-w-md mx-auto mb-3 leading-relaxed">
                Once your accounts are connected, CreatorBloom will surface:
              </p>
              <div className="inline-flex flex-col gap-2 text-left mb-2">
                {[
                  '✓ Brand opportunities',
                  '✓ Affiliate products',
                  '✓ Trending content ideas',
                  '✓ Seasonal campaigns',
                ].map((item, i) => (
                  <div key={i} className="text-sm text-surface-300">
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Cards Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opportunity, i) => {
            const config = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.content_idea
            const dotColor = URGENCY_DOT[opportunity.urgency] || URGENCY_DOT.medium

            return (
              <div
                key={opportunity.id || i}
                className="glass glass-hover card-lift p-5 group relative flex flex-col"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.color}`}>
                    {config.badge}
                  </span>
                  {/* Urgency dot */}
                  <span className="flex items-center gap-1 text-xs text-surface-500">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    {opportunity.urgency === 'high' ? 'Urgent' : opportunity.urgency === 'medium' ? 'Soon' : 'Evergreen'}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-semibold text-surface-100 text-sm leading-snug mb-2">
                  {opportunity.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-surface-400 leading-relaxed flex-1 mb-4">
                  {opportunity.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                  <span className="text-xs text-surface-500">
                    {opportunity.category || config.badge}
                  </span>
                  <button
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      opportunity.urgency === 'high'
                        ? 'bg-accent-600 hover:bg-accent-500 text-white'
                        : 'bg-surface-800/60 hover:bg-surface-700 text-surface-300 hover:text-surface-100'
                    }`}
                    onClick={() => {/* placeholder — could link to specific action */}}
                  >
                    {opportunity.actionLabel || 'Learn More'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Refresh hint */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-center text-xs text-surface-600 mt-4">
          Opportunities refresh periodically. Check back for new matches.
        </p>
      )}
    </div>
  )
}
