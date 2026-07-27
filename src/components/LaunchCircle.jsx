import { useState, useEffect } from 'react'
import { api } from '../api.js'

const REVENUE_STAGES = [
  "I haven't monetized my content yet",
  "I earn through affiliate links",
  "I work with sponsorships",
  "I sell digital products",
  "I earn from platform payouts (YouTube, TikTok, etc.)",
  "I have multiple income streams",
]

const FOLLOWER_RANGES = [
  "Under 5K",
  "5K – 25K",
  "25K – 250K",
  "250K+",
]

export default function LaunchCircle() {
  const [count, setCount] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    handle: '',
    revenue_stage: '',
    follower_range: '',
    challenge: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.launchCircle.count()
      .then(data => setCount(data))
      .catch(() => setCount({ total: 0, spots: 30, remaining: 30 }))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email format.'
    if (!form.revenue_stage) e.revenue_stage = 'Please select your revenue stage.'
    if (!form.follower_range) e.follower_range = 'Please select your follower range.'
    if (!form.challenge.trim()) e.challenge = 'Please share your biggest challenge.'
    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      await api.launchCircle.apply(form)
      setSubmitted(true)
      // Refresh count
      api.launchCircle.count().then(setCount).catch(() => {})
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const remaining = count ? count.remaining : 30
  const filled = count ? count.total : 0
  const pct = Math.min(100, Math.round((filled / 30) * 100))

  // Shared input styles
  const inputClass = (field) =>
    `w-full px-4 py-3 bg-surface-800/60 border rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all ${
      errors[field] ? 'border-rose-500/50' : 'border-surface-700'
    }`

  const labelClass = "block text-sm font-medium text-surface-300 mb-1.5"

  return (
    <div className="page-enter max-w-4xl mx-auto space-y-12 pb-16">
      {/* ── Hero ── */}
      <section className="text-center pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-medium mb-6">
          🌸 Limited beta — 30 spots
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-surface-50 leading-tight">
          Join the CreatorBloom{' '}
          <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Launch Circle
          </span>
        </h1>
        <p className="text-surface-400 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          Help shape the future of creator business. Get early access, influence what we build,
          and work directly with the founder to make CreatorBloom perfect for creators like you.
        </p>
      </section>

      {/* ── Live Counter ── */}
      <section className="glass p-8 text-center max-w-md mx-auto">
        <p className="text-surface-400 text-sm mb-3">Launch Circle Spots</p>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-surface-700/50"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-pink-400"
              strokeDasharray={`${pct} ${100 - pct}`}
              pathLength="100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-surface-50">{remaining}</span>
          </div>
        </div>
        <p className="text-surface-300 text-lg font-semibold">
          {remaining > 0 ? `${remaining} spots remaining` : 'All spots filled'}
        </p>
        <p className="text-surface-500 text-sm mt-1">{filled} of 30 filled</p>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-surface-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* ── Benefits ── */}
      <section>
        <h2 className="font-display text-2xl font-bold text-surface-50 text-center mb-8">
          What You'll Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: '🌸', title: 'Free beta access', desc: 'Use CreatorBloom Pro for free during the entire beta period. No credit card, no catch.' },
            { icon: '💡', title: 'Shape the product', desc: 'Your feedback directly influences what we build next. Vote on features, suggest improvements.' },
            { icon: '🤝', title: 'Work with the founder', desc: 'Direct access to our founder for 1-on-1 calls, feature requests, and personalized onboarding.' },
            { icon: '🚀', title: 'Early access', desc: 'Be the first to try new features before anyone else. Get a head start on building your creator business.' },
          ].map((b, i) => (
            <div key={i} className="glass p-6 glass-hover card-lift">
              <span className="text-2xl">{b.icon}</span>
              <h3 className="font-display font-semibold text-surface-100 mt-3">{b.title}</h3>
              <p className="text-sm text-surface-400 mt-2 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="launch-circle-form">
        {!submitted ? (
          <div className="glass p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold text-surface-50 text-center mb-2">
              Apply to Join 🌸
            </h2>
            <p className="text-surface-400 text-sm text-center mb-8">
              Tell us about yourself and your creator journey. We'll review applications on a rolling basis.
            </p>

            {submitError && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <span className="text-rose-400 text-lg shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="text-rose-300 text-sm">{submitError}</p>
                  <button
                    onClick={() => setSubmitError(null)}
                    className="text-rose-400 text-xs mt-1 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  className={inputClass('name')}
                />
                {errors.name && <p className="text-rose-400 text-xs mt-1.5">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email <span className="text-rose-400">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass('email')}
                />
                {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>}
              </div>

              {/* Platform/Handle */}
              <div>
                <label className={labelClass}>Platform / Handle</label>
                <input
                  type="text"
                  value={form.handle}
                  onChange={e => handleChange('handle', e.target.value)}
                  placeholder="Your YouTube/TikTok/Instagram handle"
                  className={inputClass('handle')}
                />
              </div>

              {/* Revenue Stage */}
              <div>
                <label className={labelClass}>Revenue Stage <span className="text-rose-400">*</span></label>
                <div className="space-y-2">
                  {REVENUE_STAGES.map(stage => (
                    <label
                      key={stage}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        form.revenue_stage === stage
                          ? 'border-accent-500 bg-accent-500/10 text-surface-100'
                          : 'border-surface-700 bg-surface-800/40 text-surface-400 hover:border-surface-600 hover:text-surface-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="revenue_stage"
                        value={stage}
                        checked={form.revenue_stage === stage}
                        onChange={e => handleChange('revenue_stage', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form.revenue_stage === stage ? 'border-accent-500' : 'border-surface-600'
                      }`}>
                        {form.revenue_stage === stage && (
                          <div className="w-2 h-2 rounded-full bg-accent-500" />
                        )}
                      </div>
                      <span className="text-sm">{stage}</span>
                    </label>
                  ))}
                </div>
                {errors.revenue_stage && <p className="text-rose-400 text-xs mt-1.5">{errors.revenue_stage}</p>}
              </div>

              {/* Follower Range */}
              <div>
                <label className={labelClass}>Follower Range <span className="text-rose-400">*</span></label>
                <select
                  value={form.follower_range}
                  onChange={e => handleChange('follower_range', e.target.value)}
                  className={inputClass('follower_range')}
                >
                  <option value="">Select your range...</option>
                  {FOLLOWER_RANGES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.follower_range && <p className="text-rose-400 text-xs mt-1.5">{errors.follower_range}</p>}
              </div>

              {/* Challenge */}
              <div>
                <label className={labelClass}>
                  What's the biggest challenge in running your creator business today? <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={form.challenge}
                  onChange={e => handleChange('challenge', e.target.value)}
                  placeholder="Share your story — what's holding you back? What would make your creator life easier?"
                  rows={4}
                  className={inputClass('challenge')}
                />
                {errors.challenge && <p className="text-rose-400 text-xs mt-1.5">{errors.challenge}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Apply to Join 🌸'
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ── Success State ── */
          <div className="glass p-10 text-center max-w-lg mx-auto">
            <span className="text-5xl">🎉</span>
            <h2 className="font-display text-2xl font-bold text-surface-50 mt-4">Application Received!</h2>
            <p className="text-surface-400 mt-3 leading-relaxed">
              We'll review your application and notify selected creators via email.
              Thanks for your interest in the CreatorBloom Launch Circle.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm">
              🌸 We'll be in touch soon
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
