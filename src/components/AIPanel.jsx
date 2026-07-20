import { useState } from 'react'
import { api } from '../api.js'

const TABS = ['Pricing', 'Brand Match', 'Follow-up', 'Ideas', 'Discovery']

export default function AIPanel({ show, onClose }) {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Form states
  const [pricingForm, setPricingForm] = useState({ niche: '', dealType: 'sponsorship', pastAmounts: '' })
  const [brandForm, setBrandForm] = useState({ brandName: '', brandIndustry: '', creatorNiche: '' })
  const [followupForm, setFollowupForm] = useState({ brandName: '', stage: 'prospecting', daysStale: 7 })
  const [ideasForm, setIdeasForm] = useState({ niche: '', audienceSize: '' })
  const [discoveryForm, setDiscoveryForm] = useState({ niche: '', demographics: '' })

  async function generate(apiCall, data) {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await apiCall(data)
      setResult(res)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[420px] h-full bg-surface-900/95 backdrop-blur-xl border-l border-surface-700/50 overflow-y-auto animate-[slide-left_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-xl border-b border-surface-700/30 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-surface-50">AI Assistant ✨</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 text-xl leading-none">&times;</button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-5 py-3 overflow-x-auto border-b border-surface-700/20">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); setResult(null); setError(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === i ? 'bg-accent-500/20 text-accent-400' : 'text-surface-400 hover:text-surface-200'}`}>
              {t}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="p-5">
          {tab === 0 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Creator niche</label>
              <input value={pricingForm.niche} onChange={e => setPricingForm({...pricingForm, niche: e.target.value})}
                placeholder="e.g. tech reviews" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Deal type</label>
              <select value={pricingForm.dealType} onChange={e => setPricingForm({...pricingForm, dealType: e.target.value})}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none">
                <option value="sponsorship">Sponsorship</option>
                <option value="affiliate">Affiliate</option>
                <option value="product">Digital Product</option>
              </select>
              <label className="block text-xs text-surface-400">Past deal amounts (comma-separated)</label>
              <input value={pricingForm.pastAmounts} onChange={e => setPricingForm({...pricingForm, pastAmounts: e.target.value})}
                placeholder="e.g. 2000, 2500, 1800" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <button onClick={() => generate(api.ai.pricingSuggestion, { niche: pricingForm.niche, dealType: pricingForm.dealType, pastAmounts: pricingForm.pastAmounts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) })}
                disabled={loading} className="w-full rounded-xl bg-accent-500/20 text-accent-400 py-2 text-sm font-medium hover:bg-accent-500/30 transition-all disabled:opacity-50">
                {loading ? 'Generating...' : '✨ Generate Price Range'}
              </button>
            </div>
          )}
          {tab === 1 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Brand name</label>
              <input value={brandForm.brandName} onChange={e => setBrandForm({...brandForm, brandName: e.target.value})}
                placeholder="e.g. Nike" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Brand industry</label>
              <input value={brandForm.brandIndustry} onChange={e => setBrandForm({...brandForm, brandIndustry: e.target.value})}
                placeholder="e.g. athletic wear" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={brandForm.creatorNiche} onChange={e => setBrandForm({...brandForm, creatorNiche: e.target.value})}
                placeholder="e.g. fitness and running" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <button onClick={() => generate(api.ai.brandMatch, brandForm)}
                disabled={loading} className="w-full rounded-xl bg-accent-500/20 text-accent-400 py-2 text-sm font-medium hover:bg-accent-500/30 transition-all disabled:opacity-50">
                {loading ? 'Analyzing...' : '✨ Score Brand Match'}
              </button>
            </div>
          )}
          {tab === 2 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Brand name</label>
              <input value={followupForm.brandName} onChange={e => setFollowupForm({...followupForm, brandName: e.target.value})}
                placeholder="e.g. Samsung" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Stage</label>
              <select value={followupForm.stage} onChange={e => setFollowupForm({...followupForm, stage: e.target.value})}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none">
                <option value="prospecting">Prospecting</option>
                <option value="negotiating">Negotiating</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
              <label className="block text-xs text-surface-400">Days since last update</label>
              <input type="number" value={followupForm.daysStale} onChange={e => setFollowupForm({...followupForm, daysStale: parseInt(e.target.value) || 0})}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <button onClick={() => generate(api.ai.smartFollowup, followupForm)}
                disabled={loading} className="w-full rounded-xl bg-accent-500/20 text-accent-400 py-2 text-sm font-medium hover:bg-accent-500/30 transition-all disabled:opacity-50">
                {loading ? 'Thinking...' : '✨ Get Follow-up Plan'}
              </button>
            </div>
          )}
          {tab === 3 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={ideasForm.niche} onChange={e => setIdeasForm({...ideasForm, niche: e.target.value})}
                placeholder="e.g. productivity and tech" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Audience size</label>
              <input type="number" value={ideasForm.audienceSize} onChange={e => setIdeasForm({...ideasForm, audienceSize: e.target.value})}
                placeholder="e.g. 50000" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <button onClick={() => generate(api.ai.contentIdeas, { niche: ideasForm.niche, audienceSize: parseInt(ideasForm.audienceSize) || 0 })}
                disabled={loading} className="w-full rounded-xl bg-accent-500/20 text-accent-400 py-2 text-sm font-medium hover:bg-accent-500/30 transition-all disabled:opacity-50">
                {loading ? 'Brainstorming...' : '✨ Generate Product Ideas'}
              </button>
            </div>
          )}
          {tab === 4 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={discoveryForm.niche} onChange={e => setDiscoveryForm({...discoveryForm, niche: e.target.value})}
                placeholder="e.g. sustainable living" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <label className="block text-xs text-surface-400">Audience demographics</label>
              <input value={discoveryForm.demographics} onChange={e => setDiscoveryForm({...discoveryForm, demographics: e.target.value})}
                placeholder="e.g. 25-34, mostly female, urban" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-accent-500/50" />
              <button onClick={() => generate(api.ai.brandDiscovery, discoveryForm)}
                disabled={loading} className="w-full rounded-xl bg-accent-500/20 text-accent-400 py-2 text-sm font-medium hover:bg-accent-500/30 transition-all disabled:opacity-50">
                {loading ? 'Searching...' : '✨ Discover Brands'}
              </button>
            </div>
          )}
          {/* Loading */}
          {loading && (
            <div className="mt-4 space-y-2 animate-pulse">
              <div className="h-3 bg-surface-700/50 rounded w-3/4" />
              <div className="h-3 bg-surface-700/50 rounded w-1/2" />
              <div className="h-3 bg-surface-700/50 rounded w-5/6" />
            </div>
          )}
          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}
          {/* Result */}
          {result && !loading && (
            <div className="mt-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
              <p className="text-sm text-surface-200 whitespace-pre-wrap">{result.text || result.reason || JSON.stringify(result, null, 2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
