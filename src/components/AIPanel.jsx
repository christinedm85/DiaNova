import { useState } from 'react'
import { api } from '../api.js'

const TABS = ['Pricing', 'Brand Match', 'Follow-up', 'Ideas', 'Discovery', '🤝 Coach', '📊 Benchmark', '📄 Scan']

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
  const [negotiationForm, setNegotiationForm] = useState({ emailText: '', niche: '', audienceSize: '' })
  const [benchmarkForm, setBenchmarkForm] = useState({ contentType: 'TikTok sponsorship', niche: '', audienceSize: '' })
  const [scannerForm, setScannerForm] = useState({ contractText: '' })

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
        <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-xl border-b border-surface-700/30 px-6 py-5 flex items-center justify-between">
          <h2 className="font-display text-lg text-surface-50">AI Assistant ✨</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 text-xl leading-none">&times;</button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto border-b border-surface-700/20">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => { setTab(i); setResult(null); setError(null) }}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === i ? 'bg-violet-500/20 text-violet-400' : 'text-surface-400 hover:text-surface-200'}`}>
              {t}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="p-6">
          {tab === 0 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Creator niche</label>
              <input value={pricingForm.niche} onChange={e => setPricingForm({...pricingForm, niche: e.target.value})}
                placeholder="e.g. tech reviews" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <label className="block text-xs text-surface-400">Deal type</label>
              <select value={pricingForm.dealType} onChange={e => setPricingForm({...pricingForm, dealType: e.target.value})}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none">
                <option value="sponsorship">Sponsorship</option>
                <option value="affiliate">Affiliate</option>
                <option value="product">Digital Product</option>
              </select>
              <label className="block text-xs text-surface-400">Past deal amounts (comma-separated)</label>
              <input value={pricingForm.pastAmounts} onChange={e => setPricingForm({...pricingForm, pastAmounts: e.target.value})}
                placeholder="e.g. 2000, 2500, 1800" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <button onClick={() => generate(api.ai.pricingSuggestion, { niche: pricingForm.niche, dealType: pricingForm.dealType, pastAmounts: pricingForm.pastAmounts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) })}
                disabled={loading} className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                {loading ? 'Running the numbers...' : '✨ What Should I Charge?'}
              </button>
            </div>
          )}
          {tab === 1 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Brand name</label>
              <input value={brandForm.brandName} onChange={e => setBrandForm({...brandForm, brandName: e.target.value})}
                placeholder="e.g. Nike" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <label className="block text-xs text-surface-400">Brand industry</label>
              <input value={brandForm.brandIndustry} onChange={e => setBrandForm({...brandForm, brandIndustry: e.target.value})}
                placeholder="e.g. athletic wear" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={brandForm.creatorNiche} onChange={e => setBrandForm({...brandForm, creatorNiche: e.target.value})}
                placeholder="e.g. fitness and running" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <button onClick={() => generate(api.ai.brandMatch, brandForm)}
                disabled={loading} className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                {loading ? 'Checking compatibility...' : '✨ Is This Brand a Match?'}
              </button>
            </div>
          )}
          {tab === 2 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Brand name</label>
              <input value={followupForm.brandName} onChange={e => setFollowupForm({...followupForm, brandName: e.target.value})}
                placeholder="e.g. Samsung" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
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
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <button onClick={() => generate(api.ai.smartFollowup, followupForm)}
                disabled={loading} className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                {loading ? 'Writing something you\'ll actually want to send...' : '✨ Write My Follow-up'}
              </button>
            </div>
          )}
          {tab === 3 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={ideasForm.niche} onChange={e => setIdeasForm({...ideasForm, niche: e.target.value})}
                placeholder="e.g. productivity and tech" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <label className="block text-xs text-surface-400">Audience size</label>
              <input type="number" value={ideasForm.audienceSize} onChange={e => setIdeasForm({...ideasForm, audienceSize: e.target.value})}
                placeholder="e.g. 50000" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <button onClick={() => generate(api.ai.contentIdeas, { niche: ideasForm.niche, audienceSize: parseInt(ideasForm.audienceSize) || 0 })}
                disabled={loading} className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                {loading ? 'Brainstorming...' : '✨ Spark Product Ideas'}
              </button>
            </div>
          )}
          {tab === 4 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Your niche</label>
              <input value={discoveryForm.niche} onChange={e => setDiscoveryForm({...discoveryForm, niche: e.target.value})}
                placeholder="e.g. sustainable living" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <label className="block text-xs text-surface-400">Audience demographics</label>
              <input value={discoveryForm.demographics} onChange={e => setDiscoveryForm({...discoveryForm, demographics: e.target.value})}
                placeholder="e.g. 25-34, mostly female, urban" className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50" />
              <button onClick={() => generate(api.ai.brandDiscovery, discoveryForm)}
                disabled={loading} className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50">
                {loading ? 'Searching for your next partner...' : '✨ Find My Dream Brands'}
              </button>
            </div>
          )}
          {tab === 5 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Paste the brand's email or offer here</label>
              <textarea
                value={negotiationForm.emailText}
                onChange={e => setNegotiationForm({ ...negotiationForm, emailText: e.target.value })}
                placeholder="Hi [Creator],&#10;&#10;We'd love to partner with you on a campaign. We're offering $1,200 for 2 Instagram posts and 1 TikTok video..."
                rows={8}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50 resize-none"
              />
              <p className="text-xs text-surface-500 -mt-2">{negotiationForm.emailText.length} characters</p>
              <label className="block text-xs text-surface-400">Your niche (optional)</label>
              <input
                value={negotiationForm.niche}
                onChange={e => setNegotiationForm({ ...negotiationForm, niche: e.target.value })}
                placeholder="e.g. tech reviews, fitness"
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50"
              />
              <label className="block text-xs text-surface-400">Audience reach (optional)</label>
              <input
                value={negotiationForm.audienceSize}
                onChange={e => setNegotiationForm({ ...negotiationForm, audienceSize: e.target.value })}
                placeholder="e.g. 142K avg views, 250K followers"
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50"
              />
              <button
                onClick={() => generate(api.ai.negotiationCoach, {
                  emailText: negotiationForm.emailText,
                  niche: negotiationForm.niche || undefined,
                  audienceSize: negotiationForm.audienceSize || undefined,
                })}
                disabled={loading || negotiationForm.emailText.trim().length < 20}
                className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Reading between the lines...' : '🤝 Is This a Good Deal?'}
              </button>
            </div>
          )}
          {tab === 6 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Content type</label>
              <select
                value={benchmarkForm.contentType}
                onChange={e => setBenchmarkForm({ ...benchmarkForm, contentType: e.target.value })}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none"
              >
                <option value="TikTok sponsorship">TikTok sponsorship</option>
                <option value="YouTube integration">YouTube integration</option>
                <option value="Instagram post">Instagram post</option>
                <option value="UGC">UGC</option>
                <option value="Podcast ad">Podcast ad</option>
              </select>
              <label className="block text-xs text-surface-400">Your niche (optional)</label>
              <input
                value={benchmarkForm.niche}
                onChange={e => setBenchmarkForm({ ...benchmarkForm, niche: e.target.value })}
                placeholder="e.g. fitness, tech reviews"
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50"
              />
              <label className="block text-xs text-surface-400">Audience size (optional)</label>
              <input
                value={benchmarkForm.audienceSize}
                onChange={e => setBenchmarkForm({ ...benchmarkForm, audienceSize: e.target.value })}
                placeholder="e.g. 142K"
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50"
              />
              <button
                onClick={() => generate(api.ai.creatorBenchmarking, {
                  contentType: benchmarkForm.contentType,
                  niche: benchmarkForm.niche || undefined,
                  audienceSize: benchmarkForm.audienceSize || undefined,
                })}
                disabled={loading}
                className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Checking market rates...' : '📊 How Do I Stack Up?'}
              </button>
            </div>
          )}
          {tab === 7 && (
            <div className="space-y-3">
              <label className="block text-xs text-surface-400">Paste the full sponsorship contract text here</label>
              <textarea
                value={scannerForm.contractText}
                onChange={e => setScannerForm({ ...scannerForm, contractText: e.target.value })}
                placeholder={'SPONSORSHIP AGREEMENT\n\n1. Exclusivity: Creator agrees to a 6-month exclusivity period for all fitness-related content...\n\n2. Usage Rights: Brand retains perpetual, worldwide rights to all content created...\n\n3. Payment: Net-60 payment terms apply...'}
                rows={10}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none focus:border-violet-500/50 resize-none font-mono text-xs"
              />
              <p className="text-xs text-surface-500 -mt-2">{scannerForm.contractText.length} characters</p>
              <button
                onClick={() => generate(api.ai.contractScanner, {
                  contractText: scannerForm.contractText,
                })}
                disabled={loading || scannerForm.contractText.trim().length < 50}
                className="w-full rounded-xl bg-violet-500/20 text-violet-400 py-2 text-sm font-medium hover:bg-violet-500/30 transition-all disabled:opacity-50"
              >
                {loading ? 'Hunting for gotchas...' : '📄 What\u2019s Hiding in This Contract?'}
              </button>
            </div>
          )}
          {/* Loading — personality messages */}
          {loading && <PersonalityLoader tab={tab} />}
          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-rose-400">Hmm, something didn't work. Let's try that again. 🤔</p>
            </div>
          )}
          {/* Result */}
          {result && !loading && (
            <div className="mt-4 space-y-3">
              {/* Negotiation Coach structured result */}
              {result.fairness && result.counteroffer ? (
                <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
                  {/* Fairness Verdict Card */}
                  <div className={`p-4 rounded-xl border ${
                    result.fairness.rating === 'underpriced' ? 'bg-amber-500/10 border-amber-500/30' :
                    result.fairness.rating === 'overpriced' ? 'bg-rose-500/10 border-rose-500/30' :
                    'bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        result.fairness.rating === 'underpriced' ? 'bg-amber-500/20 text-amber-400' :
                        result.fairness.rating === 'overpriced' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{result.fairness.rating}</span>
                      <span className="text-xs text-surface-400">Fairness Verdict</span>
                    </div>
                    <p className="text-sm text-surface-200">{result.fairness.summary}</p>
                  </div>

                  {/* Counteroffer Card — visually prominent */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 ring-1 ring-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Suggested Counteroffer</p>
                    <p className="font-display text-2xl font-bold text-emerald-300">{result.counteroffer.suggestedRange}</p>
                    <p className="text-xs text-surface-400 mt-1">{result.counteroffer.rationale}</p>
                  </div>

                  {/* Negotiation Tips */}
                  {result.negotiationTips?.length > 0 && (
                    <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                      <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-2">Negotiation Tips</p>
                      <ol className="space-y-1.5 list-decimal list-inside">
                        {result.negotiationTips.map((tip, i) => (
                          <li key={i} className="text-sm text-surface-200 pl-1">{tip}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Draft Reply */}
                  {result.draftReply && (
                    <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Draft Reply</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(result.draftReply)
                          }}
                          className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copy
                        </button>
                      </div>
                      <blockquote className="text-sm text-surface-200 whitespace-pre-wrap border-l-2 border-violet-500/30 pl-3 py-1 italic">{result.draftReply}</blockquote>
                    </div>
                  )}

                  {/* Red Flags */}
                  {result.redFlags?.length > 0 && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-xs text-rose-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <span>⚠️</span> Red Flags
                      </p>
                      <ul className="space-y-1.5">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="text-sm text-rose-300 flex items-start gap-2">
                            <span className="text-rose-400 mt-0.5 shrink-0">⚠</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {result._disclaimer && (
                    <p className="text-xs text-surface-500 text-center italic mt-2">{result._disclaimer}</p>
                  )}
                </div>
              ) : result.typicalRange && result.comparisons ? (
                /* Creator Benchmarking structured result */
                <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
                  {/* Typical Range Card */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 ring-1 ring-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-1">Typical Market Range</p>
                    <p className="font-display text-2xl font-bold text-emerald-300">{result.typicalRange}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        result.yourPosition === 'above_average' ? 'bg-emerald-500/20 text-emerald-400' :
                        result.yourPosition === 'below_average' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-surface-500/20 text-surface-400'
                      }`}>
                        {result.yourPosition === 'above_average' ? 'Above Average' : result.yourPosition === 'below_average' ? 'Below Average' : 'Average'}
                      </span>
                      {result.percentile != null && (
                        <span className="text-xs text-surface-400">{result.percentile}th percentile</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400 mt-2">{result.summary}</p>
                  </div>

                  {/* Percentile Bar */}
                  {result.percentile != null && (
                    <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                      <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-3">Market Position</p>
                      <div className="relative h-4 bg-surface-700/50 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${result.percentile}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5 text-xs text-surface-500">
                        <span>0th</span>
                        <span className="font-semibold text-emerald-400">{result.percentile}th</span>
                        <span>100th</span>
                      </div>
                    </div>
                  )}

                  {/* Comparison Breakdown */}
                  {result.comparisons?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Rate Comparison</p>
                      {result.comparisons.map((comp, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border ${
                            comp.gap ? 'bg-surface-800/50 border-surface-700/30' :
                            comp.label === 'Your range' ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20' :
                            'bg-surface-800/30 border-surface-700/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-surface-200">{comp.label}</span>
                            <span className="text-sm font-semibold text-surface-100">{comp.amount}</span>
                          </div>
                          {comp.gap && (
                            <p className="text-xs text-surface-500 mt-0.5">{comp.gap}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : result.clauses ? (
                /* Contract Scanner structured result */
                <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                    <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide mb-1">Scan Summary</p>
                    <p className="text-sm text-surface-200">{result.summary}</p>
                  </div>

                  {/* Clauses */}
                  {result.clauses?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Clauses Found</p>
                      {result.clauses.map((clause, i) => {
                        const severityStyles = {
                          info: { bg: 'bg-blue-500/10 border-blue-500/30', badgeBg: 'bg-blue-500/20 text-blue-400', dot: 'text-blue-400' },
                          warning: { bg: 'bg-amber-500/10 border-amber-500/30', badgeBg: 'bg-amber-500/20 text-amber-400', dot: 'text-amber-400' },
                          danger: { bg: 'bg-rose-500/10 border-rose-500/30', badgeBg: 'bg-rose-500/20 text-rose-400', dot: 'text-rose-400' },
                        }
                        const s = severityStyles[clause.severity] || severityStyles.info
                        return (
                          <div key={i} className={`p-3 rounded-xl border ${s.bg}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${s.badgeBg}`}>
                                {clause.severity}
                              </span>
                              <span className="text-xs text-surface-400 capitalize">{clause.type?.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="text-sm text-surface-200">{clause.detail}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Missing Protections */}
                  {result.missing?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <span>⚠️</span> Missing Protections
                      </p>
                      <ul className="space-y-1.5">
                        {result.missing.map((item, i) => (
                          <li key={i} className="text-sm text-amber-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {result._disclaimer && (
                    <p className="text-xs text-surface-500 text-center italic mt-2">{result._disclaimer}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                  <p className="text-sm text-surface-200 whitespace-pre-wrap">{result.text || result.reason || JSON.stringify(result, null, 2)}</p>
                  <p className="text-xs text-surface-500 mt-3 pt-3 border-t border-surface-700/30 italic">
                    Pro tip: The more you share with me, the sharper these insights get. 💫
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Personality Loader Component ──────────────────────────

const LOADER_MESSAGES = [
  '🌸 Looking through your latest numbers...',
  'I\'m comparing your engagement against creators in your niche — seeing where you shine',
  'Pulling together sponsorship matches based on your audience and content style...',
  'Scanning what\'s working in your niche right now...',
  'Running the math on what your reach and engagement are actually worth — hint: probably more than you think',
  'Cross-referencing your audience with brands that are actively sponsoring creators like you...',
  'Digging into your content performance to spot what\'s resonating...',
  'Almost there — wrapping these insights into something you can act on...',
]

function PersonalityLoader({ tab }) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % LOADER_MESSAGES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700/30 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-start gap-2.5">
        <span className="text-lg shrink-0 mt-0.5">🌸</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-surface-200 leading-relaxed">{LOADER_MESSAGES[msgIndex]}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  )
}
