import { useState, useEffect } from 'react'
import { api } from '../api.js'

export default function BrandBuilder() {
  const [brand, setBrand] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => Promise.all([api.brand.get(), api.brand.ideas()])
    .then(([b, i]) => { setBrand(b); setIdeas(i) })
    .finally(() => setLoading(false))

  useEffect(() => { fetch() }, [])

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
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-800" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad2)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(brand.health_score / 100) * 327} 327`} />
              <defs>
                <linearGradient id="scoreGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute font-display text-3xl font-bold gradient-text">{brand.health_score}</span>
          </div>
          <div className="space-y-2 text-sm">
            <ScoreItem label="Consistency" score={85} />
            <ScoreItem label="Audience Fit" score={82} />
            <ScoreItem label="Differentiation" score={70} />
            <ScoreItem label="Monetization Readiness" score={75} />
          </div>
        </div>
      </div>
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
