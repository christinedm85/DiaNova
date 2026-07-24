import { useState, useEffect } from 'react'
import { demoSeed } from '../api.js'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    features: ['Basic sponsorship tracker', '3 affiliate links', '1 digital product', 'Pricing guidance'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Full sponsorship CRM', 'Unlimited affiliates', 'Digital product sales + analytics', 'Lead capture forms', 'Brand kit builder', 'Email inbox'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Studio',
    price: 79,
    features: ['Multi-channel dashboards', 'White-labeled proposals', 'Team access (up to 5)', 'Priority support', 'Everything in Pro'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const FEATURES = [
  { title: 'Your Deal Flow 💼', desc: 'Track every sponsorship from "hey!" to "paid!" Never lose a deal to a forgotten follow-up again.', icon: '🤝' },
  { title: 'Passive Income 💸', desc: 'See which affiliate links actually convert. Get matched with high-commission programs your audience will love.', icon: '📈' },
  { title: 'Lead Gen That Works 👥', desc: 'Beautiful landing pages that turn followers into leads. Built-in funnel analytics so you know what\'s working.', icon: '👥' },
  { title: 'Smart Pricing 💰', desc: 'Stop guessing what to charge. Get data-driven rates based on your actual audience — not industry averages.', icon: '💰' },
  { title: 'Products That Sell 🌙', desc: 'Templates, guides, presets — sell digital products that earn while you sleep. We\'ll even suggest what to make next.', icon: '📦' },
  { title: 'Brand That Stands Out 🎨', desc: 'Build a brand identity that attracts premium sponsors. Track your brand health score and watch it grow.', icon: '🎨' },
]

export default function LandingPage({ onGetStarted, onLogin }) {
  const [scrolled, setScrolled] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [accessError, setAccessError] = useState('')

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const handleTryDemo = () => {
    setShowAccessModal(true)
    setAccessCode('')
    setAccessError('')
  }

  const handleAccessDemo = async () => {
    if (!accessCode.trim()) {
      setAccessError('Please enter the access code.')
      return
    }
    setDemoLoading(true)
    setAccessError('')
    try {
      const data = await demoSeed(accessCode.trim())
      localStorage.setItem('token', data.token)
      window.location.reload()
    } catch (err) {
      setDemoLoading(false)
      setAccessError(err.message || 'Invalid access code')
    }
  }

  const handleModalCancel = () => {
    setShowAccessModal(false)
    setDemoLoading(false)
    setAccessError('')
    setAccessCode('')
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png" alt="CreatorBloom" className="w-9 h-9 rounded-xl" />
            <span className="font-display text-lg font-bold text-surface-50 tracking-tight">CreatorBloom</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-surface-300 hover:text-surface-100 transition-colors">
              Sign In
            </button>
            <button onClick={onGetStarted} className="px-5 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium mb-6 animate-hero-fade-up">
          ✨ The creator business command center
        </div>
        <h2 className="font-display text-5xl md:text-6xl font-bold text-surface-50 leading-tight animate-hero-fade-up-delay">
          Turn Your <span className="gradient-text">Content</span>
          <br />
          Into a Real Business
        </h2>
        <p className="text-surface-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed animate-hero-fade-up-delay-2">
          Connect your platforms, land better brand deals, price like a pro,
          and watch your creator income grow — all from one beautiful dashboard.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8 animate-hero-fade-up-delay-2">
          <button onClick={handleTryDemo} disabled={demoLoading} className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/30 active:scale-95 text-lg disabled:opacity-60 animate-gentle-pulse">
            {demoLoading ? 'Loading...' : '👋 Try Demo Workspace'}
          </button>
          <button onClick={onGetStarted} className="px-7 py-3 bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold rounded-xl transition-colors text-lg">
            Get Started Free
          </button>
        </div>
        <p className="text-surface-600 text-sm mt-4">No credit card required · Free plan forever</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="glass p-8 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">$14K+</p>
            <p className="text-surface-500 text-sm mt-1">Avg. monthly revenue per creator</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">2,400+</p>
            <p className="text-surface-500 text-sm mt-1">Creators on the platform</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-surface-50">22%</p>
            <p className="text-surface-500 text-sm mt-1">Average rate increase after joining</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl font-bold text-surface-50">Everything you need, all in one place</h3>
          <p className="text-surface-400 mt-3">Six powerful tools. Zero spreadsheets. All the revenue.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="glass card-lift p-6 glass-hover">
              <span className="text-3xl">{f.icon}</span>
              <h4 className="font-display font-semibold text-surface-100 mt-3 text-lg">{f.title}</h4>
              <p className="text-sm text-surface-400 mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl font-bold text-surface-50">Simple pricing, no surprises</h3>
          <p className="text-surface-400 mt-3">Start free. Upgrade when your business outgrows it. (It will. 😉)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`glass p-8 flex flex-col relative ${plan.highlight ? 'ring-2 ring-accent-500/50' : ''}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-accent-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}
              <h4 className="font-display text-xl font-bold text-surface-100">{plan.name}</h4>
              <div className="mt-3 mb-6">
                <span className="font-display text-5xl font-bold text-surface-50">${plan.price}</span>
                <span className="text-surface-500 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                    <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  plan.highlight
                    ? 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg shadow-accent-600/25'
                    : 'bg-surface-800 hover:bg-surface-700 text-surface-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="glass p-12 bg-gradient-to-br from-accent-600/10 to-purple-600/10">
          <h3 className="font-display text-3xl font-bold text-surface-50">Ready to treat your content like the business it is?</h3>
          <p className="text-surface-400 mt-3 mb-8">Join creators who are earning more — without the chaos of a dozen tools.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleTryDemo} disabled={demoLoading} className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold rounded-xl transition-all duration-200 shadow-xl shadow-amber-500/30 active:scale-95 text-lg disabled:opacity-60">
              {demoLoading ? 'Loading...' : '👋 Try Demo Workspace'}
            </button>
            <button onClick={onGetStarted} className="px-8 py-3.5 bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold rounded-xl transition-colors text-lg">
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-surface-600">
          <p>© 2026 CreatorBloom. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-surface-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>

      {/* Access Code Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dark overlay backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleModalCancel} />
          {/* Modal */}
          <div className="relative z-10 w-full max-w-md glass p-8 rounded-2xl border border-surface-700/50 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-4xl">🔐</span>
              <h3 className="font-display text-2xl font-bold text-surface-50 mt-3">Buyer Access</h3>
              <p className="text-surface-400 text-sm mt-2 leading-relaxed">
                Enter the access code to explore the demo workspace.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setAccessError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAccessDemo() }}
                  placeholder="Enter access code"
                  autoFocus
                  className="w-full px-4 py-3 bg-surface-800/60 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all text-lg text-center tracking-widest"
                />
                {accessError && (
                  <p className="text-red-400 text-sm mt-2 text-center">{accessError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleModalCancel}
                  className="flex-1 px-4 py-3 bg-surface-800 hover:bg-surface-700 text-surface-300 font-medium rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccessDemo}
                  disabled={demoLoading}
                  className="flex-1 px-4 py-3 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-600/25 active:scale-95 text-sm disabled:opacity-60"
                >
                  {demoLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Access Demo'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
