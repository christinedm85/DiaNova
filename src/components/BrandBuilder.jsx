import { useState, useEffect } from 'react'
import { api } from '../api.js'
import EmptyState from './EmptyState.jsx'

export default function BrandBuilder({ onNavigate }) {
  const [brand, setBrand] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [integrationStatuses, setIntegrationStatuses] = useState({})

  const fetch = () => Promise.all([api.brand.get(), api.brand.ideas()])
    .then(([b, i]) => { setBrand(b); setIdeas(i) })
    .finally(() => setLoading(false))

  useEffect(() => { fetch() }, [])

  // Fetch integration statuses for health score checklist
  useEffect(() => {
    Promise.all([
      api.meta.status().catch(() => ({ connected: false })),
      api.youtube.status().catch(() => ({ connected: false })),
      api.monetization.status().catch(() => ({ connected: false })),
      api.sponsorships.pipeline().catch(() => ({})),
    ]).then(([meta, yt, mon, pipeline]) => {
      const totalDeals = pipeline ? Object.values(pipeline).reduce((sum, deals) => sum + deals.length, 0) : 0
      setIntegrationStatuses({
        instagram: meta?.connected || false,
        youtube: yt?.connected || false,
        sponsorships: totalDeals > 0,
        revenue: mon?.stripe?.connected || mon?.shopify?.connected || false,
      })
    })
  }, [])

  // Calculate health score based on checklist
  const checklistItems = [
    { key: 'instagram', label: 'Connect Instagram', done: integrationStatuses.instagram || false },
    { key: 'youtube', label: 'Connect YouTube', done: integrationStatuses.youtube || false },
    { key: 'sponsorships', label: 'Add sponsorship history', done: integrationStatuses.sponsorships || false },
    { key: 'revenue', label: 'Enable revenue tracking', done: integrationStatuses.revenue || false },
  ]
  const checklistDone = checklistItems.filter(c => c.done).length
  const estimatedScore = 40 + checklistDone * 15 // Base 40, +15 per completed item
  const currentScore = brand?.health_score || 0

  const togglePillar = async (pillar) => {
    const pillars = brand.pillars.includes(pillar)
      ? brand.pillars.filter(p => p !== pillar)
      : [...brand.pillars, pillar]
    const updated = await api.brand.update({ pillars })
    setBrand(updated)
  }

  const toggleTone = async (tone) => {
    const tones = brand.tone.includes(tone)
      ? brand.tone.filter(t => t !== tone)
      : [...brand.tone, tone]
    const updated = await api.brand.update({ tone: tones })
    setBrand(updated)
  }

  const toggleAudience = async (aud) => {
    const audience = brand.audience.includes(aud)
      ? brand.audience.filter(a => a !== aud)
      : [...brand.audience, aud]
    const updated = await api.brand.update({ audience })
    setBrand(updated)
  }

  const handleDeleteIdea = async (id) => {
    await api.brand.removeIdea(id)
    const updated = await api.brand.ideas()
    setIdeas(updated)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="page-enter space-y-8">
      <div>
        <h2 id="sales-tour-brand" className="font-display text-3xl font-bold text-surface-50">Brand Builder</h2>
        <p className="text-surface-400 mt-1">Define and grow your unique creator brand identity.</p>
      </div>

      {brand.health_score < 40 && (
        <EmptyState
          icon="🎨"
          title="Your brand kit is waiting"
          description="A complete brand kit helps match you with the right sponsors. It only takes 2 minutes."
          action={() => document.getElementById('sales-tour-brand')?.scrollIntoView({ behavior: 'smooth' })}
          actionLabel="Complete Your Brand Kit"
          color="purple"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6 lg:col-span-1">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Brand Identity</h3>
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-2xl gradient-border flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-display font-bold text-white">CP</span>
                <p className="text-white/60 text-sm mt-2">CreatorBloom</p>
              </div>
            </div>
            <div className="space-y-2">
              <ColorSwatch label="Primary" hex={brand.primary_color} />
              <ColorSwatch label="Accent" hex={brand.accent_color} />
              <ColorSwatch label="Neutral" hex={brand.neutral_color} />
            </div>
          </div>
        </div>

        <div className="glass p-6 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Brand Voice Generator</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-surface-500 mb-1.5">Pillars (what you talk about)</p>
              <div className="flex flex-wrap gap-2">
                {['Content Creation', 'Creator Economy', 'Tech Reviews', 'Productivity', 'Marketing', 'Design'].map(p => (
                  <Pill key={p} text={p} active={brand.pillars.includes(p)} onClick={() => togglePillar(p)} />
                ))}
                <Pill text="+ Add" outline />
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1.5">Tone</p>
              <div className="flex flex-wrap gap-2">
                {['Educational', 'Authentic', 'Inspirational', 'Humorous', 'Professional', 'Casual'].map(t => (
                  <Pill key={t} text={t} active={brand.tone.includes(t)} onClick={() => toggleTone(t)} />
                ))}
                <Pill text="+ Add" outline />
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1.5">Audience (who you serve)</p>
              <div className="flex flex-wrap gap-2">
                {['Aspiring Creators', 'Freelancers', 'Small Business', 'Agencies', 'Startups'].map(a => (
                  <Pill key={a} text={a} active={brand.audience.includes(a)} onClick={() => toggleAudience(a)} />
                ))}
                <Pill text="+ Add" outline />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">🎯 Content Idea Generator</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ideas.map(idea => (
            <div key={idea.id} className="p-4 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors cursor-pointer border border-surface-700/30 group relative">
              <button onClick={() => handleDeleteIdea(idea.id)} className="absolute top-2 right-2 text-xs text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400">{idea.format}</span>
              <h4 className="font-medium text-surface-100 mt-2 leading-snug">{idea.title}</h4>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-emerald-400 font-semibold">{idea.score}% fit</span>
                <span className="text-surface-500">{idea.reason}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6">
        <h3 className="font-display text-lg font-semibold text-surface-100 mb-4">Brand Health Score</h3>
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-800" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad2)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(currentScore / 100) * 327} 327`} />
                <defs>
                  <linearGradient id="scoreGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute font-display text-3xl font-bold gradient-text">{currentScore}</span>
            </div>
            <div className="space-y-2 text-sm">
              <ScoreItem label="Consistency" score={85} />
              <ScoreItem label="Audience Fit" score={82} />
              <ScoreItem label="Differentiation" score={70} />
              <ScoreItem label="Monetization Readiness" score={75} />
            </div>
          </div>
          {/* Checklist */}
          <div className="flex-1 w-full lg:w-auto">
            <p className="text-sm text-surface-400 mb-3">Complete these steps to boost your score:</p>
            <div className="space-y-2.5">
              {checklistItems.map(item => (
                <div key={item.key} className="flex items-center gap-3 text-sm">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    item.done
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-surface-700/40 text-surface-600 border border-surface-600/30'
                  }`}>
                    {item.done ? '✓' : '☐'}
                  </span>
                  <span className={item.done ? 'text-surface-300' : 'text-surface-500'}>{item.label}</span>
                  {!item.done && (
                    <button
                      onClick={() => {
                        if (item.key === 'instagram') onNavigate && onNavigate('meta')
                        else if (item.key === 'youtube') onNavigate && onNavigate('youtube')
                        else if (item.key === 'sponsorships') onNavigate && onNavigate('sponsorships')
                        else if (item.key === 'revenue') onNavigate && onNavigate('monetization')
                      }}
                      className="ml-auto text-xs text-accent-400 hover:text-accent-300 font-medium"
                    >
                      Connect →
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">
                <span className="font-semibold">Estimated score after setup: {Math.min(estimatedScore, 100)}/100</span>
                {estimatedScore > currentScore && (
                  <span className="text-surface-500 ml-1">(+{estimatedScore - currentScore} from current)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Match Encouragement — show when no integrations connected */}
      {!integrationStatuses.instagram && !integrationStatuses.youtube && (
        <div className="glass p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800/70 border border-surface-700/30 flex items-center justify-center mx-auto mb-5 text-2xl">
            🤝
          </div>
          <h3 className="font-display text-xl font-semibold text-surface-100 mb-2">Let's find your first brand matches</h3>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Connect Instagram or YouTube so CreatorBloom can analyze your audience and recommend companies that fit your niche.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => onNavigate && onNavigate('meta')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 shadow-lg shadow-purple-600/25"
            >
              Connect Instagram
            </button>
            <button
              onClick={() => onNavigate && onNavigate('youtube')}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/25"
            >
              Connect YouTube
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ColorSwatch({ label, hex }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg border border-surface-700" style={{ backgroundColor: hex }} />
      <div>
        <p className="text-sm text-surface-200">{label}</p>
        <p className="text-xs text-surface-500 font-mono">{hex}</p>
      </div>
    </div>
  )
}

function Pill({ text, active, outline, onClick }) {
  if (outline) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-surface-600 text-surface-500 hover:border-surface-500 hover:text-surface-400 cursor-pointer transition-colors">
        {text}
      </span>
    )
  }
  return (
    <span
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${
        active
          ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30'
          : 'bg-surface-800/50 text-surface-400 border border-surface-700/30 hover:text-surface-300'
      }`}
    >
      {text}
    </span>
  )
}

function ScoreItem({ label, score }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-surface-400 w-36">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-accent-500 to-purple-500" style={{ width: `${score}%` }} />
      </div>
      <span className="text-surface-300 font-medium w-8 text-right">{score}</span>
    </div>
  )
}
